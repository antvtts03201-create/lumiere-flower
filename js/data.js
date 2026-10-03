// ===== DỮ LIỆU & HÀM LƯU TRỮ DÙNG CHUNG =====

const CATEGORIES = ["Hoa tình yêu", "Hoa sinh nhật", "Hoa cưới", "Hoa chúc mừng", "Hoa dịp đặc biệt", "Hoa theo mùa"];
const COLORS = { "Đỏ": "#c0392b", "Hồng": "#f06292", "Trắng": "#eee", "Vàng": "#f4c20d", "Cam": "#f39c4a", "Tím": "#8e6bbf" };
const MAIN_TYPES = ["Hoa hồng", "Hoa hướng dương", "Hoa ly", "Hoa cẩm tú cầu", "Baby"];

// Tạo ảnh tạm: một hình vuông màu nền và một emoji ở giữa.
// Khi có ảnh thật, thay bằng đường dẫn, ví dụ "images/hoa1.jpg"
function pic(bgColor, emoji) {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'>" +
        "<rect width='400' height='500' fill='" + bgColor + "'/>" +
        "<text x='200' y='290' font-size='150' text-anchor='middle'>" + emoji + "</text></svg>";
    return "data:image/svg+xml," + encodeURIComponent(svg);
}

// Mỗi dòng: [tên, giá, danh mục, loại hoa, màu, màu nền ảnh, emoji]
const ROWS = [
    ["Rosy Morning", 450000, "Hoa tình yêu", "Hoa hồng", "Hồng", "#f8d7da", "🌹"],
    ["Sunshine", 380000, "Hoa sinh nhật", "Hoa hướng dương", "Vàng", "#fdeba8", "🌻"],
    ["Love in Pink", 520000, "Hoa tình yêu", "Hoa hồng", "Hồng", "#f5b7c5", "🌸"],
    ["White Elegance", 600000, "Hoa cưới", "Hoa hồng", "Trắng", "#f4efe9", "🤍"],
    ["Lavender Dream", 420000, "Hoa theo mùa", "Khác", "Tím", "#d9cdee", "💜"],
    ["Sunny Day", 360000, "Hoa chúc mừng", "Hoa hướng dương", "Vàng", "#fbe08a", "🌼"],
    ["Pink Love", 480000, "Hoa tình yêu", "Hoa hồng", "Hồng", "#f7c6d0", "💗"],
    ["Gentle Touch", 550000, "Hoa dịp đặc biệt", "Hoa hồng", "Hồng", "#f9dde0", "🌷"],
    ["Forever Yours", 560000, "Hoa tình yêu", "Hoa hồng", "Đỏ", "#e9a7a7", "❤️"],
    ["Pure White", 490000, "Hoa cưới", "Khác", "Trắng", "#eef0ea", "🕊️"],
    ["Sweet Bloom", 430000, "Hoa sinh nhật", "Hoa hồng", "Hồng", "#fad0d9", "🌺"],
    ["Spring Garden", 620000, "Hoa theo mùa", "Khác", "Cam", "#fbd9bd", "💐"]
];

// Biến mỗi dòng của ROWS thành một sản phẩm (object)
const SEED_PRODUCTS = [];
for (let i = 0; i < ROWS.length; i++) {
    const row = ROWS[i];

    // Đặt tên cho từng phần để dễ đọc
    const name = row[0];
    const price = row[1];
    const category = row[2];
    const flowerType = row[3];
    const color = row[4];
    const bgColor = row[5];
    const emoji = row[6];

    // Đánh giá: sản phẩm số lẻ 4.5 sao, số chẵn 5 sao
    let rating = 5;
    if (i % 2 === 1) {
        rating = 4.5;
    }

    // Sản phẩm mới: vị trí 0, 3, 6, 9, 10, 11
    let isNew = false;
    if (i % 3 === 0 || i > 8) {
        isNew = true;
    }

    // Nổi bật: 8 sản phẩm đầu tiên
    let isFeatured = false;
    if (i < 8) {
        isFeatured = true;
    }

    const product = {
        id: i + 1,
        name: name,
        price: price,
        category: category,
        flowerType: flowerType,
        color: color,
        description: name + " là bó hoa " + flowerType.toLowerCase() + " tông " + color.toLowerCase() + ", được cắm thủ công bởi florist của Lumière Flower.",
        image: pic(bgColor, emoji),
        images: [pic(bgColor, emoji), pic(bgColor, "🌿"), pic(bgColor, "🎀")],
        rating: rating,
        stock: 20,
        isNew: isNew,
        isFeatured: isFeatured,
        status: "active"
    };
    SEED_PRODUCTS.push(product);
}

// ----- Hàm lưu trữ localStorage -----
// Đọc dữ liệu từ localStorage. Nếu chưa có hoặc dữ liệu bị lỗi thì trả về giá trị mặc định.
function load(key, defaultValue) {
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
// Lưu dữ liệu vào localStorage (chuyển thành chuỗi bằng JSON.stringify)
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Định dạng tiền: 450000 -> "450.000đ"
function money(n) {
    return n.toLocaleString("vi-VN") + "đ";
}

// Lấy danh sách sản phẩm (bỏ qua sản phẩm bị ẩn).
// Lần đầu chưa có dữ liệu thì nạp dữ liệu mẫu.
function getProducts() {
    let list = load("products", null);
    if (list === null) {
        list = SEED_PRODUCTS;
        save("products", list);
    }

    const result = [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].status !== "hidden") {
            result.push(list[i]);
        }
    }
    return result;
}

// Tìm 1 sản phẩm theo id
function getProduct(id) {
    const list = getProducts();
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === Number(id)) {
            return list[i];
        }
    }
    return undefined;
}