'use strict';

// StockWise demonstrates variables, arrays, objects, functions, loops,
// conditionals, DOM manipulation, events, filtering, and localStorage.

const STORAGE_KEY = 'stockwise-products-v1';
const starterProducts = [
  { id: 101, name: 'Wireless Keyboard', category: 'Electronics', price: 1499, quantity: 18 },
  { id: 102, name: 'USB-C Hub', category: 'Electronics', price: 2199, quantity: 4 },
  { id: 103, name: 'Desk Organizer', category: 'Office', price: 599, quantity: 26 },
  { id: 104, name: 'Notebook Set', category: 'Office', price: 249, quantity: 3 },
  { id: 105, name: 'Insulated Bottle', category: 'Lifestyle', price: 799, quantity: 12 },
  { id: 106, name: 'LED Desk Lamp', category: 'Electronics', price: 1899, quantity: 0 },
  { id: 107, name: 'Canvas Tote Bag', category: 'Lifestyle', price: 399, quantity: 31 }
];

const $ = (selector) => document.querySelector(selector);
const tableBody = $('#productTable');
const dialog = $('#productDialog');
const form = $('#productForm');
let products = loadProducts();
let toastTimeout;

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterProducts.map((product) => ({ ...product }));
  } catch (error) {
    console.warn('Could not load saved inventory. Using demo products.', error);
    return starterProducts.map((product) => ({ ...product }));
  }
}

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    showToast('Could not save in this browser. Export a CSV backup.');
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2
  }).format(amount);
}

function getStockStatus(quantity) {
  if (quantity === 0) return { label: 'Out of stock', className: 'out' };
  if (quantity <= 5) return { label: 'Low stock', className: 'low' };
  return { label: 'In stock', className: 'healthy' };
}

function getFilteredProducts() {
  const search = $('#searchInput').value.trim().toLowerCase();
  const category = $('#categoryFilter').value;
  const stock = $('#stockFilter').value;

  return products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search)
      || product.category.toLowerCase().includes(search);
    const matchesCategory = category === 'all' || product.category === category;
    let matchesStock = true;
    if (stock === 'low') matchesStock = product.quantity > 0 && product.quantity <= 5;
    if (stock === 'healthy') matchesStock = product.quantity > 5;
    if (stock === 'out') matchesStock = product.quantity === 0;
    return matchesSearch && matchesCategory && matchesStock;
  });
}

function renderStats() {
  let totalUnits = 0;
  let inventoryValue = 0;
  let lowStockCount = 0;

  // Loop through objects in the products array to calculate analytics.
  for (const product of products) {
    totalUnits += product.quantity;
    inventoryValue += product.price * product.quantity;
    if (product.quantity <= 5) lowStockCount += 1;
  }

  $('#totalProducts').textContent = products.length.toLocaleString('en-IN');
  $('#totalUnits').textContent = totalUnits.toLocaleString('en-IN');
  $('#inventoryValue').textContent = formatCurrency(inventoryValue);
  $('#lowStockCount').textContent = lowStockCount.toLocaleString('en-IN');
  $('#alertBadge').textContent = lowStockCount;
}

function renderCategories() {
  const currentValue = $('#categoryFilter').value;
  const categories = [...new Set(products.map((product) => product.category))]
    .sort((a, b) => a.localeCompare(b));
  $('#categoryFilter').innerHTML = '<option value="all">All categories</option>';

  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    $('#categoryFilter').appendChild(option);
  }

  $('#categoryFilter').value = categories.includes(currentValue) ? currentValue : 'all';

  const totals = {};
  for (const product of products) {
    totals[product.category] = (totals[product.category] || 0) + product.quantity;
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map((entry) => entry[1]));
  const chart = $('#categoryChart');
  chart.replaceChildren();

  if (entries.length === 0) {
    chart.innerHTML = '<p class="muted">Add products to see category totals.</p>';
    return;
  }

  for (const [category, quantity] of entries) {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const name = document.createElement('span');
    name.textContent = category;
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${(quantity / max) * 100}%`;
    track.appendChild(fill);
    const count = document.createElement('span');
    count.className = 'bar-count';
    count.textContent = quantity;
    row.append(name, track, count);
    chart.appendChild(row);
  }
}

function renderAlerts() {
  const alerts = products.filter((product) => product.quantity <= 5)
    .sort((a, b) => a.quantity - b.quantity);
  const container = $('#stockAlerts');
  container.replaceChildren();

  if (alerts.length === 0) {
    const message = document.createElement('p');
    message.className = 'muted';
    message.textContent = 'All products have healthy stock levels.';
    container.appendChild(message);
    return;
  }

  for (const product of alerts) {
    const row = document.createElement('div');
    row.className = 'alert-row';
    const symbol = document.createElement('span');
    symbol.className = 'alert-symbol';
    symbol.textContent = product.quantity === 0 ? '×' : '!';
    const text = document.createElement('div');
    text.className = 'alert-text';
    const name = document.createElement('strong');
    name.textContent = product.name;
    const category = document.createElement('small');
    category.textContent = product.category;
    text.append(name, category);
    const qty = document.createElement('span');
    qty.className = 'alert-qty';
    qty.textContent = product.quantity === 0 ? 'Out of stock' : `${product.quantity} left`;
    row.append(symbol, text, qty);
    container.appendChild(row);
  }
}

function renderTable() {
  const filtered = getFilteredProducts();
  tableBody.replaceChildren();
  $('#emptyState').hidden = filtered.length !== 0;

  for (const product of filtered) {
    const row = document.createElement('tr');
    const productCell = document.createElement('td');
    const productInfo = document.createElement('div');
    productInfo.className = 'product-cell';
    const avatar = document.createElement('span');
    avatar.className = 'product-avatar';
    avatar.textContent = product.name.trim().slice(0, 1).toUpperCase() || '?';
    const details = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = product.name;
    const sku = document.createElement('div');
    sku.className = 'product-sku';
    sku.textContent = `SKU-${String(product.id).slice(-5)}`;
    details.append(name, sku);
    productInfo.append(avatar, details);
    productCell.appendChild(productInfo);

    const category = document.createElement('td');
    const categoryPill = document.createElement('span');
    categoryPill.className = 'category-pill';
    categoryPill.textContent = product.category;
    category.appendChild(categoryPill);

    const price = document.createElement('td');
    price.className = 'price';
    price.textContent = formatCurrency(product.price);
    const quantity = document.createElement('td');
    quantity.textContent = product.quantity.toLocaleString('en-IN');

    const statusCell = document.createElement('td');
    const status = getStockStatus(product.quantity);
    const statusPill = document.createElement('span');
    statusPill.className = `stock-pill ${status.className}`;
    statusPill.textContent = status.label;
    statusCell.appendChild(statusPill);

    const value = document.createElement('td');
    value.className = 'value';
    value.textContent = formatCurrency(product.price * product.quantity);

    const actions = document.createElement('td');
    const buttons = document.createElement('div');
    buttons.className = 'action-buttons';
    const edit = document.createElement('button');
    edit.className = 'action-btn';
    edit.textContent = 'Edit';
    edit.setAttribute('aria-label', `Edit ${product.name}`);
    edit.addEventListener('click', () => openEditDialog(product.id));
    const remove = document.createElement('button');
    remove.className = 'action-btn delete';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${product.name}`);
    remove.addEventListener('click', () => deleteProduct(product.id));
    buttons.append(edit, remove);
    actions.appendChild(buttons);

    row.append(productCell, category, price, quantity, statusCell, value, actions);
    tableBody.appendChild(row);
  }
  $('#resultCount').textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
}

function renderAll() {
  renderStats();
  renderCategories();
  renderAlerts();
  renderTable();
}

function openAddDialog() {
  form.reset();
  $('#productId').value = '';
  $('#dialogTitle').textContent = 'Add product';
  $('#formError').textContent = '';
  dialog.showModal();
  $('#productName').focus();
}

function openEditDialog(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  $('#productId').value = product.id;
  $('#productName').value = product.name;
  $('#productCategory').value = product.category;
  $('#productPrice').value = product.price;
  $('#productQuantity').value = product.quantity;
  $('#dialogTitle').textContent = 'Edit product';
  $('#formError').textContent = '';
  dialog.showModal();
}

function deleteProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  if (!window.confirm(`Delete "${product.name}" from inventory?`)) return;
  products = products.filter((item) => item.id !== id);
  saveProducts();
  renderAll();
  showToast('Product deleted.');
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function exportCSV() {
  const headings = ['ID', 'Product', 'Category', 'Unit Price INR', 'Quantity', 'Inventory Value INR'];
  const rows = products.map((product) => [
    product.id, product.name, product.category, product.price, product.quantity,
    (product.price * product.quantity).toFixed(2)
  ]);
  const csvCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [headings, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'stockwise-inventory.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('CSV export started.');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const idValue = $('#productId').value;
  const name = $('#productName').value.trim();
  const category = $('#productCategory').value.trim();
  const price = Number($('#productPrice').value);
  const quantity = Number($('#productQuantity').value);

  if (!name || !category || !Number.isFinite(price) || price < 0
      || !Number.isInteger(quantity) || quantity < 0) {
    $('#formError').textContent = 'Enter a name, category, valid price, and whole-number quantity (0 or more).';
    return;
  }

  if (idValue) {
    const id = Number(idValue);
    products = products.map((product) => product.id === id
      ? { ...product, name, category, price, quantity } : product);
    showToast('Product updated.');
  } else {
    products.push({ id: Date.now(), name, category, price, quantity });
    showToast('Product added.');
  }

  saveProducts();
  dialog.close();
  renderAll();
});

$('#addProductTop').addEventListener('click', openAddDialog);
$('#closeDialog').addEventListener('click', () => dialog.close());
$('#cancelDialog').addEventListener('click', () => dialog.close());
$('#searchInput').addEventListener('input', renderTable);
$('#categoryFilter').addEventListener('change', renderTable);
$('#stockFilter').addEventListener('change', renderTable);
$('#exportBtn').addEventListener('click', exportCSV);

// Initial render populates the dashboard from saved or demo data.
renderAll();
