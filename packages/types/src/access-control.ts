export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  RESTAURANT_STAFF: 'RESTAURANT_STAFF',
  TEAM_LEADER: 'TEAM_LEADER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  VIEW_ASSIGNED_PARTNERS: 'view_assigned_partners',
  VIEW_ACTIVE_DELIVERIES: 'view_active_deliveries',
  VIEW_DELIVERY_STATUS: 'view_delivery_status',
  CONTACT_DELIVERY_PARTNER: 'contact_delivery_partner',
  CREATE_SUPPORT_TICKET: 'create_support_ticket',
  MANAGE_ASSIGNED_DELIVERY_ISSUES: 'manage_assigned_delivery_issues',
  REQUEST_DELIVERY_REASSIGNMENT: 'request_delivery_reassignment',
  APPROVE_DELIVERY_REASSIGNMENT: 'approve_delivery_reassignment',
  VIEW_PARTNER_PERFORMANCE: 'view_partner_performance',
  VIEW_PARTNER_EARNINGS: 'view_partner_earnings',
  ESCALATE_TO_ADMIN: 'escalate_to_admin',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
