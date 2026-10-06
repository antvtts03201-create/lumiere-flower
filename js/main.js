// ===== HEADER, FOOTER, GIỎ HÀNG, YÊU THÍCH, TOAST (dùng ở mọi trang) =====

// Bộ icon vẽ nét: mọi icon trên web đều lấy từ đây nên luôn đồng bộ
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
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>'
};

function icon(name) {
  return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>';
}

const getCart = () => load("cart", []);
const wish = () => load("wishlist", []);
const cartCount = () => getCart().reduce((s, i) => s + i.qty, 0);

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
}
function addToCart(id, qty = 1) {
  const cart = getCart(), item = cart.find(i => i.id === id);
  if (item) item.qty += qty; else cart.push({ id, qty });
  save("cart", cart); updateBadge(); toast("Đã thêm vào giỏ hàng");
}
// Mua ngay: thêm vào giỏ rồi sang thanh toán luôn
function buyNow(id) { addToCart(id, 1); location.href = "checkout.html"; }

function toggleWish(id, btn) {
  let w = wish();
  w = w.includes(id) ? w.filter(x => x !== id) : [...w, id];
  save("wishlist", w);
  if (btn) btn.classList.toggle("on", w.includes(id));
  toast(w.includes(id) ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích");
}
function updateBadge() { const b = document.getElementById("badge"); if (b) b.textContent = cartCount(); }

// Thẻ sản phẩm dùng chung
function card(p) {
  return `<div class="card"><a class="im" href="product-detail.html?id=${p.id}"><img src="${p.image}" alt="${p.name}">${p.isNew ? '<span class="nw">Mới</span>' : ""}</a>
  <button class="heart ${wish().includes(p.id) ? "on" : ""}" onclick="toggleWish(${p.id},this)" aria-label="Yêu thích">${icon("heart")}</button>
  <h3><a href="product-detail.html?id=${p.id}">${p.name}</a></h3>
  <div class="meta"><span class="stars">${"★".repeat(Math.round(p.rating))}</span><span class="sold">Đã bán ${p.sold || 0}</span></div>
  <div class="pr">${money(p.price)}</div>
  <div class="acts"><button class="btn ghost sm" onclick="addToCart(${p.id})">Thêm vào giỏ</button><button class="btn sm" onclick="buyNow(${p.id})">Mua ngay</button></div></div>`;
}

function renderLayout() {
  const user = load("currentUser", null), page = location.pathname.split("/").pop() || "index.html";
  const nav = [["index.html","Trang chủ"],["products.html","Danh mục"],["index.html#about","Giới thiệu"],["index.html#contact","Liên hệ"]]
    .map(([h, t]) => `<a href="${h}" class="${page === h ? "active" : ""}">${t}</a>`).join("");

  // Logo riêng (logo.png đã có sẵn chữ tên thương hiệu nên không thêm chữ nữa)
  const logo = `<a href="index.html" class="logo"><img src="assets/images/logo.png" alt="Lumière Flower"></a>`;

  document.getElementById("hdr").innerHTML = `<header class="hdr"><div class="wrap bar">
    ${logo}<nav class="menu">${nav}</nav>
    <div class="icons"><a href="products.html?focus=1" title="Tìm kiếm">${icon("search")}</a>
    ${user ? `<a href="#" onclick="logout()" title="Đăng xuất (${user.name})">${icon("user")}</a>` : `<a href="login.html" title="Đăng nhập">${icon("user")}</a>`}
    <a href="products.html" title="Yêu thích">${icon("heart")}</a><a href="cart.html" class="cartlink">${icon("cart")}<span id="badge">0</span></a></div></div></header>`;

  document.getElementById("ftr").innerHTML = `<footer id="contact"><div class="wrap fgrid">
    <div>${logo}<p style="margin-top:10px">Gửi một đóa hoa, trao một điều thương nhớ.</p></div>
    <div><h4>Liên hệ</h4><p>${icon("phone")} 0123 456 789<br>${icon("mail")} lumiereflower@gmail.com<br>${icon("pin")} Hà Nội, Việt Nam</p></div>
    <div><h4>Hỗ trợ</h4><p>Chính sách vận chuyển<br>Chính sách đổi trả<br>Điều khoản</p></div>
    <div><h4>Theo dõi chúng tôi</h4><p>Facebook · Instagram · TikTok</p></div></div><p class="copy">© 2026 Lumière Flower</p></footer>`;
  updateBadge();
}
function logout() { localStorage.removeItem("currentUser"); location.href = "index.html"; }
document.addEventListener("DOMContentLoaded", renderLayout);