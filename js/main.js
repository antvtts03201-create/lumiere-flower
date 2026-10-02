// ===== HEADER, FOOTER, GIỎ HÀNG, YÊU THÍCH, TOAST (dùng ở mọi trang) =====

// Lấy giỏ hàng: danh sách dạng [{ id: 1, qty: 2 }, ...]
function getCart() {
    return load("cart", []);
}

// Lấy danh sách id sản phẩm yêu thích
function wish() {
    return load("wishlist", []);
}

// Đếm tổng số lượng sản phẩm trong giỏ
function cartCount() {
    const cart = getCart();
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total = total + cart[i].qty;
    }
    return total;
}

// Hiện thông báo nhỏ ở góc màn hình trong 2.2 giây
function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () {
        t.remove();
    }, 2200);
}

// Thêm sản phẩm vào giỏ
function addToCart(id, qty) {
    if (qty === undefined) {
        qty = 1;
    }

    const cart = getCart();

    // Tìm xem sản phẩm đã có trong giỏ chưa
    let found = null;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            found = cart[i];
        }
    }

    if (found !== null) {
        found.qty = found.qty + qty;      // đã có -> tăng số lượng
    } else {
        cart.push({ id: id, qty: qty });  // chưa có -> thêm mới
    }

    save("cart", cart);
    updateBadge();
    toast("Đã thêm vào giỏ hàng 🌷");
}

// Bấm tim: thêm hoặc bỏ sản phẩm khỏi danh sách yêu thích
function toggleWish(id, btn) {
    const list = wish();
    const index = list.indexOf(id);
    let message = "";

    if (index === -1) {
        list.push(id);
        message = "Đã thêm vào yêu thích";
    } else {
        list.splice(index, 1);
        message = "Đã bỏ yêu thích";
    }

    save("wishlist", list);

    if (btn) {
        btn.classList.toggle("on");
    }
    toast(message);
}

// Cập nhật số trên biểu tượng giỏ hàng
function updateBadge() {
    const badge = document.getElementById("badge");
    if (badge) {
        badge.textContent = cartCount();
    }
}

// Tạo HTML cho 1 thẻ sản phẩm (dùng ở nhiều trang)
function card(p) {
    // Nhãn "Mới"
    let newTag = "";
    if (p.isNew) {
        newTag = '<span class="nw">Mới</span>';
    }

    // Trái tim đã chọn hay chưa
    let heartClass = "";
    if (wish().includes(p.id)) {
        heartClass = "on";
    }

    // Số sao
    let stars = "";
    const starCount = Math.round(p.rating);
    for (let i = 0; i < starCount; i++) {
        stars = stars + "★";
    }

    const html = `
        <div class="card">
            <a class="im" href="product-detail.html?id=${p.id}">
                <img src="${p.image}" alt="${p.name}">
                ${newTag}
            </a>
            <button class="heart ${heartClass}" onclick="toggleWish(${p.id}, this)" aria-label="Yêu thích">♥</button>
            <h3>${p.name}</h3>
            <div class="stars">${stars}</div>
            <div class="pr">${money(p.price)}</div>
            <div class="acts">
                <a class="btn ghost sm" href="product-detail.html?id=${p.id}">Chi tiết</a>
                <button class="btn sm" onclick="addToCart(${p.id})">Thêm vào giỏ</button>
            </div>
        </div>
    `;
    return html;
}

// Vẽ header và footer cho trang
function renderLayout() {
    const user = load("currentUser", null);
    let page = location.pathname.split("/").pop();
    if (page === "") {
        page = "index.html";
    }

    // Menu: mỗi phần tử gồm đường dẫn và chữ hiển thị
    const links = [
        { href: "index.html", text: "Trang chủ" },
        { href: "products.html", text: "Danh mục" },
        { href: "index.html#about", text: "Giới thiệu" },
        { href: "index.html#contact", text: "Liên hệ" }
    ];

    let nav = "";
    for (let i = 0; i < links.length; i++) {
        let activeClass = "";
        if (page === links[i].href) {
            activeClass = "active";
        }
        nav += '<a href="' + links[i].href + '" class="' + activeClass + '">' + links[i].text + "</a>";
    }

    // Biểu tượng tài khoản: đã đăng nhập thì bấm để đăng xuất
    let accountLink = '<a href="login.html" title="Đăng nhập">👤</a>';
    if (user) {
        accountLink = '<a href="#" onclick="logout()" title="Đăng xuất (' + user.name + ')">👤</a>';
    }

    document.getElementById("hdr").innerHTML = `
        <header class="hdr"><div class="wrap bar">
            <button class="burger" onclick="document.querySelector('.menu').classList.toggle('open')">☰</button>
            <a href="index.html" class="logo">LUMIÈRE<small>✿ FLOWER</small></a>
            <nav class="menu">${nav}</nav>
            <div class="icons">
                <a href="products.html?focus=1" title="Tìm kiếm">🔍</a>
                ${accountLink}
                <a href="products.html" title="Yêu thích">♡</a>
                <a href="cart.html" class="cartlink">🛒<span id="badge">0</span></a>
            </div>
        </div></header>
    `;

    document.getElementById("ftr").innerHTML = `
        <footer id="contact"><div class="wrap fgrid">
            <div><div class="logo">LUMIÈRE<small>✿ FLOWER</small></div><p>Gửi một đóa hoa, trao một điều thương nhớ.</p></div>
            <div><h4>Liên hệ</h4><p>📞 0123 456 789<br>✉ lumiereflower@gmail.com<br>📍 Hà Nội, Việt Nam</p></div>
            <div><h4>Hỗ trợ</h4><p>Chính sách vận chuyển<br>Chính sách đổi trả<br>Điều khoản</p></div>
            <div><h4>Theo dõi chúng tôi</h4><p>Facebook · Instagram · TikTok</p></div>
        </div><p class="copy">© 2026 Lumière Flower</p></footer>
    `;

    updateBadge();
}

// Đăng xuất: xóa người dùng hiện tại rồi về trang chủ
function logout() {
    localStorage.removeItem("currentUser");
    location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", renderLayout);