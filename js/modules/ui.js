// ===== MODULE 5: ui.js =====
// Phần giao diện dùng chung: icon, thông báo, thẻ sản phẩm, header, footer.

import { money } from "./storage.js";
import { cartCount, addToCart, toggleWish, getWish } from "./cart.js";
import { currentUser, logout } from "./auth.js";

// Bộ icon vẽ nét (mỗi icon là phần bên trong của thẻ <svg>)
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  cart: '<path d="M3 4h2l2.5 11h10l2-8H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  truck: '<path d="M2 6h11v10H2z"/><path d="M13 9h5l3 3v4h-8"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  flower: '<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C9 7 9 3 12 2c3 1 3 5 0 7.5zM14.5 12C17 9 21 9 22 12c-1 3-5 3-7.5 0zM12 14.5C15 17 15 21 12 22c-3-1-3-5 0-7.5zM9.5 12C7 15 3 15 2 12c1-3 5-3 7.5 0z"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M12 8C9 8 7 4 9.5 4 11.5 4 12 6 12 8zM12 8c3 0 5-4 2.5-4C12.5 4 12 6 12 8z"/>',
  cake: '<path d="M4 20h16v-7H4zM4 16c3 2 5-2 8 0s5-2 8 0M12 13V9M12 9c-1.5-1-1.5-2.5 0-4 1.5 1.5 1.5 3 0 4z"/>',
  ring: '<circle cx="12" cy="15" r="6"/><path d="M9 6l3-3 3 3-3 3z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19l8-8"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  logout: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>'
};

// Tạo icon: icon("heart") -> thẻ <svg> hoàn chỉnh
export function icon(name) {
  return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + "</svg>";
}

// Đổi ký tự đặc biệt thành mã HTML an toàn (tránh bị chèn thẻ HTML lạ)
export function esc(text) {
  if (text === undefined || text === null) {
    return "";
  }
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Tên class màu cho từng trạng thái đơn hàng
export function stClass(status) {
  if (status === "Chờ xử lý") return "wait";
  if (status === "Đang giao") return "ship";
  if (status === "Hoàn thành") return "done";
  if (status === "Đã hủy") return "cancel";
  return "";
}

// Thông báo nhỏ ở góc màn hình, tự tắt sau 2,2 giây
export function toast(message) {
  const box = document.createElement("div");
  box.className = "toast";
  box.textContent = message;
  document.body.appendChild(box);
  setTimeout(function () {
    box.remove();
  }, 2200);
}

// Cập nhật số nhỏ trên icon giỏ hàng
export function updateBadge() {
  const badge = document.getElementById("badge");
  if (badge !== null) {
    badge.textContent = cartCount();
  }
}

// Tạo HTML cho 1 thẻ sản phẩm.
// Các nút dùng data-action, việc xử lý click nằm ở hàm handleClick bên dưới.
export function card(p) {
  let disabled = "";
  let soldText = "Đã bán " + (p.sold || 0);
  if (p.stock <= 0) {
    disabled = "disabled";
    soldText = "Hết hàng";
  }

  let newTag = "";
  if (p.isNew) {
    newTag = '<span class="nw">Mới</span>';
  }

  let heartClass = "heart";
  if (getWish().includes(p.id)) {
    heartClass = "heart on";
  }

  const stars = "★".repeat(Math.round(p.rating));
  const link = "product-detail.html?id=" + p.id;

  let html = '<div class="card">';
  html += `<a class="im" href="${link}"><img src="${esc(p.image)}" alt="${esc(p.name)}">${newTag}</a>`;
  html += `<button class="${heartClass}" data-action="wish" data-id="${p.id}" aria-label="Yêu thích">${icon("heart")}</button>`;
  html += `<h3><a href="${link}">${esc(p.name)}</a></h3>`;
  html += `<div class="meta"><span class="stars">${stars}</span><span class="sold">${soldText}</span></div>`;
  html += `<div class="pr">${money(p.price)}</div>`;
  html += '<div class="acts">';
  html += `<button class="btn ghost sm" data-action="add" data-id="${p.id}" ${disabled}>Thêm vào giỏ</button>`;
  html += `<button class="btn sm" data-action="buy" data-id="${p.id}" ${disabled}>Mua ngay</button>`;
  html += "</div></div>";
  return html;
}

// Tạo HTML cho cả danh sách sản phẩm
export function cards(list) {
  let html = "";
  for (let i = 0; i < list.length; i++) {
    html += card(list[i]);
  }
  return html;
}

// Xử lý click cho mọi nút có thuộc tính data-action
function handleClick(e) {
  const button = e.target.closest("[data-action]");
  if (button === null) {
    return; // không phải nút cần xử lý
  }

  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  if (action === "add" || action === "buy") {
    const result = addToCart(id, 1);
    if (!result.ok) {
      toast(result.msg);
    } else if (action === "buy") {
      location.href = "checkout.html";
    } else {
      updateBadge();
      toast("Đã thêm vào giỏ hàng");
    }
  } else if (action === "wish") {
    const isOn = toggleWish(id);
    button.classList.toggle("on", isOn);
    if (isOn) {
      toast("Đã thêm vào yêu thích");
    } else {
      toast("Đã bỏ yêu thích");
    }
  } else if (action === "logout") {
    logout();
    location.href = "index.html";
  }
}

// Vẽ header + footer. Mọi trang gọi hàm này đầu tiên.
export function initLayout() {
  const user = currentUser();
  const page = location.pathname.split("/").pop() || "index.html";

  // ----- Menu -----
  const links = [
    ["index.html", "Trang chủ"],
    ["products.html", "Danh mục"],
    ["index.html#about", "Giới thiệu"],
    ["index.html#contact", "Liên hệ"]
  ];
  if (user !== null && user.role === "admin") {
    links.push(["admin.html", "Quản trị"]);
  }

  let navHtml = "";
  for (let i = 0; i < links.length; i++) {
    let activeClass = "";
    if (links[i][0] === page) activeClass = "active";
    navHtml += `<a href="${links[i][0]}" class="${activeClass}">${links[i][1]}</a>`;
  }

  // ----- Icon tài khoản -----
  let accountHtml = "";
  if (user !== null) {
    accountHtml += `<a href="orders.html" title="Đơn hàng của ${esc(user.name)}">${icon("user")}</a>`;
    accountHtml += `<button data-action="logout" title="Đăng xuất" aria-label="Đăng xuất">${icon("logout")}</button>`;
  } else {
    accountHtml += `<a href="login.html" title="Đăng nhập">${icon("user")}</a>`;
  }

  const logo = '<a href="index.html" class="logo"><img src="assets/images/logo.png" alt="Lumière Flower"></a>';

  // ----- Header -----
  let header = '<header class="hdr"><div class="wrap bar">';
  header += logo;
  header += `<nav class="menu">${navHtml}</nav>`;
  header += '<div class="icons">';
  header += `<a href="products.html?focus=1" title="Tìm kiếm">${icon("search")}</a>`;
  header += accountHtml;
  header += `<a href="products.html?wish=1" title="Yêu thích">${icon("heart")}</a>`;
  header += `<a href="cart.html" class="cartlink" title="Giỏ hàng">${icon("cart")}<span id="badge">0</span></a>`;
  header += "</div></div></header>";
  document.getElementById("hdr").innerHTML = header;

  // ----- Footer -----
  let footer = '<footer id="contact"><div class="wrap fgrid">';
  footer += `<div>${logo}<p style="margin-top:10px">Gửi một đóa hoa, trao một điều thương nhớ.</p></div>`;
  footer += `<div><h4>Liên hệ</h4><p>${icon("phone")} 0123 456 789<br>${icon("mail")} antvtts03201@gmail.com <br>${icon("pin")} Thành Phố Hồ Chí Minh, Việt Nam</p></div>`;
  footer += "<div><h4>Hỗ trợ</h4><p>Chính sách vận chuyển<br>Chính sách đổi trả<br>Điều khoản</p></div>";
  footer += "<div><h4>Theo dõi chúng tôi</h4><p>Facebook · Instagram · TikTok</p></div>";
  footer += '</div><p class="copy">© 2026 Lumière Flower</p></footer>';
  document.getElementById("ftr").innerHTML = footer;

  updateBadge();
  document.addEventListener("click", handleClick);
}
