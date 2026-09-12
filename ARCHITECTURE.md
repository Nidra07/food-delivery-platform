# Food Delivery Platform - Architecture Documentation

## 1. System Overview

This is a production-ready food delivery platform consisting of 6 applications and 1 centralized backend:

### Applications
1. **Customer App** - React Native (iOS/Android) - Browse restaurants, order food, track deliveries
2. **Delivery Partner App** - React Native (iOS/Android) - Accept deliveries, manage earnings
3. **Restaurant Partner App** - React Native/Web - Manage menus, process orders
4. **Admin App** - React Native or Web - Administrative controls
5. **Admin Web Portal** - Next.js + React - Complete admin dashboard
6. **Team Leader Operations Portal** - Next.js + React - Delivery operations management

### Backend
- **API Server** - Node.js/NestJS - REST API serving all applications
- **Database** - PostgreSQL - Persistent data storage
- **Real-time** - WebSockets - Live updates
- **Storage** - S3-compatible - Images and documents
- **Authentication** - JWT + Refresh tokens - Secure auth

---

## 2. Role-Based Access Control Matrix

### Roles

| Role | Description | Key Permissions |
|------|-------------|------------------|
| **Customer** | End user ordering food | Browse restaurants, order, track, review |
| **Restaurant Owner** | Restaurant management | Manage menu, accept orders, view sales |
| **Restaurant Staff** | Order fulfillment | Accept orders, update status, print tickets |
| **Delivery Partner** | Food delivery | Accept deliveries, track location, confirm delivery |
| **Team Leader** | Delivery operations supervision | Monitor partners, assist with issues, escalate |
| **Admin** | Platform control | Full system access with audit logging |
| **Super Admin** | Platform ownership | Create admins, modify system settings |

### Permission Granularity

**Customer Permissions:**
- `browse:restaurants` - View nearby restaurants
- `browse:menu` - View restaurant menus
- `manage:cart` - Add/remove items from cart
- `place:order` - Create new orders
- `track:order` - View order status and delivery partner location
- `rate:order` - Leave ratings and reviews
- `cancel:order` - Request order cancellation
- `manage:profile` - Update personal information
- `manage:addresses` - Manage delivery addresses

**Delivery Partner Permissions:**
- `receive:delivery_requests` - Get new delivery notifications
- `accept:delivery` - Accept delivery requests
- `update:location` - Share real-time location
- `update:delivery_status` - Mark picked up, delivered
- `view:earnings` - View daily/weekly earnings
- `manage:documents` - Upload KYC documents
- `manage:availability` - Set online/offline status

**Restaurant Permissions:**
- `manage:menu` - CRUD menu items and categories
- `manage:items` - Update item prices, availability
- `manage:orders` - Accept/reject/update orders
- `view:analytics` - Sales and order analytics
- `manage:staff` - Add staff members
- `configure:settings` - Operating hours, delivery zones
- `manage:settlement` - View payouts and settlements

**Team Leader Permissions:**
- `view:assigned_partners` - See assigned delivery partners
- `view:active_deliveries` - Monitor active deliveries
- `view:delivery_status` - Track order/delivery progress
- `contact:delivery_partner` - Send messages to partners
- `create:support_ticket` - Create tickets for issues
- `manage:assigned_delivery_issues` - Assist with delivery problems
- `request:delivery_reassignment` - Request partner reassignment
- `view:partner_performance` - Review partner metrics
- `escalate:to_admin` - Escalate issues

**Admin Permissions:**
- `manage:customers` - CRUD customer accounts
- `manage:restaurants` - CRUD restaurant accounts
- `manage:delivery_partners` - CRUD partner accounts
- `manage:team_leaders` - Create/assign team leaders
- `manage:admins` - Create/manage admin accounts
- `manage:orders` - Full order control and intervention
- `manage:payments` - Process refunds, adjustments
- `manage:commissions` - Configure rates and fees
- `manage:coupons` - Create/modify promotions
- `manage:service_areas` - Define delivery zones
- `manage:system_settings` - Global configuration
- `view:audit_logs` - Access all system audit logs
- `manage:support_tickets` - Handle escalated issues
- `view:reports` - Generate analytics reports

---

## 3. Database Entity Relationship Diagram

```
USERS SYSTEM:
├── users (id, email, phone, password_hash, first_name, last_name, created_at)
├── user_roles (user_id, role_id) [Many-to-Many]
├── roles (id, name, description)
├── permissions (id, code, description)
├── role_permissions (role_id, permission_id) [Many-to-Many]
└── audit_logs (id, user_id, action, entity_type, entity_id, changes, timestamp)

CUSTOMER MODULE:
├── customers (id, user_id, phone_verified, email_verified)
├── addresses (id, customer_id, label, street, city, state, zip, lat, lng, is_default)
├── saved_favorites (id, customer_id, restaurant_id) [Many-to-Many]
└── customer_ratings (id, customer_id, order_id, restaurant_id, rating, review)

RESTAURANT MODULE:
├── restaurants (id, user_id, name, description, cuisine_types, avg_rating, delivery_time, min_order_value)
├── restaurant_locations (id, restaurant_id, address, lat, lng, is_primary, operating_hours)
├── restaurant_staff (id, restaurant_id, user_id, role, status)
├── restaurant_documents (id, restaurant_id, doc_type, url, verified, expiry_date)
├── menu_categories (id, restaurant_id, name, display_order)
├── menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, prep_time, available)
├── menu_item_variants (id, menu_item_id, name, price_modifier)
├── menu_item_addons (id, menu_item_id, addon_group_id, name, price)
├── addon_groups (id, restaurant_id, name, allow_multiple)
└── restaurant_settings (id, restaurant_id, status, commission_rate, tax_rate, delivery_zones)

ORDER MODULE:
├── orders (id, customer_id, restaurant_id, delivery_partner_id, status, total_amount, tax, commission, created_at)
├── order_items (id, order_id, menu_item_id, quantity, variant_id, addons, price, special_instructions)
├── order_status_history (id, order_id, status, timestamp, notes)
├── cart_items (id, customer_id, menu_item_id, restaurant_id, quantity, variant_id, addons)
└── refunds (id, order_id, amount, reason, status, processed_at)

DELIVERY PARTNER MODULE:
├── delivery_partners (id, user_id, status, rating, total_deliveries, vehicle_type)
├── delivery_partner_documents (id, delivery_partner_id, doc_type, url, verified, expiry_date)
├── delivery_partner_vehicles (id, delivery_partner_id, vehicle_type, registration, capacity)
├── delivery_partner_availability (id, delivery_partner_id, is_online, current_location, last_seen_at)
├── delivery_assignments (id, order_id, delivery_partner_id, assigned_at, accepted_at, picked_up_at, delivered_at)
├── delivery_tracking (id, delivery_assignment_id, lat, lng, timestamp)
├── delivery_partner_earnings (id, delivery_partner_id, order_id, amount, bonus, penalty, date)
└── delivery_partner_payouts (id, delivery_partner_id, amount, status, date_requested, processed_date)

TEAM LEADER MODULE:
├── team_leaders (id, user_id, assigned_zone, status)
├── team_leader_assignments (id, team_leader_id, delivery_partner_id, assigned_date)
└── team_leader_activity_log (id, team_leader_id, action, entity_type, entity_id, timestamp)

PAYMENT & SETTLEMENT:
├── payments (id, order_id, amount, method, status, transaction_id, gateway_response)
├── restaurant_settlements (id, restaurant_id, period_start, period_end, gross_amount, commission, adjustments, net_amount, status)
├── platform_transactions (id, transaction_type, amount, source_id, destination_id, status, date)
└── payout_records (id, payee_id, payee_type, amount, status, method, date_requested, processed_date)

PROMOTIONS & COUPONS:
├── coupons (id, code, discount_type, discount_value, min_order_value, max_uses, valid_from, valid_to, active)
├── coupon_usage (id, coupon_id, customer_id, order_id, discount_amount, used_at)
├── promotions (id, title, description, discount_type, value, applicable_restaurants, valid_from, valid_to, active)
└── coupon_restrictions (id, coupon_id, min_order, max_discount, applicable_categories, excluded_items)

SUPPORT & NOTIFICATIONS:
├── support_tickets (id, customer_id, order_id, category, status, created_at, resolved_at)
├── support_messages (id, ticket_id, user_id, message, attachment_url, created_at)
├── notifications (id, user_id, type, title, body, related_entity_id, read, created_at)
└── notification_preferences (id, user_id, channel, notification_type, enabled)

SERVICE AREAS:
├── service_areas (id, name, polygon_coordinates, active, created_at)
├── restaurant_service_areas (id, restaurant_id, service_area_id)
├── delivery_partner_zones (id, delivery_partner_id, service_area_id, is_primary)
└── delivery_fees (id, service_area_id, distance_start, distance_end, base_fee, per_km_rate)

SYSTEM SETTINGS:
├── system_settings (key, value, updated_at, updated_by)
├── feature_flags (name, enabled, updated_at)
├── cancellation_policies (id, entity_type, grace_period_seconds, charge_percentage, reason_category)
├── payment_gateways (id, name, config, active)
└── app_versions (id, app_name, version, min_required, force_update, url)
```

---

## 4. API Architecture

### Base URL Structure
```
Production: https://api.fooddelivery.com/v1
Staging: https://staging-api.fooddelivery.com/v1
Development: http://localhost:3000/v1
```

### Authentication Flow
```
POST /auth/register
POST /auth/login
POST /auth/refresh-token
POST /auth/verify-otp
POST /auth/logout
GET /auth/me (returns current user with roles/permissions)
```

### API Response Format
```json
{
  "success": true,
  "data": { /* ... */ },
  "error": null,
  "timestamp": "2024-09-12T10:30:00Z",
  "request_id": "req_123abc"
}
```

### Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Customer with ID 123 not found",
    "details": { /* ... */ }
  },
  "timestamp": "2024-09-12T10:30:00Z",
  "request_id": "req_123abc"
}
```

### Core API Endpoints Structure

**Customer Routes:**
```
GET    /customers/me
PUT    /customers/me
GET    /customers/addresses
POST   /customers/addresses
PUT    /customers/addresses/:id
DELETE /customers/addresses/:id

GET    /restaurants (nearby, with pagination)
GET    /restaurants/:id
GET    /restaurants/:id/menu
GET    /restaurants/:id/ratings

GET    /cart
POST   /cart/items
PUT    /cart/items/:id
DELETE /cart/items/:id
POST   /cart/checkout

GET    /orders
GET    /orders/:id
POST   /orders
PUT    /orders/:id/cancel
GET    /orders/:id/tracking

POST   /orders/:id/rating
GET    /orders/:id/ratings
```

**Restaurant Routes:**
```
GET    /restaurants/me
PUT    /restaurants/me
PUT    /restaurants/me/status
PUT    /restaurants/me/settings

GET    /restaurants/me/orders
PUT    /restaurants/me/orders/:id/status
PUT    /restaurants/me/orders/:id/reject

GET    /restaurants/me/menu
POST   /restaurants/me/menu/categories
POST   /restaurants/me/menu/items
PUT    /restaurants/me/menu/items/:id
DELETE /restaurants/me/menu/items/:id

GET    /restaurants/me/analytics
GET    /restaurants/me/settlements
```

**Delivery Partner Routes:**
```
GET    /delivery-partners/me
PUT    /delivery-partners/me
GET    /delivery-partners/me/documents
POST   /delivery-partners/me/documents
PUT    /delivery-partners/me/availability

GET    /delivery-partners/me/requests
POST   /delivery-partners/me/requests/:id/accept
POST   /delivery-partners/me/requests/:id/reject
GET    /delivery-partners/me/active-delivery
PUT    /delivery-partners/me/deliveries/:id/status
POST   /delivery-partners/me/deliveries/:id/location

GET    /delivery-partners/me/earnings
GET    /delivery-partners/me/payouts
```

**Admin Routes:**
```
GET    /admin/dashboard
GET    /admin/customers
PUT    /admin/customers/:id/status
GET    /admin/restaurants
PUT    /admin/restaurants/:id/approve
GET    /admin/delivery-partners
PUT    /admin/delivery-partners/:id/approve
GET    /admin/orders
PUT    /admin/orders/:id/reassign
PUT    /admin/orders/:id/refund
GET    /admin/team-leaders
POST   /admin/team-leaders
PUT    /admin/team-leaders/:id/assignments
GET    /admin/coupons
POST   /admin/coupons
GET    /admin/settings
PUT    /admin/settings
GET    /admin/audit-logs
```

**Team Leader Routes:**
```
GET    /operations/partners
GET    /operations/partners/:id
PUT    /operations/partners/:id/message
GET    /operations/deliveries
GET    /operations/deliveries/:id
POST   /operations/deliveries/:id/reassign-request
GET    /operations/support-tickets
POST   /operations/support-tickets
GET    /operations/analytics
```

---

## 5. Technology Stack

### Frontend Applications

**Customer App & Delivery Partner App:**
- Framework: React Native with Expo
- Language: TypeScript
- State Management: Redux Toolkit
- Navigation: React Navigation
- UI: React Native Paper + Custom components
- Maps: React Native Maps / Expo Location
- Build Tool: Expo CLI
- Testing: Jest + Detox

**Restaurant Partner App:**
- Framework: React Native or responsive web (React)
- Language: TypeScript
- Build: Vite for web
- UI: Tailwind CSS + shadcn/ui

**Admin Application:**
- Framework: React Native or NestJS admin panel
- Language: TypeScript

**Admin Web Portal & Team Leader Portal:**
- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Components: shadcn/ui + Radix UI
- State Management: TanStack Query + Zustand
- Charts: Recharts / Chart.js
- Real-time: Socket.IO client
- Build: Next.js built-in

### Backend

- **Runtime:** Node.js 20+
- **Framework:** NestJS (TypeScript)
- **HTTP:** Express.js (via NestJS)
- **API Style:** REST with OpenAPI documentation
- **Authentication:** JWT + Bcrypt
- **Database ORM:** TypeORM
- **Database:** PostgreSQL 14+
- **Real-time:** Socket.IO
- **Queue:** Bull (Redis)
- **Caching:** Redis
- **File Storage:** AWS S3 compatible
- **Email:** SendGrid / Nodemailer
- **SMS/OTP:** Twilio or local OTP
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI
- **Logging:** Winston
- **Monitoring:** Sentry (optional)

### Infrastructure & DevOps

- **API Hosting:** Render.com, Railway.app, or Fly.io
- **Web Portal Hosting:** Vercel
- **Database:** Supabase (PostgreSQL) or managed PostgreSQL
- **Storage:** Supabase Storage or S3-compatible
- **CDN:** Cloudflare
- **Container:** Docker
- **Container Registry:** Docker Hub or GitHub Container Registry
- **CI/CD:** GitHub Actions
- **IaC:** Docker Compose for local dev

### Development Tools

- **Version Control:** Git + GitHub
- **Package Manager:** npm / yarn
- **Code Quality:** ESLint + Prettier
- **Pre-commit Hooks:** Husky + Lint-staged
- **Environment:** dotenv
- **API Testing:** Postman / Thunder Client
- **Database GUI:** pgAdmin / DBeaver

---

## 6. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Client Applications                 │
├─────────────────────────────────────────────┤
│ Customer App | Partner App | Web Portals    │
└────────────────────┬────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────┐
│         CDN / Cloudflare                    │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│      API Gateway / Load Balancer            │
└────────────────────┬──────────��─────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌────▼────┐ ┌────▼────┐
   │ API Pod │  │ API Pod │ │ API Pod │
   │ (NestJS)│  │ (NestJS)│ │ (NestJS)│
   └────┬────┘  └────┬────┘ └────┬────┘
        │            │            │
        └────────────┼────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌────▼────┐ ┌────▼────┐
   │PostgreSQL│  │  Redis  │ │   S3    │
   │Database  │  │ (Cache) │ │(Storage)│
   └──────────┘  └─────────┘ └─────────┘
```

---

## 7. Security Architecture

### Authentication
- JWT tokens (Access + Refresh)
- HTTP-only cookies for refresh tokens
- OTP verification for phone/email
- Secure password hashing (bcrypt)

### Authorization
- Role-based access control (RBAC)
- Granular permission checking
- Backend permission enforcement (not just frontend)
- Audit logging for all sensitive actions

### Data Protection
- HTTPS/TLS for all communications
- Encrypted sensitive fields in database
- No storage of payment card data (use payment gateway)
- PII encryption where required
- Regular security audits

### API Security
- Rate limiting (IP-based and user-based)
- CORS configuration
- CSRF protection
- Input validation and sanitization
- SQL injection prevention via ORM
- XSS prevention

### File Upload Security
- File type validation
- File size limits
- Virus scanning (optional)
- Secure storage with signed URLs
- CDN delivery with expiration

---

## 8. Implementation Phases

### Phase 1: Architecture & Foundation (Week 1)
- Project structure setup
- Database schema & migrations
- Authentication system
- Base API scaffolding
- Role & permission system

### Phase 2: Backend Core (Week 2-3)
- User management APIs
- Restaurant onboarding flow
- Delivery partner registration
- Menu management
- Order creation & status tracking

### Phase 3: Customer Application (Week 4-5)
- Authentication & onboarding
- Restaurant discovery
- Menu browsing & cart
- Order placement & tracking
- Ratings and reviews

### Phase 4: Delivery Partner Application (Week 6-7)
- Authentication & KYC
- Delivery request handling
- Live tracking
- Earnings dashboard
- Payout management

### Phase 5: Restaurant Application (Week 8)
- Restaurant dashboard
- Order management
- Menu & item management
- Analytics & settlements

### Phase 6: Admin Web Portal (Week 9-10)
- Admin authentication
- User management
- Restaurant management
- Order control center
- Live operations map
- Finance & settlements

### Phase 7: Team Leader Portal (Week 11)
- Team leader authentication
- Partner management
- Delivery monitoring
- Support ticket system
- Escalation workflows

### Phase 8: Payments, Notifications & Polish (Week 12-13)
- Payment gateway integration
- Refund system
- Settlements automation
- Push notifications
- Real-time updates
- Testing & optimization

### Phase 9: Testing & Deployment (Week 14-15)
- Unit testing
- Integration testing
- E2E testing
- Security review
- Performance optimization
- Production deployment

---

## 9. Key Design Decisions

1. **Monorepo Structure:** All applications share common types and configurations
2. **Backend-Driven Permissions:** All authorization checked server-side
3. **Order State Machine:** Strict state transition validation
4. **Delivery Assignment:** Atomic operations to prevent duplicates
5. **Financial Auditability:** All transactions logged with full context
6. **Real-time Updates:** WebSocket connections for live features
7. **Soft Deletes:** Data retention for compliance and debugging
8. **Event Sourcing:** Order status history maintained as immutable events

---

## 10. Known Limitations & Future Improvements

### Current Limitations
- Single payment gateway support (extensible to multiple)
- Geographic delivery limited to single country (extensible)
- Real-time tracking accuracy dependent on device GPS
- Admin operations require manual intervention for complex scenarios

### Future Improvements
- AI-based delivery assignment optimization
- Predictive analytics for demand forecasting
- Multi-language support
- Multiple currency handling
- Advanced route optimization
- Machine learning for fraud detection
- Mobile app offline mode
- Customer loyalty program
- Subscription meal plans
- Restaurant virtual kitchen display systems

---

## 11. Assumptions & Clarifications

1. **Payment Processing:** Using external PCI-compliant payment gateway (Stripe/Razorpay)
2. **OTP Delivery:** Via SMS or email (backend agnostic)
3. **Location Services:** Assumes mobile devices have GPS + background location permission
4. **Business Licensing:** Admin responsible for verifying business documents
5. **Delivery Zones:** Rectangular/polygon-based service areas, not lat-lng radius
6. **Commission Model:** Fixed percentage per restaurant (configurable by admin)
7. **Refund Processing:** Automatic for paid orders, manual for cash orders
8. **Team Leader Assignment:** Assigned by admin to specific geographic zones
