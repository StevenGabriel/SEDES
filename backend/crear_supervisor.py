import uuid
from database import SessionLocal
from models import Role, Usuario
from security import hash_password

def crear_supervisor():
    db = SessionLocal()
    try:
        # 1. Obtener o verificar el rol Supervisor Técnico
        rol_supervisor = db.query(Role).filter(Role.nombre == "Supervisor Técnico").first()
        if not rol_supervisor:
            rol_supervisor = Role(nombre="Supervisor Técnico")
            db.add(rol_supervisor)
            db.commit()
            db.refresh(rol_supervisor)
            print("✅ Rol 'Supervisor Técnico' creado.")

        # 2. Verificar si el usuario ya existe
        email = "supervisor@sedes.gob.bo"
        usuario_existente = db.query(Usuario).filter(Usuario.email == email).first()

        if usuario_existente:
            usuario_existente.rol_id = rol_supervisor.id
            usuario_existente.password_hash = hash_password("password123")
            usuario_existente.estado = True
            db.commit()
            print(f"✅ Usuario {email} actualizado correctamente con rol 'Supervisor Técnico' y contraseña 'password123'.")
        else:
            nuevo_supervisor = Usuario(
                id=uuid.uuid4(),
                rol_id=rol_supervisor.id,
                nombres="Marco Antonio",
                apellidos="Vargas Rojas",
                ci_nit="6549871",
                email=email,
                password_hash=hash_password("password123"),
                telefono="+591 4 4258900",
                estado=True
            )
            db.add(nuevo_supervisor)
            db.commit()
            print(f"🎉 Supervisor registrado exitosamente:")
            print(f"   Email: {email}")
            print(f"   Contraseña: password123")
            print(f"   Rol: Supervisor Técnico")

    except Exception as e:
        print(f"❌ Error al crear supervisor: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    crear_supervisor()
