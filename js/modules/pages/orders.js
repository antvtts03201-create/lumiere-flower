// ===== TRANG LỊCH SỬ ĐƠN HÀNG CỦA KHÁCH =====
import { money } from "../storage.js";
import { requireLogin } from "../auth.js";
import { getMyOrders, cancelMyOrder } from "../orders.js";
import { initLayout, toast, esc, stClass } from "../ui.js";

initLayout();

const list = document.getElementById("orderList");

// HTML cho 1 sản phẩm trong đơn
function itemRow(item) {
  let html = '<div class="oitem">';
  html += `<img src="${esc(item.image)}" alt="">`;
  html += `<span>${esc(item.name)} × ${item.qty}</span>`;
  html += `<b>${money(item.price * item.qty)}</b>`;
  html += "</div>";
  return html;
}

// HTML cho 1 đơn hàng
function orderCard(o) {
  // Chỉ đơn "Chờ xử lý" mới có nút hủy
  let cancelButton = "";
  if (o.status === "Chờ xử lý") {
    cancelButton = `<br><button class="btn ghost sm" data-cancel="${o.id}">Hủy đơn</button>`;
  }

  let html = '<div class="ocard">';
  html += '<div class="ohead">';
  html += `<b>#${esc(o.id)}</b><span>${esc(o.date)}</span>`;
  html += `<span class="st ${stClass(o.status)}">${o.status}</span>`;
  html += "</div>";
  html += o.items.map(itemRow).join("");
  html += '<div class="ofoot">';
  html += `<span>Giao tới: ${esc(o.address)}<br>Thanh toán: ${esc(o.payment)}</span>`;
  html += `<div><b>Tổng: ${money(o.total)}</b>${cancelButton}</div>`;
  html += "</div></div>";
  return html;
}

function render() {
  const orders = getMyOrders();
  if (orders.length === 0) {
    list.innerHTML = "<p>Bạn chưa có đơn hàng nào. <a href='products.html' style='color:var(--rose)'>Mua sắm ngay</a></p>";
  } else {
    list.innerHTML = orders.map(orderCard).join("");
  }
}

if (requireLogin()) {
  // Bấm "Hủy đơn"
  list.addEventListener("click", function (e) {
    const button = e.target.closest("[data-cancel]");
    if (button === null) return;
    if (!confirm("Bạn chắc chắn muốn hủy đơn này?")) return;

    if (cancelMyOrder(button.dataset.cancel)) {
      toast("Đã hủy đơn hàng");
    } else {
      toast("Không thể hủy đơn này");
    }
    render();
  });
  render();
}
