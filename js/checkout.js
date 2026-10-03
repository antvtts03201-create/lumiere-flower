// ===== THANH TOÁN: tạo đơn hàng, lưu localStorage, xóa giỏ =====

document.addEventListener("DOMContentLoaded", function () {

  const t = totals();                     // tiền của giỏ hàng (hàm trong cart.js)
  const f = document.getElementById("f"); // form thanh toán

  // 1. Giỏ trống thì báo rồi dừng
  if (t.items.length === 0) {
    document.getElementById("co").innerHTML =
      "<h2>Thanh toán</h2><p>Giỏ hàng trống. <a href='products.html'>Mua sắm ngay</a></p>";
    return;
  }

  // 2. Nếu đã đăng nhập thì điền sẵn tên và email
  const user = load("currentUser", null);
  if (user) {
    f.name.value = user.name;
    f.email.value = user.email;
  }

  // 3. Vẽ bảng tóm tắt đơn hàng bên phải, trả về tổng tiền
  function draw() {
    // Giao nhanh thì cộng thêm 30.000đ
    let ship = t.ship;
    if (f.ship.value === "fast") {
      ship = ship + 30000;
    }

    const total = t.sub - t.discount + ship;

    // Danh sách sản phẩm
    let html = "";
    for (let i = 0; i < t.items.length; i++) {
      const item = t.items[i];
      html = html + `<p>${item.name} × ${item.qty} <b>${money(item.price * item.qty)}</b></p>`;
    }

    // Giảm giá, phí giao hàng, tổng tiền
    html = html + `
      <p>Giảm giá <b>-${money(t.discount)}</b></p>
      <p>Phí giao hàng <b>${money(ship)}</b></p>
      <h3>Tổng tiền <b>${money(total)}</b></h3>
    `;

    document.getElementById("os").innerHTML = html;
    return total;
  }

  // 4. Đổi kiểu giao hàng thì tính lại tiền
  const shipRadios = f.querySelectorAll("[name=ship]");
  for (let i = 0; i < shipRadios.length; i++) {
    shipRadios[i].onchange = draw;
  }
  draw(); // vẽ lần đầu

  // 5. Bấm "Đặt hàng"
  f.onsubmit = function (e) {
    e.preventDefault(); // không cho trang tải lại

    // Lấy danh sách sản phẩm đã mua (chỉ giữ thông tin cần thiết)
    const orderItems = [];
    for (let i = 0; i < t.items.length; i++) {
      orderItems.push({
        id: t.items[i].id,
        name: t.items[i].name,
        price: t.items[i].price,
        qty: t.items[i].qty
      });
    }

    // Tạo đơn hàng
    const order = {
      id: "DH" + Date.now().toString().slice(-6), // mã đơn: DH + 6 số cuối của thời gian
      customer: f.name.value,
      phone: f.phone.value,
      email: f.email.value,
      address: f.address.value,
      note: f.note.value,
      items: orderItems,
      total: draw(),
      payment: f.pay.value,
      status: "Chờ xử lý",
      date: new Date().toLocaleDateString("vi-VN")
    };

    // Lưu đơn mới lên đầu danh sách đơn hàng
    const orders = load("orders", []);
    orders.unshift(order);
    save("orders", orders);

    // Xóa giỏ hàng và mã giảm giá
    save("cart", []);
    localStorage.removeItem("coupon");
    updateBadge();

    // Hiện thông báo đặt hàng thành công
    document.getElementById("modalCode").textContent = order.id;
    document.getElementById("modal").classList.add("show");
  };
});