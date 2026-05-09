from io import BytesIO

from django.core.files.base import ContentFile
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from .models import CourseCertificate, CourseProgress


def generate_course_certificate(user, product):
    """Create and persist a PDF certificate if it doesn't exist yet."""
    certificate, created = CourseCertificate.objects.get_or_create(
        user=user, product=product
    )
    if not created and certificate.pdf_file:
        return certificate

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setTitle(f"Certificado - {product.title}")
    pdf.setFont("Helvetica-Bold", 28)
    pdf.drawCentredString(width / 2, height - 140, "CERTIFICADO DE FINALIZACIÓN")

    pdf.setFont("Helvetica", 14)
    pdf.drawCentredString(width / 2, height - 210, "CodeAcademy certifica que")

    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawCentredString(width / 2, height - 255, user.get_full_name() or user.email)

    pdf.setFont("Helvetica", 14)
    pdf.drawCentredString(
        width / 2, height - 295, "ha completado satisfactoriamente el curso"
    )

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawCentredString(width / 2, height - 335, product.title)

    pdf.setFont("Helvetica", 12)
    pdf.drawCentredString(
        width / 2,
        height - 390,
        f'Fecha de emisión: {timezone.now().strftime("%Y-%m-%d %H:%M UTC")}',
    )

    pdf.showPage()
    pdf.save()

    file_name = f"certificate_user_{user.id}_course_{product.id}.pdf"
    certificate.pdf_file.save(file_name, ContentFile(buffer.getvalue()), save=True)
    buffer.close()

    return certificate


def get_course_progress(user, course):
    if not user.purchased_products.filter(pk=course.pk).exists():
        return None

    progress, _ = CourseProgress.objects.get_or_create(user=user, product=course)
    return progress


@transaction.atomic
def complete_course_chapter(user, course, chapter_id):
    chapter = get_object_or_404(course.chapters, pk=chapter_id)
    progress, _ = CourseProgress.objects.get_or_create(user=user, product=course)
    progress.completed_chapters.add(chapter)
    progress.current_chapter = chapter
    progress.save(update_fields=["current_chapter", "updated_at"])
    progress.recalculate_progress()
    return progress
