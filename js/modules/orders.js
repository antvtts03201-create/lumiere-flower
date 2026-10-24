// ===== MODULE 4: orders.js =====
// Tạo đơn hàng, xem lịch sử đơn, đổi trạng thái đơn.

import { load, save, changeStock } from "./storage.js";
import { totals, clearCart, clearCoupon } from "./cart.js";
import { currentUser } from "./auth.js";

export const STATUSES = ["Chờ xử lý", "Đang giao", "Hoàn thành", "Đã hủy"];
const ORDER_KEY = "lf_orders";

export function getOrders() {
  return load(ORDER_KEY, []);
}

// Đơn hàng của người đang đăng nhập
export function getMyOrders() {
  const user = currentUser();
  const result = [];
  if (user === null) {
    return result;
  }
  const all = getOrders();
  for (let i = 0; i < all.length; i++) {
    if (all[i].userEmail === user.email) {
      result.push(all[i]);
    }
  }
  return result;
}

// info: { customer, phone, email, address, note, ship ("std" hoặc "fast"), payment }
export function createOrder(info) {
  const t = totals(info.ship === "fast");
  if (t.items.length === 0) {
    return null;
  }

  const user = currentUser();
  let userEmail = "";
  if (user !== null) userEmail = user.email;

  const order = {
    id: "DH" + Date.now().toString().slice(-6),
    userEmail: userEmail,
    customer: info.customer,
    phone: info.phone,
    email: info.email,
    address: info.address,
    note: info.note,
    items: t.items,
    sub: t.sub,
    discount: t.discount,
    ship: t.ship,
    total: t.total,
    payment: info.payment,
    status: "Chờ xử lý",
    date: new Date().toLocaleString("vi-VN")
  };

  // Lưu đơn mới lên đầu danh sách
  const orders = getOrders();
  orders.unshift(order);
  save(ORDER_KEY, orders);

  // Trừ tồn kho, tăng lượt bán, rồi dọn giỏ hàng
  for (let i = 0; i < t.items.length; i++) {
    changeStock(t.items[i].id, -t.items[i].qty, t.items[i].qty);
  }
  clearCart();
  clearCoupon();
  return order;
}

// Đổi trạng thái. Hủy đơn thì hoàn kho, khôi phục đơn đã hủy thì trừ kho lại.
export function updateStatus(id, newStatus) {
  const orders = getOrders();
  let order = null;
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].id === id) order = orders[i];
  }
  if (order === null || order.status === newStatus) {
    return;
  }

  if (newStatus === "Đã hủy") {
    for (let i = 0; i < order.items.length; i++) {
      changeStock(order.items[i].id, order.items[i].qty, -order.items[i].qty);
    }
  }
  if (order.status === "Đã hủy") {
    for (let i = 0; i < order.items.length; i++) {
      changeStock(order.items[i].id, -order.items[i].qty, order.items[i].qty);
    }
  }

  order.status = newStatus;
  save(ORDER_KEY, orders);
}

// Khách chỉ được hủy đơn của chính mình khi đơn còn "Chờ xử lý"
export function cancelMyOrder(id) {
  const mine = getMyOrders();
  for (let i = 0; i < mine.length; i++) {
    if (mine[i].id === id && mine[i].status === "Chờ xử lý") {
      updateStatus(id, "Đã hủy");
      return true;
    }
  }
  return false;
}

export function deleteOrder(id) {
  const orders = getOrders();
  const newOrders = [];
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].id !== id) newOrders.push(orders[i]);
  }
  save(ORDER_KEY, newOrders);
}
