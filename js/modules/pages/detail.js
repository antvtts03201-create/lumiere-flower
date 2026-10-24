// ===== TRANG CHI TIẾT SẢN PHẨM =====
import { getProduct, getProducts, money } from "../storage.js";
import { addToCart } from "../cart.js";
import { initLayout, cards, icon, toast, updateBadge, esc } from "../ui.js";

initLayout();

function byId(id) {
  return document.getElementById(id);
}

// Lấy id trên thanh địa chỉ, ví dụ product-detail.html?id=3
const id = new URLSearchParams(location.search).get("id");
const p = getProduct(id);

if (p === null) {
  byId("detail").innerHTML = "<p>Không tìm thấy sản phẩm. <a href='products.html'>Quay lại</a></p>";
} else {
  showProduct();
}

function showProduct() {
  let disabled = "";
  let stockText = p.stock;
  if (p.stock <= 0) {
    disabled = "disabled";
    stockText = "Hết hàng";
  }

  // Ảnh nhỏ
  let thumbs = "";
  for (let i = 0; i < p.images.length; i++) {
    thumbs += `<img src="${esc(p.images[i])}" alt="">`;
  }

  let html = '<div class="gallery">';
  html += `<img id="mainImg" src="${esc(p.images[0])}" alt="${esc(p.name)}">`;
  html += `<div class="thumbs">${thumbs}</div></div>`;

  html += '<div class="info">';
  html += `<h1>${esc(p.name)}</h1>`;
  html += `<div class="pr big">${money(p.price)}</div>`;
  html += `<div class="stars">${"★".repeat(Math.round(p.rating))} <small>(12 đánh giá · Đã bán ${p.sold || 0})</small></div>`;
  html += `<p>${esc(p.description)}</p>`;

  html += '<table class="spec">';
  html += `<tr><td>Danh mục</td><td>${esc(p.category)}</td></tr>`;
  html += `<tr><td>Loại hoa</td><td>${esc(p.flowerType)}</td></tr>`;
  html += `<tr><td>Màu sắc</td><td>${esc(p.color)}</td></tr>`;
  html += "<tr><td>Kích thước</td><td>40 × 50 cm</td></tr>";
  html += "<tr><td>Xuất xứ</td><td>Đà Lạt</td></tr>";
  html += `<tr><td>Còn lại</td><td>${stockText}</td></tr>`;
  html += "</table>";

  html += '<div class="qty"><button id="minus">-</button><span id="q">1</span><button id="plus">+</button></div>';
  html += '<div class="acts">';
  html += `<button class="btn" id="add" ${disabled}>Thêm vào giỏ hàng</button>`;
  html += `<button class="btn" id="buy" ${disabled}>Mua ngay</button>`;
  html += `<button class="btn ghost" data-action="wish" data-id="${p.id}">${icon("heart")} Yêu thích</button>`;
  html += "</div></div>";

  byId("detail").innerHTML = html;

  // Bấm ảnh nhỏ thì đổi ảnh lớn
  const thumbImages = document.querySelectorAll(".thumbs img");
  for (let i = 0; i < thumbImages.length; i++) {
    thumbImages[i].onclick = function () {
      byId("mainImg").src = thumbImages[i].src;
    };
  }

  // Tăng / giảm số lượng (từ 1 đến số còn trong kho)
  let qty = 1;
  byId("plus").onclick = function () {
    if (qty < p.stock) {
      qty = qty + 1;
      byId("q").textContent = qty;
    }
  };
  byId("minus").onclick = function () {
    if (qty > 1) {
      qty = qty - 1;
      byId("q").textContent = qty;
    }
  };

  byId("add").onclick = function () {
    const result = addToCart(p.id, qty);
    if (result.ok) {
      updateBadge();
      toast("Đã thêm vào giỏ hàng");
    } else {
      toast(result.msg);
    }
  };

  byId("buy").onclick = function () {
    const result = addToCart(p.id, qty);
    if (result.ok) {
      location.href = "checkout.html";
    } else {
      toast(result.msg);
    }
  };

  byId("desc").textContent = p.description + " Mỗi bó hoa được tuyển chọn kỹ lưỡng, gói bằng giấy kraft và ruy băng.";

  // Sản phẩm liên quan: cùng danh mục trước, thiếu thì lấy thêm sản phẩm khác
  const all = getProducts();
  const sameCategory = [];
  const otherCategory = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].id === p.id) continue; // bỏ qua chính sản phẩm đang xem
    if (all[i].category === p.category) {
      sameCategory.push(all[i]);
    } else {
      otherCategory.push(all[i]);
    }
  }
  const related = sameCategory.concat(otherCategory).slice(0, 4);
  byId("related").innerHTML = cards(related);
}

// 3 ô dịch vụ
document.querySelector(".svc").innerHTML =
  `<div>${icon("flower")} Hoa tươi 100%</div><div>${icon("truck")} Giao hàng nhanh chóng</div><div>${icon("card")} Thanh toán an toàn</div>`;

// Chuyển tab Mô tả / Đánh giá / Chính sách
const tabs = document.querySelectorAll(".tab");
const panes = document.querySelectorAll(".pane");
for (let i = 0; i < tabs.length; i++) {
  tabs[i].onclick = function () {
    for (let j = 0; j < tabs.length; j++) {
      tabs[j].classList.remove("on");
      panes[j].classList.remove("on");
    }
    tabs[i].classList.add("on");
    byId(tabs[i].dataset.t).classList.add("on");
  };
}
