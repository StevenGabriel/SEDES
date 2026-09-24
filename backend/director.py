import uuid
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_

from database import get_db
import models

router = APIRouter(
    prefix="/api/director",
    tags=["Director General SEDES"]
)

@router.get("/consola", summary="Obtener métricas ejecutivas, rendimiento y trazabilidad para la consola de dirección")
def obtener_metricas_consola(db: Session = Depends(get_db)):
    """
    Retorna los datos reales de la base de datos estructurados para la Consola de Administración:
    1. KPIs Superiores: Trámites en curso, Tiempo promedio de cierre, Alertas críticas.
    2. Rendimiento por Supervisor: Actas/inspecciones realizadas por supervisor.
    3. Estado y Tipos de Trámites: Distribución porcentual y conteo total (Aperturas vs Renovaciones).
    4. Bitácora de Trazabilidad Reciente: Últimos eventos y auditoría del sistema.
    """
    ahora = datetime.now()
    hace_7_dias = ahora - timedelta(days=7)

    # 1. TRÁMITES Y KPIS REALES
    total_tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).count()
    
    tramites_en_curso = db.query(models.Tramite).filter(
        models.Tramite.estado == True,
        models.Tramite.estado_tramite.notin_(["Aprobado", "Rechazado", "Finalizado"])
    ).count()

    tramites_esta_semana = db.query(models.Tramite).filter(
        models.Tramite.estado == True,
        models.Tramite.fecha_creacion >= hace_7_dias
    ).count()

    # Tiempo promedio real de resolución (días transcurridos en trámites concluidos)
    tramites_cerrados = db.query(models.Tramite).filter(
        models.Tramite.estado == True,
        models.Tramite.estado_tramite.in_(["Aprobado", "Finalizado", "Inspección Aprobada"])
    ).all()

    dias_totales = 0
    conteo_cerrados = 0
    for t in tramites_cerrados:
        if t.fecha_creacion:
            f_fin = t.fecha_modificacion or ahora
            f_ini = t.fecha_creacion
            delta = max(0, (f_fin - f_ini).days)
            dias_totales += delta
            conteo_cerrados += 1

    tiempo_promedio = round(dias_totales / conteo_cerrados) if conteo_cerrados > 0 else 0

    # Alertas críticas reales (documentos observados/rechazados o trámites con retraso/observación)
    docs_observados = db.query(models.TramiteDocumento).filter(
        models.TramiteDocumento.estado == True,
        models.TramiteDocumento.estado_validacion.in_(["Observado", "Rechazado"])
    ).count()
    
    tramites_vencidos = db.query(models.Tramite).filter(
        models.Tramite.estado == True,
        models.Tramite.estado_tramite.ilike("%observad%")
    ).count()

    alertas_criticas = docs_observados + tramites_vencidos

    # 2. DISTRIBUCIÓN POR TIPOS REAL (Aperturas vs Renovaciones)
    aperturas_count = db.query(models.Tramite).filter(
        models.Tramite.estado == True,
        or_(
            models.Tramite.tipo_tramite.ilike("%apertura%"),
            models.Tramite.tipo_tramite.ilike("%habilitaci%"),
            models.Tramite.tipo_tramite.ilike("%nueva%")
        )
    ).count()

    renovaciones_count = db.query(models.Tramite).filter(
        models.Tramite.estado == True,
        or_(
            models.Tramite.tipo_tramite.ilike("%renovaci%"),
            models.Tramite.tipo_tramite.ilike("%acreditaci%"),
            models.Tramite.tipo_tramite.ilike("%actualizaci%")
        )
    ).count()

    # Otros tipos o no clasificados si hubieran
    total_clasificado = aperturas_count + renovaciones_count
    if total_tramites > 0:
        porcentaje_aperturas = round((aperturas_count / total_tramites) * 100) if total_tramites > 0 else 0
        porcentaje_renovaciones = round((renovaciones_count / total_tramites) * 100) if total_tramites > 0 else 0
    else:
        porcentaje_aperturas = 0
        porcentaje_renovaciones = 0

    # 3. RENDIMIENTO POR SUPERVISOR (MEDIDO ESTRICTAMENTE POR ACTAS REALES DE LA BDD)
    supervisores_db = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre.ilike("%supervisor%"),
        models.Usuario.estado == True
    ).order_by(models.Usuario.apellidos.asc()).all()

    rendimiento_supervisores = []

    for s in supervisores_db:
        # Contar actas oficiales emitidas reales (inspecciones completadas/finalizadas)
        inspecciones_completadas = db.query(models.Inspeccion).filter(
            models.Inspeccion.supervisor_id == s.id,
            models.Inspeccion.estado == True,
            models.Inspeccion.estado_inspeccion.in_(["Completada", "Aprobada", "Finalizada"])
        ).count()

        # Contar trámites asignados activos con inspección de campo pendiente
        tramites_asig_list = db.query(models.Tramite).filter(
            models.Tramite.supervisor_asignado_id == s.id,
            models.Tramite.estado == True,
            models.Tramite.estado_tramite.notin_(["Aprobado", "Rechazado", "Cancelado"])
        ).all()

        tramites_asig = 0
        for trm in tramites_asig_list:
            insp = db.query(models.Inspeccion).filter(
                models.Inspeccion.tramite_id == trm.id,
                models.Inspeccion.estado == True
            ).first()
            if not insp or (insp.estado_inspeccion != "Completada" and not insp.acta_pdf_url):
                tramites_asig += 1

        nombre_abrev = f"{s.nombres[0]}. {s.apellidos.split()[0]}" if s.nombres and s.apellidos else (s.nombres or "Supervisor")
        
        rendimiento_supervisores.append({
            "id": str(s.id),
            "nombre_completo": f"{s.nombres or ''} {s.apellidos or ''}".strip() or s.email,
            "nombre_corto": nombre_abrev,
            "actas_emitidas": inspecciones_completadas,
            "actas_reales_db": inspecciones_completadas,
            "asignados": tramites_asig,
            "email": s.email,
            "telefono": s.telefono or ""
        })

    # Ordenar ranking de mayor a menor número de actas emitidas
    rendimiento_supervisores.sort(key=lambda x: x["actas_emitidas"], reverse=True)

    # 4. BITÁCORA DE TRAZABILIDAD RECIENTE (ESTRICTAMENTE DE LA TABLA HISTORIAL ACTIVIDAD)
    trazabilidad = []
    logs_db = db.query(models.HistorialActividad).filter(
        models.HistorialActividad.estado == True
    ).order_by(desc(models.HistorialActividad.fecha_creacion)).limit(10).all()

    for log in logs_db:
        es_sistema = "sistema" in (log.responsable or "").lower() or "alerta" in (log.accion or "").lower()
        trazabilidad.append({
            "id": str(log.id),
            "funcionario": log.responsable or ("Sistema" if es_sistema else "Personal SEDES"),
            "es_sistema": es_sistema,
            "accion": log.accion,
            "fecha": log.fecha_hora_formato or (log.fecha_creacion.strftime("%d %b %Y - %H:%M") if log.fecha_creacion else ""),
            "expediente": log.codigo_tramite or "N/A",
            "resultado": log.estado_resultado
        })

    return {
        "kpis": {
            "tramites_en_curso": {
                "valor": tramites_en_curso,
                "subtexto": f"+{tramites_esta_semana} esta semana"
            },
            "tiempo_promedio": {
                "valor": f"{tiempo_promedio} días" if conteo_cerrados > 0 else "0 días",
                "subtexto": f"{conteo_cerrados} trámite(s) concluidos" if conteo_cerrados > 0 else "Sin trámites concluidos aún"
            },
            "alertas_criticas": {
                "valor": alertas_criticas,
                "subtexto": f"{tramites_vencidos} observados / {docs_observados} docs obs."
            }
        },
        "rendimiento_supervisores": rendimiento_supervisores,
        "distribucion_tramites": {
            "total": total_tramites,
            "aperturas_conteo": aperturas_count,
            "aperturas_porcentaje": porcentaje_aperturas,
            "renovaciones_conteo": renovaciones_count,
            "renovaciones_porcentaje": porcentaje_renovaciones
        },
        "trazabilidad_reciente": trazabilidad
    }

# ==============================================================================
# ENDPOINTS PARA MÉTRICAS E INDICADORES (CON FILTROS DINÁMICOS REACTIVOS)
# ==============================================================================

@router.get("/filtros-opciones", summary="Obtener opciones únicas existentes en la base de datos para los filtros")
def obtener_opciones_filtros(db: Session = Depends(get_db)):
    """
    Retorna listas de valores únicos reales desde la base de datos PostgreSQL
    para poblar dinámicamente los 9 selectores de filtros.
    """
    # Municipios
    municipios_raw = db.query(models.Establecimiento.municipio).filter(
        models.Establecimiento.estado == True,
        models.Establecimiento.municipio.isnot(None)
    ).distinct().all()
    municipios = sorted(list(set([m[0].strip().title() for m in municipios_raw if m[0] and m[0].strip()])))

    # Tipos de Establecimiento / Laboratorio
    tipos_raw = db.query(models.Establecimiento.tipo).filter(
        models.Establecimiento.estado == True,
        models.Establecimiento.tipo.isnot(None)
    ).distinct().all()
    tipos = sorted(list(set([t[0].strip() for t in tipos_raw if t[0] and t[0].strip()])))

    # Estados
    estados_estab_raw = db.query(models.Establecimiento.estado_operativo).filter(
        models.Establecimiento.estado == True,
        models.Establecimiento.estado_operativo.isnot(None)
    ).distinct().all()
    estados = sorted(list(set([e[0].strip() for e in estados_estab_raw if e[0] and e[0].strip()])))

    # Nombres de Establecimientos
    nombres_raw = db.query(models.Establecimiento.nombre_comercial).filter(
        models.Establecimiento.estado == True,
        models.Establecimiento.nombre_comercial.isnot(None)
    ).distinct().all()
    nombres = sorted(list(set([n[0].strip() for n in nombres_raw if n[0] and n[0].strip()])))

    # Niveles
    niveles_raw = db.query(models.Establecimiento.nivel).filter(
        models.Establecimiento.estado == True,
        models.Establecimiento.nivel.isnot(None)
    ).distinct().all()
    niveles = sorted(list(set([nv[0].strip() for nv in niveles_raw if nv[0] and nv[0].strip()])))

    # Propietarios
    props_db = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre.ilike("%propietario%"),
        models.Usuario.estado == True
    ).all()
    propietarios = sorted(list(set([f"{p.nombres} {p.apellidos}".strip() for p in props_db if p.nombres or p.apellidos])))

    # Responsable del Laboratorio
    resp_lab_raw = db.query(models.Establecimiento.responsable_laboratorio).filter(
        models.Establecimiento.estado == True,
        models.Establecimiento.responsable_laboratorio.isnot(None)
    ).distinct().all()
    responsables_lab = sorted(list(set([r[0].strip() for r in resp_lab_raw if r[0] and r[0].strip()])))

    # Responsables de Áreas
    resp_areas_raw = db.query(models.Establecimiento.responsables_areas).filter(
        models.Establecimiento.estado == True,
        models.Establecimiento.responsables_areas.isnot(None)
    ).distinct().all()
    responsables_areas = sorted(list(set([ra[0].strip() for ra in resp_areas_raw if ra[0] and ra[0].strip()])))

    # Direcciones / Zonas
    dirs_raw = db.query(models.Establecimiento.direccion).filter(
        models.Establecimiento.estado == True,
        models.Establecimiento.direccion.isnot(None)
    ).distinct().all()
    direcciones = sorted(list(set([d[0].strip() for d in dirs_raw if d[0] and d[0].strip()])))[:30]

    return {
        "municipios": municipios,
        "tipos": tipos,
        "estados": estados,
        "nombres": nombres,
        "niveles": niveles,
        "propietarios": propietarios,
        "responsables_laboratorio": responsables_lab,
        "responsables_areas": responsables_areas,
        "direcciones": direcciones
    }


@router.get("/metricas-indicadores", summary="Obtener métricas, indicadores y analíticas avanzadas con filtros dinámicos")
def obtener_metricas_indicadores(
    periodo_anio: Optional[int] = Query(2026, description="Año del periodo"),
    periodo_mes: Optional[int] = Query(None, description="Mes del periodo (1-12)"),
    municipio: Optional[str] = Query(None, description="Filtro por Municipio"),
    tipo_laboratorio: Optional[str] = Query(None, description="Filtro por Tipo de Laboratorio"),
    estado: Optional[str] = Query(None, description="Filtro por Estado Operativo / Trámite"),
    nombre_laboratorio: Optional[str] = Query(None, description="Filtro por Nombre del Laboratorio"),
    nivel: Optional[str] = Query(None, description="Filtro por Nivel"),
    propietario: Optional[str] = Query(None, description="Filtro por Nombre del Propietario"),
    responsable_laboratorio: Optional[str] = Query(None, description="Filtro por Responsable de Laboratorio"),
    responsables_areas: Optional[str] = Query(None, description="Filtro por Responsable de Áreas"),
    direccion: Optional[str] = Query(None, description="Filtro por Dirección"),
    db: Session = Depends(get_db)
):
    """
    Calcula dinámicamente todas las métricas analíticas e indicadores macro
    a partir de la base de datos PostgreSQL aplicando los filtros suministrados.
    """
    ahora = datetime.now()

    # --- 1. CONSTRUCCIÓN DE CONSULTA BASE DE ESTABLECIMIENTOS FILTRADOS ---
    query_est = db.query(models.Establecimiento).filter(models.Establecimiento.estado == True)

    if municipio:
        query_est = query_est.filter(models.Establecimiento.municipio.ilike(f"%{municipio}%"))
    if tipo_laboratorio:
        query_est = query_est.filter(models.Establecimiento.tipo.ilike(f"%{tipo_laboratorio}%"))
    if estado:
        query_est = query_est.filter(
            or_(
                models.Establecimiento.estado_operativo.ilike(f"%{estado}%"),
                models.Establecimiento.estado_operativo == estado
            )
        )
    if nombre_laboratorio:
        query_est = query_est.filter(models.Establecimiento.nombre_comercial.ilike(f"%{nombre_laboratorio}%"))
    if nivel:
        query_est = query_est.filter(models.Establecimiento.nivel.ilike(f"%{nivel}%"))
    if responsable_laboratorio:
        query_est = query_est.filter(models.Establecimiento.responsable_laboratorio.ilike(f"%{responsable_laboratorio}%"))
    if responsables_areas:
        query_est = query_est.filter(models.Establecimiento.responsables_areas.ilike(f"%{responsables_areas}%"))
    if direccion:
        query_est = query_est.filter(models.Establecimiento.direccion.ilike(f"%{direccion}%"))
    if propietario:
        query_est = query_est.join(models.Usuario, models.Establecimiento.propietario_id == models.Usuario.id).filter(
            or_(
                models.Usuario.nombres.ilike(f"%{propietario}%"),
                models.Usuario.apellidos.ilike(f"%{propietario}%"),
                func.concat(models.Usuario.nombres, " ", models.Usuario.apellidos).ilike(f"%{propietario}%")
            )
        )

    establecimientos_filtrados = query_est.all()
    estab_ids = [e.id for e in establecimientos_filtrados]

    # --- 2. CONSTRUCCIÓN DE CONSULTA DE TRÁMITES FILTRADOS ---
    query_trm = db.query(models.Tramite).filter(models.Tramite.estado == True)

    # Si hay filtros de establecimiento aplicados
    if len(estab_ids) > 0 or (municipio or tipo_laboratorio or estado or nombre_laboratorio or nivel or propietario or responsable_laboratorio or responsables_areas or direccion):
        query_trm = query_trm.filter(models.Tramite.establecimiento_id.in_(estab_ids if estab_ids else [uuid.uuid4()]))

    if periodo_anio:
        query_trm = query_trm.filter(func.extract('year', models.Tramite.fecha_creacion) == periodo_anio)
    if periodo_mes:
        query_trm = query_trm.filter(func.extract('month', models.Tramite.fecha_creacion) == periodo_mes)

    tramites_filtrados = query_trm.all()
    total_tramites = len(tramites_filtrados)

    # --- 3. KPIS SUPERIORES ---
    # Tasa de aprobación
    tramites_aprobados = [t for t in tramites_filtrados if t.estado_tramite in ["Aprobado", "Finalizado", "Inspección Aprobada"]]
    tramites_resueltos = [t for t in tramites_filtrados if t.estado_tramite in ["Aprobado", "Finalizado", "Inspección Aprobada", "Rechazado"]]
    
    tasa_aprobacion = round((len(tramites_aprobados) / len(tramites_resueltos) * 100)) if len(tramites_resueltos) > 0 else (100 if len(tramites_aprobados) > 0 else 0)

    # Tiempo promedio de resolución
    dias_totales = 0
    conteo_resueltos = 0
    for t in tramites_aprobados:
        if t.fecha_creacion:
            f_fin = t.fecha_modificacion or ahora
            f_ini = t.fecha_creacion
            delta = max(0, (f_fin - f_ini).days)
            dias_totales += delta
            conteo_resueltos += 1

    tiempo_promedio = round(dias_totales / conteo_resueltos) if conteo_resueltos > 0 else 0

    # --- 4. TRÁMITES POR MES (TENDENCIA ANUAL APERTURAS VS RENOVACIONES) ---
    meses_nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    tramites_por_mes = []

    for mes_idx in range(1, 13):
        # Conteo aperturas del mes
        aperturas_mes = sum(1 for t in tramites_filtrados if t.fecha_creacion and t.fecha_creacion.month == mes_idx and ("apertura" in (t.tipo_tramite or "").lower() or "nueva" in (t.tipo_tramite or "").lower() or "habilitaci" in (t.tipo_tramite or "").lower()))
        # Conteo renovaciones del mes
        renovaciones_mes = sum(1 for t in tramites_filtrados if t.fecha_creacion and t.fecha_creacion.month == mes_idx and ("renovaci" in (t.tipo_tramite or "").lower() or "acreditaci" in (t.tipo_tramite or "").lower() or "actualizaci" in (t.tipo_tramite or "").lower()))
        # Si no clasifica pero está en el mes
        otros_mes = sum(1 for t in tramites_filtrados if t.fecha_creacion and t.fecha_creacion.month == mes_idx) - (aperturas_mes + renovaciones_mes)
        if otros_mes > 0:
            aperturas_mes += otros_mes

        tramites_por_mes.append({
            "mes": meses_nombres[mes_idx - 1],
            "mes_numero": mes_idx,
            "aperturas": aperturas_mes,
            "renovaciones": renovaciones_mes,
            "total": aperturas_mes + renovaciones_mes
        })

    # --- 5. DISTRIBUCIÓN POR TIPO DE ESTABLECIMIENTO ---
    tipos_conteo = {}
    for e in establecimientos_filtrados:
        tipo_nombre = e.tipo or "Laboratorio Clínico"
        tipos_conteo[tipo_nombre] = tipos_conteo.get(tipo_nombre, 0) + 1

    total_estabs = max(len(establecimientos_filtrados), 1)
    distribucion_tipos = []
    for tipo_nom, cant in sorted(tipos_conteo.items(), key=lambda x: x[1], reverse=True):
        distribucion_tipos.append({
            "tipo": tipo_nom,
            "cantidad": cant,
            "porcentaje": round((cant / total_estabs) * 100)
        })

    # --- 6. CUELLOS DE BOTELLA OPERATIVOS IDENTIFICADOS ---
    cuellos_botella = []
    
    # 1. Trámites > 30 días sin resolución
    tramites_demorados = sum(1 for t in tramites_filtrados if t.fecha_creacion and (ahora - t.fecha_creacion).days > 30 and t.estado_tramite not in ["Aprobado", "Finalizado", "Rechazado"])
    if tramites_demorados > 0:
        cuellos_botella.append({
            "id": "cb-1",
            "nivel": "alto",
            "color": "rose",
            "mensaje": f"{tramites_demorados} trámite(s) llevan más de 30 días sin resolución"
        })
    else:
        cuellos_botella.append({
            "id": "cb-1",
            "nivel": "optimo",
            "color": "emerald",
            "mensaje": "Todos los trámites en curso están dentro del plazo normativo (<30 días)"
        })

    # 2. Documentos observados pendientes
    trm_ids_filtrados = [t.id for t in tramites_filtrados]
    docs_observados_count = db.query(models.TramiteDocumento).filter(
        models.TramiteDocumento.estado == True,
        models.TramiteDocumento.estado_validacion.in_(["Observado", "Rechazado"]),
        models.TramiteDocumento.tramite_id.in_(trm_ids_filtrados) if trm_ids_filtrados else False
    ).count() if trm_ids_filtrados else 0

    if docs_observados_count > 0:
        cuellos_botella.append({
            "id": "cb-2",
            "nivel": "medio",
            "color": "amber",
            "mensaje": f"{docs_observados_count} documento(s) con observaciones pendientes de subsanación"
        })

    # 3. Inspecciones pendientes o reprogramadas
    inspecciones_pendientes = db.query(models.Inspeccion).filter(
        models.Inspeccion.estado == True,
        models.Inspeccion.estado_inspeccion.in_(["Pendiente", "Reprogramada"]),
        models.Inspeccion.tramite_id.in_(trm_ids_filtrados) if trm_ids_filtrados else True
    ).count()

    if inspecciones_pendientes > 0:
        cuellos_botella.append({
            "id": "cb-3",
            "nivel": "info",
            "color": "amber",
            "mensaje": f"{inspecciones_pendientes} inspección(es) de campo pendientes o reprogramadas"
        })
    else:
        cuellos_botella.append({
            "id": "cb-3",
            "nivel": "optimo",
            "color": "emerald",
            "mensaje": "Inspecciones de campo al día y calendarizadas"
        })

    # --- 7. RANKING DE SUPERVISORES CON DESEMPEÑO REAL ---
    supervisores_db = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre.ilike("%supervisor%"),
        models.Usuario.estado == True
    ).all()

    ranking_supervisores = []
    for s in supervisores_db:
        actas_count = db.query(models.Inspeccion).filter(
            models.Inspeccion.supervisor_id == s.id,
            models.Inspeccion.estado == True,
            models.Inspeccion.estado_inspeccion.in_(["Completada", "Aprobada", "Finalizada"])
        ).count()

        # Determinar badge de desempeño según actas completadas
        if actas_count >= 20:
            calif = "Excelente"
            color_badge = "bg-emerald-50 text-emerald-700 border-emerald-200"
        elif actas_count >= 15:
            calif = "Muy Bueno"
            color_badge = "bg-teal-50 text-teal-700 border-teal-200"
        elif actas_count >= 10:
            calif = "Bueno"
            color_badge = "bg-sky-50 text-sky-700 border-sky-200"
        elif actas_count >= 5:
            calif = "Regular"
            color_badge = "bg-amber-50 text-amber-700 border-amber-200"
        else:
            calif = "En Proceso"
            color_badge = "bg-slate-50 text-slate-600 border-slate-200"

        nombre_completo = f"{s.nombres or ''} {s.apellidos or ''}".strip() or s.email
        ranking_supervisores.append({
            "id": str(s.id),
            "nombre": nombre_completo,
            "actas": actas_count,
            "calificacion": calif,
            "badge_color": color_badge
        })

    ranking_supervisores.sort(key=lambda x: x["actas"], reverse=True)

    # --- 8. CANTIDAD POR MUNICIPIO (PÚBLICOS VS PRIVADOS) ---
    muns_conteo = {}
    for e in establecimientos_filtrados:
        mun = (e.municipio or "Cercado").strip().title()
        if mun not in muns_conteo:
            muns_conteo[mun] = {"municipio": mun, "privados": 0, "publicos": 0, "total": 0}
        
        tipo_str = (e.tipo or "").lower()
        if "público" in tipo_str or "publico" in tipo_str or "seguro" in tipo_str:
            muns_conteo[mun]["publicos"] += 1
        else:
            muns_conteo[mun]["privados"] += 1
        muns_conteo[mun]["total"] += 1

    cantidad_municipios = sorted(list(muns_conteo.values()), key=lambda x: x["total"], reverse=True)[:8]

    # --- 9. POR NIVEL DE LABORATORIO ---
    niveles_conteo = {"1er Nivel": 0, "2do Nivel": 0, "3er Nivel": 0, "De Referencia": 0}
    for e in establecimientos_filtrados:
        nv_str = (e.nivel or "").lower()
        if "1" in nv_str or "primer" in nv_str or "básico" in nv_str:
            niveles_conteo["1er Nivel"] += 1
        elif "2" in nv_str or "segundo" in nv_str:
            niveles_conteo["2do Nivel"] += 1
        elif "3" in nv_str or "tercer" in nv_str:
            niveles_conteo["3er Nivel"] += 1
        elif "ref" in nv_str or "especializado" in nv_str:
            niveles_conteo["De Referencia"] += 1
        else:
            niveles_conteo["1er Nivel"] += 1

    total_niveles = max(sum(niveles_conteo.values()), 1)
    por_nivel = [
        {"nivel": k, "cantidad": v, "porcentaje": round((v / total_niveles) * 100)}
        for k, v in [
            ("De Referencia", niveles_conteo["De Referencia"]),
            ("3er Nivel", niveles_conteo["3er Nivel"]),
            ("2do Nivel", niveles_conteo["2do Nivel"]),
            ("1er Nivel", niveles_conteo["1er Nivel"])
        ]
    ]

    # --- 10. POR TIPO DE LABORATORIO (SECTOR) ---
    sectores_conteo = {
        "Público": 0,
        "Seguro Social": 0,
        "Privado": 0,
        "Iglesia": 0,
        "ONG": 0,
        "Fuerzas Armadas": 0,
        "Universidades": 0
    }

    for e in establecimientos_filtrados:
        t_str = f"{e.tipo or ''} {e.nombre_comercial or ''}".lower()
        if "seguro" in t_str or "caja" in t_str or "cns" in t_str:
            sectores_conteo["Seguro Social"] += 1
        elif "público" in t_str or "publico" in t_str or "hospital" in t_str or "centro de salud" in t_str:
            sectores_conteo["Público"] += 1
        elif "iglesia" in t_str or "parroquia" in t_str or "católic" in t_str:
            sectores_conteo["Iglesia"] += 1
        elif "ong" in t_str or "fundación" in t_str or "fundacion" in t_str:
            sectores_conteo["ONG"] += 1
        elif "militar" in t_str or "armada" in t_str or "ff.aa" in t_str:
            sectores_conteo["Fuerzas Armadas"] += 1
        elif "universidad" in t_str or "univalle" in t_str or "umss" in t_str:
            sectores_conteo["Universidades"] += 1
        else:
            sectores_conteo["Privado"] += 1

    total_sectores = max(sum(sectores_conteo.values()), 1)
    por_tipo_laboratorio = [
        {"sector": k, "cantidad": v, "porcentaje": round((v / total_sectores) * 100, 1)}
        for k, v in sorted(sectores_conteo.items(), key=lambda x: x[1], reverse=True)
    ]

    # --- 11. ESTADO / SITUACIÓN DEL LABORATORIO (DONUT) ---
    situacion_conteo = {
        "Funcionando": 0,
        "No Funcionando": 0,
        "Cerrado": 0,
        "En Refacción": 0,
        "Renovación": 0
    }

    for e in establecimientos_filtrados:
        est_str = (e.estado_operativo or "").lower()
        if "habilitado" in est_str or "funcionando" in est_str:
            situacion_conteo["Funcionando"] += 1
        elif "clausurado" in est_str or "no funcionando" in est_str or "sancionado" in est_str:
            situacion_conteo["No Funcionando"] += 1
        elif "cerrado" in est_str:
            situacion_conteo["Cerrado"] += 1
        elif "refacción" in est_str or "refaccion" in est_str or "mantenimiento" in est_str:
            situacion_conteo["En Refacción"] += 1
        elif "renovación" in est_str or "renovacion" in est_str or "en trámite" in est_str:
            situacion_conteo["Renovación"] += 1
        else:
            situacion_conteo["Funcionando"] += 1

    total_situacion = max(sum(situacion_conteo.values()), 1)
    estado_situacion = {
        "total": sum(situacion_conteo.values()),
        "items": [
            {"label": "Funcionando", "color": "#10b981", "cantidad": situacion_conteo["Funcionando"], "porcentaje": round((situacion_conteo["Funcionando"] / total_situacion) * 100)},
            {"label": "No Funcionando", "color": "#ef4444", "cantidad": situacion_conteo["No Funcionando"], "porcentaje": round((situacion_conteo["No Funcionando"] / total_situacion) * 100)},
            {"label": "Cerrado", "color": "#64748b", "cantidad": situacion_conteo["Cerrado"], "porcentaje": round((situacion_conteo["Cerrado"] / total_situacion) * 100)},
            {"label": "En Refacción", "color": "#f59e0b", "cantidad": situacion_conteo["En Refacción"], "porcentaje": round((situacion_conteo["En Refacción"] / total_situacion) * 100)},
            {"label": "Renovación", "color": "#06b6d4", "cantidad": situacion_conteo["Renovación"], "porcentaje": round((situacion_conteo["Renovación"] / total_situacion) * 100)}
        ]
    }

    return {
        "kpis": {
            "total_tramites": {
                "valor": total_tramites,
                "subtexto": f"+{sum(1 for t in tramites_filtrados if t.fecha_creacion and t.fecha_creacion >= ahora - timedelta(days=30))} último mes"
            },
            "tasa_aprobacion": {
                "valor": f"{tasa_aprobacion}%",
                "subtexto": f"{len(tramites_aprobados)} trámites aprobados"
            },
            "tiempo_promedio": {
                "valor": f"{tiempo_promedio} días",
                "subtexto": "Promedio de resolución"
            }
        },
        "tramites_por_mes": tramites_por_mes,
        "distribucion_tipos": distribucion_tipos,
        "cuellos_botella": cuellos_botella,
        "ranking_supervisores": ranking_supervisores,
        "cantidad_municipios": cantidad_municipios,
        "por_nivel": por_nivel,
        "por_tipo_laboratorio": por_tipo_laboratorio,
        "estado_situacion": estado_situacion
    }

