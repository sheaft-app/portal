export const clearLocalStorage = () => {
  localStorage.removeItem("user_cart");
  localStorage.removeItem("user_choosen_role");
  localStorage.removeItem("user_current_order");
  localStorage.removeItem("user_cookies_consent");
  localStorage.removeItem("user_last_transaction");
  localStorage.removeItem("user_location");
  localStorage.removeItem("user_first_time_on_cart");
  localStorage.removeItem("user_sponsoring");
}