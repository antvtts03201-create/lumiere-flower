// ===== TRANG DANH MỤC: tìm kiếm, lọc, sắp xếp, phân trang =====
const PER_PAGE = 8;
const params = new URLSearchParams(location.search);
const state = { q: "", cats: params.get("cat") ? [params.get("cat")] : [], color: "", min: 0, max: Infinity, types: [], sort: "popular", page: 1 };
function applyFilters() {
  const list = getProducts().filter(p =>
    p.name.toLowerCase().includes(state.q.toLowerCase()) &&
    (!state.cats.length || state.cats.includes(p.category)) &&
    (!state.color || p.color === state.color) &&
    p.price >= state.min && p.price <= state.max &&
    (!state.types.length || state.types.includes(MAIN_TYPES.includes(p.flowerType) ? p.flowerType : "Khác")));
  const sorts = {
    popular: (a, b) => b.rating - a.rating, newest: (a, b) => b.id - a.id,
    asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price, name: (a, b) => a.name.localeCompare(b.name)
  };
  return list.sort(sorts[state.sort]);
}
function render() {
  const list = applyFilters(), pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  state.page = Math.min(state.page, pages);
  const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
  document.getElementById("grid").innerHTML = slice.length ? slice.map(card).join("") : "<p>Không tìm thấy sản phẩm phù hợp.</p>";
  document.getElementById("pager").innerHTML = Array.from({ length: pages }, (_, i) =>
    `<button class="pg ${i + 1 === state.page ? "on" : ""}" onclick="state.page=${i + 1};render()">${i + 1}</button>`).join("");
}
function setup() {
  const box = (arr, key) => arr.map(v => `<label><input type="checkbox" value="${v}" data-k="${key}" ${state[key].includes(v) ? "checked" : ""}> ${v}</label>`).join("");
  document.getElementById("catBox").innerHTML = box(CATEGORIES, "cats");
  document.getElementById("typeBox").innerHTML = box([...MAIN_TYPES, "Khác"], "types");
  document.getElementById("colorBox").innerHTML = Object.entries(COLORS).map(([n, c]) =>
    `<button class="dot" title="${n}" style="background:${c}" onclick="state.color=state.color==='${n}'?'':'${n}';document.querySelectorAll('.dot').forEach(d=>d.classList.toggle('on',d.title===state.color));state.page=1;render()"></button>`).join("");
  document.querySelectorAll("input[data-k]").forEach(i => i.onchange = () => {
    const arr = state[i.dataset.k]; i.checked ? arr.push(i.value) : arr.splice(arr.indexOf(i.value), 1); state.page = 1; render();
  });
  const s = document.getElementById("search"); s.oninput = () => { state.q = s.value; state.page = 1; render(); };
  if (params.get("focus")) s.focus();
  document.getElementById("sort").onchange = e => { state.sort = e.target.value; render(); };
  document.getElementById("applyPrice").onclick = () => {
    state.min = Number(document.getElementById("from").value) || 0;
    state.max = Number(document.getElementById("to").value) || Infinity; state.page = 1; render();
  };
  document.getElementById("allCats").onclick = () => { state.cats = []; document.querySelectorAll("[data-k=cats]").forEach(i => i.checked = false); render(); };
  render();
}
document.addEventListener("DOMContentLoaded", setup);
