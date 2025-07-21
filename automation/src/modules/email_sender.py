"""
Email Sender Module
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

class EmailSender:
    """Email sending manager"""

    def __init__(self, smtp_host=None, smtp_port=587, username=None, password=None):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.logger = logging.getLogger(__name__)
        self._initialized = False

    def initialize(self):
        """Initialize email service"""
        try:
            if self.smtp_host and self.username and self.password:
                # Test connection
                server = smtplib.SMTP(self.smtp_host, self.smtp_port)
                server.starttls()
                server.login(self.username, self.password)
                server.quit()
                self._initialized = True
                self.logger.info("Email service initialized")
            else:
                self.logger.warning("Email credentials not found - using mock mode")
                self._initialized = True

        except Exception as e:
            self.logger.error(f"Failed to initialize email service: {str(e)}")
            self._initialized = False

        return self._initialized

    def is_initialized(self):
        """Check if service is initialized"""
        return self._initialized

    def send_email(self, to_email, subject, body, from_email=None, attachments=None):
        """Send single email"""
        try:
            if not self._initialized:
                raise Exception("Email service not initialized")

            from_email = from_email or self.username

            if self.smtp_host:
                msg = MIMEMultipart()
                msg['From'] = from_email
                msg['To'] = to_email
                msg['Subject'] = subject

                msg.attach(MIMEText(body, 'html'))

                # Add attachments if any
                if attachments:
                    for attachment in attachments:
                        self._add_attachment(msg, attachment)

                server = smtplib.SMTP(self.smtp_host, self.smtp_port)
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
                server.quit()

                self.logger.info(f"Email sent to {to_email}")
                return {'status': 'sent', 'to': to_email}
            else:
                self.logger.info(f"Mock email sent to {to_email}: {subject}")
                return {'status': 'sent', 'to': to_email, 'mock': True}

        except Exception as e:
            self.logger.error(f"Error sending email to {to_email}: {str(e)}")
            return {'status': 'failed', 'to': to_email, 'error': str(e)}

    def send_bulk_email(self, recipients, subject, template, data=None):
        """Send bulk emails"""
        results = []

        for recipient in recipients:
            # Customize email for each recipient
            personalized_subject = subject
            personalized_body = self._render_template(template, data or {})

            result = self.send_email(recipient, personalized_subject, personalized_body)
            results.append(result)

        return results

    def _render_template(self, template, data):
        """Render email template with data"""
        if template == 'default':
            return f"""
            <html>
            <body>
                <h2>Automation Report</h2>
                <p>Your automation task has completed successfully.</p>
                <p><strong>Timestamp:</strong> {data.get('timestamp', 'N/A')}</p>
                <p><strong>Records Processed:</strong> {data.get('records', 'N/A')}</p>
            </body>
            </html>
            """
        elif template == 'error':
            return f"""
            <html>
            <body>
                <h2>Automation Error Report</h2>
                <p>An error occurred during automation task execution.</p>
                <p><strong>Error:</strong> {data.get('error', 'Unknown error')}</p>
                <p><strong>Timestamp:</strong> {data.get('timestamp', 'N/A')}</p>
            </body>
            </html>
            """
        else:
            return template

    def _add_attachment(self, msg, attachment_path):
        """Add attachment to email"""
        try:
            with open(attachment_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())

            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {os.path.basename(attachment_path)}'
            )
            msg.attach(part)

        except Exception as e:
            self.logger.error(f"Error adding attachment {attachment_path}: {str(e)}")
