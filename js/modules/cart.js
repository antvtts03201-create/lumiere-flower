// ===== MODULE 3: cart.js =====
// Giỏ hàng, mã giảm giá, danh sách yêu thích và tính tiền.

import { load, save, getProduct } from "./storage.js";

const CART_KEY = "lf_cart";
const WISH_KEY = "lf_wishlist";
const COUPON_KEY = "lf_coupon";

export const COUPONS = { LUMIERE10: 0.1, WELCOME5: 0.05 };
export const FREE_SHIP = 800000; // từ mức này trở lên được miễn phí vận chuyển
export const SHIP_FEE = 30000;
export const FAST_FEE = 30000;   // phụ phí giao nhanh

// Giỏ hàng là mảng: [{ id: 1, qty: 2 }, { id: 5, qty: 1 }]
export function getCart() {
  return load(CART_KEY, []);
}

// Tổng số sản phẩm trong giỏ (hiện ở số nhỏ trên icon giỏ hàng)
export function cartCount() {
  const cart = getCart();
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    total = total + cart[i].qty;
  }
  return total;
}

export function clearCart() {
  save(CART_KEY, []);
}

// Thêm vào giỏ. Trả về { ok: true } hoặc { ok: false, msg: "lý do" }
export function addToCart(id, qty) {
  if (qty === undefined) qty = 1;

  const product = getProduct(id);
  if (product === null) {
    return { ok: false, msg: "Sản phẩm không tồn tại" };
  }

  const cart = getCart();
  let item = null;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) item = cart[i];
  }

  let currentQty = 0;
  if (item !== null) currentQty = item.qty;

  if (currentQty + qty > product.stock) {
    return { ok: false, msg: "Vượt quá số lượng còn trong kho" };
  }

  if (item !== null) {
    item.qty = item.qty + qty;
  } else {
    cart.push({ id: id, qty: qty });
  }
  save(CART_KEY, cart);
  return { ok: true };
}

// Tăng / giảm số lượng (change = +1 hoặc -1). Số lượng về 0 thì xóa khỏi giỏ.
export function changeQty(id, change) {
  const cart = getCart();
  let item = null;
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) item = cart[i];
  }
  if (item === null) {
    return { ok: false };
  }

  if (change > 0) {
    const product = getProduct(id);
    if (product === null || item.qty + change > product.stock) {
      return { ok: false, msg: "Vượt quá số lượng còn trong kho" };
    }
  }

  item.qty = item.qty + change;

  const newCart = [];
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].qty >= 1) newCart.push(cart[i]);
  }
  save(CART_KEY, newCart);
  return { ok: true };
}

export function removeItem(id) {
  const cart = getCart();
  const newCart = [];
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id !== id) newCart.push(cart[i]);
  }
  save(CART_KEY, newCart);
}

// ----- Mã giảm giá -----

export function getCoupon() {
  return load(COUPON_KEY, "");
}

export function clearCoupon() {
  localStorage.removeItem(COUPON_KEY);
}

// Trả về true nếu mã hợp lệ
export function applyCoupon(codeInput) {
  const code = codeInput.trim().toUpperCase();
  if (COUPONS[code] === undefined) {
    return false;
  }
  save(COUPON_KEY, code);
  return true;
}

// ----- Yêu thích -----

export function getWish() {
  return load(WISH_KEY, []);
}

// Thêm hoặc bỏ yêu thích. Trả về true nếu sản phẩm đang được yêu thích sau khi bấm.
export function toggleWish(id) {
  const wish = getWish();
  const index = wish.indexOf(id);
  let isOn = false;

  if (index === -1) {
    wish.push(id);
    isOn = true;
  } else {
    wish.splice(index, 1);
  }
  save(WISH_KEY, wish);
  return isOn;
}

// ----- Tính tiền -----
// fast = true: giao nhanh (cộng thêm phụ phí)
export function totals(fast) {
  const cart = getCart();
  const items = [];

  // 1. Ghép thông tin sản phẩm với số lượng trong giỏ
  for (let i = 0; i < cart.length; i++) {
    const p = getProduct(cart[i].id);
    if (p !== null) {
      items.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: cart[i].qty });
    }
  }

  // 2. Tạm tính
  let sub = 0;
  for (let i = 0; i < items.length; i++) {
    sub = sub + items[i].price * items[i].qty;
  }

  // 3. Giảm giá
  let percent = 0;
  const code = getCoupon();
  if (COUPONS[code] !== undefined) {
    percent = COUPONS[code];
  }
  const discount = Math.round(sub * percent);

  // 4. Phí vận chuyển
  let ship = SHIP_FEE;
  if (sub === 0 || sub >= FREE_SHIP) {
    ship = 0;
  }
  if (fast && sub > 0) {
    ship = ship + FAST_FEE;
  }

  return { items: items, sub: sub, discount: discount, ship: ship, total: sub - discount + ship };
}
