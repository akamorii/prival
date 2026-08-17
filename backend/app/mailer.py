import logging
import smtplib
from email.mime.text import MIMEText
from email.utils import formatdate

from sqlalchemy.orm import Session

from . import models
from .security import decrypt_secret

logger = logging.getLogger("mailer")

PROVIDER_SMTP: dict[str, tuple[str, int]] = {
    "gmail.com": ("smtp.gmail.com", 465),
    "yandex.ru": ("smtp.yandex.ru", 465),
    "yandex.com": ("smtp.yandex.ru", 465),
    "ya.ru": ("smtp.yandex.ru", 465),
    "mail.ru": ("smtp.mail.ru", 465),
    "outlook.com": ("smtp.office365.com", 587),
    "hotmail.com": ("smtp.office365.com", 587),
}


def resolve_smtp_host(email: str) -> tuple[str, int]:
    domain = email.rsplit("@", 1)[-1].lower()
    if domain in PROVIDER_SMTP:
        return PROVIDER_SMTP[domain]
    return f"smtp.{domain}", 465


def format_order_email(order: models.Order) -> str:
    local_time = order.created_at.strftime("%H:%M")
    lines = [f"Новый заказ №{order.id}", "", f"Стол: №{order.table_number}", f"Время: {local_time}", "", "Заказ:", ""]
    for item in order.items:
        line_total = item.price * item.quantity
        lines.append(f"{item.name} × {item.quantity} — {line_total} ₽")
    lines += ["", f"Итого: {order.total} ₽"]
    if order.comment:
        lines += ["", "Комментарий:", "", order.comment]
    return "\n".join(lines)


class MailerNotConfigured(Exception):
    pass


def send_order_email(db: Session, order: models.Order) -> None:
    settings_row = db.query(models.AppSettings).filter(models.AppSettings.id == 1).first()
    if not settings_row or not settings_row.smtp_email or not settings_row.smtp_app_password_encrypted or not settings_row.notify_email:
        raise MailerNotConfigured("Почта для уведомлений не настроена в админ-панели")

    password = decrypt_secret(settings_row.smtp_app_password_encrypted)
    if not password:
        raise MailerNotConfigured("Не удалось расшифровать пароль приложения")

    host, port = resolve_smtp_host(settings_row.smtp_email)

    message = MIMEText(format_order_email(order), "plain", "utf-8")
    message["Subject"] = f"Новый заказ №{order.id} — стол №{order.table_number}"
    message["From"] = settings_row.smtp_email
    message["To"] = settings_row.notify_email
    message["Date"] = formatdate(localtime=True)

    if port == 465:
        with smtplib.SMTP_SSL(host, port, timeout=15) as server:
            server.login(settings_row.smtp_email, password)
            server.sendmail(settings_row.smtp_email, [settings_row.notify_email], message.as_string())
    else:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            server.login(settings_row.smtp_email, password)
            server.sendmail(settings_row.smtp_email, [settings_row.notify_email], message.as_string())
