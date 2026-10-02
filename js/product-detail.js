// ===== TRANG CHI TIẾT SẢN PHẨM =====
document.addEventListener("DOMContentLoaded", () => {
  const p = getProduct(new URLSearchParams(location.search).get("id"));
  const box = document.getElementById("detail");
  if (!p) { box.innerHTML = "<p>Không tìm thấy sản phẩm. <a href='products.html'>Quay lại</a></p>"; return; }
  box.innerHTML = `<div class="gallery"><img id="mainImg" src="${p.images[0]}" alt="${p.name}">
    <div class="thumbs">${p.images.map(s => `<img src="${s}" onclick="document.getElementById('mainImg').src=this.src">`).join("")}</div></div>
    <div class="info"><h1>${p.name}</h1><div class="pr big">${money(p.price)}</div>
    <div class="stars">${"★".repeat(Math.round(p.rating))} <small>(12 đánh giá)</small></div><p>${p.description}</p>
    <table class="spec"><tr><td>Loại hoa</td><td>${p.flowerType}</td></tr><tr><td>Màu sắc</td><td>${p.color}</td></tr>
    <tr><td>Kích thước</td><td>40 × 50 cm</td></tr><tr><td>Xuất xứ</td><td>Đà Lạt</td></tr><tr><td>Còn lại</td><td>${p.stock}</td></tr></table>
    <div class="qty"><button onclick="chg(-1)">-</button><span id="q">1</span><button onclick="chg(1)">+</button></div>
    <div class="acts"><button class="btn" id="add">Thêm vào giỏ hàng</button><button class="btn ghost" onclick="toggleWish(${p.id})">♡ Yêu thích</button></div></div>`;
  let qty = 1;
  window.chg = d => { qty = Math.min(p.stock, Math.max(1, qty + d)); document.getElementById("q").textContent = qty; };
  document.getElementById("add").onclick = () => addToCart(p.id, qty);
  document.querySelectorAll(".tab").forEach(t => t.onclick = () => { // chuyển tab
    document.querySelectorAll(".tab,.pane").forEach(x => x.classList.remove("on"));
    t.classList.add("on"); document.getElementById(t.dataset.t).classList.add("on"); });
  document.getElementById("desc").textContent = p.description + " Mỗi bó hoa được tuyển chọn kỹ lưỡng, gói bằng giấy kraft và ruy băng.";
  const others = getProducts().filter(x => x.id !== p.id);
  const same = others.filter(x => x.category === p.category);
  document.getElementById("related").innerHTML = [...same, ...others.filter(x => !same.includes(x))].slice(0, 4).map(card).join("");
});
