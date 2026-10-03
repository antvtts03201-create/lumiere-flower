// ===== GIỎ HÀNG: số lượng, xóa, tính tiền, mã giảm giá =====

// Danh sách mã giảm giá: tên mã và phần trăm giảm (0.1 = 10%)
const COUPONS = {
  LUMIERE10: 0.1,
  WELCOME5: 0.05
};

// Tính tiền cho cả giỏ hàng (checkout.js cũng dùng hàm này)
function totals() {
  const cart = getCart();
  const items = [];

  // 1. Ghép thông tin sản phẩm (tên, giá, ảnh) với số lượng trong giỏ
  for (let i = 0; i < cart.length; i++) {
    const product = getProduct(cart[i].id);

    // Sản phẩm đã bị ẩn hoặc xóa thì bỏ qua
    if (product) {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: cart[i].qty
      });
    }
  }

  // 2. Tạm tính = tổng (giá x số lượng)
  let sub = 0;
  for (let i = 0; i < items.length; i++) {
    sub = sub + items[i].price * items[i].qty;
  }

  // 3. Giảm giá theo mã đã áp dụng
  const code = load("coupon", "");
  let percent = 0;
  if (COUPONS[code]) {
    percent = COUPONS[code];
  }
  const discount = Math.round(sub * percent);

  // 4. Phí vận chuyển: miễn phí nếu giỏ trống hoặc từ 800.000đ trở lên
  let ship = 30000;
  if (sub === 0 || sub >= 800000) {
    ship = 0;
  }

  // 5. Tổng tiền cuối cùng
  const total = sub - discount + ship;

  return { items: items, sub: sub, discount: discount, ship: ship, total: total, code: code };
}

// Tăng / giảm số lượng (d = +1 hoặc -1)
function changeQty(id, d) {
  const cart = getCart();

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty = cart[i].qty + d;
    }
  }

  // Số lượng nhỏ hơn 1 thì xóa sản phẩm khỏi giỏ
  const newCart = [];
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].qty >= 1) {
      newCart.push(cart[i]);
    }
  }

  save("cart", newCart);
  renderCart();
  updateBadge();
}

// Xóa hẳn một sản phẩm khỏi giỏ
function removeItem(id) {
  const cart = getCart();
  const newCart = [];

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id !== id) {
      newCart.push(cart[i]);
    }
  }

  save("cart", newCart);
  renderCart();
  updateBadge();
  toast("Đã xóa sản phẩm");
}

// Áp dụng mã giảm giá
function applyCoupon() {
  const input = document.getElementById("coupon").value;
  const code = input.trim().toUpperCase(); // bỏ khoảng trắng, viết hoa

  if (COUPONS[code]) {
    save("coupon", code);
    toast("Áp dụng mã " + code);
  } else {
    toast("Mã không hợp lệ");
  }

  renderCart();
}

// Vẽ giỏ hàng và bảng tổng tiền ra trang
function renderCart() {
  const t = totals();
  let html = "";

  // Danh sách sản phẩm
  if (t.items.length === 0) {
    html = "<p>Giỏ hàng đang trống.</p>";
  } else {
    for (let i = 0; i < t.items.length; i++) {
      const item = t.items[i];

      html = html + `
        <div class="crow">
          <img src="${item.image}">
          <b>${item.name}</b>
          <span>${money(item.price)}</span>
          <div class="qty">
            <button onclick="changeQty(${item.id}, -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <span>${money(item.price * item.qty)}</span>
          <button class="del" onclick="removeItem(${item.id})">🗑</button>
        </div>
      `;
    }
  }
  document.getElementById("cartBody").innerHTML = html;

  // Bảng tổng tiền
  document.getElementById("sum").innerHTML = `
    <p>Tạm tính <b>${money(t.sub)}</b></p>
    <p>Giảm giá <b>-${money(t.discount)}</b></p>
    <p>Phí vận chuyển <b>${money(t.ship)}</b></p>
    <h3>Tổng tiền <b>${money(t.total)}</b></h3>
  `;
}

// Khi trang tải xong thì vẽ giỏ hàng
document.addEventListener("DOMContentLoaded", renderCart);
