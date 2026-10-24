// ===== TRANG ĐĂNG KÝ + ĐĂNG NHẬP =====
import { register, login } from "../auth.js";
import { initLayout, toast } from "../ui.js";

initLayout();

const regForm = document.getElementById("regForm"); // chỉ có ở trang đăng ký
const logForm = document.getElementById("logForm"); // chỉ có ở trang đăng nhập

// ----- Đăng ký -----
if (regForm !== null) {
  regForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const f = regForm.elements;

    const result = register({
      name: f.name.value,
      email: f.email.value,
      password: f.password.value,
      confirm: f.confirm.value
    });
    
    toast(result.msg);

    if (result.ok) {
      // Chờ 0,9 giây rồi chuyển sang trang đăng nhập
      setTimeout(function () {
        location.href = "login.html" + location.search;
      }, 900);
    }
  });
}

// ----- Đăng nhập -----
if (logForm !== null) {
  logForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const f = logForm.elements;

    const result = login(f.email.value, f.password.value);
    toast(result.msg);
    if (!result.ok) return;

    // Quyết định chuyển tới trang nào sau khi đăng nhập
    let target = "index.html";
    if (result.user.role === "admin") {
      target = "admin.html";
    }

    // Nếu trước đó bị chuyển tới đây từ trang khác (?next=...) thì quay lại trang đó.
    // Chỉ chấp nhận tên trang nội bộ như "checkout.html" để tránh bị chuyển sang web lạ.
    const next = new URLSearchParams(location.search).get("next");
    if (next !== null && /^[a-z-]+\.html(\?[\w=&%-]*)?$/i.test(next)) {
      target = next;
    }

    setTimeout(function () {
      location.href = target;
    }, 700);
  });
}
