import os
import json
import uuid
from datetime import datetime, date
from pathlib import Path
from sqlalchemy import text
from geoalchemy2 import WKTElement
from geoalchemy2.functions import ST_AsText

from database import engine, SessionLocal, Base
import models

BACKUP_DIR = Path(__file__).resolve().parent / 'backups'
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

def serializar_valor(val):
    if val is None:
        return None
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if isinstance(val, uuid.UUID):
        return str(val)
    return val

def parsear_fecha(val_str):
    if not val_str:
        return None
    try:
        return datetime.fromisoformat(val_str)
    except Exception:
        try:
            return datetime.strptime(val_str, '%Y-%m-%d').date()
        except Exception:
            return None

def generar_backup() -> str:
    db = SessionLocal()
    ahora = datetime.now()
    timestamp = ahora.strftime('%Y%m%d_%H%M%S')
    backup_filename_json = BACKUP_DIR / f'backup_sedes_db_{timestamp}.json'

    print(f'\n======================================================')
    print(f' [PASO 1] GENERANDO BACKUP COMPLETO DE LA BASE DE DATOS')
    print(f'======================================================')

    backup_data = {
        'version': '1.0',
        'timestamp': ahora.isoformat(),
        'descripcion': 'Respaldo previo al vaciado para datos reales',
        'tablas': {}
    }

    totales = {}

    try:
        # 1. Roles
        roles = db.query(models.Role).order_by(models.Role.id.asc()).all()
        backup_data['tablas']['roles'] = [
            {
                'id': r.id,
                'nombre': r.nombre,
                'estado': r.estado,
                'fecha_creacion': serializar_valor(r.fecha_creacion),
                'fecha_modificacion': serializar_valor(r.fecha_modificacion)
            }
            for r in roles
        ]
        totales['roles'] = len(roles)

        # 2. Usuarios
        usuarios = db.query(models.Usuario).all()
        backup_data['tablas']['usuarios'] = [
            {
                'id': serializar_valor(u.id),
                'rol_id': u.rol_id,
                'nombres': u.nombres,
                'apellidos': u.apellidos,
                'ci_nit': u.ci_nit,
                'email': u.email,
                'password_hash': u.password_hash,
                'telefono': u.telefono,
                'estado': u.estado,
                'fecha_creacion': serializar_valor(u.fecha_creacion),
                'fecha_modificacion': serializar_valor(u.fecha_modificacion)
            }
            for u in usuarios
        ]
        totales['usuarios'] = len(usuarios)

        # 3. Establecimientos
        establecimientos = db.query(models.Establecimiento).all()
        estabs_list = []
        for e in establecimientos:
            wkt_geom = None
            if e.coordenadas is not None:
                try:
                    wkt_res = db.query(ST_AsText(e.coordenadas)).filter(models.Establecimiento.id == e.id).scalar()
                    wkt_geom = wkt_res
                except Exception:
                    pass
            estabs_list.append({
                'id': serializar_valor(e.id),
                'propietario_id': serializar_valor(e.propietario_id),
                'codigo_cue': e.codigo_cue,
                'nombre_comercial': e.nombre_comercial,
                'tipo': e.tipo,
                'nivel': e.nivel,
                'municipio': e.municipio,
                'responsable_laboratorio': e.responsable_laboratorio,
                'responsables_areas': e.responsables_areas,
                'direccion': e.direccion,
                'coordenadas_wkt': wkt_geom,
                'horario': e.horario,
                'telefono': e.telefono,
                'email_contacto': e.email_contacto,
                'descripcion': e.descripcion,
                'imagen_url': e.imagen_url,
                'servicios': e.servicios,
                'observaciones': e.observaciones,
                'estado_operativo': e.estado_operativo,
                'estado': e.estado,
                'fecha_creacion': serializar_valor(e.fecha_creacion),
                'fecha_modificacion': serializar_valor(e.fecha_modificacion)
            })
        backup_data['tablas']['establecimientos'] = estabs_list
        totales['establecimientos'] = len(establecimientos)

        # 4. Tramites
        tramites = db.query(models.Tramite).all()
        backup_data['tablas']['tramites'] = [
            {
                'id': serializar_valor(t.id),
                'establecimiento_id': serializar_valor(t.establecimiento_id),
                'supervisor_asignado_id': serializar_valor(t.supervisor_asignado_id),
                'tipo_tramite': t.tipo_tramite,
                'estado_tramite': t.estado_tramite,
                'fecha_ingreso': serializar_valor(t.fecha_ingreso),
                'estado': t.estado,
                'fecha_creacion': serializar_valor(t.fecha_creacion),
                'fecha_modificacion': serializar_valor(t.fecha_modificacion)
            }
            for t in tramites
        ]
        totales['tramites'] = len(tramites)

        # 5. Catalogo Requisitos
        cat_reqs = db.query(models.CatalogoRequisito).order_by(models.CatalogoRequisito.id.asc()).all()
        backup_data['tablas']['catalogo_requisitos'] = [
            {
                'id': c.id,
                'seccion_codigo': c.seccion_codigo,
                'seccion_titulo': c.seccion_titulo,
                'seccion_subtitulo': c.seccion_subtitulo,
                'nombre_documento': c.nombre_documento,
                'categoria': c.categoria,
                'aplica_a': c.aplica_a,
                'es_obligatorio': c.es_obligatorio,
                'es_subtitulo': c.es_subtitulo,
                'orden': c.orden,
                'estado': c.estado,
                'fecha_creacion': serializar_valor(c.fecha_creacion),
                'fecha_modificacion': serializar_valor(c.fecha_modificacion)
            }
            for c in cat_reqs
        ]
        totales['catalogo_requisitos'] = len(cat_reqs)

        # 6. Tramite Documentos
        docs = db.query(models.TramiteDocumento).all()
        backup_data['tablas']['tramite_documentos'] = [
            {
                'id': serializar_valor(d.id),
                'tramite_id': serializar_valor(d.tramite_id),
                'requisito_id': d.requisito_id,
                'archivo_url': d.archivo_url,
                'estado_validacion': d.estado_validacion,
                'observaciones_supervisor': d.observaciones_supervisor,
                'fecha_limite_subsanacion': serializar_valor(d.fecha_limite_subsanacion),
                'estado': d.estado,
                'fecha_creacion': serializar_valor(d.fecha_creacion),
                'fecha_modificacion': serializar_valor(d.fecha_modificacion)
            }
            for d in docs
        ]
        totales['tramite_documentos'] = len(docs)

        # 7. Inspecciones
        insps = db.query(models.Inspeccion).all()
        backup_data['tablas']['inspecciones'] = [
            {
                'id': serializar_valor(i.id),
                'tramite_id': serializar_valor(i.tramite_id),
                'supervisor_id': serializar_valor(i.supervisor_id),
                'fecha_programada': serializar_valor(i.fecha_programada),
                'estado_inspeccion': i.estado_inspeccion,
                'veredicto_final': i.veredicto_final,
                'acta_pdf_url': i.acta_pdf_url,
                'estado': i.estado,
                'fecha_creacion': serializar_valor(i.fecha_creacion),
                'fecha_modificacion': serializar_valor(i.fecha_modificacion)
            }
            for i in insps
        ]
        totales['inspecciones'] = len(insps)

        # 8. Citaciones Infracciones
        citaciones = db.query(models.CitacionInfraccion).all()
        backup_data['tablas']['citaciones_infracciones'] = [
            {
                'id': serializar_valor(ci.id),
                'establecimiento_id': serializar_valor(ci.establecimiento_id),
                'supervisor_id': serializar_valor(ci.supervisor_id),
                'motivo_citacion': ci.motivo_citacion,
                'evidencia_foto_url': ci.evidencia_foto_url,
                'fecha_emision': serializar_valor(ci.fecha_emision),
                'alerta_enviada': ci.alerta_enviada,
                'estado': ci.estado,
                'fecha_creacion': serializar_valor(ci.fecha_creacion),
                'fecha_modificacion': serializar_valor(ci.fecha_modificacion)
            }
            for ci in citaciones
        ]
        totales['citaciones_infracciones'] = len(citaciones)

        # 9. Notificaciones
        notifs = db.query(models.Notificacion).all()
        backup_data['tablas']['notificaciones'] = [
            {
                'id': serializar_valor(n.id),
                'usuario_id': serializar_valor(n.usuario_id),
                'titulo': n.titulo,
                'mensaje': n.mensaje,
                'leido': n.leido,
                'estado': n.estado,
                'fecha_creacion': serializar_valor(n.fecha_creacion),
                'fecha_modificacion': serializar_valor(n.fecha_modificacion)
            }
            for n in notifs
        ]
        totales['notificaciones'] = len(notifs)

        # 10. Historial Actividades
        hist = db.query(models.HistorialActividad).all()
        backup_data['tablas']['historial_actividades'] = [
            {
                'id': serializar_valor(h.id),
                'codigo_tramite': h.codigo_tramite,
                'establecimiento': h.establecimiento,
                'accion': h.accion,
                'responsable': h.responsable,
                'estado_resultado': h.estado_resultado,
                'estado_badge': h.estado_badge,
                'fecha_hora_formato': h.fecha_hora_formato,
                'estado': h.estado,
                'fecha_creacion': serializar_valor(h.fecha_creacion),
                'fecha_modificacion': serializar_valor(h.fecha_modificacion)
            }
            for h in hist
        ]
        totales['historial_actividades'] = len(hist)

        # Guardar archivo JSON
        with open(backup_filename_json, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)

        print(f'[OK] Respaldo generado y guardado con xito:')
        print(f'    Archivo: {backup_filename_json}')
        print(f'    Detalle de registros respaldados:')
        for tabla, cantidad in totales.items():
            print(f'       {tabla.ljust(25)}: {cantidad} registros')

        return str(backup_filename_json)

    except Exception as e:
        print(f'[ERROR] Error crtico al generar backup: {e}')
        raise
    finally:
        db.close()

def vaciar_base_datos(conservar_roles_y_personal: bool = True):
    db = SessionLocal()
    print(f'\n======================================================')
    print(f' [PASO 2] LIMPIANDO BASE DE DATOS PARA DATOS REALES')
    print(f'======================================================')
    try:
        # Eliminar tablas en orden por foreign keys
        num_docs = db.query(models.TramiteDocumento).delete()
        num_insps = db.query(models.Inspeccion).delete()
        num_cits = db.query(models.CitacionInfraccion).delete()
        num_notifs = db.query(models.Notificacion).delete()
        num_hist = db.query(models.HistorialActividad).delete()
        num_tram = db.query(models.Tramite).delete()
        num_est = db.query(models.Establecimiento).delete()

        if conservar_roles_y_personal:
            rol_prop = db.query(models.Role).filter(models.Role.nombre == 'Propietario').first()
            if rol_prop:
                num_usrs = db.query(models.Usuario).filter(models.Usuario.rol_id == rol_prop.id).delete()
            else:
                num_usrs = 0
            print(f'    Documentos de trmites eliminados : {num_docs}')
            print(f'    Inspecciones eliminadas           : {num_insps}')
            print(f'    Citaciones eliminadas              : {num_cits}')
            print(f'    Notificaciones eliminadas          : {num_notifs}')
            print(f'    Historial de auditora eliminado   : {num_hist}')
            print(f'    Trmites eliminados                : {num_tram}')
            print(f'    Establecimientos eliminados        : {num_est}')
            print(f'    Propietarios de prueba eliminados  : {num_usrs}')
            print(f'  ------------------------------------------------------')
            print(f'   CONSERVADOS PARA USO INMEDIATO:')
            print(f'      Roles del Sistema (Administrador, Coordinador, Supervisor, Director, Propietario)')
            print(f'      Cuentas de Personal Oficial SEDES (admin@, coordinador@, supervisor@, andrea.torrico@, etc.)')
            print(f'      Catlogo Oficial de Requisitos Normativos (Secciones 2.1 a 2.5)')
        else:
            num_usrs = db.query(models.Usuario).delete()
            db.query(models.CatalogoRequisito).delete()
            print(f'    Vaciado total completado.')

        db.commit()
        print(f'\n[OK] Base de datos limpia y 100% preparada para el ingreso de datos reales!')
    except Exception as e:
        db.rollback()
        print(f'[ERROR] Error al vaciar base de datos: {e}')
        raise
    finally:
        db.close()

def restaurar_backup(archivo_backup: str):
    p = Path(archivo_backup)
    if not p.exists():
        print(f'[ERROR] Archivo de respaldo no encontrado: {archivo_backup}')
        return

    with open(p, 'r', encoding='utf-8') as f:
        data = json.load(f)

    db = SessionLocal()
    print(f'\n======================================================')
    print(f'[RESTORE] RESTAURANDO BASE DE DATOS DESDE: {p.name}')
    print(f'======================================================')
    try:
        # 1. Limpiar datos existentes
        db.query(models.TramiteDocumento).delete()
        db.query(models.Inspeccion).delete()
        db.query(models.CitacionInfraccion).delete()
        db.query(models.Notificacion).delete()
        db.query(models.HistorialActividad).delete()
        db.query(models.Tramite).delete()
        db.query(models.Establecimiento).delete()
        db.query(models.Usuario).delete()
        db.query(models.CatalogoRequisito).delete()
        db.query(models.Role).delete()
        db.commit()

        tablas = data.get('tablas', {})

        # Roles
        for r in tablas.get('roles', []):
            db.add(models.Role(
                id=r['id'],
                nombre=r['nombre'],
                estado=r.get('estado', True),
                fecha_creacion=parsear_fecha(r.get('fecha_creacion')),
                fecha_modificacion=parsear_fecha(r.get('fecha_modificacion'))
            ))
        db.commit()

        # Catalogo Requisitos
        for c in tablas.get('catalogo_requisitos', []):
            db.add(models.CatalogoRequisito(
                id=c['id'],
                seccion_codigo=c.get('seccion_codigo'),
                seccion_titulo=c.get('seccion_titulo'),
                seccion_subtitulo=c.get('seccion_subtitulo'),
                nombre_documento=c['nombre_documento'],
                categoria=c.get('categoria', 'General'),
                aplica_a=c.get('aplica_a', 'Todos'),
                es_obligatorio=c.get('es_obligatorio', True),
                es_subtitulo=c.get('es_subtitulo', False),
                orden=c.get('orden', 1),
                estado=c.get('estado', True)
            ))
        db.commit()

        # Usuarios
        for u in tablas.get('usuarios', []):
            db.add(models.Usuario(
                id=uuid.UUID(u['id']),
                rol_id=u['rol_id'],
                nombres=u['nombres'],
                apellidos=u['apellidos'],
                ci_nit=u['ci_nit'],
                email=u['email'],
                password_hash=u['password_hash'],
                telefono=u.get('telefono'),
                estado=u.get('estado', True)
            ))
        db.commit()

        # Establecimientos
        for e in tablas.get('establecimientos', []):
            wkt = e.get('coordenadas_wkt')
            geom = WKTElement(wkt, srid=4326) if wkt else None
            db.add(models.Establecimiento(
                id=uuid.UUID(e['id']),
                propietario_id=uuid.UUID(e['propietario_id']),
                codigo_cue=e.get('codigo_cue'),
                nombre_comercial=e['nombre_comercial'],
                tipo=e['tipo'],
                nivel=e['nivel'],
                municipio=e['municipio'],
                responsable_laboratorio=e.get('responsable_laboratorio'),
                responsables_areas=e.get('responsables_areas'),
                direccion=e['direccion'],
                coordenadas=geom,
                horario=e.get('horario'),
                telefono=e.get('telefono'),
                email_contacto=e.get('email_contacto'),
                descripcion=e.get('descripcion'),
                imagen_url=e.get('imagen_url'),
                servicios=e.get('servicios'),
                observaciones=e.get('observaciones'),
                estado_operativo=e.get('estado_operativo', 'Habilitado'),
                estado=e.get('estado', True)
            ))
        db.commit()

        # Tramites
        for t in tablas.get('tramites', []):
            db.add(models.Tramite(
                id=uuid.UUID(t['id']),
                establecimiento_id=uuid.UUID(t['establecimiento_id']),
                supervisor_asignado_id=uuid.UUID(t['supervisor_asignado_id']) if t.get('supervisor_asignado_id') else None,
                tipo_tramite=t['tipo_tramite'],
                estado_tramite=t['estado_tramite'],
                fecha_ingreso=parsear_fecha(t.get('fecha_ingreso')),
                estado=t.get('estado', True)
            ))
        db.commit()

        # Tramite Documentos
        for d in tablas.get('tramite_documentos', []):
            db.add(models.TramiteDocumento(
                id=uuid.UUID(d['id']),
                tramite_id=uuid.UUID(d['tramite_id']),
                requisito_id=d['requisito_id'],
                archivo_url=d['archivo_url'],
                estado_validacion=d.get('estado_validacion', 'Pendiente'),
                observaciones_supervisor=d.get('observaciones_supervisor'),
                fecha_limite_subsanacion=parsear_fecha(d.get('fecha_limite_subsanacion')),
                estado=d.get('estado', True)
            ))

        # Inspecciones
        for i in tablas.get('inspecciones', []):
            db.add(models.Inspeccion(
                id=uuid.UUID(i['id']),
                tramite_id=uuid.UUID(i['tramite_id']),
                supervisor_id=uuid.UUID(i['supervisor_id']),
                fecha_programada=parsear_fecha(i['fecha_programada']),
                estado_inspeccion=i.get('estado_inspeccion', 'Pendiente'),
                veredicto_final=i.get('veredicto_final'),
                acta_pdf_url=i.get('acta_pdf_url'),
                estado=i.get('estado', True)
            ))

        # Citaciones
        for ci in tablas.get('citaciones_infracciones', []):
            db.add(models.CitacionInfraccion(
                id=uuid.UUID(ci['id']),
                establecimiento_id=uuid.UUID(ci['establecimiento_id']),
                supervisor_id=uuid.UUID(ci['supervisor_id']),
                motivo_citacion=ci['motivo_citacion'],
                evidencia_foto_url=ci.get('evidencia_foto_url'),
                fecha_emision=parsear_fecha(ci.get('fecha_emision')),
                alerta_enviada=ci.get('alerta_enviada', False),
                estado=ci.get('estado', True)
            ))

        # Notificaciones
        for n in tablas.get('notificaciones', []):
            db.add(models.Notificacion(
                id=uuid.UUID(n['id']),
                usuario_id=uuid.UUID(n['usuario_id']),
                titulo=n['titulo'],
                mensaje=n['mensaje'],
                leido=n.get('leido', False),
                estado=n.get('estado', True)
            ))

        # Historial
        for h in tablas.get('historial_actividades', []):
            db.add(models.HistorialActividad(
                id=uuid.UUID(h['id']),
                codigo_tramite=h['codigo_tramite'],
                establecimiento=h['establecimiento'],
                accion=h['accion'],
                responsable=h['responsable'],
                estado_resultado=h['estado_resultado'],
                estado_badge=h.get('estado_badge', 'bg-emerald-50 text-emerald-700 border-emerald-200'),
                fecha_hora_formato=h['fecha_hora_formato'],
                estado=h.get('estado', True)
            ))

        db.commit()
        print('[OK] Restauracin completada con xito!')
    except Exception as e:
        db.rollback()
        print(f'[ERROR] Error al restaurar: {e}')
        raise
    finally:
        db.close()

if __name__ == '__main__':
    archivo = generar_backup()
    vaciar_base_datos(conservar_roles_y_personal=True)
