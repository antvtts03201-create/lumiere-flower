// ===== GIỎ HÀNG: số lượng, xóa, tính tiền, mã giảm giá =====
const COUPONS = { LUMIERE10: 0.1, WELCOME5: 0.05 };
function totals() {
  const items = getCart().map(i => ({ ...getProduct(i.id), qty: i.qty })).filter(i => i.id);
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const code = load("coupon", ""), discount = Math.round(sub * (COUPONS[code] || 0));
  const ship = sub === 0 || sub >= 800000 ? 0 : 30000; // miễn phí từ 800.000đ
  return { items, sub, discount, ship, total: sub - discount + ship, code };
}
function changeQty(id, d) {
  const cart = getCart(), it = cart.find(i => i.id === id);
  it.qty += d; save("cart", it.qty < 1 ? cart.filter(i => i.id !== id) : cart); renderCart(); updateBadge();
}
function removeItem(id) { save("cart", getCart().filter(i => i.id !== id)); renderCart(); updateBadge(); toast("Đã xóa sản phẩm"); }
function applyCoupon() {
  const c = document.getElementById("coupon").value.trim().toUpperCase();
  if (COUPONS[c]) { save("coupon", c); toast("Áp dụng mã " + c); } else toast("Mã không hợp lệ");
  renderCart();
}
function renderCart() {
  const t = totals();
  document.getElementById("cartBody").innerHTML = t.items.length ? t.items.map(i => `<div class="crow"><img src="${i.image}"><b>${i.name}</b><span>${money(i.price)}</span>
    <div class="qty"><button onclick="changeQty(${i.id},-1)">-</button><span>${i.qty}</span><button onclick="changeQty(${i.id},1)">+</button></div>
    <span>${money(i.price * i.qty)}</span><button class="del" onclick="removeItem(${i.id})">🗑</button></div>`).join("") : "<p>Giỏ hàng đang trống.</p>";
  document.getElementById("sum").innerHTML = `<p>Tạm tính <b>${money(t.sub)}</b></p><p>Giảm giá <b>-${money(t.discount)}</b></p><p>Phí vận chuyển <b>${money(t.ship)}</b></p><h3>Tổng tiền <b>${money(t.total)}</b></h3>`;
}
document.addEventListener("DOMContentLoaded", renderCart);
