// ===== MODULE 1: storage.js =====
// Lưu / đọc dữ liệu bằng localStorage.
// Đây cũng là nơi quản lý danh mục và sản phẩm (thêm, sửa, xóa).

// ----- Hàm cơ bản -----

// Đọc dữ liệu. Nếu chưa có hoặc bị lỗi thì trả về giá trị mặc định.
export function load(key, defaultValue) {
  const text = localStorage.getItem(key);
  if (text === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return defaultValue;
  }
}

// Lưu dữ liệu (chuyển thành chuỗi JSON trước khi lưu).
export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Định dạng tiền: 450000 -> "450.000đ"
export function money(n) {
  return Number(n).toLocaleString("vi-VN") + "đ";
}

// Tìm id lớn nhất trong danh sách rồi cộng 1 (dùng cho phần tử mới).
export function nextId(list) {
  let max = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id > max) {
      max = list[i].id;
    }
  }
  return max + 1;
}

export const COLORS = { "Đỏ": "#c0392b", "Hồng": "#f06292", "Trắng": "#eee", "Vàng": "#f4c20d", "Cam": "#f39c4a", "Tím": "#8e6bbf" };
export const MAIN_TYPES = ["Hoa hồng", "Hoa hướng dương", "Hoa ly", "Hoa cẩm tú cầu", "Baby"];

const CATEGORY_KEY = "lf_categories";
const PRODUCT_KEY = "lf_products";

// ----- Dữ liệu mẫu (chỉ nạp lần đầu tiên) -----

const CAT_NAMES = ["Hoa tình yêu", "Hoa sinh nhật", "Hoa cưới", "Hoa chúc mừng", "Hoa dịp đặc biệt", "Hoa theo mùa"];
const CAT_FILES = ["hoa-tinh-yeu", "hoa-sinh-nhat", "hoa-cuoi", "hoa-chuc-mung", "hoa-dip-dac-biet", "hoa-theo-mua"];

function makeSeedCategories() {
  const list = [];
  for (let i = 0; i < CAT_NAMES.length; i++) {
    list.push({
      id: i + 1,
      name: CAT_NAMES[i],
      image: "assets/images/" + CAT_FILES[i] + ".jpg",
      status: "active"
    });
  }
  return list;
}

// Mỗi dòng: [tên, giá, danh mục, loại hoa, màu, lượt bán]
const ROWS = [
  ["Rosy Morning", 450000, "Hoa tình yêu", "Hoa hồng", "Hồng", 120],
  ["Sunshine", 380000, "Hoa sinh nhật", "Hoa hướng dương", "Vàng", 86],
  ["Love in Pink", 520000, "Hoa tình yêu", "Hoa hồng", "Hồng", 150],
  ["White Elegance", 600000, "Hoa cưới", "Hoa hồng", "Trắng", 64],
  ["Lavender Dream", 420000, "Hoa theo mùa", "Khác", "Tím", 45],
  ["Sunny Day", 360000, "Hoa chúc mừng", "Hoa hướng dương", "Vàng", 98],
  ["Pink Love", 480000, "Hoa tình yêu", "Hoa hồng", "Hồng", 132],
  ["Gentle Touch", 550000, "Hoa dịp đặc biệt", "Hoa hồng", "Hồng", 71],
  ["Forever Yours", 560000, "Hoa tình yêu", "Hoa hồng", "Đỏ", 160],
  ["Pure White", 490000, "Hoa cưới", "Khác", "Trắng", 58],
  ["Sweet Bloom", 430000, "Hoa sinh nhật", "Hoa hồng", "Hồng", 93],
  ["Spring Garden", 620000, "Hoa theo mùa", "Khác", "Cam", 77]
];

// Lấy đường dẫn ảnh của một danh mục theo tên
function imageOfCategory(name) {
  const cats = makeSeedCategories();
  for (let i = 0; i < cats.length; i++) {
    if (cats[i].name === name) {
      return cats[i].image;
    }
  }
  return "";
}

function makeSeedProducts() {
  const cats = makeSeedCategories();
  const list = [];
  for (let i = 0; i < ROWS.length; i++) {
    const row = ROWS[i];
    const mainImage = imageOfCategory(row[2]);

    let rating = 5;
    if (i % 2 === 1) rating = 4.5;

    let isNew = false;
    if (i % 3 === 0 || i > 8) isNew = true;

    let isFeatured = false;
    if (i < 8) isFeatured = true;

    let typeText = row[3].toLowerCase();
    if (row[3] === "Khác") typeText = "hoa phối";

    list.push({
      id: i + 1,
      name: row[0],
      price: row[1],
      category: row[2],
      flowerType: row[3],
      color: row[4],
      sold: row[5],
      description: row[0] + " là bó " + typeText + " tông " + row[4].toLowerCase() + ", được cắm thủ công bởi florist của Lumière Flower.",
      image: mainImage,
      images: [mainImage, cats[(i + 1) % 6].image, cats[(i + 3) % 6].image],
      rating: rating,
      stock: 20,
      isNew: isNew,
      isFeatured: isFeatured,
      status: "active"
    });
  }
  return list;
}

// Đọc danh sách từ localStorage. Chưa có thì tạo từ dữ liệu mẫu rồi lưu lại.
function readList(key, makeSeed) {
  let list = load(key, null);
  if (list === null) {
    list = makeSeed();
    save(key, list);
  }
  return list;
}

// ===================== DANH MỤC =====================

// showAll = true: lấy cả danh mục đang ẩn (dùng trong trang quản trị)
export function getCategories(showAll) {
  const all = readList(CATEGORY_KEY, makeSeedCategories);
  if (showAll) {
    return all;
  }
  const result = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].status !== "hidden") {
      result.push(all[i]);
    }
  }
  return result;
}

// Kiểm tra tên danh mục đã có chưa (bỏ qua danh mục có id = exceptId)
function categoryNameExists(list, name, exceptId) {
  for (let i = 0; i < list.length; i++) {
    const sameName = list[i].name.toLowerCase() === name.toLowerCase();
    if (sameName && list[i].id !== exceptId) {
      return true;
    }
  }
  return false;
}

// Thêm mới (không có d.id) hoặc cập nhật (có d.id)
export function saveCategory(d) {
  const list = getCategories(true);
  const name = d.name.trim();

  if (name === "") {
    return { ok: false, msg: "Tên danh mục không được để trống" };
  }
  if (categoryNameExists(list, name, d.id)) {
    return { ok: false, msg: "Tên danh mục đã tồn tại" };
  }

  if (d.id) {
    // ----- Sửa -----
    let cat = null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === d.id) cat = list[i];
    }
    if (cat === null) {
      return { ok: false, msg: "Không tìm thấy danh mục" };
    }
    // Nếu đổi tên thì các sản phẩm thuộc danh mục cũng đổi theo
    if (cat.name !== name) {
      const products = readList(PRODUCT_KEY, makeSeedProducts);
      for (let i = 0; i < products.length; i++) {
        if (products[i].category === cat.name) {
          products[i].category = name;
        }
      }
      save(PRODUCT_KEY, products);
    }
    cat.name = name;
    cat.image = d.image.trim();
    cat.status = d.status;
  } else {
    // ----- Thêm mới -----
    list.push({ id: nextId(list), name: name, image: d.image.trim(), status: d.status });
  }

  save(CATEGORY_KEY, list);
  return { ok: true };
}

export function deleteCategory(id) {
  const list = getCategories(true);
  let cat = null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) cat = list[i];
  }
  if (cat === null) {
    return { ok: false, msg: "Không tìm thấy danh mục" };
  }

  // Không cho xóa nếu còn sản phẩm thuộc danh mục này
  const products = getProducts(true);
  for (let i = 0; i < products.length; i++) {
    if (products[i].category === cat.name) {
      return { ok: false, msg: "Danh mục đang có sản phẩm, không thể xóa" };
    }
  }

  const newList = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id !== id) newList.push(list[i]);
  }
  save(CATEGORY_KEY, newList);
  return { ok: true };
}

// ===================== SẢN PHẨM =====================

export function getProducts(showAll) {
  const all = readList(PRODUCT_KEY, makeSeedProducts);
  if (showAll) {
    return all;
  }
  const result = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].status !== "hidden") {
      result.push(all[i]);
    }
  }
  return result;
}

// Tìm 1 sản phẩm theo id. Không thấy thì trả về null.
export function getProduct(id, showAll) {
  const list = getProducts(showAll);
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === Number(id)) {
      return list[i];
    }
  }
  return null;
}

// Thêm mới (không có d.id) hoặc cập nhật (có d.id)
export function saveProduct(d) {
  const list = readList(PRODUCT_KEY, makeSeedProducts);
  const name = d.name.trim();

  if (name === "") {
    return { ok: false, msg: "Tên sản phẩm không được để trống" };
  }

  if (d.id) {
    // ----- Sửa -----
    let p = null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === d.id) p = list[i];
    }
    if (p === null) {
      return { ok: false, msg: "Không tìm thấy sản phẩm" };
    }
    p.name = name;
    p.price = Number(d.price);
    p.stock = Number(d.stock);
    p.category = d.category;
    p.flowerType = d.flowerType;
    p.color = d.color;
    p.image = d.image.trim();
    p.images[0] = p.image; // ảnh đầu tiên luôn là ảnh chính
    p.description = d.description.trim();
    p.isNew = d.isNew;
    p.isFeatured = d.isFeatured;
    p.status = d.status;
  } else {
    // ----- Thêm mới -----
    const image = d.image.trim();
    list.push({
      id: nextId(list),
      name: name,
      price: Number(d.price),
      stock: Number(d.stock),
      category: d.category,
      flowerType: d.flowerType,
      color: d.color,
      image: image,
      images: [image, image, image],
      description: d.description.trim(),
      isNew: d.isNew,
      isFeatured: d.isFeatured,
      status: d.status,
      rating: 5,
      sold: 0
    });
  }

  save(PRODUCT_KEY, list);
  return { ok: true };
}

export function deleteProduct(id) {
  const list = readList(PRODUCT_KEY, makeSeedProducts);
  const newList = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id !== id) newList.push(list[i]);
  }
  save(PRODUCT_KEY, newList);
}

// Cộng / trừ tồn kho và lượt bán. Dùng khi đặt đơn (số âm) hoặc hủy đơn (số dương).
export function changeStock(id, stockChange, soldChange) {
  const list = readList(PRODUCT_KEY, makeSeedProducts);
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].stock = Math.max(0, list[i].stock + stockChange);
      list[i].sold = Math.max(0, (list[i].sold || 0) + soldChange);
    }
  }
  save(PRODUCT_KEY, list);
}
