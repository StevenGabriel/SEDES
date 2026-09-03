import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("email_service")
logging.basicConfig(level=logging.INFO)

# Configuración SMTP (Variables de entorno o valores por defecto)
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "no-reply@sedescbba.gob.bo")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def build_reset_email_html(nombres: str, reset_link: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }}
            .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 50, 100, 0.08); }}
            .header {{ background: linear-gradient(135deg, #005596 0%, #0077be 50%, #0099e6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; }}
            .header p {{ margin: 6px 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }}
            .content {{ padding: 32px 28px; color: #334155; line-height: 1.6; font-size: 14px; }}
            .btn-container {{ text-align: center; margin: 30px 0; }}
            .btn {{ background-color: #0073c6; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(0, 115, 198, 0.3); }}
            .warning-box {{ background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #92400e; }}
            .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1>SEDES Cochabamba</h1>
                <p>Portal Único de Trámites y Requisitos</p>
            </div>
            <div class="content">
                <p>Estimado(a) <strong>{nombres}</strong>,</p>
                <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta en el sistema de trámites de laboratorios del SEDES.</p>
                
                <div class="warning-box">
                    ⏱️ <strong>Aviso de seguridad:</strong> Este enlace tiene una vigencia máxima de <strong>10 minutos</strong>. Si no fue usted quien solicitó este cambio, puede ignorar este mensaje de forma segura.
                </div>

                <div class="btn-container">
                    <a href="{reset_link}" class="btn" target="_blank">Restablecer Mi Contraseña</a>
                </div>

                <p style="font-size: 12px; color: #64748b; margin-top: 25px;">
                    Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:<br>
                    <a href="{reset_link}" style="color: #0073c6; word-break: break-all;">{reset_link}</a>
                </p>
            </div>
            <div class="footer">
                © 2026 Servicio Departamental de Salud (SEDES Cochabamba) • Bolivia<br>
                Este es un mensaje automático, por favor no responda a este correo.
            </div>
        </div>
    </body>
    </html>
    """

def send_password_reset_email(to_email: str, nombres: str, token: str) -> dict:
    """
    Envía el correo electrónico con el token de recuperación.
    Si SMTP no está configurado (entorno de pruebas local), registra el link en consola.
    """
    reset_link = f"{FRONTEND_URL}/restablecer-password?token={token}"
    
    # 1. Registro visible en consola para desarrollo
    logger.info("=================================================================")
    logger.info(f"📧 [RECUPERACIÓN DE CONTRASEÑA - SEDES]")
    logger.info(f"Para: {to_email} ({nombres})")
    logger.info(f"Enlace (Válido por 10 min): {reset_link}")
    logger.info("=================================================================")

    # 2. Si hay configuración SMTP activa, enviar correo real
    if SMTP_HOST and SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Recuperación de Contraseña - SEDES Cochabamba (10 minutos)"
            msg["From"] = f"SEDES Cochabamba <{SMTP_FROM}>"
            msg["To"] = to_email

            html_content = build_reset_email_html(nombres, reset_link)
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM, [to_email], msg.as_string())
            
            logger.info(f"✅ Correo enviado exitosamente a {to_email} vía SMTP.")
            return {"sent": True, "method": "smtp", "reset_link": reset_link}
        except Exception as e:
            logger.error(f"❌ Error al enviar correo SMTP: {e}")
            return {"sent": False, "method": "smtp_failed", "error": str(e), "reset_link": reset_link}
    
    return {"sent": True, "method": "dev_console", "reset_link": reset_link}
