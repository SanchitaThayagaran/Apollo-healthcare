from django.conf import settings
import boto3
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

sns = boto3.client("sns", region_name=settings.AWS_REGION)

def send_appointment_reminder(patient_email, message):
    arn = settings.SNS_REMINDER_TOPIC_ARN
    logger.info(f"[notifications] using SNS ARN={arn!r}")
    if not arn:
        logger.error("[notifications] no SNS topic ARN configured!")
        return
    try:
        resp = sns.publish(
            TopicArn=arn,
            Message=message,
            Subject="Your Apollo Healthcare Appointment"
        )
        logger.info(f"[notifications] SNS publish response: {resp}")
    except Exception:
        logger.exception("[notifications] Failed to publish SNS message")
