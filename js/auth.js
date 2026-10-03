// ===== ĐĂNG KÝ / ĐĂNG NHẬP (giả lập bằng localStorage) =====

// Lấy danh sách người dùng. Lần đầu chưa có thì tạo sẵn 1 tài khoản admin
function getUsers() {
  const users = load("users", null);

  if (users) {
    return users;
  }

  const seed = [
    { name: "Admin", email: "admin@lumiereflower.com", password: "admin123", role: "admin" }
  ];
  save("users", seed);
  return seed;
}

document.addEventListener("DOMContentLoaded", function () {

  // Trang nào có form nào thì form đó mới tồn tại
  const regForm = document.getElementById("regForm"); // trang đăng ký
  const logForm = document.getElementById("logForm"); // trang đăng nhập

  // ----- ĐĂNG KÝ -----
  if (regForm) {
    regForm.onsubmit = function (e) {
      e.preventDefault(); // không cho trang tải lại

      const users = getUsers();

      // 1. Mật khẩu xác nhận phải khớp
      if (regForm.password.value !== regForm.confirm.value) {
        toast("Mật khẩu xác nhận không khớp");
        return;
      }

      // 2. Email không được trùng
      for (let i = 0; i < users.length; i++) {
        if (users[i].email === regForm.email.value) {
          toast("Email đã tồn tại");
          return;
        }
      }

      // 3. Thêm người dùng mới rồi lưu lại
      users.push({
        name: regForm.name.value,
        email: regForm.email.value,
        password: regForm.password.value,
        role: "customer"
      });
      save("users", users);

      toast("Đăng ký thành công!");

      // Chờ 0.9 giây rồi chuyển sang trang đăng nhập
      setTimeout(function () {
        location.href = "login.html";
      }, 900);
    };
  }

  // ----- ĐĂNG NHẬP -----
  if (logForm) {
    logForm.onsubmit = function (e) {
      e.preventDefault();

      const users = getUsers();
      let found = null;

      // Tìm người dùng có đúng email và mật khẩu
      for (let i = 0; i < users.length; i++) {
        if (users[i].email === logForm.email.value && users[i].password === logForm.password.value) {
          found = users[i];
        }
      }

      if (!found) {
        toast("Sai email hoặc mật khẩu");
        return;
      }

      // Lưu người đang đăng nhập rồi về trang chủ
      save("currentUser", found);
      toast("Đăng nhập thành công");

      // Admin sẽ chuyển tới admin/admin.html khi làm xong phần admin
      setTimeout(function () {
        location.href = "index.html";
      }, 700);
    };
  }
});