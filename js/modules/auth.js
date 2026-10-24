// ===== MODULE 2: auth.js =====
// Đăng ký, đăng nhập, đăng xuất và kiểm tra quyền.

import { load, save } from "./storage.js";

const USERS_KEY = "lf_users";
const CURRENT_KEY = "lf_currentUser";

// Lấy danh sách người dùng. Lần đầu sẽ tạo sẵn 1 tài khoản admin.
export function getUsers() {
  let users = load(USERS_KEY, null);
  if (users === null) {
    users = [{ id: 1, name: "Admin", email: "admin@lumiereflower.com", password: "admin123", role: "admin" }];
    save(USERS_KEY, users);
  }
  return users;
}

// Người đang đăng nhập (null nếu chưa đăng nhập)
export function currentUser() {
  return load(CURRENT_KEY, null);
}

export function register(info) {
  const name = info.name.trim();
  const email = info.email.trim().toLowerCase();

  if (name === "") {
    return { ok: false, msg: "Vui lòng nhập họ tên" };
  }
  if (info.password.length < 6) {
    return { ok: false, msg: "Mật khẩu tối thiểu 6 ký tự" };
  }
  if (info.password !== info.confirm) {
    return { ok: false, msg: "Mật khẩu xác nhận không khớp" };
  }

  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return { ok: false, msg: "Email đã tồn tại" };
    }
  }

  users.push({ id: users.length + 1, name: name, email: email, password: info.password, role: "customer" });
  save(USERS_KEY, users);
  return { ok: true, msg: "Đăng ký thành công!" };
}

export function login(emailInput, password) {
  const email = emailInput.trim().toLowerCase();
  const users = getUsers();

  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].password === password) {
      // Chỉ lưu thông tin cần thiết, không lưu mật khẩu
      const user = { id: users[i].id, name: users[i].name, email: users[i].email, role: users[i].role };
      save(CURRENT_KEY, user);
      return { ok: true, msg: "Đăng nhập thành công", user: user };
    }
  }
  return { ok: false, msg: "Sai email hoặc mật khẩu" };
}

export function logout() {
  localStorage.removeItem(CURRENT_KEY);
}

// Trang cần đăng nhập: chưa đăng nhập thì chuyển sang trang đăng nhập.
// Đăng nhập xong sẽ quay lại trang này (nhờ tham số ?next=...).
export function requireLogin() {
  if (currentUser() !== null) {
    return true;
  }
  const pageName = location.pathname.split("/").pop() + location.search;
  location.href = "login.html?next=" + encodeURIComponent(pageName);
  return false;
}

// Trang chỉ dành cho admin
export function requireAdmin() {
  const user = currentUser();
  if (user !== null && user.role === "admin") {
    return true;
  }
  location.href = "login.html?next=admin.html";
  return false;
}
