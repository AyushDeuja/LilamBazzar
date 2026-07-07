/** Landing page per role — where a user goes right after signing in. */
export const ROLE_HOME = {
  admin: '/admin/orders',
  vendor: '/vendor/products',
  customer: '/',
};

export function roleHome(user_role) {
  return ROLE_HOME[user_role] || '/';
}
