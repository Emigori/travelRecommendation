// Súper simple: carga JSON, busca por palabra y pinta tarjetas.
const $ = (sel) => document.querySelector(sel);
let DATA = null;

async function loadData() {
  try {
    const res = await fetch("./travel_recommendation_api.json");
    DATA = await res.json();
    // console.log("DATA:", DATA); // para verificar
  } catch (e) {
    console.error("No se pudo cargar el JSON", e);
  }
}

function norm(s) {
  return (s || "").toLowerCase().trim();
}

function detectKeyword(q) {
  // acepta variaciones básicas
  const x = norm(q);
  if (!x) return null;

  // playas
  if (x.includes("playa")) return "beaches";
  if (x.includes("beach") || x.includes("beaches")) return "beaches";

  // templos
  if (x.includes("templo") || x.includes("templos")) return "temples";
  if (x.includes("temple") || x.includes("temples")) return "temples";

  // país / pais / country
  if (x.includes("país") || x.includes("pais") || x.includes("country") || x.includes("countries"))
    return "countries";

  return null;
}

function countryItems() {
  // aplana countries -> cities
  const arr = [];
  (DATA.countries || []).forEach(c =>
    (c.cities || []).forEach(ct => arr.push(ct))
  );
  return arr;
}

function buildTimeHTML(tz) {
  if (!tz) return "";
  const opts = { timeZone: tz, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const now = new Date().toLocaleTimeString('en-US', opts);
  return `<small>Time now: ${now} (${tz})</small>`;
}

function render(items) {
  const box = $("#results");
  box.innerHTML = items.map(it => `
    <article class="card">
      <img src="${it.imageUrl}" alt="${it.name}">
      <div class="b">
        <h3>${it.name}</h3>
        <p>${it.description || ""}</p>
        ${buildTimeHTML(it.timeZone)}
        <div style="margin-top:8px">
          <a class="pill" href="https://www.google.com/search?q=${encodeURIComponent(it.name)}" target="_blank" rel="noopener">Visit</a>
        </div>
      </div>
    </article>
  `).join("");
}

function onSearch() {
  const q = $("#q").value;
  const key = detectKeyword(q);
  if (!DATA || !key) { render([]); return; }

  let items = [];
  if (key === "beaches") items = DATA.beaches || [];
  else if (key === "temples") items = DATA.temples || [];
  else if (key === "countries") items = countryItems();

  render(items);
}

function onClear() {
  $("#q").value = "";
  $("#results").innerHTML = "";
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  $("#searchBtn")?.addEventListener("click", onSearch);
  $("#clearBtn")?.addEventListener("click", onClear);
});