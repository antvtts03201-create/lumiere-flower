// ===== TRANG CHI TIẾT SẢN PHẨM (bản cho người mới) =====

document.addEventListener("DOMContentLoaded", function () {

  // 1. Lấy sản phẩm theo id trên thanh địa chỉ (vd: product-detail.html?id=3)
  const id = new URLSearchParams(location.search).get("id");
  const p = getProduct(id);

  // 2. Nếu không có sản phẩm thì báo lỗi rồi dừng
  if (!p) {
    document.getElementById("detail").innerHTML =
      "<p>Không tìm thấy sản phẩm. <a href='products.html'>Quay lại</a></p>";
    return;
  }

  // 3. Hiển thị thông tin sản phẩm ra trang
  //    (chú ý: đoạn HTML nằm giữa 2 dấu ` mở và đóng)
  document.getElementById("detail").innerHTML = `
    <div class="gallery">
      <img id="mainImg" src="${p.images[0]}" alt="${p.name}">
      <div class="thumbs">
        <img src="${p.images[0]}">
        <img src="${p.images[1]}">
        <img src="${p.images[2]}">
      </div>
    </div>

    <div class="info">
      <h1>${p.name}</h1>
      <div class="pr big">${money(p.price)}</div>
      <div class="stars">${"★".repeat(Math.round(p.rating))} <small>(12 đánh giá)</small></div>
      <p>${p.description}</p>

      <table class="spec">
        <tr><td>Loại hoa</td><td>${p.flowerType}</td></tr>
        <tr><td>Màu sắc</td><td>${p.color}</td></tr>
        <tr><td>Kích thước</td><td>40 × 50 cm</td></tr>
        <tr><td>Xuất xứ</td><td>Đà Lạt</td></tr>
        <tr><td>Còn lại</td><td>${p.stock}</td></tr>
      </table>

      <div class="qty">
        <button id="minus">-</button>
        <span id="q">1</span>
        <button id="plus">+</button>
      </div>

      <div class="acts">
        <button class="btn" id="add">Thêm vào giỏ hàng</button>
        <button class="btn ghost" id="wish">♡ Yêu thích</button>
      </div>
    </div>
  `;

  // 4. Bấm ảnh nhỏ thì đổi ảnh lớn
  const thumbs = document.querySelectorAll(".thumbs img");
  for (let i = 0; i < thumbs.length; i++) {
    thumbs[i].onclick = function () {
      document.getElementById("mainImg").src = thumbs[i].src;
    };
  }

  // 5. Nút tăng / giảm số lượng
  let qty = 1;

  document.getElementById("plus").onclick = function () {
    if (qty < p.stock) {
      qty = qty + 1;
      document.getElementById("q").textContent = qty;
    }
  };

  document.getElementById("minus").onclick = function () {
    if (qty > 1) {
      qty = qty - 1;
      document.getElementById("q").textContent = qty;
    }
  };

  // 6. Nút thêm vào giỏ và yêu thích
  document.getElementById("add").onclick = function () {
    addToCart(p.id, qty);
  };

  document.getElementById("wish").onclick = function () {
    toggleWish(p.id);
  };

  // 7. Chuyển tab Mô tả / Đánh giá / Chính sách
  const tabs = document.querySelectorAll(".tab");
  const panes = document.querySelectorAll(".pane");

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].onclick = function () {
      // Tắt hết, rồi bật cái vừa bấm
      for (let j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove("on");
        panes[j].classList.remove("on");
      }
      tabs[i].classList.add("on");
      document.getElementById(tabs[i].dataset.t).classList.add("on");
    };
  }

  // 8. Mô tả chi tiết
  document.getElementById("desc").textContent =
    p.description + " Mỗi bó hoa được tuyển chọn kỹ lưỡng, gói bằng giấy kraft và ruy băng.";

  // 9. Sản phẩm liên quan: ưu tiên cùng danh mục, thiếu thì lấy thêm sản phẩm khác
  const all = getProducts();
  const sameCategory = [];
  const otherCategory = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].id === p.id) {
      continue; // bỏ qua chính sản phẩm đang xem
    }
    if (all[i].category === p.category) {
      sameCategory.push(all[i]);
    } else {
      otherCategory.push(all[i]);
    }
  }

  // Ghép 2 danh sách rồi lấy 4 sản phẩm đầu
  const related = sameCategory.concat(otherCategory).slice(0, 4);

  document.getElementById("related").innerHTML = related.map(card).join("");
});