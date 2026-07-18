"""Render an Initial Guarantee Letter (IGL) as a PDF with ReportLab.

The layout mirrors a formal insurance guarantee letter: a letterhead (issuer
box + contact line), a centered title between rules, the date and reference, a
salutation, justified body paragraphs, a details table, and a sign-off.
"""
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

NAVY = colors.HexColor("#1f2d5a")
GREY = colors.HexColor("#555f6c")
LIGHT = colors.HexColor("#c3c6d6")


def _draw_accent_bar(canvas, doc):
    """A short navy accent bar in the top-left corner, like the template."""
    canvas.saveState()
    canvas.setFillColor(NAVY)
    page_height = doc.pagesize[1]
    canvas.rect(12 * mm, page_height - 38 * mm, 2.5 * mm, 22 * mm, fill=1, stroke=0)
    canvas.restoreState()


def build_guarantee_letter(data: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=22 * mm,
        rightMargin=22 * mm,
        topMargin=18 * mm,
        bottomMargin=16 * mm,
        title=f"Guarantee Letter {data.get('glReference', '')}",
        author=data.get("insurer", "Insurer"),
    )

    base = getSampleStyleSheet()
    issuer_style = ParagraphStyle(
        "Issuer", parent=base["Normal"], fontName="Helvetica-Bold",
        fontSize=13, textColor=NAVY, alignment=TA_CENTER, leading=16,
    )
    contact_style = ParagraphStyle(
        "Contact", parent=base["Normal"], fontSize=8.5, textColor=GREY,
        alignment=TA_CENTER, leading=12,
    )
    title_style = ParagraphStyle(
        "GLTitle", parent=base["Title"], fontName="Helvetica-Bold",
        fontSize=20, textColor=colors.HexColor("#151c27"), alignment=TA_CENTER,
        spaceBefore=6, spaceAfter=6,
    )
    meta_style = ParagraphStyle(
        "Meta", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=10,
        leading=14,
    )
    body_style = ParagraphStyle(
        "Body", parent=base["Normal"], fontSize=10.5, leading=16,
        alignment=TA_JUSTIFY, spaceAfter=10,
    )
    label_style = ParagraphStyle(
        "Label", parent=base["Normal"], fontSize=9, textColor=GREY, leading=13,
    )
    value_style = ParagraphStyle(
        "Value", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=9.5,
        leading=13,
    )
    footer_style = ParagraphStyle(
        "Footer", parent=base["Normal"], fontSize=7.5, textColor=GREY,
        alignment=TA_CENTER, leading=10,
    )

    insurer = data.get("insurer", "The Insurer")
    story = []

    # Letterhead: issuer box + contact line.
    issuer_box = Table(
        [[Paragraph(insurer, issuer_style)]], colWidths=[85 * mm]
    )
    issuer_box.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1, NAVY),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    issuer_box.hAlign = "CENTER"
    story.append(issuer_box)
    story.append(Spacer(1, 5))
    story.append(
        Paragraph(
            "Claims &amp; Guarantee Department  |  claims@insurer.example  |  "
            "www.insurer.example  |  +60 3-0000 0000",
            contact_style,
        )
    )
    story.append(Spacer(1, 14))

    # Title between two rules.
    story.append(HRFlowable(width="100%", thickness=0.75, color=LIGHT))
    story.append(Paragraph("Initial Guarantee Letter", title_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=LIGHT))
    story.append(Spacer(1, 16))

    # Date + reference.
    story.append(Paragraph(data.get("issueDate", ""), meta_style))
    story.append(
        Paragraph(f"Reference: {data.get('glReference', '')}", meta_style)
    )
    story.append(Spacer(1, 12))

    hospital = data.get("hospitalName", "the attending hospital")
    story.append(Paragraph(f"To the Admissions Office, {hospital},", body_style))

    patient = data.get("patientName", "the patient")
    amount = data.get("guaranteedAmount") or "the approved amount"
    valid_until = data.get("validUntil", "")

    story.append(
        Paragraph(
            f"This letter formally confirms that <b>{insurer}</b> guarantees "
            f"payment for the inpatient admission of <b>{patient}</b> at "
            f"<b>{hospital}</b>, issued under the member's active medical policy. "
            "This Initial Guarantee Letter authorises the hospital to proceed "
            "with the admission and treatment described below.",
            body_style,
        )
    )
    story.append(
        Paragraph(
            f"The guaranteed amount for this admission is <b>{amount}</b>, "
            "subject to the policy terms, exclusions, and the member's remaining "
            f"annual limit. This guarantee is valid until <b>{valid_until}</b>.",
            body_style,
        )
    )

    # Details table.
    def row(label, value):
        return [
            Paragraph(label, label_style),
            Paragraph(value or "&mdash;", value_style),
        ]

    details = Table(
        [
            row("Patient name", data.get("patientName")),
            row("NRIC", data.get("nric")),
            row("Member / Policy no.", data.get("memberId")),
            row("Coverage plan", data.get("policyPlan")),
            row("Diagnosis", data.get("diagnosis")),
            row("Reason for admission", data.get("admissionReason")),
            row("Guaranteed amount", amount),
        ],
        colWidths=[50 * mm, None],
    )
    details.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.75, LIGHT),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, LIGHT),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f4f6fb")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(details)
    story.append(Spacer(1, 14))

    story.append(
        Paragraph(
            f"<b>{insurer}</b> assures that the terms and conditions set out in "
            "the policy document will be honoured, and that the hospital will be "
            "reimbursed for eligible charges up to the guaranteed amount upon "
            "submission of a complete claim. For any queries, please contact the "
            f"claims department quoting reference {data.get('glReference', '')}.",
            body_style,
        )
    )
    story.append(Spacer(1, 18))

    story.append(Paragraph("Authorised for and on behalf of,", body_style))
    story.append(Paragraph(f"<b>{insurer}</b>", meta_style))
    story.append(Paragraph("Claims &amp; Guarantee Department", label_style))
    story.append(Spacer(1, 24))

    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT))
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            "This is a system-generated Initial Guarantee Letter produced by the "
            "Rawat Lawat platform for demonstration purposes and does not "
            "constitute a real insurance guarantee.",
            footer_style,
        )
    )

    doc.build(story, onFirstPage=_draw_accent_bar, onLaterPages=_draw_accent_bar)
    return buffer.getvalue()
