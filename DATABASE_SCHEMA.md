# Food Delivery Platform - Database Schema

## Overview
- **Database:** PostgreSQL 14+
- **ORM:** TypeORM
- **Migrations:** TypeORM CLI
- **Connection Pooling:** pg with PgBoss

---

## Core Tables

### 1. Users & Authentication

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_picture_url TEXT,
  status ENUM ('ACTIVE', 'SUSPENDED', 'DELETED') DEFAULT 'ACTIVE',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status)
);
```

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
);

-- Seed data
INSERT INTO roles (name, is_system_role) VALUES
('CUSTOMER', true),
('RESTAURANT_OWNER', true),
('RESTAURANT_STAFF', true),
('DELIVERY_PARTNER', true),
('TEAM_LEADER', true),
('ADMIN', true),
('SUPER_ADMIN', true);
```

```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(100),
  action VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_resource_action (resource, action)
);
```

```sql
CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INTEGER,
  
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);
```

```sql
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INTEGER NOT NULL,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status ENUM ('SUCCESS', 'FAILURE') DEFAULT 'SUCCESS',
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_timestamp (user_id, timestamp),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_action (action)
);
```

---

### 2. Customer Module

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  last_order_at TIMESTAMP,
  preferred_language VARCHAR(10),
  notification_preferences JSONB,
  referral_code VARCHAR(20) UNIQUE,
  referred_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_by) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_referral_code (referral_code)
);
```

```sql
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  label VARCHAR(50),
  street_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  saved_name VARCHAR(100),
  delivery_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id),
  INDEX idx_location (latitude, longitude),
  CONSTRAINT one_default_per_customer UNIQUE (customer_id, is_default) WHERE is_default = true
);
```

```sql
CREATE TABLE saved_favorites (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (customer_id, restaurant_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  restaurant_id INTEGER,
  order_id INTEGER,
  rating INTEGER NOT NULL,
  title VARCHAR(200),
  review_text TEXT,
  delivery_rating INTEGER,
  food_quality_rating INTEGER,
  packaging_rating INTEGER,
  images TEXT[],
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  status ENUM ('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_order_id (order_id),
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);
```

---

### 3. Restaurant Module

```sql
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cuisine_types TEXT[],
  logo_url TEXT,
  banner_url TEXT,
  total_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  average_prep_time INTEGER,
  minimum_order_value DECIMAL(10, 2),
  delivery_charge DECIMAL(10, 2),
  status ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'CLOSED') DEFAULT 'PENDING',
  approval_date TIMESTAMP,
  approved_by INTEGER,
  rejection_reason TEXT,
  commission_rate DECIMAL(5, 2) DEFAULT 15,
  tax_rate DECIMAL(5, 2) DEFAULT 5,
  opens_at TIME,
  closes_at TIME,
  is_open BOOLEAN,
  is_accepting_orders BOOLEAN DEFAULT TRUE,
  is_temporarily_closed BOOLEAN DEFAULT FALSE,
  temporarily_closed_reason TEXT,
  temporarily_closed_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_is_open (is_open),
  INDEX idx_cuisine_types (cuisine_types),
  FULLTEXT INDEX idx_name_search (name, description)
);
```

```sql
CREATE TABLE restaurant_locations (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  street_address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(20),
  is_primary BOOLEAN DEFAULT FALSE,
  service_area_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_location (latitude, longitude),
  INDEX idx_restaurant_id (restaurant_id),
  CONSTRAINT one_primary_per_restaurant UNIQUE (restaurant_id, is_primary) WHERE is_primary = true
);
```

```sql
CREATE TABLE restaurant_staff (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role VARCHAR(100),
  status ENUM ('ACTIVE', 'INACTIVE', 'REMOVED') DEFAULT 'ACTIVE',
  added_by INTEGER,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  removed_at TIMESTAMP,
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_restaurant_id (restaurant_id),
  UNIQUE (restaurant_id, user_id)
);
```

```sql
CREATE TABLE restaurant_documents (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  document_url TEXT NOT NULL,
  document_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by INTEGER,
  verified_at TIMESTAMP,
  expiry_date DATE,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_verification_status (is_verified, expiry_date)
);
```

```sql
CREATE TABLE menu_categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant_id (restaurant_id),
  UNIQUE (restaurant_id, name)
);
```

```sql
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  image_url TEXT,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_spicy BOOLEAN DEFAULT FALSE,
  prep_time_minutes INTEGER DEFAULT 15,
  is_available BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  is_recommended BOOLEAN DEFAULT FALSE,
  calories INTEGER,
  allergens TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_category_id (category_id),
  INDEX idx_available (is_available),
  CONSTRAINT valid_price CHECK (price > 0)
);
```

```sql
CREATE TABLE menu_item_variants (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL,
  variant_group_name VARCHAR(100),
  variant_name VARCHAR(100) NOT NULL,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  INDEX idx_menu_item_id (menu_item_id),
  UNIQUE (menu_item_id, variant_group_name, variant_name)
);
```

```sql
CREATE TABLE addon_groups (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  max_selections INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant_id (restaurant_id)
);
```

```sql
CREATE TABLE menu_item_addons (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL,
  addon_group_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  FOREIGN KEY (addon_group_id) REFERENCES addon_groups(id) ON DELETE CASCADE,
  INDEX idx_menu_item_id (menu_item_id),
  INDEX idx_addon_group_id (addon_group_id)
);
```

---

### 4. Order Module

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL,
  delivery_address_id INTEGER,
  delivery_partner_id INTEGER,
  team_leader_id INTEGER,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  delivery_charge DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  coupon_code VARCHAR(50),
  coupon_discount DECIMAL(10, 2) DEFAULT 0,
  notes VARCHAR(500),
  status ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'FAILED'
  ) DEFAULT 'PENDING',
  payment_method ENUM ('ONLINE', 'CASH') DEFAULT 'ONLINE',
  payment_status ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  cancellation_reason TEXT,
  cancelled_by VARCHAR(50),
  cancelled_at TIMESTAMP,
  delivery_time_estimate INTEGER,
  actual_delivery_time INTEGER,
  rating INTEGER,
  customer_feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE SET NULL,
  FOREIGN KEY (team_leader_id) REFERENCES team_leaders(id) ON DELETE SET NULL,
  INDEX idx_customer_id (customer_id),
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_delivery_partner_id (delivery_partner_id),
  INDEX idx_order_number (order_number)
);
```

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  item_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  variant_selection JSONB,
  addons_selection JSONB,
  special_instructions TEXT,
  item_total DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL,
  INDEX idx_order_id (order_id),
  CONSTRAINT valid_quantity CHECK (quantity > 0)
);
```

```sql
CREATE TABLE order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INTEGER,
  changed_by_role VARCHAR(50),
  notes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_order_id (order_id),
  INDEX idx_timestamp (timestamp)
);
```

```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  variant_selection JSONB,
  addons_selection JSONB,
  special_instructions TEXT,
  item_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_customer_restaurant (customer_id, restaurant_id),
  CONSTRAINT valid_quantity CHECK (quantity > 0)
);
```

```sql
CREATE TABLE refunds (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  status ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSED', 'FAILED') DEFAULT 'REQUESTED',
  requested_by VARCHAR(50),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER,
  rejection_reason TEXT,
  payment_method_used VARCHAR(50),
  transaction_id VARCHAR(100),
  notes TEXT,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_order_id (order_id)
);
```

---

### 5. Delivery Partner Module

```sql
CREATE TABLE delivery_partners (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255),
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  date_of_birth DATE,
  gender ENUM ('MALE', 'FEMALE', 'OTHER'),
  status ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE', 'REJECTED') DEFAULT 'PENDING',
  is_online BOOLEAN DEFAULT FALSE,
  current_location_latitude DECIMAL(10, 8),
  current_location_longitude DECIMAL(11, 8),
  current_location_updated_at TIMESTAMP,
  vehicle_type VARCHAR(50),
  total_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  response_time INTEGER,
  delivery_accuracy DECIMAL(5, 2),
  cancellation_rate DECIMAL(5, 2),
  kyc_status ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED') DEFAULT 'PENDING',
  kyc_verified_at TIMESTAMP,
  bank_account_verified BOOLEAN DEFAULT FALSE,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  is_full_time BOOLEAN DEFAULT FALSE,
  assigned_zone_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_is_online (is_online),
  INDEX idx_location (current_location_latitude, current_location_longitude)
);
```

```sql
CREATE TABLE delivery_partner_documents (
  id SERIAL PRIMARY KEY,
  delivery_partner_id INTEGER NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  document_url TEXT NOT NULL,
  document_number VARCHAR(100),
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by INTEGER,
  verified_at TIMESTAMP,
  expiry_date DATE,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_delivery_partner_id (delivery_partner_id),
  INDEX idx_verification_status (is_verified, expiry_date)
);
```

```sql
CREATE TABLE delivery_partner_vehicles (
  id SERIAL PRIMARY KEY,
  delivery_partner_id INTEGER NOT NULL,
  vehicle_type VARCHAR(50),
  registration_number VARCHAR(50) UNIQUE,
  model VARCHAR(100),
  color VARCHAR(50),
  capacity_kg DECIMAL(8, 2),
  insurance_expiry DATE,
  pollution_certificate_expiry DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
  INDEX idx_delivery_partner_id (delivery_partner_id)
);
```

```sql
CREATE TABLE delivery_assignments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  delivery_partner_id INTEGER NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(50),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  otp_code VARCHAR(10),
  delivery_status ENUM ('ASSIGNED', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'DELIVERED', 'FAILED') DEFAULT 'ASSIGNED',
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  delivery_proof_url TEXT,
  signature_url TEXT,
  notes TEXT,
  failed_reason TEXT,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_delivery_partner_id (delivery_partner_id),
  INDEX idx_delivery_status (delivery_status),
  UNIQUE (order_id, delivery_partner_id, assigned_at)
);
```

```sql
CREATE TABLE delivery_tracking (
  id SERIAL PRIMARY KEY,
  delivery_assignment_id INTEGER NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  speed DECIMAL(8, 2),
  heading INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (delivery_assignment_id) REFERENCES delivery_assignments(id) ON DELETE CASCADE,
  INDEX idx_delivery_assignment_id (delivery_assignment_id),
  INDEX idx_timestamp (timestamp)
);
```

```sql
CREATE TABLE delivery_partner_earnings (
  id SERIAL PRIMARY KEY,
  delivery_partner_id INTEGER NOT NULL,
  order_id INTEGER,
  date DATE DEFAULT CURRENT_DATE,
  base_delivery_charge DECIMAL(10, 2) NOT NULL,
  distance_charge DECIMAL(10, 2) DEFAULT 0,
  surge_charge DECIMAL(10, 2) DEFAULT 0,
  bonus DECIMAL(10, 2) DEFAULT 0,
  penalty DECIMAL(10, 2) DEFAULT 0,
  total_earning DECIMAL(10, 2),
  status ENUM ('PENDING', 'SETTLED', 'CANCELLED') DEFAULT 'PENDING',
  settled_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_delivery_partner_id (delivery_partner_id),
  INDEX idx_date (date),
  INDEX idx_status (status)
);
```

```sql
CREATE TABLE delivery_partner_payouts (
  id SERIAL PRIMARY KEY,
  delivery_partner_id INTEGER NOT NULL,
  payout_period_start DATE NOT NULL,
  payout_period_end DATE NOT NULL,
  total_earnings DECIMAL(10, 2) NOT NULL,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL,
  status ENUM ('REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'REQUESTED',
  payment_method VARCHAR(50),
  bank_account_id VARCHAR(255),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER,
  transaction_id VARCHAR(100),
  failure_reason TEXT,
  
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_delivery_partner_id (delivery_partner_id),
  INDEX idx_status (status)
);
```

---

### 6. Team Leader Module

```sql
CREATE TABLE team_leaders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255),
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  status ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE') DEFAULT 'ACTIVE',
  assigned_zone_id INTEGER,
  managed_delivery_partners_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status)
);
```

```sql
CREATE TABLE team_leader_assignments (
  id SERIAL PRIMARY KEY,
  team_leader_id INTEGER NOT NULL,
  delivery_partner_id INTEGER NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INTEGER,
  removed_at TIMESTAMP,
  
  FOREIGN KEY (team_leader_id) REFERENCES team_leaders(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_team_leader_id (team_leader_id),
  UNIQUE (team_leader_id, delivery_partner_id)
);
```

---

### 7. Payment & Settlement Module

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM ('CARD', 'UPI', 'WALLET', 'BANK_TRANSFER', 'CASH') DEFAULT 'CARD',
  status ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
  transaction_id VARCHAR(100),
  gateway_name VARCHAR(100),
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_transaction_id (transaction_id)
);
```

```sql
CREATE TABLE restaurant_settlements (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  total_orders INTEGER,
  gross_sales DECIMAL(10, 2) NOT NULL,
  cancellations DECIMAL(10, 2) DEFAULT 0,
  refunds DECIMAL(10, 2) DEFAULT 0,
  commission_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  adjustments DECIMAL(10, 2) DEFAULT 0,
  net_settlement_amount DECIMAL(10, 2) NOT NULL,
  status ENUM ('PENDING', 'PROCESSED', 'PAID', 'DISPUTE') DEFAULT 'PENDING',
  settlement_date TIMESTAMP,
  payment_method VARCHAR(50),
  bank_account_id VARCHAR(255),
  transaction_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_status (status),
  INDEX idx_period (period_start_date, period_end_date)
);
```

```sql
CREATE TABLE platform_transactions (
  id SERIAL PRIMARY KEY,
  transaction_type ENUM ('COMMISSION', 'DELIVERY_CHARGE', 'REFUND', 'ADJUSTMENT', 'BONUS', 'PENALTY') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  source_entity_type VARCHAR(50),
  source_entity_id INTEGER,
  destination_entity_type VARCHAR(50),
  destination_entity_id INTEGER,
  order_id INTEGER,
  status ENUM ('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_type_date (transaction_type, created_at),
  INDEX idx_order_id (order_id)
);
```

---

### 8. Promotions & Coupons

```sql
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM ('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  minimum_order_value DECIMAL(10, 2) DEFAULT 0,
  maximum_discount_amount DECIMAL(10, 2),
  maximum_uses_per_customer INTEGER,
  total_maximum_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  applicable_restaurants INTEGER[],
  excluded_categories INTEGER[],
  excluded_items INTEGER[],
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_active (is_active),
  INDEX idx_valid_period (valid_from, valid_to)
);
```

```sql
CREATE TABLE coupon_usage (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  discount_amount DECIMAL(10, 2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_used_at (used_at)
);
```

---

### 9. Support & Notifications

```sql
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER,
  restaurant_id INTEGER,
  delivery_partner_id INTEGER,
  order_id INTEGER,
  category VARCHAR(100),
  priority ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  status ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
  subject VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  assigned_to INTEGER,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL,
  FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

```sql
CREATE TABLE support_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER,
  message_text TEXT NOT NULL,
  attachment_url TEXT,
  message_type ENUM ('USER', 'ADMIN', 'SYSTEM') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ticket_id (ticket_id)
);
```

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(100),
  title VARCHAR(255),
  body TEXT,
  related_entity_type VARCHAR(50),
  related_entity_id INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);
```

---

### 10. Service Areas & Configuration

```sql
CREATE TABLE service_areas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  polygon_coordinates JSONB NOT NULL,
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  radius_km DECIMAL(8, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_is_active (is_active)
);
```

```sql
CREATE TABLE restaurant_service_areas (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  service_area_id INTEGER NOT NULL,
  
  PRIMARY KEY (restaurant_id, service_area_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (service_area_id) REFERENCES service_areas(id) ON DELETE CASCADE
);
```

```sql
CREATE TABLE delivery_fees (
  id SERIAL PRIMARY KEY,
  service_area_id INTEGER NOT NULL,
  distance_start_km DECIMAL(8, 2),
  distance_end_km DECIMAL(8, 2),
  base_fee DECIMAL(10, 2),
  per_km_rate DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (service_area_id) REFERENCES service_areas(id) ON DELETE CASCADE,
  INDEX idx_service_area_id (service_area_id)
);
```

```sql
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_key (setting_key)
);
```

---

## Indexes Summary

Critical indexes for performance:
- User queries: `users(email, phone, status)`
- Order queries: `orders(customer_id, status, created_at, delivery_partner_id)`
- Delivery tracking: `delivery_tracking(delivery_assignment_id, timestamp)`
- Location queries: `addresses(latitude, longitude)`, `delivery_partners(current_location_latitude, current_location_longitude)`
- Timeline queries: `order_status_history(order_id, timestamp)`
- Audit queries: `audit_logs(user_id, timestamp, action)`

---

## Constraints & Rules

1. **Referential Integrity:** All foreign keys have appropriate cascade policies
2. **Soft Deletes:** Sensitive entities use `deleted_at` instead of hard delete
3. **State Validation:** Status columns have CHECK constraints
4. **Uniqueness:** Single defaults per entity (e.g., default address, primary location)
5. **Financial Precision:** All monetary fields use DECIMAL(10, 2)
6. **Timestamps:** All records track creation and modification times
7. **Audit Trail:** Critical actions logged in audit_logs table

---

## Migration Strategy

Migrations run in order:
1. Core auth tables (users, roles, permissions)
2. Customer-related tables
3. Restaurant-related tables
4. Order and payment tables
5. Delivery partner tables
6. Team leader tables
7. Support and notification tables
8. Configuration tables

Each migration is reversible and uses transactions.
