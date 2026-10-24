// ===== MODULE 6: admin.js =====
// Trang quản trị: quản lý danh mục, sản phẩm và đơn hàng.
// Cách làm: mỗi lần dữ liệu thay đổi thì gọi render() để vẽ lại toàn bộ trang.

import { money, COLORS, MAIN_TYPES, getCategories, saveCategory, deleteCategory,
         getProducts, saveProduct, deleteProduct } from "./storage.js";
import { requireAdmin } from "./auth.js";
import { getOrders, updateStatus, deleteOrder, STATUSES } from "./orders.js";
import { initLayout, toast, esc, stClass } from "./ui.js";

// Trạng thái hiện tại của trang quản trị
let currentTab = "cat";   // "cat" | "prod" | "ord"
let editingCat = null;    // danh mục đang sửa (null = đang thêm mới)
let editingProd = null;   // sản phẩm đang sửa
let statusFilter = "";    // lọc đơn hàng theo trạng thái
let openOrderId = "";     // đơn hàng đang mở phần chi tiết

function byId(id) {
  return document.getElementById(id);
}

// ===== Các hàm nhỏ hỗ trợ tạo HTML =====

function selected(a, b) {
  if (a === b) {
    return "selected";
  }
  return "";
}

// Tạo các thẻ <option> từ một mảng chữ. current = giá trị đang được chọn.
function optionTags(list, current) {
  let html = "";
  for (let i = 0; i < list.length; i++) {
    html += `<option value="${esc(list[i])}" ${selected(list[i], current)}>${esc(list[i])}</option>`;
  }
  return html;
}

function visibilityOptions(current) {
  let html = `<option value="active" ${selected("active", current)}>Hiển thị</option>`;
  html += `<option value="hidden" ${selected("hidden", current)}>Ẩn</option>`;
  return html;
}

function visibilityText(status) {
  if (status === "hidden") {
    return "Ẩn";
  }
  return "Hiển thị";
}

function checked(value) {
  if (value) {
    return "checked";
  }
  return "";
}

// Đếm số sản phẩm thuộc một danh mục
function countProducts(categoryName) {
  const products = getProducts(true);
  let count = 0;
  for (let i = 0; i < products.length; i++) {
    if (products[i].category === categoryName) count++;
  }
  return count;
}

// Danh sách tên danh mục (để đổ vào ô chọn)
function categoryNames() {
  const cats = getCategories(true);
  const names = [];
  for (let i = 0; i < cats.length; i++) {
    names.push(cats[i].name);
  }
  return names;
}

// ===== Vẽ trang =====

export function initAdmin() {
  if (!requireAdmin()) {
    return;
  }
  initLayout();
  render();

  const root = byId("adminRoot");
  root.addEventListener("click", handleClick);
  root.addEventListener("submit", handleSubmit);
  root.addEventListener("change", handleChange);
}

function render() {
  // Thống kê nhanh
  const orders = getOrders();
  let revenue = 0;
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].status !== "Đã hủy") {
      revenue = revenue + orders[i].total;
    }
  }

  let html = '<div class="stats">';
  html += `<div><b>${getProducts(true).length}</b><span>Sản phẩm</span></div>`;
  html += `<div><b>${orders.length}</b><span>Đơn hàng</span></div>`;
  html += `<div><b>${money(revenue)}</b><span>Doanh thu (không tính đơn hủy)</span></div>`;
  html += "</div>";

  // Các tab
  const tabs = [["cat", "Danh mục"], ["prod", "Sản phẩm"], ["ord", "Đơn hàng"]];
  html += '<div class="atabs">';
  for (let i = 0; i < tabs.length; i++) {
    let on = "";
    if (currentTab === tabs[i][0]) on = "on";
    html += `<button class="atab ${on}" data-act="tab" data-tab="${tabs[i][0]}">${tabs[i][1]}</button>`;
  }
  html += "</div>";

  // Nội dung của tab đang chọn
  if (currentTab === "cat") {
    html += categoryPanel();
  } else if (currentTab === "prod") {
    html += productPanel();
  } else {
    html += orderPanel();
  }

  byId("adminRoot").innerHTML = html;
}

// ---------- TAB DANH MỤC ----------

function categoryForm() {
  // Đang sửa thì lấy dữ liệu của danh mục đó, không thì dùng ô trống
  let c = editingCat;
  let title = "Sửa danh mục";
  let buttonText = "Cập nhật";
  let cancelButton = '<button type="button" class="btn ghost" data-act="cancel">Hủy</button>';

  if (c === null) {
    c = { id: "", name: "", image: "", status: "active" };
    title = "Thêm danh mục";
    buttonText = "Thêm mới";
    cancelButton = "";
  }

  let html = `<h3>${title}</h3>`;
  html += '<form data-form="cat" class="aform">';
  html += `<input type="hidden" name="id" value="${c.id}">`;
  html += `<input class="fld" name="name" placeholder="Tên danh mục" required value="${esc(c.name)}">`;
  html += `<select name="status">${visibilityOptions(c.status)}</select>`;
  html += `<input class="fld full" name="image" placeholder="Đường dẫn ảnh, vd: assets/images/hoa-cuoi.jpg" required value="${esc(c.image)}">`;
  html += `<div class="arow full"><button class="btn">${buttonText}</button>${cancelButton}</div>`;
  html += "</form>";
  return html;
}

function categoryRow(c) {
  let html = "<tr>";
  html += `<td><img class="thumb" src="${esc(c.image)}" alt=""></td>`;
  html += `<td>${esc(c.name)}</td>`;
  html += `<td>${countProducts(c.name)}</td>`;
  html += `<td>${visibilityText(c.status)}</td>`;
  html += '<td class="tact">';
  html += `<button class="btn ghost sm" data-act="edit-cat" data-id="${c.id}">Sửa</button>`;
  html += `<button class="btn sm" data-act="del-cat" data-id="${c.id}">Xóa</button>`;
  html += "</td></tr>";
  return html;
}

function categoryPanel() {
  const rows = getCategories(true).map(categoryRow).join("");

  let html = `<div class="apanel">${categoryForm()}</div>`;
  html += '<div class="apanel"><h3>Danh sách danh mục</h3><div class="tscroll"><table class="tbl">';
  html += "<thead><tr><th>Ảnh</th><th>Tên</th><th>Số SP</th><th>Trạng thái</th><th></th></tr></thead>";
  html += `<tbody>${rows}</tbody></table></div></div>`;
  return html;
}

// ---------- TAB SẢN PHẨM ----------

function productForm() {
  let p = editingProd;
  let title = "Sửa sản phẩm";
  let buttonText = "Cập nhật";
  let cancelButton = '<button type="button" class="btn ghost" data-act="cancel">Hủy</button>';

  if (p === null) {
    p = { id: "", name: "", price: "", stock: 20, category: "", flowerType: MAIN_TYPES[0], color: "Hồng",
          image: "", description: "", status: "active", isNew: false, isFeatured: false };
    title = "Thêm sản phẩm";
    buttonText = "Thêm mới";
    cancelButton = "";
  }

  const types = MAIN_TYPES.concat(["Khác"]);
  const colorNames = Object.keys(COLORS);

  let html = `<h3>${title}</h3>`;
  html += '<form data-form="prod" class="aform">';
  html += `<input type="hidden" name="id" value="${p.id}">`;
  html += `<input class="fld full" name="name" placeholder="Tên sản phẩm" required value="${esc(p.name)}">`;
  html += `<input class="fld" name="price" type="number" min="0" step="1000" placeholder="Giá (đ)" required value="${p.price}">`;
  html += `<input class="fld" name="stock" type="number" min="0" placeholder="Tồn kho" required value="${p.stock}">`;
  html += `<select name="category">${optionTags(categoryNames(), p.category)}</select>`;
  html += `<select name="flowerType">${optionTags(types, p.flowerType)}</select>`;
  html += `<select name="color">${optionTags(colorNames, p.color)}</select>`;
  html += `<select name="status">${visibilityOptions(p.status)}</select>`;
  html += `<input class="fld full" name="image" placeholder="Đường dẫn ảnh, vd: assets/images/hoa-cuoi.jpg" required value="${esc(p.image)}">`;
  html += `<textarea class="fld full" name="description" rows="3" placeholder="Mô tả">${esc(p.description)}</textarea>`;
  html += `<label class="full"><input type="checkbox" name="isNew" ${checked(p.isNew)}> Sản phẩm mới</label>`;
  html += `<label class="full"><input type="checkbox" name="isFeatured" ${checked(p.isFeatured)}> Sản phẩm nổi bật</label>`;
  html += `<div class="arow full"><button class="btn">${buttonText}</button>${cancelButton}</div>`;
  html += "</form>";
  return html;
}

function productRow(p) {
  let html = "<tr>";
  html += `<td><img class="thumb" src="${esc(p.image)}" alt=""></td>`;
  html += `<td>${esc(p.name)}</td>`;
  html += `<td>${esc(p.category)}</td>`;
  html += `<td>${money(p.price)}</td>`;
  html += `<td>${p.stock}</td>`;
  html += `<td>${p.sold || 0}</td>`;
  html += `<td>${visibilityText(p.status)}</td>`;
  html += '<td class="tact">';
  html += `<button class="btn ghost sm" data-act="edit-prod" data-id="${p.id}">Sửa</button>`;
  html += `<button class="btn sm" data-act="del-prod" data-id="${p.id}">Xóa</button>`;
  html += "</td></tr>";
  return html;
}

function productPanel() {
  const rows = getProducts(true).map(productRow).join("");

  let html = `<div class="apanel">${productForm()}</div>`;
  html += '<div class="apanel"><h3>Danh sách sản phẩm</h3><div class="tscroll"><table class="tbl">';
  html += "<thead><tr><th>Ảnh</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Kho</th><th>Đã bán</th><th>Trạng thái</th><th></th></tr></thead>";
  html += `<tbody>${rows}</tbody></table></div></div>`;
  return html;
}

// ---------- TAB ĐƠN HÀNG ----------

// Phần chi tiết hiện ra khi bấm nút "Chi tiết"
function orderDetailRow(o) {
  let itemsText = "";
  for (let i = 0; i < o.items.length; i++) {
    const item = o.items[i];
    itemsText += `${esc(item.name)} × ${item.qty} — ${money(item.price * item.qty)}<br>`;
  }
  let note = o.note;
  if (note === "") note = "Không có";

  let html = '<tr class="odetail"><td colspan="6">';
  html += itemsText + "<br>";
  html += `Địa chỉ: ${esc(o.address)}<br>`;
  html += `Email: ${esc(o.email)}<br>`;
  html += `Thanh toán: ${esc(o.payment)}<br>`;
  html += `Ghi chú: ${esc(note)}<br>`;
  html += `Giảm giá: -${money(o.discount)} · Phí giao hàng: ${money(o.ship)}`;
  html += "</td></tr>";
  return html;
}

function orderRow(o) {
  let html = "<tr>";
  html += `<td><b>${esc(o.id)}</b></td>`;
  html += `<td>${esc(o.customer)}<br><small>${esc(o.phone)}</small></td>`;
  html += `<td>${esc(o.date)}</td>`;
  html += `<td>${money(o.total)}</td>`;
  html += `<td><select class="stsel ${stClass(o.status)}" data-act="status" data-id="${o.id}">${optionTags(STATUSES, o.status)}</select></td>`;
  html += '<td class="tact">';
  html += `<button class="btn ghost sm" data-act="toggle-order" data-id="${o.id}">Chi tiết</button>`;
  html += `<button class="btn sm" data-act="del-order" data-id="${o.id}">Xóa</button>`;
  html += "</td></tr>";

  if (openOrderId === o.id) {
    html += orderDetailRow(o);
  }
  return html;
}

function orderPanel() {
  // Lọc theo trạng thái (nếu có chọn)
  const all = getOrders();
  const list = [];
  for (let i = 0; i < all.length; i++) {
    if (statusFilter === "" || all[i].status === statusFilter) {
      list.push(all[i]);
    }
  }

  let rows = list.map(orderRow).join("");
  if (list.length === 0) {
    rows = '<tr><td colspan="6">Chưa có đơn hàng.</td></tr>';
  }

  let html = '<div class="apanel"><h3>Quản lý đơn hàng</h3>';
  html += `<select class="filterSel" data-act="filter"><option value="">Tất cả trạng thái</option>${optionTags(STATUSES, statusFilter)}</select>`;
  html += '<div class="tscroll"><table class="tbl">';
  html += "<thead><tr><th>Mã</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>";
  html += `<tbody>${rows}</tbody></table></div></div>`;
  return html;
}

// ===== Xử lý sự kiện =====

// Khi bấm một nút có thuộc tính data-act
function handleClick(e) {
  const button = e.target.closest("button[data-act]");
  if (button === null) {
    return;
  }

  const act = button.dataset.act;
  const id = Number(button.dataset.id);

  if (act === "tab") {
    currentTab = button.dataset.tab;

  } else if (act === "cancel") {
    editingCat = null;
    editingProd = null;

  } else if (act === "edit-cat") {
    const cats = getCategories(true);
    for (let i = 0; i < cats.length; i++) {
      if (cats[i].id === id) editingCat = cats[i];
    }

  } else if (act === "edit-prod") {
    const products = getProducts(true);
    for (let i = 0; i < products.length; i++) {
      if (products[i].id === id) editingProd = products[i];
    }

  } else if (act === "del-cat") {
    if (!confirm("Xóa danh mục này?")) return;
    const result = deleteCategory(id);
    if (result.ok) {
      toast("Đã xóa danh mục");
    } else {
      toast(result.msg);
    }

  } else if (act === "del-prod") {
    if (!confirm("Xóa sản phẩm này?")) return;
    deleteProduct(id);
    toast("Đã xóa sản phẩm");

  } else if (act === "toggle-order") {
    // Bấm lần nữa vào cùng đơn thì đóng lại
    if (openOrderId === button.dataset.id) {
      openOrderId = "";
    } else {
      openOrderId = button.dataset.id;
    }

  } else if (act === "del-order") {
    if (!confirm("Xóa đơn hàng này?")) return;
    deleteOrder(button.dataset.id);
    toast("Đã xóa đơn hàng");
  }

  render();

  // Bấm "Sửa" thì cuộn lên đầu trang để thấy form
  if (act === "edit-cat" || act === "edit-prod") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Khi gửi form thêm / sửa
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const f = form.elements; // f.name, f.price... là các ô nhập trong form

  // Ô id có giá trị -> đang sửa; để trống -> thêm mới
  let id = null;
  if (f.id.value !== "") {
    id = Number(f.id.value);
  }

  let result;
  if (form.dataset.form === "cat") {
    result = saveCategory({ id: id, name: f.name.value, image: f.image.value, status: f.status.value });
    if (result.ok) editingCat = null;
  } else {
    result = saveProduct({
      id: id,
      name: f.name.value,
      price: f.price.value,
      stock: f.stock.value,
      category: f.category.value,
      flowerType: f.flowerType.value,
      color: f.color.value,
      image: f.image.value,
      description: f.description.value,
      isNew: f.isNew.checked,
      isFeatured: f.isFeatured.checked,
      status: f.status.value
    });
    if (result.ok) editingProd = null;
  }

  if (result.ok) {
    toast("Đã lưu");
    render();
  } else {
    toast(result.msg);
  }
}

// Khi đổi giá trị ô chọn (trạng thái đơn, bộ lọc)
function handleChange(e) {
  const select = e.target;

  if (select.dataset.act === "status") {
    updateStatus(select.dataset.id, select.value);
    toast("Đã cập nhật trạng thái");
    render();
  } else if (select.dataset.act === "filter") {
    statusFilter = select.value;
    render();
  }
}
