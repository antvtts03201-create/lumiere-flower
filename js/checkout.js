// ===== THANH TOÁN: tạo đơn hàng, lưu localStorage, xóa giỏ =====
document.addEventListener("DOMContentLoaded", () => {
  const t = totals(), f = document.getElementById("f");
  if (!t.items.length) { document.getElementById("co").innerHTML = "<h2>Thanh toán</h2><p>Giỏ hàng trống. <a href='products.html'>Mua sắm ngay</a></p>"; return; }
  const user = load("currentUser", null);
  if (user) { f.name.value = user.name; f.email.value = user.email; }
  const draw = () => {
    const ship = t.ship + (f.ship.value === "fast" ? 30000 : 0), total = t.sub - t.discount + ship;
    document.getElementById("os").innerHTML = t.items.map(i => `<p>${i.name} × ${i.qty} <b>${money(i.price * i.qty)}</b></p>`).join("") +
      `<p>Giảm giá <b>-${money(t.discount)}</b></p><p>Phí giao hàng <b>${money(ship)}</b></p><h3>Tổng tiền <b>${money(total)}</b></h3>`;
    return total;
  };
  f.querySelectorAll("[name=ship]").forEach(r => r.onchange = draw); draw();
  f.onsubmit = e => {
    e.preventDefault();
    const order = { id: "DH" + Date.now().toString().slice(-6), customer: f.name.value, phone: f.phone.value, email: f.email.value,
      address: f.address.value, note: f.note.value, items: t.items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: draw(), payment: f.pay.value, status: "Chờ xử lý", date: new Date().toLocaleDateString("vi-VN") };
    save("orders", [order, ...load("orders", [])]);
    save("cart", []); localStorage.removeItem("coupon"); updateBadge();
    document.getElementById("modalCode").textContent = order.id;
    document.getElementById("modal").classList.add("show");
  };
});
