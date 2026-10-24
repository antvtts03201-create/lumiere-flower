// ===== TRANG THANH TOÁN =====
import { money } from "../storage.js";
import { totals } from "../cart.js";
import { currentUser, requireLogin } from "../auth.js";
import { createOrder } from "../orders.js";
import { initLayout, toast, updateBadge, esc } from "../ui.js";

initLayout();

function byId(id) {
  return document.getElementById(id);
}

// Phải đăng nhập mới được đặt hàng
if (requireLogin()) {
  startCheckout();
}

function startCheckout() {
  // Giỏ trống thì báo rồi dừng
  if (totals(false).items.length === 0) {
    byId("co").innerHTML = "<h2>Thanh toán</h2><p>Giỏ hàng trống. <a href='products.html' style='color:var(--rose)'>Mua sắm ngay</a></p>";
    return;
  }

  const form = byId("f");
  const f = form.elements; // f.name, f.phone... là các ô nhập trong form
  const user = currentUser();

  // Điền sẵn tên và email của người đang đăng nhập
  f.name.value = user.name;
  f.email.value = user.email;

  // Vẽ bảng tóm tắt đơn hàng bên phải
  function drawSummary() {
    const fast = f.ship.value === "fast";
    const t = totals(fast);

    let html = "";
    for (let i = 0; i < t.items.length; i++) {
      const item = t.items[i];
      html += `<p>${esc(item.name)} × ${item.qty} <b>${money(item.price * item.qty)}</b></p>`;
    }
    html += `<p>Giảm giá <b>-${money(t.discount)}</b></p>`;
    html += `<p>Phí giao hàng <b>${money(t.ship)}</b></p>`;
    html += `<h3>Tổng tiền <b>${money(t.total)}</b></h3>`;
    byId("os").innerHTML = html;
  }

  // Đổi kiểu giao hàng thì tính lại tiền
  form.addEventListener("change", drawSummary);
  drawSummary();

  // Bấm "Đặt hàng"
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const order = createOrder({
      customer: f.name.value.trim(),
      phone: f.phone.value.trim(),
      email: f.email.value.trim(),
      address: f.address.value.trim(),
      note: f.note.value.trim(),
      ship: f.ship.value,
      payment: f.pay.value
    });

    if (order === null) {
      toast("Giỏ hàng trống");
      return;
    }

    updateBadge();
    byId("modalCode").textContent = order.id;
    byId("modal").classList.add("show");
  });
}
