// ============================================================================
// BODY SCENT — Shared Frontend Logic (script.js)
// Auto-detects page elements across index.html, product.html, order.html, admin.html
// Persists orders in localStorage under key: "bodyScentOrders"
// ============================================================================

const CONFIG = {
  productsUrl: "products.json",
  ordersStorageKey: "bodyScentOrders",
  fallbackImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80"
};

const MOOD_FILTERS = [
  { key: "all", label: "ทั้งหมด", dotClass: "" },
  { key: "fresh", label: "Fresh", dotClass: "mood-dot--fresh" },
  { key: "sweet", label: "Sweet", dotClass: "mood-dot--sweet" },
  { key: "confident", label: "Confident", dotClass: "mood-dot--confident" },
  { key: "romance", label: "Romance", dotClass: "mood-dot--romance" }
];

const MOOD_META = {
  fresh: { label: "Fresh", dotClass: "mood-dot--fresh", iconClass: "mood-icon--fresh" },
  sweet: { label: "Sweet", dotClass: "mood-dot--sweet", iconClass: "mood-icon--sweet" },
  confident: { label: "Confident", dotClass: "mood-dot--confident", iconClass: "mood-icon--confident" },
  romance: { label: "Romance", dotClass: "mood-dot--romance", iconClass: "mood-icon--romance" }
};

let catalogProducts = [];
let selectedMood = "all";

document.addEventListener("DOMContentLoaded", async () => {
  const filterBar = document.getElementById("filter-bar");
  const productList = document.getElementById("product-list");
  const orderForm = document.getElementById("orderForm");
  const ordersTbody = document.querySelector("#ordersTable tbody");

  if (filterBar || productList) {
    selectedMood = resolveMoodFromQuery();
    await initProductView(filterBar, productList);
  }

  if (orderForm) {
    initOrderView(orderForm);
  }

  if (ordersTbody) {
    initAdminView(ordersTbody);
  }
});

// ============================================================================
// 1. Product Catalog & Mood Filtering (#filter-bar, #product-list)
// ============================================================================
function resolveMoodFromQuery() {
  try {
    const params = new URLSearchParams(window.location.search);
    const paramMood = (params.get("mood") || "").trim().toLowerCase();
    if (!paramMood || paramMood === "all") return "all";
    return Object.prototype.hasOwnProperty.call(MOOD_META, paramMood) ? paramMood : "all";
  } catch (err) {
    return "all";
  }
}

async function initProductView(filterBar, productList) {
  if (filterBar) {
    renderMoodFilterButtons(filterBar, selectedMood);
    filterBar.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mood]");
      if (!button) return;
      selectedMood = (button.getAttribute("data-mood") || "all").toLowerCase();
      setActiveMoodButton(filterBar, selectedMood);
      if (productList) {
        renderProductGrid(catalogProducts, productList, selectedMood);
      }
    });
  }

  if (!productList) return;

  try {
    const response = await fetch(CONFIG.productsUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = await response.json();
    catalogProducts = Array.isArray(json) ? json : [];
    renderProductGrid(catalogProducts, productList, selectedMood);
  } catch (error) {
    console.error("Error loading products.json:", error);
    productList.innerHTML = `
      <div class="panel" style="grid-column: 1 / -1; text-align: center;">
        <p style="margin-bottom: 8px;">ไม่สามารถโหลดข้อมูลสินค้าจาก products.json ได้</p>
        <p style="font-size: 0.85rem; color: var(--ink-muted);">
          กรุณาเปิดผ่านเว็บเซิร์ฟเวอร์หรือ Live Server เพื่อให้เบราว์เซอร์โหลดไฟล์ JSON ได้ตามปกติ
        </p>
      </div>
    `;
  }
}

function renderMoodFilterButtons(container, activeMood) {
  container.innerHTML = MOOD_FILTERS.map((item) => {
    const isActive = item.key === activeMood ? "active" : "";
    const dotExtraClass = item.dotClass ? ` ${item.dotClass}` : "";
    return `
      <button
        type="button"
        class="filter-btn ${isActive}"
        data-mood="${escapeAttr(item.key)}"
      >
        <span class="mood-dot${dotExtraClass}" aria-hidden="true"></span>
        <span>${escapeHtml(item.label)}</span>
      </button>
    `;
  }).join("");
}

function setActiveMoodButton(container, activeMood) {
  container.querySelectorAll("[data-mood]").forEach((btn) => {
    const btnMood = (btn.getAttribute("data-mood") || "").toLowerCase();
    btn.classList.toggle("active", btnMood === activeMood);
  });
}

function renderProductGrid(products, container, moodFilter) {
  const normalized = (moodFilter || "all").toLowerCase();
  const visibleItems =
    normalized === "all"
      ? products
      : products.filter((p) => String(p.mood || "").toLowerCase() === normalized);

  if (!visibleItems.length) {
    container.innerHTML = `
      <div class="panel" style="grid-column: 1 / -1; text-align: center;">
        <p style="color: var(--ink-secondary);">ไม่พบสินค้าในหมวดกลิ่นที่เลือก</p>
      </div>
    `;
    return;
  }

  container.innerHTML = visibleItems
    .map((product) => {
      const moodKey = String(product.mood || "").toLowerCase();
      const moodInfo = MOOD_META[moodKey] || {
        label: product.mood || "Scent",
        dotClass: "",
        iconClass: ""
      };
      const imageUrl = escapeAttr(product.image || CONFIG.fallbackImage);
      const itemParam = encodeURIComponent(product.name ?? "");
      const priceParam = encodeURIComponent(Number(product.price) || 0);
      const orderLink = `order.html?item=${itemParam}&price=${priceParam}`;

      return `
        <article class="product-card" data-mood="${escapeAttr(moodKey)}" data-id="${escapeAttr(product.id)}">
          <div class="product-media">
            <img
              src="${imageUrl}"
              alt="${escapeAttr(product.name)}"
              loading="lazy"
              onerror="this.onerror=null;this.src='${escapeAttr(CONFIG.fallbackImage)}';"
            />
          </div>
          <div class="product-content">
            <div class="product-top-meta">
              <span class="mood-label">
                <span class="mood-dot ${moodInfo.dotClass}" aria-hidden="true"></span>
                <span class="mood-icon ${moodInfo.iconClass}" aria-hidden="true">✦</span>
                <span>${escapeHtml(moodInfo.label)}</span>
              </span>
              <span class="product-type">${escapeHtml(product.type || "")}</span>
            </div>
            <h3 class="product-title">${escapeHtml(product.name)}</h3>
            <div class="product-size">ไซส์: ${escapeHtml(product.size || "-")}</div>
            <p class="product-desc">${escapeHtml(product.description || "")}</p>
            <div class="product-bottom">
              <span class="product-price">${formatBaht(product.price)}</span>
              <a class="btn-order-link" href="${escapeAttr(orderLink)}">สั่งซื้อ</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// ============================================================================
// 2. Order Form & localStorage Persistence (#orderForm)
// ============================================================================
function initOrderView(orderForm) {
  const customerNameInput = document.getElementById("customerName");
  const contactInput = document.getElementById("contact");
  const itemsInput = document.getElementById("items");
  const totalInput = document.getElementById("total");
  const noteInput = document.getElementById("note");

  const params = new URLSearchParams(window.location.search);
  const queryItem = params.get("item");
  const queryPrice = params.get("price");

  if (itemsInput) {
    itemsInput.value = queryItem !== null ? queryItem : "";
  }
  if (totalInput) {
    totalInput.value = queryPrice !== null ? queryPrice : "";
  }

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      const payload = {
        customerName: customerNameInput ? customerNameInput.value.trim() : "",
        contact: contactInput ? contactInput.value.trim() : "",
        items: itemsInput ? itemsInput.value.trim() : "",
        total: totalInput ? totalInput.value.trim() : "",
        note: noteInput ? noteInput.value.trim() : "",
        timestamp: new Date().toISOString()
      };

      const rawOrders = localStorage.getItem(CONFIG.ordersStorageKey);
      const parsedOrders = rawOrders ? JSON.parse(rawOrders) : [];
      const ordersArray = Array.isArray(parsedOrders) ? parsedOrders : [];

      ordersArray.push(payload);
      localStorage.setItem(CONFIG.ordersStorageKey, JSON.stringify(ordersArray));

      window.location.href = "thankyou.html";
    } catch (error) {
      console.error("Failed to save order to localStorage:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  });
}

// ============================================================================
// 3. Admin Orders Table (#ordersTable tbody)
// ============================================================================
function initAdminView(ordersTbody) {
  const orders = loadBodyScentOrders();
  const sortedLatestFirst = sortByLatestTimestamp(orders);
  renderOrdersTableBody(sortedLatestFirst, ordersTbody);
}

function loadBodyScentOrders() {
  try {
    const raw = localStorage.getItem(CONFIG.ordersStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read bodyScentOrders:", error);
    return [];
  }
}

function sortByLatestTimestamp(orders) {
  return orders
    .map((entry, idx) => ({ entry, idx }))
    .sort((a, b) => {
      const timeA = Date.parse(a.entry && a.entry.timestamp ? a.entry.timestamp : "");
      const timeB = Date.parse(b.entry && b.entry.timestamp ? b.entry.timestamp : "");
      const hasValidA = !Number.isNaN(timeA);
      const hasValidB = !Number.isNaN(timeB);

      if (hasValidA && hasValidB && timeB !== timeA) {
        return timeB - timeA;
      }
      if (hasValidB && !hasValidA) return 1;
      if (hasValidA && !hasValidB) return -1;
      return b.idx - a.idx;
    })
    .map((item) => item.entry);
}

function formatThaiTimestamp(isoOrDate) {
  if (!isoOrDate) return "";
  const dateObj = new Date(isoOrDate);
  if (Number.isNaN(dateObj.getTime())) {
    return String(isoOrDate);
  }
  return dateObj.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function renderOrdersTableBody(orders, tbody) {
  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 28px; color: var(--ink-muted);">
          ยังไม่มีคำสั่งซื้อ
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders
    .map((order) => {
      const formattedDate = formatThaiTimestamp(order.timestamp);
      const formattedTotal = formatOrderTotal(order.total);
      return `
        <tr>
          <td>${escapeHtml(formattedDate)}</td>
          <td>${escapeHtml(order.customerName ?? "")}</td>
          <td>${escapeHtml(order.contact ?? "")}</td>
          <td>${escapeHtml(order.items ?? "")}</td>
          <td>${escapeHtml(formattedTotal)}</td>
          <td>${escapeHtml(order.note ?? "")}</td>
        </tr>
      `;
    })
    .join("");
}

// ============================================================================
// Formatting & Escaping Helpers
// ============================================================================
function formatBaht(value) {
  const num = Number(value) || 0;
  return `${num.toLocaleString("th-TH")} บาท`;
}

function formatOrderTotal(rawTotal) {
  const cleaned = String(rawTotal ?? "").replace(/[^0-9.-]/g, "");
  if (cleaned !== "" && !Number.isNaN(Number(cleaned))) {
    return `${Number(cleaned).toLocaleString("th-TH")} บาท`;
  }
  return String(rawTotal ?? "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
