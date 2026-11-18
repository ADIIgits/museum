# Museum Ticket Booking System — Project Synopsis

**Document Type:** Formal Academic & Technical Project Synopsis  
**Length:** Equivalent to 3–4 standard printed pages (~1,400 words with structured tables)  
**File Generated:** [`Museum_Ticket_Booking_System_Synopsis.docx`](file:///Users/ADII/coding/museum/Museum_Ticket_Booking_System_Synopsis.docx)

---

## 1. Project Overview & Executive Summary
The **Museum Ticket Booking System** is a modern, full-stack web application designed to streamline and digitize ticket booking, event exploration, and visitor coordination for cultural heritage sites, art galleries, and museums. 

Traditional museum ticketing frequently relies on physical ticket stalls, causing lengthy queues, manual data entry errors, lack of visitor visibility, and cumbersome cash management. This project resolves these issues by delivering a decoupled, high-performance web platform where visitors can:
1. Browse museum exhibitions, operating hours, ticket pricing, and location details.
2. Configure custom bookings with exact visit dates, ticket quantities, and dynamic visitor name records.
3. Review order summaries and perform simulated electronic payment settlement.
4. Access their confirmed digital tickets anytime with unique cryptographic reference UUIDs.

---

## 2. Problem Statement & Key Objectives

### 2.1 Problems Addressed
- **Queue Congestion:** Manual on-site queues reduce visitor satisfaction and cause operational bottlenecks during holidays and weekends.
- **Inadequate Visitor Tracking:** Physical ticketing lacks structured guest attendee information needed for auditing, security, or tour groupings.
- **Information Asymmetry:** Operating hours, dynamic ticket prices, and special exhibitions are rarely synchronized between counters and online visitors.
- **Physical Ticket Misplacement:** Paper tickets are easily lost and create physical waste with minimal verification capability.

### 2.2 Core Objectives
- **Digital Catalog:** Centralized directory showing live museum details, fees, and visiting hours.
- **Dynamic Booking & Passenger Manifest:** Dynamic visitor name fields linked directly to each booked ticket.
- **Two-Step Reservation Workflow:** Clear lifecycle state management (`pending` $\rightarrow$ `confirmed`).
- **Cryptographic Verification:** Generation of UUIDv4 ticket codes and transaction reference tokens.
- **Session-Based Isolation:** Secure authentication keeping visitor reservations private and protected.

---

## 3. Technology Stack & Architecture

The system utilizes a decoupled client-server architecture:
- **Frontend Layer:** React 19 SPA bundled with Vite 6, styled using modern dark aesthetics and typography.
- **Routing & Navigation:** React Router DOM v7 with client-side protected route wrappers.
- **HTTP Client:** Axios configured with credentials exchange and automated Django CSRF cookie handling.
- **Backend Framework:** Python 3.12 with Django 5.x and Django REST Framework (DRF).
- **Authentication:** Custom email-based user model with Django session-based authentication.
- **Persistence Tier:** Relational SQL database (SQLite in development, PostgreSQL ready).

---

## 4. Key Subsystems & Functional Modules

1. **User Authentication & Management Subsystem (`accounts`):**
   - Custom `User` model using `email` as the primary identifier (incorporates name, age, phone).
   - Endpoints: Registration (`/api/auth/register/`), Login (`/api/auth/login/`), Logout (`/api/auth/logout/`), and Session Check (`/api/auth/me/`).
2. **Museum Discovery & Exhibition Catalog (`museums`):**
   - Stores museum profile, ticket pricing, opening/closing schedules, and cover imagery.
   - Built-in sample seed script (`seed_museums`) providing real-world mock data for immediate exhibition testing.
3. **Reservation & Multi-Attendee Booking Engine (`bookings`):**
   - Real-time ticket calculation and date validation.
   - Dynamic visitor names stored as structured JSON arrays (`visitor_names`).
4. **Payment Gateway Simulation:**
   - Dedicated checkout breakdown screen.
   - `/api/bookings/<id>/pay/` endpoint which generates a verified payment ID (`SIM-XXXXXXXXXXXX`) and transitions booking status to `confirmed`.
5. **Digital Ticket Dashboard (`TicketsPage`):**
   - Clean digital boarding pass rendering with printable styling, download/print buttons, and UUID badges.

---

## 5. Database Schema Summary

| Model | Key Fields | Type / Relationship | Purpose |
| :--- | :--- | :--- | :--- |
| **`User`** | `email`, `name`, `age`, `phone`, `password` | AbstractBaseUser | Unique email identifier and visitor demographics |
| **`Museum`** | `name`, `location`, `ticket_price`, `opening_time`, `closing_time` | Relational Entity | Public museum listing and admission fees |
| **`Booking`** | `ticket_id`, `user`, `museum`, `num_tickets`, `visitor_names`, `visit_date`, `total_price`, `status`, `payment_id` | ForeignKeys & JSONField | Complete reservation transaction lifecycle record |

---

## 6. Future Enhancements
- Integration with commercial payment gateways (Stripe, Razorpay).
- QR code generator and gatekeeper mobile verification app.
- Time-slot and hourly hall capacity quotas.
- Automated email/SMS PDF ticket notifications.

