import { filterIngredients, prepareIngredients } from './search.js';
import { renderAllTable, renderCategories, renderCategoryGuides, renderSearchResults } from './render.js';

let ingredients = [];
let sourcesById = new Map();

function setActiveTab(tabId, { updateHistory = false, scroll = true } = {}) {
  const target = document.getElementById(tabId);
  if (!target?.classList.contains('section')) return false;
  document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
  document.querySelectorAll('.nav a').forEach((link) => link.classList.toggle('active', link.dataset.tab === tabId));
  target.classList.add('active');
  if (updateHistory) history.pushState(null, '', `#${tabId}`);
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  return true;
}

function toggleAccordion(header, forceOpen) {
  const item = header.closest('.accordion-item');
  const body = item?.querySelector('.accordion-body');
  if (!item || !body) return;
  const open = forceOpen ?? !item.classList.contains('open');
  item.classList.toggle('open', open);
  header.setAttribute('aria-expanded', String(open));
  body.hidden = !open;
}

function navigateToIngredient(id, { updateHistory = true, focus = true } = {}) {
  const ingredient = ingredients.find((item) => item.id === id);
  if (!ingredient) return false;
  if (updateHistory) history.pushState(null, '', `#ingredient/${encodeURIComponent(id)}`);
  setActiveTab(ingredient.targetSection, { scroll: false });
  requestAnimationFrame(() => {
    const item = document.getElementById(`ingredient-${id}`);
    const header = item?.querySelector('.accordion-header');
    if (!item || !header) return;
    toggleAccordion(header, true);
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (focus) header.focus({ preventScroll: true });
  });
  return true;
}

function applyLocation() {
  let hash;
  try {
    hash = decodeURIComponent(location.hash.slice(1));
  } catch {
    hash = location.hash.slice(1);
  }
  if (hash.startsWith('ingredient/')) {
    if (!navigateToIngredient(hash.slice('ingredient/'.length), { updateHistory: false, focus: false })) {
      setActiveTab('overview', { scroll: false });
    }
    return;
  }
  setActiveTab(hash || 'overview', { scroll: false });
}

function bindInteractions() {
  document.addEventListener('click', (event) => {
    const accordionHeader = event.target.closest('.accordion-header');
    if (accordionHeader) {
      toggleAccordion(accordionHeader);
      return;
    }
    const ingredientLink = event.target.closest('a[data-ingredient-id]');
    if (ingredientLink) {
      event.preventDefault();
      navigateToIngredient(ingredientLink.dataset.ingredientId);
      return;
    }
    const tabLink = event.target.closest('a[data-tab]');
    if (tabLink) {
      event.preventDefault();
      setActiveTab(tabLink.dataset.tab, { updateHistory: true });
    }
  });

  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const overview = document.getElementById('overviewContent');
  const resultList = document.getElementById('searchResultList');
  input.disabled = false;
  input.addEventListener('input', () => {
    const query = input.value.trim();
    if (!query) {
      results.hidden = true;
      overview.hidden = false;
      resultList.replaceChildren();
      return;
    }
    overview.hidden = true;
    results.hidden = false;
    renderSearchResults(filterIngredients(ingredients, query), resultList, sourcesById);
  });
  window.addEventListener('popstate', applyLocation);
}

async function init() {
  try {
    const [ingredientResponse, sourceResponse] = await Promise.all([
      fetch('./data/ingredients.json'),
      fetch('./data/sources.json'),
    ]);
    if (!ingredientResponse.ok || !sourceResponse.ok) throw new Error('HTTP data load failed');
    const [data, sourceData] = await Promise.all([ingredientResponse.json(), sourceResponse.json()]);
    sourcesById = new Map(sourceData.sources.map((source) => [source.id, source]));
    ingredients = prepareIngredients(data.ingredients);

    renderCategories(ingredients, sourcesById, data.categoryMetadata);
    renderCategoryGuides(data.categoryGuides, sourcesById);
    const count = renderAllTable(ingredients, document.getElementById('allTableBody'), sourcesById);
    document.getElementById('overviewIngredientCount').textContent = String(count);
    document.getElementById('overviewEvidenceCount').textContent = String(ingredients.filter((item) => item.evidence).length);
    document.getElementById('overviewSourceCount').textContent = String(sourceData.sources.length);
    document.getElementById('allCount').textContent = String(count);
    bindInteractions();
    applyLocation();
  } catch (error) {
    const input = document.getElementById('searchInput');
    input.placeholder = '数据加载失败，请通过本地服务器或 GitHub Pages 打开';
    input.closest('.search-box').after(Object.assign(document.createElement('p'), {
      className: 'status-message error',
      textContent: '数据未能加载。请确认结构化数据文件均可访问。',
    }));
    console.error(error);
  }
}

init();
