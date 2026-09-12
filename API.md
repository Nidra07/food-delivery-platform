# Food Delivery Platform - API Documentation

## Base URL

```
Development: http://localhost:3000/v1
Staging: https://staging-api.fooddelivery.com/v1
Production: https://api.fooddelivery.com/v1
```

---

## Authentication

All authenticated endpoints require a bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Refresh
- Access tokens expire after 24 hours
- Use refresh token to obtain new access token
- Refresh tokens expire after 7 days

---

## Response Format

All API responses follow this format:

### Success Response (200, 201)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Example",
    "created_at": "2024-09-12T10:30:00Z"
  },
  "error": null,
  "timestamp": "2024-09-12T10:30:00Z",
  "request_id": "req_123abc"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"]
    }
  },
  "timestamp": "2024-09-12T10:30:00Z",
  "request_id": "req_123abc"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2024-09-12T10:30:00Z",
  "request_id": "req_123abc"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_CREDENTIALS | 401 | Invalid email/password |
| TOKEN_EXPIRED | 401 | Access token expired |
| UNAUTHORIZED | 403 | Insufficient permissions |
| RESOURCE_NOT_FOUND | 404 | Resource does not exist |
| VALIDATION_ERROR | 400 | Input validation failed |
| DUPLICATE_RESOURCE | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

---

## Authentication Endpoints

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "CUSTOMER"  // CUSTOMER, DELIVERY_PARTNER, RESTAURANT_OWNER
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+1234567890",
    "first_name": "John",
    "last_name": "Doe",
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 86400
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "role": "CUSTOMER",
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 86400
  }
}
```

### Refresh Token
```
POST /auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 86400
  }
}
```

### Send OTP
```
POST /auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "EMAIL"  // EMAIL or SMS
}

Response: 200 OK
{
  "success": true,
  "data": {
    "message": "OTP sent to your email",
    "expires_in": 600
  }
}
```

### Verify OTP
```
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "verified": true,
    "message": "Email verified successfully"
  }
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["CUSTOMER"],
    "permissions": ["browse:restaurants", "place:order", "track:order"]
  }
}
```

---

## Customer Endpoints

### Get Customer Profile
```
GET /customers/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "phone_verified": true,
    "email_verified": true,
    "total_orders": 5,
    "total_spent": 250.50,
    "last_order_at": "2024-09-10T15:30:00Z"
  }
}
```

### Update Customer Profile
```
PUT /customers/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "preferred_language": "en"
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated customer object */ }
}
```

### Get Customer Addresses
```
GET /customers/addresses
Authorization: Bearer <access_token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "label": "Home",
      "street_address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "is_default": true
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Create Address
```
POST /customers/addresses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "label": "Home",
  "street_address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "is_default": true
}

Response: 201 Created
{
  "success": true,
  "data": { /* address object */ }
}
```

### Update Address
```
PUT /customers/addresses/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{ /* address fields to update */ }

Response: 200 OK
{
  "success": true,
  "data": { /* updated address */ }
}
```

### Delete Address
```
DELETE /customers/addresses/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "message": "Address deleted successfully"
  }
}
```

---

## Restaurant Endpoints

### Browse Restaurants
```
GET /restaurants
Authorization: Bearer <access_token> (optional)

Query Parameters:
- latitude: number (required)
- longitude: number (required)
- search: string
- cuisines: string (comma-separated)
- sort_by: "rating" | "delivery_time" | "min_order" (default: "rating")
- page: number (default: 1)
- limit: number (default: 20)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "description": "Authentic Italian cuisine",
      "cuisine_types": ["Italian", "Pizza"],
      "logo_url": "https://...",
      "rating": 4.5,
      "total_ratings": 324,
      "min_order_value": 10.00,
      "delivery_charge": 2.50,
      "average_prep_time": 25
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Get Restaurant Details
```
GET /restaurants/:id
Authorization: Bearer <access_token> (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pizza Palace",
    "description": "Authentic Italian cuisine",
    "cuisine_types": ["Italian", "Pizza"],
    "logo_url": "https://...",
    "banner_url": "https://...",
    "rating": 4.5,
    "total_ratings": 324,
    "min_order_value": 10.00,
    "delivery_charge": 2.50,
    "average_prep_time": 25,
    "is_open": true,
    "is_accepting_orders": true,
    "opens_at": "11:00",
    "closes_at": "23:00"
  }
}
```

### Get Restaurant Menu
```
GET /restaurants/:id/menu
Authorization: Bearer <access_token> (optional)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pizza Category",
      "items": [
        {
          "id": 101,
          "name": "Margherita Pizza",
          "description": "Fresh mozzarella and basil",
          "price": 12.99,
          "image_url": "https://...",
          "is_vegetarian": true,
          "rating": 4.7,
          "variants": [
            {
              "id": 1001,
              "name": "Medium",
              "price_modifier": 0
            }
          ],
          "addons": [
            {
              "id": 2001,
              "name": "Extra Cheese",
              "price": 1.50
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Order Endpoints

### Get Cart
```
GET /cart
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "restaurant_id": 1,
    "items": [
      {
        "id": 1,
        "menu_item_id": 101,
        "item_name": "Margherita Pizza",
        "quantity": 2,
        "unit_price": 12.99,
        "variant_selection": { "size": "Medium" },
        "addons_selection": { "extra_cheese": true },
        "item_total": 25.98
      }
    ],
    "subtotal": 25.98,
    "tax": 2.08,
    "delivery_charge": 2.50,
    "total": 30.56
  }
}
```

### Add to Cart
```
POST /cart/items
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "restaurant_id": 1,
  "menu_item_id": 101,
  "quantity": 2,
  "variant_selection": { "size": "Medium" },
  "addons_selection": { "extra_cheese": true },
  "special_instructions": "No onions"
}

Response: 201 Created
{
  "success": true,
  "data": { /* cart item */ }
}
```

### Update Cart Item
```
PUT /cart/items/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quantity": 3,
  "variant_selection": { "size": "Large" }
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated cart item */ }
}
```

### Remove from Cart
```
DELETE /cart/items/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": { "message": "Item removed from cart" }
}
```

### Apply Coupon
```
POST /cart/apply-coupon
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "coupon_code": "SAVE10"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "coupon_code": "SAVE10",
    "discount_amount": 3.00,
    "original_total": 30.56,
    "final_total": 27.56
  }
}
```

### Checkout
```
POST /orders/checkout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "delivery_address_id": 1,
  "payment_method": "ONLINE",
  "coupon_code": "SAVE10",
  "notes": "Ring doorbell twice",
  "delivery_time_preference": "ASAP"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "order_id": 1001,
    "order_number": "ORD-2024-001001",
    "restaurant_id": 1,
    "status": "PENDING",
    "subtotal": 25.98,
    "tax": 2.08,
    "delivery_charge": 2.50,
    "discount_amount": 3.00,
    "total_amount": 27.56,
    "payment_id": 5001,
    "payment_url": "https://stripe.com/pay/...",
    "created_at": "2024-09-12T10:30:00Z"
  }
}
```

### Get Orders
```
GET /orders
Authorization: Bearer <access_token>

Query Parameters:
- status: string (comma-separated)
- restaurant_id: number
- page: number (default: 1)
- limit: number (default: 20)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "order_number": "ORD-2024-001001",
      "restaurant_id": 1,
      "restaurant_name": "Pizza Palace",
      "status": "OUT_FOR_DELIVERY",
      "total_amount": 27.56,
      "created_at": "2024-09-12T10:30:00Z",
      "estimated_delivery": "2024-09-12T11:15:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Get Order Details
```
GET /orders/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1001,
    "order_number": "ORD-2024-001001",
    "customer_id": 1,
    "restaurant_id": 1,
    "restaurant_name": "Pizza Palace",
    "delivery_partner_id": 5,
    "delivery_partner_name": "John Smith",
    "delivery_partner_phone": "+1234567890",
    "delivery_partner_rating": 4.8,
    "items": [
      {
        "id": 1,
        "item_name": "Margherita Pizza",
        "quantity": 2,
        "unit_price": 12.99,
        "item_total": 25.98
      }
    ],
    "delivery_address": {
      "street_address": "123 Main St",
      "city": "New York",
      "postal_code": "10001"
    },
    "status": "OUT_FOR_DELIVERY",
    "status_timeline": [
      {
        "status": "PENDING",
        "timestamp": "2024-09-12T10:30:00Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2024-09-12T10:32:00Z"
      }
    ],
    "subtotal": 25.98,
    "tax": 2.08,
    "delivery_charge": 2.50,
    "discount_amount": 3.00,
    "total_amount": 27.56,
    "payment_status": "COMPLETED",
    "created_at": "2024-09-12T10:30:00Z",
    "estimated_delivery": "2024-09-12T11:15:00Z"
  }
}
```

### Track Order (Real-time)
```
WebSocket: /ws/orders/:id/tracking
Authorization: Bearer <access_token>

Connection established, listening for updates:

{
  "type": "DELIVERY_LOCATION_UPDATE",
  "data": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2024-09-12T10:45:00Z"
  }
}

{
  "type": "ORDER_STATUS_UPDATE",
  "data": {
    "status": "OUT_FOR_DELIVERY",
    "timestamp": "2024-09-12T10:50:00Z"
  }
}
```

### Cancel Order
```
PUT /orders/:id/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Changed my mind",
  "comments": "Will order later"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1001,
    "status": "CANCELLED",
    "cancellation_reason": "Changed my mind",
    "refund_status": "PROCESSING"
  }
}
```

### Rate Order
```
POST /orders/:id/rating
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Excellent service!",
  "review_text": "Food was fresh and arrived on time",
  "food_quality_rating": 5,
  "delivery_rating": 5,
  "packaging_rating": 4
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 1001,
    "rating": 5,
    "review_text": "Food was fresh and arrived on time",
    "created_at": "2024-09-12T12:00:00Z"
  }
}
```

---

## Restaurant Partner Endpoints

### Get Restaurant Profile
```
GET /restaurants/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 10,
    "name": "Pizza Palace",
    "description": "Authentic Italian cuisine",
    "status": "APPROVED",
    "is_open": true,
    "is_accepting_orders": true,
    "total_orders": 150,
    "avg_rating": 4.5
  }
}
```

### Update Restaurant Profile
```
PUT /restaurants/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Pizza Palace Plus",
  "description": "Authentic Italian and Mediterranean",
  "opens_at": "11:00",
  "closes_at": "23:30"
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated restaurant */ }
}
```

### Get Orders
```
GET /restaurants/me/orders
Authorization: Bearer <access_token>

Query Parameters:
- status: string (comma-separated)
- sort_by: "created_at" | "updated_at" (default: "created_at")
- order: "asc" | "desc" (default: "desc")
- page: number
- limit: number

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "order_number": "ORD-2024-001001",
      "customer_name": "John Doe",
      "status": "PREPARING",
      "items_count": 3,
      "total_amount": 27.56,
      "created_at": "2024-09-12T10:30:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Accept Order
```
PUT /restaurants/me/orders/:id/accept
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "estimated_prep_time": 25
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1001,
    "status": "CONFIRMED",
    "estimated_prep_time": 25
  }
}
```

### Update Order Status
```
PUT /restaurants/me/orders/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "READY_FOR_PICKUP",
  "notes": "Order ready, waiting for pickup"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1001,
    "status": "READY_FOR_PICKUP"
  }
}
```

### Reject Order
```
PUT /restaurants/me/orders/:id/reject
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Out of stock",
  "items": [101, 102]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1001,
    "status": "REJECTED",
    "rejection_reason": "Out of stock"
  }
}
```

### Get Menu
```
GET /restaurants/me/menu
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pizza",
      "items": [ /* menu items */ ]
    }
  ]
}
```

### Create Menu Category
```
POST /restaurants/me/menu/categories
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Appetizers",
  "description": "Starters and appetizers"
}

Response: 201 Created
{
  "success": true,
  "data": { /* category */ }
}
```

### Create Menu Item
```
POST /restaurants/me/menu/items
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "category_id": 1,
  "name": "Margherita Pizza",
  "description": "Fresh mozzarella and basil",
  "price": 12.99,
  "is_vegetarian": true,
  "prep_time_minutes": 15
}

Response: 201 Created
{
  "success": true,
  "data": { /* menu item */ }
}
```

### Get Analytics
```
GET /restaurants/me/analytics
Authorization: Bearer <access_token>

Query Parameters:
- start_date: date (YYYY-MM-DD)
- end_date: date (YYYY-MM-DD)

Response: 200 OK
{
  "success": true,
  "data": {
    "total_orders": 150,
    "total_revenue": 3750.00,
    "average_order_value": 25.00,
    "average_rating": 4.5,
    "top_items": [ /* top selling items */ ]
  }
}
```

### Get Settlements
```
GET /restaurants/me/settlements
Authorization: Bearer <access_token>

Query Parameters:
- page: number
- limit: number

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "period_start_date": "2024-09-01",
      "period_end_date": "2024-09-30",
      "gross_sales": 3750.00,
      "commission_amount": 562.50,
      "net_settlement_amount": 3187.50,
      "status": "PAID"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

---

## Delivery Partner Endpoints

### Get Partner Profile
```
GET /delivery-partners/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 5,
    "user_id": 20,
    "status": "ACTIVE",
    "is_online": true,
    "vehicle_type": "BIKE",
    "total_deliveries": 245,
    "average_rating": 4.7,
    "kyc_status": "VERIFIED"
  }
}
```

### Update Availability
```
PUT /delivery-partners/me/availability
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "is_online": true,
  "current_location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "is_online": true,
    "last_location_updated": "2024-09-12T10:30:00Z"
  }
}
```

### Get Delivery Requests
```
GET /delivery-partners/me/requests
Authorization: Bearer <access_token>

Query Parameters:
- status: "PENDING" | "ACCEPTED" | "REJECTED"
- page: number
- limit: number

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_id": 1001,
      "order_number": "ORD-2024-001001",
      "restaurant_name": "Pizza Palace",
      "customer_name": "John Doe",
      "pickup_address": "123 Restaurant St",
      "delivery_address": "456 Customer Ave",
      "estimated_distance": 3.5,
      "estimated_earnings": 5.50,
      "status": "PENDING",
      "created_at": "2024-09-12T10:30:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Accept Delivery Request
```
POST /delivery-partners/me/requests/:id/accept
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "status": "ACCEPTED",
    "accepted_at": "2024-09-12T10:35:00Z"
  }
}
```

### Reject Delivery Request
```
POST /delivery-partners/me/requests/:id/reject
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Too far"
}

Response: 200 OK
{
  "success": true,
  "data": { "message": "Request rejected" }
}
```

### Get Active Delivery
```
GET /delivery-partners/me/active-delivery
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 1001,
    "status": "PICKED_UP",
    "restaurant_location": { "latitude": 40.7500, "longitude": -74.0100 },
    "delivery_location": { "latitude": 40.7200, "longitude": -74.0050 },
    "customer_phone": "+1234567890",
    "delivery_otp": "123456"
  }
}
```

### Update Delivery Status
```
PUT /delivery-partners/me/deliveries/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "DELIVERED",
  "otp_entered": "123456"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "status": "DELIVERED",
    "delivered_at": "2024-09-12T11:00:00Z"
  }
}
```

### Upload Location
```
PUT /delivery-partners/me/deliveries/:id/location
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "latitude": 40.7200,
  "longitude": -74.0050,
  "accuracy": 5.2,
  "speed": 12.5
}

Response: 200 OK
{
  "success": true,
  "data": { "message": "Location updated" }
}
```

### Get Earnings
```
GET /delivery-partners/me/earnings
Authorization: Bearer <access_token>

Query Parameters:
- period: "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM"
- start_date: date
- end_date: date

Response: 200 OK
{
  "success": true,
  "data": {
    "period": "TODAY",
    "total_deliveries": 12,
    "base_earnings": 48.00,
    "bonus": 5.00,
    "penalties": 0,
    "total_earnings": 53.00,
    "breakdown": [
      {
        "order_id": 1001,
        "base_charge": 4.00,
        "bonus": 0.50,
        "total": 4.50
      }
    ]
  }
}
```

### Get Payouts
```
GET /delivery-partners/me/payouts
Authorization: Bearer <access_token>

Query Parameters:
- status: string
- page: number

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "payout_period_start": "2024-09-01",
      "payout_period_end": "2024-09-07",
      "total_earnings": 320.00,
      "deductions": 20.00,
      "net_amount": 300.00,
      "status": "COMPLETED",
      "processed_date": "2024-09-08"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

---

## Admin Endpoints

### Dashboard Overview
```
GET /admin/dashboard
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "total_customers": 5420,
    "total_restaurants": 340,
    "total_delivery_partners": 890,
    "online_delivery_partners": 245,
    "orders_today": 1320,
    "orders_active": 185,
    "orders_completed": 1100,
    "orders_cancelled": 35,
    "gross_order_value_today": 45600.00,
    "platform_revenue_today": 6840.00,
    "pending_kyc_approvals": 12,
    "pending_support_tickets": 8
  }
}
```

### Manage Customers
```
GET /admin/customers
Authorization: Bearer <access_token>

Query Parameters:
- search: string
- status: string
- page: number
- limit: number

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "ACTIVE",
      "total_orders": 15,
      "total_spent": 375.50,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Update Customer Status
```
PUT /admin/customers/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "SUSPENDED",
  "reason": "Suspicious activity"
}

Response: 200 OK
{
  "success": true,
  "data": { "message": "Customer status updated" }
}
```

### Manage Orders
```
GET /admin/orders
Authorization: Bearer <access_token>

Query Parameters:
- status: string
- restaurant_id: number
- customer_id: number
- delivery_partner_id: number
- date_from: date
- date_to: date
- sort_by: string
- page: number
- limit: number

Response: 200 OK
{
  "success": true,
  "data": [ /* orders */ ],
  "pagination": { /* pagination info */ }
}
```

### Reassign Delivery
```
PUT /admin/orders/:id/reassign
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "new_delivery_partner_id": 10,
  "reason": "Original partner unavailable"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "order_id": 1001,
    "new_delivery_partner_id": 10,
    "reassigned_at": "2024-09-12T10:40:00Z"
  }
}
```

### Process Refund
```
PUT /admin/orders/:id/refund
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Customer requested",
  "amount": 27.56
}

Response: 200 OK
{
  "success": true,
  "data": {
    "refund_id": 1,
    "order_id": 1001,
    "amount": 27.56,
    "status": "PROCESSING"
  }
}
```

### Manage Coupons
```
POST /admin/coupons
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "SAVE15",
  "description": "Save 15% on orders",
  "discount_type": "PERCENTAGE",
  "discount_value": 15,
  "minimum_order_value": 20.00,
  "maximum_uses_per_customer": 1,
  "valid_from": "2024-09-12T00:00:00Z",
  "valid_to": "2024-09-30T23:59:59Z"
}

Response: 201 Created
{
  "success": true,
  "data": { /* coupon */ }
}
```

### Get System Settings
```
GET /admin/settings
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "commission_rate": 15.0,
    "tax_rate": 5.0,
    "min_order_value": 10.00,
    "delivery_fee_base": 2.50,
    "delivery_fee_per_km": 1.00,
    "enable_cash_payment": true,
    "enable_wallet": false
  }
}
```

### Update System Settings
```
PUT /admin/settings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "commission_rate": 16.0,
  "tax_rate": 5.0
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated settings */ }
}
```

---

## Team Leader Endpoints

### Get Assigned Partners
```
GET /operations/partners
Authorization: Bearer <access_token>

Query Parameters:
- status: string
- page: number
- limit: number

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "John Smith",
      "phone": "+1234567890",
      "status": "ACTIVE",
      "is_online": true,
      "current_location": { "latitude": 40.7128, "longitude": -74.0060 },
      "active_delivery": {
        "order_id": 1001,
        "status": "OUT_FOR_DELIVERY"
      },
      "total_deliveries_today": 8,
      "average_rating": 4.7
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Get Partner Details
```
GET /operations/partners/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 5,
    "name": "John Smith",
    "phone": "+1234567890",
    "email": "john@example.com",
    "status": "ACTIVE",
    "is_online": true,
    "assigned_zone": "Zone A",
    "current_location": { "latitude": 40.7128, "longitude": -74.0060 },
    "active_delivery": { /* delivery details */ },
    "total_deliveries": 245,
    "average_rating": 4.7,
    "response_time": 2.5,
    "delivery_accuracy": 98.5
  }
}
```

### Send Message to Partner
```
POST /operations/partners/:id/message
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Customer is waiting. Please hurry!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "message_id": 1,
    "sent_at": "2024-09-12T10:45:00Z"
  }
}
```

### Get Active Deliveries
```
GET /operations/deliveries
Authorization: Bearer <access_token>

Query Parameters:
- status: string
- delivery_partner_id: number
- page: number
- limit: number

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_id": 1001,
      "order_number": "ORD-2024-001001",
      "delivery_partner_id": 5,
      "delivery_partner_name": "John Smith",
      "status": "OUT_FOR_DELIVERY",
      "customer_name": "Jane Doe",
      "restaurant_name": "Pizza Palace",
      "assigned_at": "2024-09-12T10:35:00Z",
      "picked_up_at": "2024-09-12T10:50:00Z",
      "estimated_delivery": "2024-09-12T11:15:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Get Delivery Details
```
GET /operations/deliveries/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 1001,
    "status": "OUT_FOR_DELIVERY",
    "delivery_partner": { /* partner details */ },
    "customer": { /* customer details */ },
    "restaurant": { /* restaurant details */ },
    "tracking": {
      "current_location": { "latitude": 40.7150, "longitude": -74.0070 },
      "pickup_location": { "latitude": 40.7500, "longitude": -74.0100 },
      "delivery_location": { "latitude": 40.7200, "longitude": -74.0050 },
      "distance_remaining": 1.2,
      "eta": "2024-09-12T11:10:00Z"
    }
  }
}
```

### Request Delivery Reassignment
```
POST /operations/deliveries/:id/reassign-request
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Partner not responding",
  "requested_action": "REQUEST_APPROVAL"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "request_id": 1,
    "status": "PENDING_APPROVAL",
    "created_at": "2024-09-12T10:55:00Z"
  }
}
```

### Get Support Tickets
```
GET /operations/support-tickets
Authorization: Bearer <access_token>

Query Parameters:
- status: string
- priority: string
- page: number
- limit: number

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_number": "TKT-2024-001",
      "subject": "Delivery delayed",
      "priority": "HIGH",
      "status": "OPEN",
      "category": "DELIVERY_ISSUE",
      "order_id": 1001,
      "created_at": "2024-09-12T10:30:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Create Support Ticket
```
POST /operations/support-tickets
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "subject": "Delivery partner location not updating",
  "description": "Partner location has not updated for 10 minutes",
  "priority": "HIGH",
  "category": "TECHNICAL_ISSUE",
  "related_order_id": 1001,
  "related_partner_id": 5
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_number": "TKT-2024-001",
    "status": "OPEN"
  }
}
```

---

## WebSocket Connections

### Order Real-time Tracking
```
WebSocket: ws://localhost:3001/ws/orders/:id/tracking
Authorization: Bearer <access_token>

# Events received:
{
  "type": "ORDER_STATUS_UPDATE",
  "data": {
    "status": "OUT_FOR_DELIVERY",
    "timestamp": "2024-09-12T10:50:00Z"
  }
}

{
  "type": "DELIVERY_LOCATION_UPDATE",
  "data": {
    "latitude": 40.7150,
    "longitude": -74.0070,
    "accuracy": 5.2,
    "timestamp": "2024-09-12T10:51:00Z"
  }
}
```

### Delivery Partner Real-time Updates
```
WebSocket: ws://localhost:3001/ws/delivery-partners/:id/tracking
Authorization: Bearer <access_token>

# Restaurant receives updates
{
  "type": "DELIVERY_PARTNER_ASSIGNED",
  "data": {
    "delivery_partner_id": 5,
    "partner_name": "John Smith",
    "partner_phone": "+1234567890"
  }
}

{
  "type": "ORDER_PICKED_UP",
  "data": {
    "picked_up_at": "2024-09-12T10:50:00Z"
  }
}
```

### Order Notifications
```
WebSocket: ws://localhost:3001/ws/restaurants/:id/orders
Authorization: Bearer <access_token>

# Restaurant receives new order
{
  "type": "NEW_ORDER",
  "data": {
    "order_id": 1001,
    "order_number": "ORD-2024-001001",
    "customer_name": "Jane Doe",
    "items": [ /* order items */ ],
    "received_at": "2024-09-12T10:30:00Z"
  }
}
```

---

## Rate Limiting

All endpoints are rate-limited:
- **Default:** 100 requests per 15 minutes per IP
- **Authenticated:** 200 requests per 15 minutes per user
- **Admin:** 500 requests per 15 minutes per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1694520600
```

---

## Common Query Parameters

All list endpoints support:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `sort_by`: Field to sort by (default: created_at)
- `order`: asc or desc (default: desc)
- `search`: Full-text search

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"Password123!"}'

# Browse restaurants
curl http://localhost:3000/v1/restaurants \
  -H "Authorization: Bearer <access_token>" \
  -G --data-urlencode "latitude=40.7128" \
  --data-urlencode "longitude=-74.0060"

# Place order
curl -X POST http://localhost:3000/v1/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "delivery_address_id": 1,
    "payment_method": "ONLINE",
    "notes": "Ring doorbell twice"
  }'
```

### Using Postman

1. Import the provided Postman collection
2. Set environment variables (API URL, token)
3. Run individual requests or request collections

### Using Thunder Client

1. Import the provided Thunder Client collection
2. Configure authorization globally
3. Test endpoints

