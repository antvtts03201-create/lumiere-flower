// ===== TRANG GIỎ HÀNG =====
import { money } from "../storage.js";
import { totals, changeQty, removeItem, applyCoupon, getCoupon } from "../cart.js";
import { initLayout, icon, toast, updateBadge, esc } from "../ui.js";
initLayout();

function byId(id) {
  return document.getElementById(id);
}

// HTML cho 1 dòng sản phẩm trong giỏ
function cartRow(item) {
  let html = '<div class="crow">';
  html += `<img src="${esc(item.image)}" alt="">`;
  html += `<b>${esc(item.name)}</b>`;
  html += `<span>${money(item.price)}</span>`;
  html += '<div class="qty">';
  html += `<button data-act="dec" data-id="${item.id}">-</button>`;
  html += `<span>${item.qty}</span>`;
  html += `<button data-act="inc" data-id="${item.id}">+</button>`;
  html += "</div>";
  html += `<span>${money(item.price * item.qty)}</span>`;
  html += `<button class="del" data-act="del" data-id="${item.id}" aria-label="Xóa">${icon("trash")}</button>`;
  html += "</div>";
  return html;
}

// Vẽ lại giỏ hàng và bảng tổng tiền
function render() {
  const t = totals(false);

  let cartHtml = "";
  if (t.items.length === 0) {
    cartHtml = "<p>Giỏ hàng đang trống. <a href='products.html' style='color:var(--rose)'>Mua sắm ngay</a></p>";
  } else {
    cartHtml = t.items.map(cartRow).join("");
  }
  byId("cartBody").innerHTML = cartHtml;

  let sumHtml = `<p>Tạm tính <b>${money(t.sub)}</b></p>`;
  sumHtml += `<p>Giảm giá <b>-${money(t.discount)}</b></p>`;
  sumHtml += `<p>Phí vận chuyển <b>${money(t.ship)}</b></p>`;
  sumHtml += `<h3>Tổng tiền <b>${money(t.total)}</b></h3>`;
  byId("sum").innerHTML = sumHtml;

  updateBadge();
}

// Bấm nút +, -, xóa trong giỏ
byId("cartBody").addEventListener("click", function (e) {
  const button = e.target.closest("[data-act]");
  if (button === null) return;

  const id = Number(button.dataset.id);
  const act = button.dataset.act;

  if (act === "del") {
    removeItem(id);
    toast("Đã xóa sản phẩm");
  } else if (act === "inc") {
    const result = changeQty(id, 1);
    if (!result.ok) toast(result.msg);
  } else if (act === "dec") {
    changeQty(id, -1);
  }
  render();
});

// Áp dụng mã giảm giá
function useCoupon() {
  const ok = applyCoupon(byId("coupon").value);
  if (ok) {
    toast("Áp dụng mã " + getCoupon());
  } else {
    toast("Mã không hợp lệ");
  }
  render();
}
byId("applyCoupon").onclick = useCoupon;
byId("coupon").addEventListener("keydown", function (e) {
  if (e.key === "Enter") useCoupon();
});

byId("coupon").value = getCoupon();
render();
