// ===== HEADER, FOOTER, GIỎ HÀNG, YÊU THÍCH, TOAST (dùng ở mọi trang) =====
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
  save("cart", cart); updateBadge(); toast("Đã thêm vào giỏ hàng 🌷");
}
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
  <button class="heart ${wish().includes(p.id) ? "on" : ""}" onclick="toggleWish(${p.id},this)" aria-label="Yêu thích">♥</button>
  <h3>${p.name}</h3><div class="stars">${"★".repeat(Math.round(p.rating))}</div><div class="pr">${money(p.price)}</div>
  <div class="acts"><a class="btn ghost sm" href="product-detail.html?id=${p.id}">Chi tiết</a><button class="btn sm" onclick="addToCart(${p.id})">Thêm vào giỏ</button></div></div>`;
}
function renderLayout() {
  const user = load("currentUser", null), page = location.pathname.split("/").pop() || "index.html";
  const nav = [["index.html","Trang chủ"],["products.html","Danh mục"],["index.html#about","Giới thiệu"],["index.html#contact","Liên hệ"]]
    .map(([h, t]) => `<a href="${h}" class="${page === h ? "active" : ""}">${t}</a>`).join("");
  document.getElementById("hdr").innerHTML = `<header class="hdr"><div class="wrap bar">
    <button class="burger" onclick="document.querySelector('.menu').classList.toggle('open')">☰</button>
    <a href="index.html" class="logo">LUMIÈRE<small>✿ FLOWER</small></a><nav class="menu">${nav}</nav>
    <div class="icons"><a href="products.html?focus=1" title="Tìm kiếm">🔍</a>
    ${user ? `<a href="#" onclick="logout()" title="Đăng xuất (${user.name})">👤</a>` : `<a href="login.html" title="Đăng nhập">👤</a>`}
    <a href="products.html" title="Yêu thích">♡</a><a href="cart.html" class="cartlink">🛒<span id="badge">0</span></a></div></div></header>`;
  document.getElementById("ftr").innerHTML = `<footer id="contact"><div class="wrap fgrid">
    <div><div class="logo">LUMIÈRE<small>✿ FLOWER</small></div><p>Gửi một đóa hoa, trao một điều thương nhớ.</p></div>
    <div><h4>Liên hệ</h4><p>📞 0123 456 789<br>✉ lumiereflower@gmail.com<br>📍 Hà Nội, Việt Nam</p></div>
    <div><h4>Hỗ trợ</h4><p>Chính sách vận chuyển<br>Chính sách đổi trả<br>Điều khoản</p></div>
    <div><h4>Theo dõi chúng tôi</h4><p>Facebook · Instagram · TikTok</p></div></div><p class="copy">© 2026 Lumière Flower</p></footer>`;
  updateBadge();
}
function logout() { localStorage.removeItem("currentUser"); location.href = "index.html"; }
document.addEventListener("DOMContentLoaded", renderLayout);
