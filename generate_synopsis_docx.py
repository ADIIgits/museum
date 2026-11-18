import zipfile
import xml.etree.ElementTree as ET
import os
import xml.sax.saxutils as saxutils

def escape(text):
    if text is None:
        return ""
    # XML escape &, <, >, quotes
    return saxutils.escape(str(text))

def create_docx(filename, title, subtitle, sections):
    doc_xml_parts = []
    doc_xml_parts.append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    doc_xml_parts.append('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
                         'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">')
    doc_xml_parts.append('<w:body>')
    
    # Page Title / Header Block
    doc_xml_parts.append(f'''
    <w:p>
        <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:before="360" w:after="120"/>
        </w:pPr>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                <w:b/>
                <w:color w:val="1E3A8A"/>
                <w:sz w:val="52"/>
            </w:rPr>
            <w:t>{escape(title)}</w:t>
        </w:r>
    </w:p>
    <w:p>
        <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:before="0" w:after="280"/>
        </w:pPr>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                <w:i/>
                <w:color w:val="475569"/>
                <w:sz w:val="26"/>
            </w:rPr>
            <w:t>{escape(subtitle)}</w:t>
        </w:r>
    </w:p>
    ''')
    
    # Metadata callout block (Document Info Table / Meta)
    doc_xml_parts.append('''
    <w:tbl>
        <w:tblPr>
            <w:tblW w:w="9500" w:type="dxa"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:left w:val="none"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:right w:val="none"/>
                <w:insideH w:val="none"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
            <w:tblCellMar>
                <w:top w:w="120" w:type="dxa"/>
                <w:left w:w="160" w:type="dxa"/>
                <w:bottom w:w="120" w:type="dxa"/>
                <w:right w:w="160" w:type="dxa"/>
            </w:tblCellMar>
        </w:tblPr>
        <w:tr>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="4750" w:type="dxa"/>
                    <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
                </w:tcPr>
                <w:p>
                    <w:pPr><w:spacing w:after="40"/></w:pPr>
                    <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="334155"/></w:rPr><w:t>Project Type: </w:t></w:r>
                    <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>Full-Stack Web Application</w:t></w:r>
                </w:p>
                <w:p>
                    <w:pPr><w:spacing w:after="0"/></w:pPr>
                    <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="334155"/></w:rPr><w:t>Architecture: </w:t></w:r>
                    <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>Decoupled Client-Server (REST API)</w:t></w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="4750" w:type="dxa"/>
                    <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
                </w:tcPr>
                <w:p>
                    <w:pPr><w:spacing w:after="40"/></w:pPr>
                    <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="334155"/></w:rPr><w:t>Tech Stack: </w:t></w:r>
                    <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>Django REST Framework + React (Vite)</w:t></w:r>
                </w:p>
                <w:p>
                    <w:pPr><w:spacing w:after="0"/></w:pPr>
                    <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="334155"/></w:rPr><w:t>Document: </w:t></w:r>
                    <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>Comprehensive Project Synopsis</w:t></w:r>
                </w:p>
            </w:tc>
        </w:tr>
    </w:tbl>
    <w:p><w:pPr><w:spacing w:before="160" w:after="160"/></w:pPr></w:p>
    ''')
    
    # Process sections
    for sec in sections:
        # Heading 1
        h1 = sec.get("h1")
        if h1:
            doc_xml_parts.append(f'''
            <w:p>
                <w:pPr>
                    <w:pBdr>
                        <w:bottom w:val="single" w:sz="12" w:space="4" w:color="2563EB"/>
                    </w:pBdr>
                    <w:spacing w:before="360" w:after="160"/>
                    <w:keepNext/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                        <w:b/>
                        <w:color w:val="1E3A8A"/>
                        <w:sz w:val="32"/>
                    </w:rPr>
                    <w:t>{escape(h1)}</w:t>
                </w:r>
            </w:p>
            ''')
            
        # Items in section
        for item in sec.get("items", []):
            itype = item.get("type")
            if itype == "h2":
                doc_xml_parts.append(f'''
                <w:p>
                    <w:pPr>
                        <w:spacing w:before="240" w:after="80"/>
                        <w:keepNext/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                            <w:b/>
                            <w:color w:val="0F766E"/>
                            <w:sz w:val="26"/>
                        </w:rPr>
                        <w:t>{escape(item['text'])}</w:t>
                    </w:r>
                </w:p>
                ''')
            elif itype == "p":
                doc_xml_parts.append(f'''
                <w:p>
                    <w:pPr>
                        <w:spacing w:before="0" w:after="140" w:line="276" w:lineRule="auto"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                            <w:color w:val="1E293B"/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t>{escape(item['text'])}</w:t>
                    </w:r>
                </w:p>
                ''')
            elif itype == "callout":
                doc_xml_parts.append(f'''
                <w:p>
                    <w:pPr>
                        <w:pBdr>
                            <w:left w:val="single" w:sz="24" w:space="15" w:color="2563EB"/>
                        </w:pBdr>
                        <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
                        <w:spacing w:before="120" w:after="140" w:line="260" w:lineRule="auto"/>
                        <w:ind w:left="240" w:right="160"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                            <w:b/>
                            <w:color w:val="1E3A8A"/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t>{escape(item.get('title', 'Key Highlight: '))}</w:t>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                            <w:color w:val="334155"/>
                            <w:sz w:val="21"/>
                        </w:rPr>
                        <w:t>{escape(item['text'])}</w:t>
                    </w:r>
                </w:p>
                ''')
            elif itype == "bullet":
                doc_xml_parts.append(f'''
                <w:p>
                    <w:pPr>
                        <w:ind w:left="420" w:hanging="220"/>
                        <w:spacing w:before="0" w:after="80" w:line="260" w:lineRule="auto"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                            <w:color w:val="2563EB"/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t>▪  </w:t>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                            <w:b/>
                            <w:color w:val="0F172A"/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t>{escape(item.get('bold', ''))}</w:t>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                            <w:color w:val="334155"/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t>{escape(item['text'])}</w:t>
                    </w:r>
                </w:p>
                ''')
            elif itype == "table":
                headers = item.get("headers", [])
                rows = item.get("rows", [])
                col_widths = item.get("widths", [2500, 7000])
                total_w = sum(col_widths)
                
                table_xml = [f'''
                <w:tbl>
                    <w:tblPr>
                        <w:tblW w:w="{total_w}" w:type="dxa"/>
                        <w:jc w:val="center"/>
                        <w:tblBorders>
                            <w:top w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
                            <w:left w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
                            <w:bottom w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
                            <w:right w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
                            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                        </w:tblBorders>
                        <w:tblCellMar>
                            <w:top w:w="120" w:type="dxa"/>
                            <w:left w:w="160" w:type="dxa"/>
                            <w:bottom w:w="120" w:type="dxa"/>
                            <w:right w:w="160" w:type="dxa"/>
                        </w:tblCellMar>
                    </w:tblPr>
                ''']
                
                # Header row
                table_xml.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
                for i, h in enumerate(headers):
                    w = col_widths[i] if i < len(col_widths) else 2000
                    table_xml.append(f'''
                    <w:tc>
                        <w:tcPr>
                            <w:tcW w:w="{w}" w:type="dxa"/>
                            <w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/>
                        </w:tcPr>
                        <w:p>
                            <w:pPr>
                                <w:spacing w:before="60" w:after="60"/>
                            </w:pPr>
                            <w:r>
                                <w:rPr>
                                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                                    <w:b/>
                                    <w:color w:val="FFFFFF"/>
                                    <w:sz w:val="21"/>
                                </w:rPr>
                                <w:t>{escape(h)}</w:t>
                            </w:r>
                        </w:p>
                    </w:tc>
                    ''')
                table_xml.append('</w:tr>')
                
                # Data rows
                for r_idx, row in enumerate(rows):
                    row_bg = "F8FAFC" if (r_idx % 2 == 1) else "FFFFFF"
                    table_xml.append('<w:tr>')
                    for i, cell in enumerate(row):
                        w = col_widths[i] if i < len(col_widths) else 2000
                        is_first_col = (i == 0)
                        table_xml.append(f'''
                        <w:tc>
                            <w:tcPr>
                                <w:tcW w:w="{w}" w:type="dxa"/>
                                <w:shd w:val="clear" w:color="auto" w:fill="{row_bg}"/>
                            </w:tcPr>
                            <w:p>
                                <w:pPr>
                                    <w:spacing w:before="60" w:after="60"/>
                                </w:pPr>
                                <w:r>
                                    <w:rPr>
                                        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                                        {'<w:b/>' if is_first_col else ''}
                                        <w:color w:val="{'0F172A' if is_first_col else '334155'}"/>
                                        <w:sz w:val="20"/>
                                    </w:rPr>
                                    <w:t>{escape(cell)}</w:t>
                                </w:r>
                            </w:p>
                        </w:tc>
                        ''')
                    table_xml.append('</w:tr>')
                    
                table_xml.append('</w:tbl>')
                table_xml.append('<w:p><w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr></w:p>')
                doc_xml_parts.append(''.join(table_xml))

    # Page setup (Standard margins)
    doc_xml_parts.append('''
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
            <w:cols w:space="720"/>
            <w:docGrid w:linePitch="360"/>
        </w:sectPr>
    ''')
    doc_xml_parts.append('</w:body></w:document>')
    
    document_xml = ''.join(doc_xml_parts)
    
    # [Content_Types].xml
    content_types_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>'''

    # _rels/.rels
    rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

    # word/_rels/document.xml.rels
    word_rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

    # word/styles.xml
    styles_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/>
                <w:sz w:val="22"/>
                <w:szCs w:val="22"/>
                <w:lang w:val="en-US"/>
            </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
            <w:pPr>
                <w:spacing w:after="160" w:line="240" w:lineRule="auto"/>
            </w:pPr>
        </w:pPrDefault>
    </w:docDefaults>
</w:styles>'''

    # Package into docx (ZIP archive)
    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as docx:
        docx.writestr('[Content_Types].xml', content_types_xml)
        docx.writestr('_rels/.rels', rels_xml)
        docx.writestr('word/_rels/document.xml.rels', word_rels_xml)
        docx.writestr('word/document.xml', document_xml)
        docx.writestr('word/styles.xml', styles_xml)
    
    print(f"Generated {filename} successfully ({os.path.getsize(filename)} bytes)")

if __name__ == '__main__':
    title = "MUSEUM TICKET BOOKING SYSTEM"
    subtitle = "PROJECT SYNOPSIS & ARCHITECTURAL SPECIFICATION DOCUMENT"
    
    sections = [
        {
            "h1": "1. PROJECT OVERVIEW & EXECUTIVE SUMMARY",
            "items": [
                {
                    "type": "p",
                    "text": "The Museum Ticket Booking System is a production-grade, full-stack web application architected to digitize and optimize the end-to-end ticketing, discovery, and visitor management lifecycle for cultural institutions and public museums. Historically, museum ticketing relies heavily on manual on-premise physical counter interactions, resulting in cumbersome queues, inaccurate capacity distribution, and lack of real-time operational oversight. This system introduces a decoupled, responsive digital platform that enables visitors to explore museums, inspect operational parameters, customize visitor allocations, and execute guaranteed ticket reservations seamlessly across devices."
                },
                {
                    "type": "callout",
                    "title": "Core Project Vision: ",
                    "text": "To deliver a frictionless, modern ticketing interface for cultural enthusiasts while equipping museum administrators with automated inventory auditing, centralized reservation indexing, and extensible cryptographic ticket verification."
                },
                {
                    "type": "p",
                    "text": "The software is designed around a modern decoupled client-server architecture: the user-facing interface is delivered through an optimized Single Page Application (SPA) built with React and Vite, while enterprise data persistence, business logic, access control, and API orchestration are governed by Python Django and Django REST Framework (DRF) backed by transactional relational storage."
                }
            ]
        },
        {
            "h1": "2. PROBLEM STATEMENT & PROJECT OBJECTIVES",
            "items": [
                {
                    "type": "h2",
                    "text": "2.1 Existing Challenges in Museum Ticketing"
                },
                {
                    "type": "bullet",
                    "bold": "Manual Queue Bottlenecks: ",
                    "text": "Physical ticket stalls create friction, lengthy visitor wait times, and high administrative personnel overhead during peak tourist and holiday hours."
                },
                {
                    "type": "bullet",
                    "bold": "Lack of Multi-Visitor Transparency: ",
                    "text": "Traditional offline systems fail to capture structured per-visitor identity metadata, hindering security, age auditing, and group tour analytics."
                },
                {
                    "type": "bullet",
                    "bold": "Static and Disconnected Information: ",
                    "text": "Exhibition schedules, real-time pricing, operating hours, and location data are rarely synchronized with physical ticketing centers."
                },
                {
                    "type": "bullet",
                    "bold": "Paper Waste & Lost Ticket Friction: ",
                    "text": "Physical receipts and paper tickets are prone to misplacement and lack automated verification workflows."
                },
                {
                    "type": "h2",
                    "text": "2.2 Specific System Objectives"
                },
                {
                    "type": "bullet",
                    "bold": "Universal Digital Discovery: ",
                    "text": "Provide comprehensive museum listings complete with operating hours, ticket pricing, geographic location, and visual exhibition showcases."
                },
                {
                    "type": "bullet",
                    "bold": "Interactive Dynamic Booking: ",
                    "text": "Facilitate custom multi-ticket bookings with dynamic per-visitor name entry, immediate price computation, and date validation."
                },
                {
                    "type": "bullet",
                    "bold": "Reliable Two-Step Transaction Lifecycle: ",
                    "text": "Enforce a clear reservation state machine consisting of 'Pending Payment', simulated/gateway settlement, and definitive 'Confirmed' reservation."
                },
                {
                    "type": "bullet",
                    "bold": "Cryptographic Ticket Tracking: ",
                    "text": "Generate unique universally unique identifiers (UUIDv4) and reference codes for every confirmed ticket to enable non-forgeable entry verification."
                },
                {
                    "type": "bullet",
                    "bold": "Secure Identity Isolation: ",
                    "text": "Implement robust session-based authenticated access ensuring visitors can only view, manage, and download their own ticket registries."
                }
            ]
        },
        {
            "h1": "3. TECHNICAL ARCHITECTURE & TECHNOLOGY STACK",
            "items": [
                {
                    "type": "p",
                    "text": "The platform strictly segregates presentation and client interaction from data persistence and business logic, providing horizontal scalability, clean API contracts, and independent deployment lifecycles."
                },
                {
                    "type": "table",
                    "headers": ["Layer / Tier", "Technology", "Strategic Purpose & Role"],
                    "widths": [2000, 2600, 4900],
                    "rows": [
                        ["Frontend UI / SPA", "React 19 + Vite 6", "Blazing-fast modern component rendering, reactive state management, and optimized bundling."],
                        ["Client Routing", "React Router DOM v7", "Declarative browser routing, URL-driven navigation, and granular protected route guards."],
                        ["HTTP & API Client", "Axios (with Interceptors)", "Centralized asynchronous REST communication, automatic CSRF token inclusion, and error handling."],
                        ["Design & Notifications", "Modern Dark UI + react-hot-toast", "Contemporary aesthetic design with high-contrast UI tokens, responsive layouts, and non-blocking toast alerts."],
                        ["Backend Framework", "Django 5.x (Python 3.12)", "Enterprise web backend providing robust ORM, security middlewares, and MVC/MVT structure."],
                        ["REST API Engine", "Django REST Framework (DRF)", "Standardized JSON serialization, viewsets, permission layers, and validation pipelines."],
                        ["Authentication Layer", "Django Session & CSRF Auth", "HttpOnly session cookie-backed authentication safeguarding against XSS and CSRF token vulnerabilities."],
                        ["Database Tier", "SQLite3 / PostgreSQL Compatible", "ACID-compliant relational database management for museums, bookings, and user models."]
                    ]
                }
            ]
        },
        {
            "h1": "4. MODULE SPECIFICATIONS & SYSTEM CAPABILITIES",
            "items": [
                {
                    "type": "h2",
                    "text": "4.1 User Authentication & Profile Subsystem"
                },
                {
                    "type": "p",
                    "text": "The authentication module overrides Django's default username-centric auth with a custom AbstractBaseUser model leveraging email as the unique primary credential. It captures extended visitor demographics including full name, age, and telephone contact. Upon registration or login, authenticated sessions are verified via an explicit '/api/auth/me/' endpoint, establishing an immediate user context in the React frontend."
                },
                {
                    "type": "h2",
                    "text": "4.2 Museum Catalog & Exhibition Discovery Subsystem"
                },
                {
                    "type": "p",
                    "text": "The museums module manages institutional details including museum name, descriptive background, geographic address, cover imagery, per-ticket admission pricing, and operating times (opening_time and closing_time). It provides open public listing endpoints ('/api/museums/') and individual museum retrieval ('/api/museums/<id>/') equipped with automated mock catalog seeding via custom Django management commands."
                },
                {
                    "type": "h2",
                    "text": "4.3 Dynamic Ticket Booking & Reservation Engine"
                },
                {
                    "type": "p",
                    "text": "The booking engine enables users to pick visit dates and dynamically add or remove ticket counts. For each ticket selected, dynamic input fields capture the specific visitor name, stored as structured JSON metadata in the backend. The total bill is deterministically computed based on current admission fees. Once submitted, the booking enters an initial 'pending' state."
                },
                {
                    "type": "h2",
                    "text": "4.4 Payment Simulation & Confirmation Gateway"
                },
                {
                    "type": "p",
                    "text": "To decouple checkout from third-party vendor lock-in, the system incorporates an integrated payment gateway abstraction. Visitors review booking breakdowns on a dedicated payment view. Confirming payment invokes '/api/bookings/<id>/pay/', which transitions the booking status to 'confirmed', stamps an immutable timestamp, and generates a distinct transaction payment token (e.g. SIM-XXXXXXXXXXXX)."
                },
                {
                    "type": "h2",
                    "text": "4.5 Digital Ticket Dashboard & Verification Pass"
                },
                {
                    "type": "p",
                    "text": "The ticket dashboard ('/tickets') aggregates all reservations linked to the logged-in user. Each ticket renders as a clean digital boarding pass displaying the institution, UUIDv4 Ticket ID, visiting date, admission price, per-visitor name directory, and a visual digital confirmation badge. Built-in print/download capabilities enable visitors to produce offline hardcopies."
                }
            ]
        },
        {
            "h1": "5. DATABASE SCHEMA & DATA MODELING",
            "items": [
                {
                    "type": "p",
                    "text": "The data schema follows third normal form (3NF) principles, enforcing referential integrity and cascading deletes across users, catalog entities, and transactions."
                },
                {
                    "type": "table",
                    "headers": ["Entity / Model", "Field Attribute", "Data Type", "Constraint & Description"],
                    "widths": [2000, 2200, 2000, 3300],
                    "rows": [
                        ["User (Custom)", "email", "EmailField", "Primary unique login credential"],
                        ["User (Custom)", "name, age, phone", "CharField / Int", "Demographic & communication details"],
                        ["User (Custom)", "is_staff, is_active", "BooleanField", "Authorization & access permission flags"],
                        ["Museum", "name, location", "CharField", "Indexed naming & physical address"],
                        ["Museum", "ticket_price", "DecimalField", "Admission fee per single visitor ticket"],
                        ["Museum", "opening_time, closing_time", "TimeField", "Daily operational schedule boundaries"],
                        ["Booking", "ticket_id", "UUIDField", "UUIDv4 unique cryptographic entry identifier"],
                        ["Booking", "user", "ForeignKey (User)", "Linked visitor account (CASCADE)"],
                        ["Booking", "museum", "ForeignKey (Museum)", "Associated museum attraction (CASCADE)"],
                        ["Booking", "visitor_names", "JSONField", "Array of individual guest attendee names"],
                        ["Booking", "total_price", "DecimalField", "Computed reservation financial subtotal"],
                        ["Booking", "status", "CharField", "Choice: pending / confirmed / cancelled"],
                        ["Booking", "payment_id", "CharField", "Settlement transaction reference code"]
                    ]
                }
            ]
        },
        {
            "h1": "6. REST API SPECIFICATION",
            "items": [
                {
                    "type": "table",
                    "headers": ["HTTP Verb", "API Endpoint Route", "Access Level", "Payload & Output Specification"],
                    "widths": [1500, 2900, 2100, 3000],
                    "rows": [
                        ["POST", "/api/auth/register/", "Public", "Body: email, password, name, age, phone. Returns User Profile."],
                        ["POST", "/api/auth/login/", "Public", "Body: email, password. Establishes Session & CSRF Token."],
                        ["POST", "/api/auth/logout/", "Authenticated", "Terminates active session and clears auth cookies."],
                        ["GET", "/api/auth/me/", "Authenticated", "Returns authenticated visitor profile and permissions."],
                        ["GET", "/api/museums/", "Public", "List of all active museums, timings, and ticket prices."],
                        ["GET", "/api/museums/<id>/", "Public", "Detailed single museum profile and pricing info."],
                        ["GET", "/api/bookings/", "Authenticated", "Returns list of bookings belonging to authenticated visitor."],
                        ["POST", "/api/bookings/", "Authenticated", "Body: museum, visit_date, num_tickets, visitor_names. Creates booking."],
                        ["GET", "/api/bookings/<id>/", "Authenticated", "Returns specific booking metadata and visitor list."],
                        ["POST", "/api/bookings/<id>/pay/", "Authenticated", "Simulates payment completion, transitions status to 'confirmed'."]
                    ]
                }
            ]
        },
        {
            "h1": "7. SECURITY, PERFORMANCE & DESIGN HIGHLIGHTS",
            "items": [
                {
                    "type": "bullet",
                    "bold": "CSRF & Session Cookie Security: ",
                    "text": "Django's built-in Cross-Site Request Forgery (CSRF) mitigation is synchronized via Axios interceptors, preventing cross-site state-changing exploits."
                },
                {
                    "type": "bullet",
                    "bold": "Password Encryption: ",
                    "text": "Credentials are salted and hashed utilizing PBKDF2 with SHA-256 encryption, eliminating raw credential exposure."
                },
                {
                    "type": "bullet",
                    "bold": "Client-Side Route Guarding: ",
                    "text": "React ProtectedRoute wrappers intercept unauthorized access attempts to checkout, payment, and tickets, redirecting with state memory."
                },
                {
                    "type": "bullet",
                    "bold": "Responsive Dark Mode Theme: ",
                    "text": "Engineered with a cohesive modern dark palette (#0d0d12 base, #16161f cards, #222230 borders, #4f46e5 brand accents) with fluid grid responsiveness."
                },
                {
                    "type": "bullet",
                    "bold": "Client-Side Form Validation: ",
                    "text": "Real-time verification prevents submission of non-future dates, zero ticket quantities, or blank visitor attendee names."
                }
            ]
        },
        {
            "h1": "8. FUTURE ROADMAP & EXTENSION OPPORTUNITIES",
            "items": [
                {
                    "type": "bullet",
                    "bold": "Commercial Gateway Integration: ",
                    "text": "Seamless drop-in upgrade from payment simulator to Stripe / Razorpay / PayPal SDK webhooks."
                },
                {
                    "type": "bullet",
                    "bold": "QR Code Scanning App: ",
                    "text": "Companion mobile scanner application for gatekeepers to read ticket UUID QR codes and prevent duplicate admissions."
                },
                {
                    "type": "bullet",
                    "bold": "Time-Slot & Capacity Management: ",
                    "text": "Hourly time-slot quotas to enforce social distancing and prevent exhibition hall overcrowding."
                },
                {
                    "type": "bullet",
                    "bold": "Automated Email & SMS Dispatch: ",
                    "text": "Immediate issuance of transactional PDF boarding passes directly to visitor email inboxes via Celery / SendGrid."
                }
            ]
        },
        {
            "h1": "9. CONCLUSION",
            "items": [
                {
                    "type": "p",
                    "text": "The Museum Ticket Booking System provides a robust, scalable, and intuitive software solution addressing the operational challenges of modern cultural tourism. By coupling the rapid development, security, and data integrity of Django with the high-performance interactivity of React and Vite, the project serves as an exemplary full-stack software architecture. It successfully fulfills academic engineering criteria while demonstrating industrial readiness for public museum deployment."
                }
            ]
        }
    ]
    
    output_path = "/Users/ADII/coding/museum/Museum_Ticket_Booking_System_Synopsis.docx"
    create_docx(output_path, title, subtitle, sections)
