// ===== TRANG CHỦ =====
import { getProducts, getCategories } from "../storage.js";
import { initLayout, cards, icon, esc } from "../ui.js";

initLayout();

function byId(id) {
  return document.getElementById(id);
}

const products = getProducts();
const categories = getCategories();

// ----- 1. Danh mục (lấy từ dữ liệu quản trị) -----
let catHtml = "";
for (let i = 0; i < categories.length; i++) {
  const c = categories[i];
  catHtml += `<a class="cat" href="products.html?cat=${encodeURIComponent(c.name)}">`;
  catHtml += `<span class="cat-img"><img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy"></span>`;
  catHtml += `${esc(c.name)}</a>`;
}
byId("cats").innerHTML = catHtml;

// ----- 2. Sản phẩm nổi bật và sản phẩm mới -----
// Lấy tối đa "limit" sản phẩm có field = true (isFeatured hoặc isNew)
function pick(field, limit) {
  const result = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i][field] && result.length < limit) {
      result.push(products[i]);
    }
  }
  return result;
}
byId("featured").innerHTML = cards(pick("isFeatured", 4));
byId("newest").innerHTML = cards(pick("isNew", 4));

// ----- 3. Chọn hoa theo sự kiện -----
// Mỗi sự kiện: [tên icon, chữ hiển thị, danh mục]
const allEvents = [
  ["heart", "Valentine", "Hoa tình yêu"],
  ["gift", "8/3 · 20/10", "Hoa chúc mừng"],
  ["cake", "Sinh nhật", "Hoa sinh nhật"],
  ["ring", "Cưới hỏi", "Hoa cưới"],
  ["star", "Dịp đặc biệt", "Hoa dịp đặc biệt"],
  ["leaf", "Theo mùa", "Hoa theo mùa"]
];

function categoryExists(name) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].name === name) return true;
  }
  return false;
}

// Chỉ giữ lại những sự kiện mà danh mục còn tồn tại
const events = [];
for (let i = 0; i < allEvents.length; i++) {
  if (categoryExists(allEvents[i][2])) {
    events.push(allEvents[i]);
  }
}

let tabsHtml = "";
for (let i = 0; i < events.length; i++) {
  tabsHtml += `<button class="ev" data-i="${i}">${icon(events[i][0])} ${events[i][1]}</button>`;
}
byId("evTabs").innerHTML = tabsHtml;

// Hiện 4 sản phẩm của sự kiện thứ n
function showEvent(n) {
  const categoryName = events[n][2];

  const list = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i].category === categoryName && list.length < 4) {
      list.push(products[i]);
    }
  }

  let html = cards(list);
  if (list.length === 0) html = "<p>Chưa có sản phẩm.</p>";
  byId("evGrid").innerHTML = html;

  byId("evMore").href = "products.html?cat=" + encodeURIComponent(categoryName);
  byId("evMore").textContent = "Xem tất cả " + categoryName.toLowerCase() + " →";

  // Tô màu nút đang chọn
  const buttons = byId("evTabs").querySelectorAll(".ev");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle("on", i === n);
  }
}

byId("evTabs").addEventListener("click", function (e) {
  const button = e.target.closest(".ev");
  if (button !== null) {
    showEvent(Number(button.dataset.i));
  }
});
if (events.length > 0) {
  showEvent(0);
}

// ----- 4. Banner tự chuyển, bấm vào banner để sang trang khác -----
const banners = [
  { image: "assets/images/lumiere_banner_1.png", link: "products.html?cat=" + encodeURIComponent("Hoa tình yêu") },
  { image: "assets/images/lumiere_banner_2.png", link: "products.html" },
  { image: "assets/images/lumiere_banner_3.png", link: "#events" }
];

let sliderHtml = `<a class="banner" id="bannerLink" href="${banners[0].link}">`;
sliderHtml += `<img id="bannerImage" src="${banners[0].image}" alt="Lumière Flower"></a>`;
sliderHtml += '<button class="arrow l">‹</button><button class="arrow r">›</button>';
sliderHtml += '<div class="dots">';
for (let i = 0; i < banners.length; i++) {
  sliderHtml += "<i></i>";
}
sliderHtml += "</div>";

const slider = byId("slider");
slider.innerHTML = sliderHtml;

const dots = slider.querySelectorAll(".dots i");
let current = 0;

function showBanner(n) {
  // (n + 3) % 3 giúp quay vòng: sau banner cuối là banner đầu
  current = (n + banners.length) % banners.length;
  byId("bannerImage").src = banners[current].image;
  byId("bannerLink").href = banners[current].link;
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.toggle("on", i === current);
  }
}

slider.querySelector(".l").onclick = function () {
  showBanner(current - 1);
};
slider.querySelector(".r").onclick = function () {
  showBanner(current + 1);
};
for (let i = 0; i < dots.length; i++) {
  dots[i].onclick = function () {
    showBanner(i);
  };
}

showBanner(0);
setInterval(function () {
  showBanner(current + 1);
}, 5000);
