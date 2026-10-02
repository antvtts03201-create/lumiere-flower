// ===== ĐĂNG KÝ / ĐĂNG NHẬP (giả lập bằng localStorage) =====
function getUsers() {
  const u = load("users", null);
  if (u) return u;
  const seed = [{ name: "Admin", email: "admin@lumiereflower.com", password: "admin123", role: "admin" }];
  save("users", seed); return seed;
}
document.addEventListener("DOMContentLoaded", () => {
  const reg = document.getElementById("regForm"), log = document.getElementById("logForm");
  if (reg) reg.onsubmit = e => {
    e.preventDefault(); const users = getUsers();
    if (reg.password.value !== reg.confirm.value) return toast("Mật khẩu xác nhận không khớp");
    if (users.some(u => u.email === reg.email.value)) return toast("Email đã tồn tại");
    users.push({ name: reg.name.value, email: reg.email.value, password: reg.password.value, role: "customer" });
    save("users", users); toast("Đăng ký thành công!"); setTimeout(() => location.href = "login.html", 900);
  };
  if (log) log.onsubmit = e => {
    e.preventDefault();
    const u = getUsers().find(x => x.email === log.email.value && x.password === log.password.value);
    if (!u) return toast("Sai email hoặc mật khẩu");
    save("currentUser", u); toast("Đăng nhập thành công");
    setTimeout(() => location.href = "index.html", 700); // Admin sẽ chuyển tới admin/admin.html khi làm xong phần admin
  };
});
