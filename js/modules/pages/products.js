// ===== TRANG DANH MỤC: tìm kiếm, lọc, sắp xếp, phân trang =====
import { getProducts, getCategories, COLORS, MAIN_TYPES } from "../storage.js";
import { getWish } from "../cart.js";
import { initLayout, cards, esc } from "../ui.js";

initLayout();

function byId(id) {
  return document.getElementById(id);
}

const PER_PAGE = 8; // số sản phẩm mỗi trang
const params = new URLSearchParams(location.search);

// "state" lưu các lựa chọn lọc hiện tại của khách
const state = {
  q: "",            // từ khóa tìm kiếm
  cats: [],         // danh mục đã chọn
  color: "",        // màu đã chọn
  min: 0,           // giá thấp nhất
  max: Infinity,    // giá cao nhất
  types: [],        // loại hoa đã chọn
  sort: "popular",  // kiểu sắp xếp
  page: 1,          // trang hiện tại
  wishOnly: params.get("wish") === "1"  // chỉ hiện sản phẩm yêu thích
};
if (params.get("cat") !== null) {
  state.cats.push(params.get("cat"));
}

// Sản phẩm p có thỏa các điều kiện lọc không? (true = giữ lại)
function matches(p) {
  // 1. Tên chứa từ khóa
  if (p.name.toLowerCase().indexOf(state.q.toLowerCase()) === -1) return false;

  // 2. Đúng danh mục
  if (state.cats.length > 0 && !state.cats.includes(p.category)) return false;

  // 3. Đúng màu
  if (state.color !== "" && p.color !== state.color) return false;

  // 4. Trong khoảng giá
  if (p.price < state.min || p.price > state.max) return false;

  // 5. Đúng loại hoa (loại không nằm trong danh sách chính tính là "Khác")
  if (state.types.length > 0) {
    let type = p.flowerType;
    if (!MAIN_TYPES.includes(type)) type = "Khác";
    if (!state.types.includes(type)) return false;
  }

  // 6. Nếu đang xem trang yêu thích
  if (state.wishOnly && !getWish().includes(p.id)) return false;

  return true;
}

function sortList(list) {
  list.sort(function (a, b) {
    if (state.sort === "asc") return a.price - b.price;
    if (state.sort === "desc") return b.price - a.price;
    if (state.sort === "newest") return b.id - a.id;
    if (state.sort === "name") return a.name.localeCompare(b.name);
    return b.rating - a.rating; // mặc định: phổ biến (điểm cao trước)
  });
}

// Vẽ danh sách sản phẩm và nút phân trang
function render() {
  const all = getProducts();
  const list = [];
  for (let i = 0; i < all.length; i++) {
    if (matches(all[i])) list.push(all[i]);
  }
  sortList(list);

  // Tính số trang rồi cắt đúng phần của trang hiện tại
  let pages = Math.ceil(list.length / PER_PAGE);
  if (pages < 1) pages = 1;
  if (state.page > pages) state.page = pages;

  const start = (state.page - 1) * PER_PAGE;
  const pageItems = list.slice(start, start + PER_PAGE);

  let gridHtml = cards(pageItems);
  if (pageItems.length === 0) gridHtml = "<p>Không tìm thấy sản phẩm phù hợp.</p>";
  byId("grid").innerHTML = gridHtml;

  let pagerHtml = "";
  if (pages > 1) {
    for (let n = 1; n <= pages; n++) {
      let on = "";
      if (n === state.page) on = "on";
      pagerHtml += `<button class="pg ${on}" data-page="${n}">${n}</button>`;
    }
  }
  byId("pager").innerHTML = pagerHtml;
}

// Tạo các ô tick từ một mảng. key = "cats" hoặc "types"
function checkboxes(values, key) {
  let html = "";
  for (let i = 0; i < values.length; i++) {
    let check = "";
    if (state[key].includes(values[i])) check = "checked";
    html += `<label><input type="checkbox" value="${esc(values[i])}" data-k="${key}" ${check}> ${esc(values[i])}</label>`;
  }
  return html;
}

// ----- Dựng bộ lọc bên trái -----
const categoryNames = [];
const cats = getCategories();
for (let i = 0; i < cats.length; i++) {
  categoryNames.push(cats[i].name);
}
byId("catBox").innerHTML = checkboxes(categoryNames, "cats");
byId("typeBox").innerHTML = checkboxes(MAIN_TYPES.concat(["Khác"]), "types");

let colorHtml = "";
const colorNames = Object.keys(COLORS);
for (let i = 0; i < colorNames.length; i++) {
  const name = colorNames[i];
  colorHtml += `<button class="dot" title="${name}" data-color="${name}" style="background:${COLORS[name]}"></button>`;
}
byId("colorBox").innerHTML = colorHtml;

if (state.wishOnly) {
  document.querySelector(".page-head h1").textContent = "Sản phẩm yêu thích";
}

// ----- Các sự kiện -----

// Tick / bỏ tick danh mục hoặc loại hoa
byId("side").addEventListener("change", function (e) {
  const input = e.target;
  if (input.dataset.k === undefined) return;

  const arr = state[input.dataset.k];
  if (input.checked) {
    arr.push(input.value);
  } else {
    arr.splice(arr.indexOf(input.value), 1);
  }
  state.page = 1;
  render();
});

// Bấm chọn màu
byId("side").addEventListener("click", function (e) {
  const dot = e.target.closest(".dot");
  if (dot === null) return;

  if (state.color === dot.dataset.color) {
    state.color = ""; // bấm lại màu đang chọn thì bỏ chọn
  } else {
    state.color = dot.dataset.color;
  }
  const dots = document.querySelectorAll(".dot");
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.toggle("on", dots[i].dataset.color === state.color);
  }
  state.page = 1;
  render();
});

// "Tất cả" danh mục
byId("allCats").onclick = function () {
  state.cats = [];
  const boxes = document.querySelectorAll("[data-k=cats]");
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].checked = false;
  }
  state.page = 1;
  render();
};

// Tìm kiếm khi gõ chữ
byId("search").oninput = function (e) {
  state.q = e.target.value;
  state.page = 1;
  render();
};
if (params.get("focus")) byId("search").focus();

byId("sort").onchange = function (e) {
  state.sort = e.target.value;
  render();
};

byId("applyPrice").onclick = function () {
  state.min = Number(byId("from").value) || 0;
  state.max = Number(byId("to").value) || Infinity;
  state.page = 1;
  render();
};

byId("pager").addEventListener("click", function (e) {
  const button = e.target.closest("[data-page]");
  if (button !== null) {
    state.page = Number(button.dataset.page);
    render();
  }
});

// Nút "Bộ lọc" trên điện thoại
byId("filterBtn").onclick = function () {
  byId("side").classList.toggle("open");
};

render();
