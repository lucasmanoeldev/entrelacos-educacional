import smtplib
from django.conf import settings
from django.core.mail import get_connection
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Valida conexão e autenticação SMTP sem enviar mensagens.'

    def handle(self, *args, **options):
        if settings.EMAIL_BACKEND != 'django.core.mail.backends.smtp.EmailBackend':
            raise CommandError('O envio SMTP ainda não está ativado.')
        if not all([settings.EMAIL_HOST, settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD]):
            raise CommandError('Preencha host, usuário e senha SMTP no ambiente do backend.')
        if not (settings.EMAIL_USE_TLS or settings.EMAIL_USE_SSL):
            raise CommandError('Configure TLS ou SSL antes de autenticar no provedor.')
        try:
            with get_connection() as connection:
                if connection.connection is None:
                    raise CommandError('Não foi possível abrir a conexão SMTP.')
        except smtplib.SMTPAuthenticationError:
            raise CommandError('O provedor recusou o login. Verifique o usuário e a senha de aplicativo/SMTP.') from None
        except (smtplib.SMTPException, OSError):
            raise CommandError('Falha na conexão SMTP. Verifique host, porta, criptografia e acesso de rede.') from None
        self.stdout.write(self.style.SUCCESS('Conexão e autenticação SMTP validadas. Nenhuma mensagem foi enviada.'))
