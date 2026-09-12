# Food Delivery Platform - Implementation Guide

## Phase-by-Phase Implementation Roadmap

This document provides detailed implementation guidance following the project architecture and requirements.

---

## Phase 1: Architecture & Foundation (Week 1)

### 1.1 Project Setup
- ✅ Create monorepo structure
- ✅ Configure npm workspaces
- ✅ Setup Git repository
- ✅ Initialize CI/CD pipeline

### 1.2 Backend Foundation
**Location:** `backend/src`

**Tasks:**
1. Initialize NestJS project
   ```bash
   nest new backend
   cd backend
   npm install --save @nestjs/typeorm typeorm postgresql
   npm install --save @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
   npm install --save socket.io redis bull
   ```

2. Create core configuration
   - `config/database.config.ts` - PostgreSQL connection
   - `config/jwt.config.ts` - JWT settings
   - `config/app.config.ts` - Application settings
   - `config/redis.config.ts` - Redis connection

3. Setup database connection
   - Install PostgreSQL locally or use Docker
   - Create database `food_delivery`
   - Configure TypeORM connection pool

4. Create base modules structure
   ```
   src/
   ├── modules/
   │   ├── auth/
   │   ├── users/
   │   ├── roles/
   │   └── permissions/
   ├── database/
   │   ├── entities/
   │   └── migrations/
   ├── common/
   │   ├── decorators/
   │   ├── filters/
   │   ├── pipes/
   │   └── middleware/
   ├── app.module.ts
   └── main.ts
   ```

### 1.3 Database Schema
**Location:** `backend/src/database`

**Tasks:**
1. Create TypeORM entities
   - User entity with relations to roles
   - Role entity with permissions
   - Permission entity
   - Customer, DeliveryPartner, Restaurant entities

2. Generate migrations
   ```bash
   npm run typeorm migration:generate src/database/migrations/InitialSchema
   npm run typeorm migration:run
   ```

3. Create database indexes
   - User lookup indexes
   - Order status indexes
   - Location indexes for delivery tracking

### 1.4 Authentication System
**Location:** `backend/src/modules/auth`

**Key Files:**
- `auth.service.ts` - Authentication logic
- `jwt.strategy.ts` - JWT passport strategy
- `auth.controller.ts` - Auth endpoints
- `auth.module.ts` - Auth module

**Endpoints to Implement:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/me` - Current user info

**Features:**
- Password hashing with bcrypt
- JWT token generation and validation
- Refresh token rotation
- OTP generation and verification

### 1.5 Role & Permission System
**Location:** `backend/src/modules/roles`

**Key Files:**
- `role.entity.ts` - Role definition
- `permission.entity.ts` - Permission definition
- `roles.service.ts` - Role management
- `rbac.guard.ts` - Role-based access control guard

**Tasks:**
1. Create role entities (CUSTOMER, RESTAURANT_OWNER, etc.)
2. Create permission entities
3. Implement role-permission mapping
4. Create RBAC guard for protecting endpoints

**Seed Data:**
```typescript
const roles = [
  { name: 'CUSTOMER', description: 'Customer role' },
  { name: 'DELIVERY_PARTNER', description: 'Delivery partner role' },
  { name: 'RESTAURANT_OWNER', description: 'Restaurant owner role' },
  { name: 'TEAM_LEADER', description: 'Team leader role' },
  { name: 'ADMIN', description: 'Admin role' },
  { name: 'SUPER_ADMIN', description: 'Super admin role' }
];
```

### 1.6 API Response Structure
**Location:** `backend/src/common/interceptors`

**Key File:**
- `response.interceptor.ts` - Standardize API responses

**Implementation:**
```typescript
{
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: any } | null;
  timestamp: string;
  request_id: string;
}
```

---

## Phase 2: Backend Core Modules (Week 2-3)

### 2.1 User Management Module
**Location:** `backend/src/modules/users`

**Entities:**
- User (base entity)
- UserRole (relation)
- AuditLog (track actions)

**Services:**
- `users.service.ts` - CRUD operations
- `users.controller.ts` - REST endpoints

**Key Methods:**
```typescript
// UserService
create(createUserDto: CreateUserDto): Promise<User>
findById(id: number): Promise<User>
update(id: number, updateUserDto: UpdateUserDto): Promise<User>
delete(id: number): Promise<void>
assignRole(userId: number, roleId: number): Promise<void>
getPermissions(userId: number): Promise<Permission[]>
```

**Database:** `users`, `user_roles`, `permissions`

### 2.2 Customer Module
**Location:** `backend/src/modules/customers`

**Entities:**
- Customer
- Address
- SavedFavorite
- Review

**Services:**
- `customers.service.ts` - Customer operations
- `customers.controller.ts` - REST endpoints

**Key Endpoints:**
```
GET    /customers/me                 # Get profile
PUT    /customers/me                 # Update profile
GET    /customers/addresses          # List addresses
POST   /customers/addresses          # Add address
PUT    /customers/addresses/:id      # Update address
DELETE /customers/addresses/:id      # Delete address
GET    /customers/favorites          # Get favorites
POST   /customers/favorites/:id      # Save favorite
```

**Database:** `customers`, `addresses`, `saved_favorites`, `reviews`

### 2.3 Restaurant Module
**Location:** `backend/src/modules/restaurants`

**Entities:**
- Restaurant
- RestaurantLocation
- RestaurantStaff
- RestaurantDocument
- MenuCategory
- MenuItem
- MenuItemVariant
- MenuItemAddon

**Services:**
- `restaurants.service.ts` - Restaurant operations
- `menu.service.ts` - Menu management
- `restaurants.controller.ts` - REST endpoints

**Key Endpoints:**
```
GET    /restaurants                  # Browse restaurants
GET    /restaurants/:id              # Get restaurant details
GET    /restaurants/:id/menu         # Get restaurant menu
GET    /restaurants/me               # Get my restaurant
PUT    /restaurants/me               # Update restaurant
POST   /restaurants/me/menu/items    # Create menu item
PUT    /restaurants/me/menu/items/:id # Update item
DELETE /restaurants/me/menu/items/:id # Delete item
```

**Database:** 
- `restaurants`
- `restaurant_locations`
- `restaurant_staff`
- `restaurant_documents`
- `menu_categories`
- `menu_items`
- `menu_item_variants`
- `menu_item_addons`

### 2.4 Orders Module
**Location:** `backend/src/modules/orders`

**Entities:**
- Order
- OrderItem
- OrderStatusHistory
- CartItem
- Refund

**Services:**
- `orders.service.ts` - Order operations
- `cart.service.ts` - Cart management
- `order-status.service.ts` - Status tracking
- `orders.controller.ts` - REST endpoints

**Key Endpoints:**
```
GET    /cart                         # Get cart
POST   /cart/items                   # Add to cart
PUT    /cart/items/:id               # Update cart item
DELETE /cart/items/:id               # Remove from cart
POST   /cart/apply-coupon            # Apply coupon
POST   /orders/checkout              # Place order
GET    /orders                       # Get orders
GET    /orders/:id                   # Get order details
PUT    /orders/:id/cancel            # Cancel order
POST   /orders/:id/rating            # Rate order
```

**Order State Machine:**
```
PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP 
→ PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
                              ↓
                          CANCELLED/FAILED
```

**Database:**
- `orders`
- `order_items`
- `order_status_history`
- `cart_items`
- `refunds`

### 2.5 Delivery Partner Module
**Location:** `backend/src/modules/delivery`

**Entities:**
- DeliveryPartner
- DeliveryPartnerDocument
- DeliveryPartnerVehicle
- DeliveryAssignment
- DeliveryTracking
- DeliveryPartnerEarnings
- DeliveryPartnerPayout

**Services:**
- `delivery-partners.service.ts` - Partner management
- `delivery-assignment.service.ts` - Assignment logic
- `delivery-tracking.service.ts` - Location tracking
- `delivery-partners.controller.ts` - REST endpoints

**Key Endpoints:**
```
GET    /delivery-partners/me         # Get my profile
PUT    /delivery-partners/me         # Update profile
GET    /delivery-partners/me/requests # Get requests
POST   /delivery-partners/me/requests/:id/accept  # Accept
POST   /delivery-partners/me/requests/:id/reject  # Reject
PUT    /delivery-partners/me/availability        # Set availability
GET    /delivery-partners/me/active-delivery     # Get active
PUT    /delivery-partners/me/deliveries/:id/status # Update status
PUT    /delivery-partners/me/deliveries/:id/location # Update location
GET    /delivery-partners/me/earnings            # Get earnings
GET    /delivery-partners/me/payouts             # Get payouts
```

**Assignment Algorithm:**
```
1. Get unassigned orders
2. Filter delivery partners (online, in service area)
3. Calculate distance to restaurant
4. Score partners (distance, rating, load)
5. Assign to best partner
6. Send notification
7. Wait for acceptance (timeout: 30 seconds)
8. Reassign if rejected
```

**Database:**
- `delivery_partners`
- `delivery_partner_documents`
- `delivery_partner_vehicles`
- `delivery_assignments`
- `delivery_tracking`
- `delivery_partner_earnings`
- `delivery_partner_payouts`

### 2.6 Payment Module
**Location:** `backend/src/modules/payments`

**Entities:**
- Payment
- RestaurantSettlement
- PlatformTransaction

**Services:**
- `payments.service.ts` - Payment processing
- `payments.controller.ts` - Payment endpoints
- `payment-gateway.abstraction.ts` - Gateway abstraction

**Key Methods:**
```typescript
// PaymentService
createPayment(orderId: number, amount: number): Promise<Payment>
verifyPayment(paymentId: string, transactionId: string): Promise<boolean>
processRefund(paymentId: string, amount: number): Promise<Refund>
calculateCommission(orderId: number): Promise<number>
settleRestaurant(restaurantId: number, period: DateRange): Promise<Settlement>
```

**Payment Flow:**
```
1. Customer selects payment method at checkout
2. Backend creates payment record
3. Redirect to payment gateway
4. Gateway processes transaction
5. Webhook callback with result
6. Verify payment server-side
7. Update order status
8. Generate settlement records
```

**Database:**
- `payments`
- `restaurant_settlements`
- `platform_transactions`

---

## Phase 3: Customer Application (Week 4-5)

**Technology:** React Native + Expo + TypeScript

### 3.1 Project Setup
```bash
cd apps/customer-app
expo init customer-app
cd customer-app
npm install
npx expo install expo-router expo-location expo-camera expo-image-picker
npm install @react-native-maps/maps @react-native-community/geolocation
npm install redux @reduxjs/toolkit react-redux
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install axios
```

### 3.2 Directory Structure
```
apps/customer-app/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── OTPVerificationScreen.tsx
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   └── RestaurantListScreen.tsx
│   │   ├── restaurants/
│   │   │   ├── RestaurantDetailsScreen.tsx
│   │   │   └── MenuScreen.tsx
│   │   ├── orders/
│   │   │   ├── CartScreen.tsx
│   │   │   ├── CheckoutScreen.tsx
│   │   │   ├── OrdersScreen.tsx
│   │   │   └── OrderTrackingScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── AddressesScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── support/
│   │       ├── SupportScreen.tsx
│   │       └── TicketDetailScreen.tsx
│   ├── components/
│   │   ├── RestaurantCard.tsx
│   │   ├── MenuItemCard.tsx
│   │   ├── CartItem.tsx
│   │   ├── OrderStatus.tsx
│   │   └── LocationPicker.tsx
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── orders.service.ts
│   │   └── location.service.ts
│   ├── store/
│   │   ├── authSlice.ts
│   │   ├── cartSlice.ts
│   │   ├── ordersSlice.ts
│   │   └── store.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── App.tsx
│   └── app.json
```

### 3.3 Key Features

**Authentication Flow:**
1. Register with email/phone
2. Verify OTP
3. Create password
4. Login with credentials
5. Maintain JWT token in secure storage

**Restaurant Discovery:**
1. Get user location (GPS)
2. Fetch nearby restaurants
3. Display with filters (cuisine, rating, delivery time)
4. Show restaurant details with menu

**Menu & Cart:**
1. Browse menu categories
2. Select items with variants
3. Add addons
4. Add to cart
5. Review cart and edit quantities

**Checkout:**
1. Select delivery address
2. Apply coupon
3. Select payment method
4. Review order summary
5. Place order

**Order Tracking:**
1. Show order status timeline
2. Display delivery partner details
3. Real-time location tracking (WebSocket)
4. Show estimated delivery time
5. Contact support option

### 3.4 State Management (Redux)

```typescript
// authSlice.ts
state = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
}

// cartSlice.ts
state = {
  restaurantId: null,
  items: [],
  subtotal: 0,
  tax: 0,
  deliveryCharge: 0,
  discount: 0,
  total: 0,
}

// ordersSlice.ts
state = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
}
```

---

## Phase 4: Delivery Partner Application (Week 6-7)

**Technology:** React Native + Expo + TypeScript

### 4.1 Project Setup
```bash
cd apps/delivery-partner-app
expo init delivery-partner-app
npm install
npx expo install expo-location expo-background-fetch expo-task-manager
npm install @react-native-camera/camera @react-native-maps/maps
```

### 4.2 Key Screens

```
screens/
├── auth/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── KYCDocumentUploadScreen.tsx
│   └── VerificationStatusScreen.tsx
├── delivery/
│   ├── DeliveryRequestsScreen.tsx
│   ├── ActiveDeliveryScreen.tsx
│   ├── NavigationScreen.tsx
│   ├── DeliveryConfirmationScreen.tsx
│   └── ProofOfDeliveryScreen.tsx
├── earnings/
│   ├── EarningsScreen.tsx
│   ├── PayoutsScreen.tsx
│   └── EarningsDetailScreen.tsx
├── profile/
│   ├── ProfileScreen.tsx
│   ├── DocumentsScreen.tsx
│   ├── VehicleDetailsScreen.tsx
│   └── SettingsScreen.tsx
└── support/
    ├── SupportScreen.tsx
    └── TicketDetailScreen.tsx
```

### 4.3 Core Features

**Delivery Request Workflow:**
1. Partner goes online
2. System offers delivery requests
3. Partner accepts/rejects
4. Navigate to restaurant (Google Maps integration)
5. Confirm arrival and pickup
6. Navigate to customer
7. Verify delivery (OTP/PIN)
8. Confirm delivery with photo
9. Receive earnings

**Location Tracking:**
- Background location updates every 30 seconds
- Send to backend via WebSocket
- Compress location data
- Battery optimization

**Earnings Tracking:**
- Show daily earnings
- Weekly and monthly summaries
- Bonuses and penalties
- Payout status

**KYC Workflow:**
1. Upload identity document
2. Upload vehicle document
3. Submit for verification
4. Wait for admin approval
5. Receive verification status

---

## Phase 5: Restaurant Application (Week 8)

**Technology:** React Native or Web (React)

### 5.1 Key Screens

```
screens/
├── auth/
│   ├── LoginScreen.tsx
│   └── RegistrationScreen.tsx
├── dashboard/
│   ├── DashboardScreen.tsx
│   ├── TodayOrdersScreen.tsx
│   └── AnalyticsScreen.tsx
├── orders/
│   ├── OrdersListScreen.tsx
│   ├── OrderDetailScreen.tsx
│   └── OrderAcceptanceFlow.tsx
├── menu/
│   ├── MenuCategoriesScreen.tsx
│   ├── MenuItemsScreen.tsx
│   ├── AddMenuItemScreen.tsx
│   └── EditMenuItemScreen.tsx
├── settings/
│   ├── RestaurantSettingsScreen.tsx
│   ├── OperatingHoursScreen.tsx
│   └── ServiceAreasScreen.tsx
├── analytics/
│   ├── SalesReportScreen.tsx
│   ├── CommissionScreen.tsx
│   └── SettlementsScreen.tsx
└── support/
    ├── SupportScreen.tsx
    └── TicketDetailScreen.tsx
```

### 5.2 Core Features

**Order Management:**
1. Real-time order notifications (WebSocket)
2. Accept/reject orders
3. Set preparation time
4. Mark ready for pickup
5. Track delivery partner
6. Handle cancellations

**Menu Management:**
1. Create/edit categories
2. Add/edit menu items
3. Set variants and add-ons
4. Manage pricing
5. Control availability
6. Upload images

**Analytics:**
1. Sales summary
2. Order analytics
3. Popular items
4. Customer ratings
5. Performance metrics

**Settlements:**
1. View settlement records
2. Download statements
3. View commission deductions
4. Payout history

---

## Phase 6: Admin Web Portal (Week 9-10)

**Technology:** Next.js 14 + React + Tailwind CSS + shadcn/ui

### 6.1 Project Setup
```bash
cd apps/admin-web
npx create-next-app@latest . --typescript --tailwind
npm install @tanstack/react-query zustand socket.io-client
npm install recharts date-fns
npm install @radix-ui/react-* (components)
```

### 6.2 Directory Structure
```
apps/admin-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx
│   │   │   ├── customers/
│   │   │   ├── restaurants/
│   │   │   ├── delivery-partners/
│   │   │   ├── orders/
│   │   │   ├── team-leaders/
│   │   │   ├── finance/
│   │   │   ├── coupons/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── sidebar/
│   │   ├── header/
│   │   ├── dashboard/
│   │   ├── tables/
│   │   ├── forms/
│   │   ├── modals/
│   │   └── charts/
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useQuery.ts
│   │   └── useMutation.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
```

### 6.3 Dashboard Pages

**Dashboard:**
- KPI cards (customers, restaurants, partners, orders)
- Revenue charts
- Order status distribution
- Recent orders
- Online partners count
- Pending KYC approvals
- Support tickets

**Customer Management:**
- List with search/filter
- View profile
- View order history
- Suspend/reactivate account
- Send messages

**Restaurant Management:**
- List with approval status
- View details
- Configure commission
- View documents
- Approve/reject onboarding
- View settlements
- Performance metrics

**Delivery Partner Management:**
- List with status
- KYC verification
- Document review
- View earnings
- View payouts
- Performance metrics
- Suspend/reactivate
- Assign to team leaders

**Order Control Center:**
- List all orders
- Filter by status
- Search by order ID
- View order details
- Timeline view
- Reassign delivery partner
- Process refunds
- Cancel orders

**Live Operations Map:**
- Show active orders
- Delivery partner locations
- Restaurant locations
- Delivery routes
- Delayed orders alert

**Finance Management:**
- Customer payments
- Restaurant commissions
- Delivery partner earnings
- Platform revenue
- Refunds
- Financial reports
- Export to CSV/PDF

---

## Phase 7: Team Leader Portal (Week 11)

**Technology:** Next.js 14 + React + Tailwind CSS

### 7.1 Key Pages

```
(operations)/
├── dashboard/
│   └── page.tsx
├── partners/
│   ├── page.tsx
│   ├── [id]/
│   │   └── page.tsx
│   └── performance/
│       └── page.tsx
├── deliveries/
│   ├── page.tsx
│   ├── active/
│   │   └── page.tsx
│   └── [id]/
│       └── page.tsx
├── support/
│   ├── page.tsx
│   ├── tickets/
│   │   └── [id]/
│   │       └── page.tsx
│   └── escalations/
│       └── page.tsx
└── analytics/
    └── page.tsx
```

### 7.2 Core Features

**Partner Management:**
- View assigned partners
- Check online/offline status
- View active deliveries
- Performance metrics
- Attendance tracking

**Delivery Monitoring:**
- Live delivery tracking
- Show delivery location
- Expected delivery time
- Order details
- Customer contact info

**Issue Management:**
- Create support tickets
- View open tickets
- Escalate to admin
- Add messages
- Track resolution

**Permissions Enforcement:**
- Cannot delete platform data
- Cannot access unrestricted financials
- Cannot create admin accounts
- Cannot modify system settings
- Cannot override critical controls

---

## Phase 8: Payments, Notifications & Polish (Week 12-13)

### 8.1 Payment Integration

**Stripe Integration:**
```typescript
// services/payment-gateway.service.ts
class StripePaymentGateway implements IPaymentGateway {
  async createPaymentIntent(amount: number, orderId: string): Promise<string>
  async confirmPayment(paymentIntentId: string): Promise<boolean>
  async refundPayment(paymentIntentId: string, amount?: number): Promise<boolean>
  async handleWebhook(event: StripeEvent): Promise<void>
}
```

**Payment Verification:**
- Create payment record before redirect
- Verify on webhook callback
- Update order status based on result
- Handle failed payments
- Manage refunds

### 8.2 Push Notifications

**Using Firebase Cloud Messaging:**
```bash
npm install firebase-admin
```

**Notification Types:**
- New order received (restaurant)
- Delivery request (partner)
- Order status updates (customer)
- Delivery nearby (customer)
- Support messages (all)

**Implementation:**
```typescript
// services/notification.service.ts
async sendPushNotification(
  userId: number,
  title: string,
  body: string,
  data?: any
): Promise<void>

async sendBatchNotifications(
  userIds: number[],
  title: string,
  body: string
): Promise<void>
```

### 8.3 Real-time Updates (WebSockets)

**Socket.IO Namespaces:**
```typescript
// Rooms: order:{orderId}, partner:{partnerId}, restaurant:{restaurantId}

socket.on('order:status_update', (data) => {
  // Update order status for customer
})

socket.on('delivery:location_update', (data) => {
  // Update location for customer
})

socket.on('restaurant:new_order', (data) => {
  // Notify restaurant of new order
})
```

### 8.4 Email Templates

Using SendGrid or Nodemailer:
```typescript
// Email templates
- OrderConfirmation.hbs
- OrderReady.hbs
- DeliveryStarted.hbs
- OrderDelivered.hbs
- RefundProcessed.hbs
- KYCApproved.hbs
- KYCRejected.hbs
- SettlementReport.hbs
```

---

## Phase 9: Testing & Deployment (Week 14-15)

### 9.1 Testing Strategy

**Unit Tests:**
```bash
# Each module has corresponding .spec.ts files
npm test
```

**Key Tests:**
- Authentication flows
- Order creation and state transitions
- Payment processing
- Role-based access control
- Delivery assignment logic
- Refund processing

**Integration Tests:**
```bash
npm run test:integration
# Tests API endpoints with real database
```

**E2E Tests:**
```bash
npm run test:e2e
# Test complete user workflows
```

### 9.2 Production Deployment

**Checklist:**
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Logging setup
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Security audit passed
- [ ] Load testing performed
- [ ] Documentation updated

**Deployment Steps:**

1. **Build Applications:**
   ```bash
   npm run build
   ```

2. **Database:**
   ```bash
   npm run db:migrate
   ```

3. **Backend Deployment:**
   - Push Docker image to registry
   - Deploy to container platform (Render/Railway)
   - Set environment variables
   - Configure SSL

4. **Web Portal Deployment:**
   - Deploy to Vercel
   - Configure environment variables
   - Setup custom domain
   - Enable automatic deployments

5. **Mobile Apps:**
   - Build for iOS and Android
   - Submit to App Store and Play Store
   - Configure deep linking
   - Setup analytics

### 9.3 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
- Lint code
- Run tests
- Build Docker image
- Push to registry
- Deploy to staging
- Run smoke tests
- Deploy to production
```

---

## Key Implementation Tips

### 1. Database Best Practices
- Use migrations for schema changes
- Create indexes on frequently queried fields
- Use transactions for multi-step operations
- Regular backups

### 2. API Development
- Version your API (v1, v2)
- Use request/response DTOs
- Implement proper error handling
- Add request validation
- Document with Swagger/OpenAPI

### 3. Security
- Enforce HTTPS
- Use CSRF protection
- Validate all inputs server-side
- Hash passwords with bcrypt
- Use secure JWT secrets
- Implement rate limiting
- Log all sensitive actions

### 4. Performance
- Use pagination for large datasets
- Implement caching with Redis
- Use database connection pooling
- Optimize database queries
- Use CDN for static assets
- Implement lazy loading in mobile

### 5. Monitoring
- Setup error tracking (Sentry)
- Monitor API performance
- Track database queries
- Setup alerts for critical issues
- Regular log analysis

### 6. Development Workflow
- Use feature branches
- Require code reviews
- Automated testing before merge
- Semantic commit messages
- Version releases with tags

---

## Common Pitfalls to Avoid

1. **Payment Security:**
   - ❌ Don't verify payments only client-side
   - ✅ Always verify server-side and via webhook

2. **Order States:**
   - ❌ Don't allow invalid state transitions
   - ✅ Implement strict state machine validation

3. **Permissions:**
   - ❌ Don't enforce permissions only frontend
   - ✅ Always check permissions server-side

4. **Location Data:**
   - ❌ Don't expose all partner locations to customers
   - ✅ Respect privacy, show only active delivery partner

5. **Financial Records:**
   - ❌ Don't allow manual edits without audit trail
   - ✅ Keep immutable transaction log

---

## Resources & References

- [NestJS Best Practices](https://docs.nestjs.com/techniques/database)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Optimization](https://www.postgresql.org/docs/current/performance.html)
- [Socket.IO Namespace & Rooms](https://socket.io/docs/v4/namespaces/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Next Steps

After completing this implementation:

1. **Testing:** Thoroughly test all features
2. **Performance Tuning:** Optimize slow queries and API endpoints
3. **Security Audit:** Third-party security review
4. **Load Testing:** Verify system can handle expected load
5. **Monitoring Setup:** Implement production monitoring
6. **Documentation:** Complete API and system documentation
7. **Training:** Train support team on platform
8. **Launch:** Go-live to production

