"""
Single-page Agronomic Advisory PDF generator with embedded Noto Sans Bengali font.
"""

import io

from django.conf import settings
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

FONT_PATH = settings.BASE_DIR / "apps" / "reports" / "fonts" / "NotoSansBengali-Regular.ttf"

_FONT_REGISTERED = False


def register_bengali_font():
    global _FONT_REGISTERED
    if not _FONT_REGISTERED:
        if FONT_PATH.exists():
            pdfmetrics.registerFont(TTFont("NotoSansBengali", str(FONT_PATH)))
            _FONT_REGISTERED = True
        else:
            raise FileNotFoundError(f"Font not found at {FONT_PATH}")


def generate_advisory_pdf(history_item, farmer_name: str = "সম্মানিত কৃষক") -> bytes:
    """Generates a complete single-page agronomic advisory PDF in Bangla."""
    register_bengali_font()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom Bangla typography styles
    font_name = "NotoSansBengali" if _FONT_REGISTERED else "Helvetica"

    title_style = ParagraphStyle(
        "BanglaTitle",
        parent=styles["Heading1"],
        fontName=font_name,
        fontSize=20,
        leading=26,
        textColor=colors.HexColor("#1b5e20"),  # Forest Green
        alignment=1,  # Center
    )

    tagline_style = ParagraphStyle(
        "BanglaTagline",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#33691e"),
        alignment=1,
    )

    meta_style = ParagraphStyle(
        "BanglaMeta",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#37474f"),
    )

    heading_style = ParagraphStyle(
        "BanglaHeading",
        parent=styles["Heading2"],
        fontName=font_name,
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#2e7d32"),
        spaceBefore=8,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "BanglaBody",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#212121"),
    )

    disclaimer_style = ParagraphStyle(
        "BanglaDisclaimer",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=7.5,
        leading=11,
        textColor=colors.HexColor("#d32f2f"),
        alignment=1,
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("মৃত্তিকা এআই (Mrittika AI)", title_style))
    story.append(Paragraph("সঠিক ফসল, সঠিক সার, সঠিক পরামর্শ - এআই প্রযুক্তিতে আধুনিক কৃষি", tagline_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2e7d32"), spaceAfter=10))

    # 2. Farmer & Land Metadata Table
    created_str = history_item.created_at.strftime("%d-%m-%Y %I:%M %p")
    inp = history_item.inputs or {}
    area_unit = f"{inp.get('land_area', 1.0)} {inp.get('land_unit', 'বিঘা')}"

    meta_data = [
        [
            Paragraph(f"<b>কৃষকের নাম:</b> {farmer_name}", meta_style),
            Paragraph(f"<b>তারিখ ও সময়:</b> {created_str}", meta_style),
        ],
        [
            Paragraph(f"<b>মৌসুম:</b> {inp.get('season', 'রবি')}", meta_style),
            Paragraph(f"<b>মাটির ধরন:</b> {inp.get('soil_type', 'দোআঁশ')}", meta_style),
        ],
        [
            Paragraph(f"<b>জমির পরিমাণ:</b> {area_unit}", meta_style),
            Paragraph(f"<b>মাটির pH:</b> {inp.get('pH', '৬.৫')}", meta_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f8e9")),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#c5e1a5")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    out = history_item.outputs or {}

    # 3. Recommendations Summary
    if history_item.crop_name_bn:
        story.append(Paragraph(f"<b>নির্বাচিত ফসল:</b> {history_item.crop_name_bn}", heading_style))

    # Fertilizer table
    fert_items = out.get("fertilizer_items", [])
    if fert_items:
        story.append(Paragraph("সুপারিশকৃত সারের মাত্রা (Fertilizer Dosages)", heading_style))
        table_data = [
            [
                Paragraph("<b>সারের নাম</b>", body_style),
                Paragraph("<b>পুষ্টি উপাদান</b>", body_style),
                Paragraph("<b>কেজি / বিঘা</b>", body_style),
                Paragraph("<b>কেজি / শতক</b>", body_style),
                Paragraph(f"<b>মোট সার ({area_unit})</b>", body_style),
            ]
        ]
        for it in fert_items:
            table_data.append([
                Paragraph(it.get("name_bn", ""), body_style),
                Paragraph(it.get("nutrient", ""), body_style),
                Paragraph(str(it.get("rate_kg_bigha", "")), body_style),
                Paragraph(str(it.get("rate_kg_decimal", "")), body_style),
                Paragraph(f"<b>{it.get('total_quantity_kg', '')} কেজি</b>", body_style),
            ])

        fert_table = Table(table_data, colWidths=[130, 95, 95, 95, 105])
        fert_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f5e9")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#a5d6a7")),
            ("PADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(fert_table)
        story.append(Spacer(1, 10))

    # Application Schedule
    schedule = out.get("application_schedule", [])
    if schedule:
        story.append(Paragraph("সার প্রয়োগের সময়সূচী (Application Schedule)", heading_style))
        for step in schedule[:3]:  # Keep to 3 for single page fit
            story.append(Paragraph(f"• <b>{step.get('stage', '')}:</b> {step.get('instructions_bn', '')}", body_style))
        story.append(Spacer(1, 6))

    # Soil Health Notes
    soil_notes = out.get("soil_health_notes", [])
    if soil_notes:
        story.append(Paragraph("মাটির স্বাস্থ্য সম্পর্কিত বার্তা", heading_style))
        for note in soil_notes[:2]:
            story.append(Paragraph(f"• <b>{note.get('title_bn', '')}:</b> {note.get('message_bn', '')}", body_style))
        story.append(Spacer(1, 8))

    # Footer Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#ef9a9a"), spaceAfter=6))
    story.append(Paragraph(
        "সতর্কতা: এই পরামর্শটি এআই প্রযুক্তির প্রাথমিক গাইড। জমিতে প্রয়োগের পূর্বে স্থানীয় উপজেলা কৃষি কর্মকর্তা বা এসএএও (SAAO) এর সাথে যাচাই করুন।",
        disclaimer_style,
    ))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
