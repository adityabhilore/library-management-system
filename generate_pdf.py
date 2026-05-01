#!/usr/bin/env python3
"""Generate PDF for ESP32 mDNS Solution Guide"""

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib import colors

    # Create PDF
    pdf_path = "ESP32_mDNS_Solution.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a3c6e'),
        spaceAfter=12,
        alignment=1
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1a3c6e'),
        spaceAfter=10,
        spaceBefore=10
    )

    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#0369a1'),
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        spaceAfter=6,
        leading=12
    )

    # Content
    content = []

    # Title
    content.append(Paragraph("Smart Library Access System", title_style))
    content.append(Paragraph("ESP32 mDNS Solution Guide", subheading_style))
    content.append(Spacer(1, 0.2*inch))

    # Problem Section
    content.append(Paragraph("PROBLEM: Hardcoded ESP32 IP Address", heading_style))
    content.append(Paragraph(
        "<b>Current Issue:</b><br/>"
        "• ESP32 IP hardcoded as 10.235.95.250 in door_control.py<br/>"
        "• When WiFi changes or ESP32 reconnects → IP changes<br/>"
        "• Communication with ESP32 breaks<br/>"
        "• Requires manual Arduino code update & re-upload<br/>"
        "• Not practical for production system",
        body_style
    ))
    content.append(Spacer(1, 0.15*inch))

    # Solution Section
    content.append(Paragraph("SOLUTION: mDNS (Multicast DNS)", heading_style))
    content.append(Paragraph(
        "<b>How it works:</b><br/>"
        "• Use hostname instead of IP: library-door.local<br/>"
        "• ESP32 automatically advertises on network<br/>"
        "• When WiFi changes → automatic re-advertisement<br/>"
        "• Backend always connects to library-door.local<br/>"
        "• Hostname automatically resolves to current IP",
        body_style
    ))
    content.append(Spacer(1, 0.2*inch))

    # Why mDNS Section
    content.append(Paragraph("Why mDNS is Perfect", heading_style))

    table_data = [
        ['Feature', 'mDNS', 'Static IP', 'Cloud DNS'],
        ['No router setup', 'YES', 'NO', 'NO'],
        ['Works on WiFi change', 'YES', 'NO', 'NO'],
        ['Local network only', 'YES', 'YES', 'NO'],
        ['No external service', 'YES', 'YES', 'NO'],
        ['Easy to implement', 'YES', 'MAYBE', 'NO'],
    ]

    table = Table(table_data, colWidths=[1.8*inch, 1.2*inch, 1.2*inch, 1.2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a3c6e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    content.append(table)
    content.append(Spacer(1, 0.2*inch))

    content.append(PageBreak())

    # Implementation Part 1
    content.append(Paragraph("STEP 1: Arduino Code for ESP32", heading_style))
    content.append(Paragraph(
        "<b>Add these includes at the top of your sketch:</b>",
        body_style
    ))

    code_block1 = """<font face="Courier" size="8">
#include &lt;WiFi.h&gt;<br/>
#include &lt;ESPmDNS.h&gt;
</font>"""
    content.append(Paragraph(code_block1, body_style))
    content.append(Spacer(1, 0.1*inch))

    content.append(Paragraph("<b>Add this to your setup() function:</b>", body_style))

    code_block2 = """<font face="Courier" size="8">
const char* ssid = "YOUR_WIFI_SSID";<br/>
const char* password = "YOUR_WIFI_PASSWORD";<br/>
<br/>
void setup() {<br/>
&nbsp;&nbsp;Serial.begin(115200);<br/>
&nbsp;&nbsp;WiFi.begin(ssid, password);<br/>
&nbsp;&nbsp;while (WiFi.status() != WL_CONNECTED) {<br/>
&nbsp;&nbsp;&nbsp;&nbsp;delay(500);<br/>
&nbsp;&nbsp;&nbsp;&nbsp;Serial.print(".");<br/>
&nbsp;&nbsp;}<br/>
&nbsp;&nbsp;Serial.println("WiFi connected!");<br/>
&nbsp;&nbsp;<br/>
&nbsp;&nbsp;if (!MDNS.begin("library-door")) {<br/>
&nbsp;&nbsp;&nbsp;&nbsp;Serial.println("mDNS failed!");<br/>
&nbsp;&nbsp;&nbsp;&nbsp;while(1) delay(1000);<br/>
&nbsp;&nbsp;}<br/>
&nbsp;&nbsp;Serial.println("mDNS ready - library-door.local");<br/>
&nbsp;&nbsp;MDNS.addService("http", "tcp", 80);<br/>
}
</font>"""
    content.append(Paragraph(code_block2, body_style))
    content.append(Spacer(1, 0.15*inch))

    content.append(Paragraph("<b>Upload Steps:</b>", subheading_style))
    content.append(Paragraph(
        "1. Replace WiFi credentials (SSID and password)<br/>"
        "2. Connect ESP32 via USB<br/>"
        "3. Select Board: ESP32 Dev Module<br/>"
        "4. Upload the sketch<br/>"
        "5. Open Serial Monitor<br/>"
        "6. Verify message: 'mDNS ready - library-door.local'<br/>"
        "7. Done! (One-time setup)",
        body_style
    ))
    content.append(Spacer(1, 0.2*inch))

    content.append(PageBreak())

    # Implementation Part 2
    content.append(Paragraph("STEP 2: Update Python Backend", heading_style))

    content.append(Paragraph("<b>Current Code (BROKEN):</b>", subheading_style))
    code_old = """<font face="Courier" size="9" color="red">
ESP32_IP = "10.235.95.250"
</font>"""
    content.append(Paragraph(code_old, body_style))
    content.append(Spacer(1, 0.1*inch))

    content.append(Paragraph("<b>New Code (FIXED):</b>", subheading_style))
    code_new = """<font face="Courier" size="9" color="green">
ESP32_HOSTNAME = "library-door.local"
</font>"""
    content.append(Paragraph(code_new, body_style))
    content.append(Spacer(1, 0.1*inch))

    content.append(Paragraph(
        "<b>In door_control.py, change ALL references from "
        "door control open URL to use the hostname instead of IP:</b>",
        body_style
    ))

    content.append(Paragraph(
        "<font face='Courier' size='9'>"
        "url = f'http://{ESP32_HOSTNAME}/open'"
        "</font>",
        body_style
    ))

    content.append(Spacer(1, 0.2*inch))

    # Testing
    content.append(Paragraph("Testing the Solution", heading_style))
    content.append(Paragraph(
        "<b>Test 1: Check mDNS Discovery</b><br/>"
        "<font face='Courier' size='9'>ping library-door.local</font><br/>"
        "Should respond with ESP32 IP address<br/>"
        "<br/>"
        "<b>Test 2: Check Door Control</b><br/>"
        "<font face='Courier' size='9'>curl http://library-door.local/open</font><br/>"
        "Door should open successfully<br/>"
        "<br/>"
        "<b>Test 3: WiFi Change Test</b><br/>"
        "1. Reconnect ESP32 to different WiFi<br/>"
        "2. Run ping test again<br/>"
        "3. IP may change, but hostname still works!",
        body_style
    ))

    content.append(Spacer(1, 0.3*inch))

    # Summary
    content.append(Paragraph("Final Summary", heading_style))
    content.append(Paragraph(
        "<b>What You've Fixed:</b><br/>"
        "✓ Hardcoded IP dependency removed<br/>"
        "✓ Automatic mDNS hostname discovery<br/>"
        "✓ Works across WiFi changes<br/>"
        "✓ No manual code updates needed<br/>"
        "✓ Production-ready solution<br/>"
        "<br/>"
        "<b>One-time Changes:</b><br/>"
        "• Arduino: Add mDNS code → Upload once<br/>"
        "• Python: Change IP to hostname → Deploy once<br/>"
        "<br/>"
        "<b>Result:</b><br/>"
        "Your door control system now works reliably forever!",
        body_style
    ))

    # Build PDF
    doc.build(content)
    print(f"SUCCESS! PDF created: {pdf_path}")

except ImportError as e:
    print(f"Error: reportlab library not found")
    print("Install it with: pip install reportlab")
    exit(1)
except Exception as e:
    print(f"Error creating PDF: {e}")
    exit(1)
