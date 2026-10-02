// ===== DỮ LIỆU & HÀM LƯU TRỮ DÙNG CHUNG =====
const CATEGORIES = ["Hoa tình yêu","Hoa sinh nhật","Hoa cưới","Hoa chúc mừng","Hoa dịp đặc biệt","Hoa theo mùa"];
const COLORS = {"Đỏ":"#c0392b","Hồng":"#f06292","Trắng":"#eee","Vàng":"#f4c20d","Cam":"#f39c4a","Tím":"#8e6bbf"};
const MAIN_TYPES = ["Hoa hồng","Hoa hướng dương","Hoa ly","Hoa cẩm tú cầu","Baby"];
// Ảnh tạm (SVG). Muốn dùng ảnh thật: thay image/images bằng đường dẫn assets/images/...
const pic = (bg, e) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><rect width='400' height='500' fill='${bg}'/><text x='200' y='290' font-size='150' text-anchor='middle'>${e}</text></svg>`);
const ROWS = [
 ["Rosy Morning",450000,"Hoa tình yêu","Hoa hồng","Hồng","#f8d7da","🌹"],
 ["Sunshine",380000,"Hoa sinh nhật","Hoa hướng dương","Vàng","#fdeba8","🌻"],
 ["Love in Pink",520000,"Hoa tình yêu","Hoa hồng","Hồng","#f5b7c5","🌸"],
 ["White Elegance",600000,"Hoa cưới","Hoa hồng","Trắng","#f4efe9","🤍"],
 ["Lavender Dream",420000,"Hoa theo mùa","Khác","Tím","#d9cdee","💜"],
 ["Sunny Day",360000,"Hoa chúc mừng","Hoa hướng dương","Vàng","#fbe08a","🌼"],
 ["Pink Love",480000,"Hoa tình yêu","Hoa hồng","Hồng","#f7c6d0","💗"],
 ["Gentle Touch",550000,"Hoa dịp đặc biệt","Hoa hồng","Hồng","#f9dde0","🌷"],
 ["Forever Yours",560000,"Hoa tình yêu","Hoa hồng","Đỏ","#e9a7a7","❤️"],
 ["Pure White",490000,"Hoa cưới","Khác","Trắng","#eef0ea","🕊️"],
 ["Sweet Bloom",430000,"Hoa sinh nhật","Hoa hồng","Hồng","#fad0d9","🌺"],
 ["Spring Garden",620000,"Hoa theo mùa","Khác","Cam","#fbd9bd","💐"]];
const SEED_PRODUCTS = ROWS.map((r,i) => ({
  id:i+1, name:r[0], price:r[1], category:r[2], flowerType:r[3], color:r[4],
  description:`${r[0]} là bó hoa ${r[3].toLowerCase()} tông ${r[4].toLowerCase()}, được cắm thủ công bởi florist của Lumière Flower.`,
  image:pic(r[5],r[6]), images:[pic(r[5],r[6]),pic(r[5],"🌿"),pic(r[5],"🎀")],
  rating:i%2?4.5:5, stock:20, isNew:i%3===0||i>8, isFeatured:i<8, status:"active"}));

const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const money = n => n.toLocaleString("vi-VN") + "đ";
// Sản phẩm lấy từ localStorage (admin sửa → client thấy), lần đầu nạp dữ liệu mẫu
function getProducts() {
  let list = load("products", null);
  if (!list) { list = SEED_PRODUCTS; save("products", list); }
  return list.filter(p => p.status !== "hidden");
}
const getProduct = id => getProducts().find(p => p.id === Number(id));
