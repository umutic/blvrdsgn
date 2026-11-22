/** Tüm localStorage anahtarları tek noktada (CLAUDE.md §6.3). */
export const STORAGE_KEYS = {
  PRODUCTS: 'poster_db_products_v1',
  ORDERS: 'poster_db_orders_v1',
  COUPONS: 'poster_db_coupons_v1',
  CART: 'poster_store_cart_v1',
  WISHLIST: 'poster_store_wishlist_v1',
  ADMIN_SESSION: 'poster_admin_session_v1',
  ADMIN_USERS: 'poster_db_admin_users_v1',
  ROLE_MATRIX: 'poster_db_role_matrix_v1',
  AUDIT_LOG: 'poster_db_audit_log_v1',
};

/**
 * Seed verisi değiştiğinde bu değeri arttırın: tarayıcıdaki eski seed'li koleksiyonlar
 * (ürün/sipariş/kupon) bir kez yeni seed ile değiştirilir. Anahtar adları değişmez.
 */
export const SEED_VERSION = '3';
