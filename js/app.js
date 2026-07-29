(() => {
  'use strict';

  const categoryNames = {
    moisture: '💧 保湿', whitening: '✨ 美白', antiaging: '⏳ 抗老',
    acne: '🔬 祛痘', repair: '🛡 修复', sunscreen: '☀ 防晒',
    cleanse: '🚿 洗护', safety: '⚠ 安全', base: '🔧 基础',
  };
  const categoryOrder = ['moisture', 'whitening', 'antiaging', 'acne', 'repair', 'sunscreen', 'cleanse', 'safety', 'base'];
  let ingredientDB = [];

  function setActiveTab(tabId, options) {
    const settings = Object.assign({ updateHistory: false, scroll: true }, options);
    const target = document.getElementById(tabId);
    if (!target || !target.classList.contains('section')) return false;

    document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
    document.querySelectorAll('.nav a').forEach((link) => link.classList.toggle('active', link.dataset.tab === tabId));
    target.classList.add('active');
    if (tabId === 'all') renderAllTable();
    if (settings.updateHistory) history.pushState(null, '', '#' + tabId);
    if (settings.scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }

  function toggleAccordion(header, forceOpen) {
    const item = header.closest('.accordion-item');
    if (!item) return;
    const shouldOpen = forceOpen === undefined ? !item.classList.contains('open') : forceOpen;
    item.classList.toggle('open', shouldOpen);
    header.setAttribute('aria-expanded', String(shouldOpen));
  }

  function normalizeName(value) {
    return value.toLowerCase().replace(/[\s()（）/·+\-]/g, '');
  }

  function findMatchingAccordion(ingredient) {
    const needle = normalizeName(ingredient.nameZh).slice(0, 8);
    return Array.from(document.querySelectorAll('#' + ingredient.targetSection + ' .accordion-header'))
      .find((header) => normalizeName(header.textContent).includes(needle));
  }

  function navigateToIngredient(id, options) {
    const settings = Object.assign({ updateHistory: true }, options);
    const ingredient = ingredientDB.find((item) => item.id === id);
    if (!ingredient) return;
    if (settings.updateHistory) history.pushState(null, '', '#ingredient/' + encodeURIComponent(id));

    setActiveTab(ingredient.targetSection, { updateHistory: false, scroll: false });
    requestAnimationFrame(() => {
      const accordion = findMatchingAccordion(ingredient);
      if (accordion) {
        toggleAccordion(accordion, true);
        accordion.id = 'ingredient-' + ingredient.id;
        accordion.scrollIntoView({ behavior: 'smooth', block: 'center' });
        accordion.focus({ preventScroll: true });
        return;
      }
      setActiveTab('all', { updateHistory: false, scroll: false });
      const rowLink = document.querySelector('[data-ingredient-id="' + CSS.escape(id) + '"]');
      if (rowLink) {
        rowLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rowLink.focus({ preventScroll: true });
      }
    });
  }

  function badgeFor(risk) {
    const badge = document.createElement('span');
    badge.className = 'badge ' + (risk === '高' ? 'badge-danger' : risk === '中' ? 'badge-warning' : 'badge-success');
    badge.textContent = risk + '风险';
    return badge;
  }

  function showSearchResults(results) {
    const resultList = document.getElementById('searchResultList');
    resultList.replaceChildren();
    if (!results.length) {
      const empty = document.createElement('p');
      empty.className = 'status-message';
      empty.textContent = '未找到匹配的成分。尝试其他关键词。';
      resultList.append(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    results.forEach((ingredient) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card search-result-card';
      card.dataset.ingredientId = ingredient.id;

      const title = document.createElement('h3');
      title.append(document.createTextNode(ingredient.nameZh + ' '), badgeFor(ingredient.legacyRisk));
      const summary = document.createElement('p');
      summary.className = 'ingredient-summary';
      summary.textContent = ingredient.summary;
      const action = document.createElement('p');
      action.className = 'ingredient-action';
      action.textContent = '查看详情 →';
      card.append(title, summary, action);
      fragment.append(card);
    });
    resultList.append(fragment);
  }

  function searchIngredients() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim().toLowerCase();
    const results = document.getElementById('searchResults');
    const overview = document.getElementById('overviewContent');

    if (!query) {
      results.style.display = 'none';
      overview.style.display = '';
      document.getElementById('searchResultList').replaceChildren();
      return;
    }

    overview.style.display = 'none';
    results.style.display = 'block';
    showSearchResults(ingredientDB.filter((item) => item.searchText.includes(query) || item.pinyinInitials.includes(query)));
  }

  function appendCell(row, text, className) {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    cell.textContent = text;
    row.append(cell);
    return cell;
  }

  function renderAllTable() {
    const categoryIndex = Object.fromEntries(categoryOrder.map((category, index) => [category, index]));
    const sorted = [...ingredientDB].sort((a, b) => {
      const categoryDifference = (categoryIndex[a.categories[0]] ?? 99) - (categoryIndex[b.categories[0]] ?? 99);
      return categoryDifference || a.nameZh.localeCompare(b.nameZh, 'zh-CN');
    });
    const tableBody = document.getElementById('allTableBody');
    const fragment = document.createDocumentFragment();

    sorted.forEach((ingredient) => {
      const row = document.createElement('tr');
      const nameCell = appendCell(row, ingredient.nameZh);
      nameCell.style.fontWeight = '600';
      appendCell(row, ingredient.categories.map((category) => categoryNames[category] || category).join(' · '));
      const riskCell = document.createElement('td');
      riskCell.className = 'risk-cell';
      riskCell.append(badgeFor(ingredient.legacyRisk));
      row.append(riskCell);
      const summaryCell = appendCell(row, ingredient.summary, 'summary-cell');
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'ingredient-link';
      link.dataset.ingredientId = ingredient.id;
      link.textContent = '查看';
      summaryCell.append(document.createElement('br'), link);
      fragment.append(row);
    });
    tableBody.replaceChildren(fragment);
    document.getElementById('allCount').textContent = String(sorted.length);
  }

  function applyLocation() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash.startsWith('ingredient/')) {
      navigateToIngredient(hash.slice('ingredient/'.length), { updateHistory: false });
      return;
    }
    setActiveTab(hash || 'overview', { updateHistory: false, scroll: false });
  }

  function bindInteractions() {
    document.getElementById('nav').addEventListener('click', (event) => {
      const link = event.target.closest('a[data-tab]');
      if (!link) return;
      event.preventDefault();
      setActiveTab(link.dataset.tab, { updateHistory: true });
    });

    document.querySelectorAll('.quick-nav-card[data-tab]').forEach((card) => {
      const activate = () => setActiveTab(card.dataset.tab, { updateHistory: true });
      card.addEventListener('click', activate);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });

    document.querySelectorAll('.accordion-header').forEach((header) => {
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', String(header.closest('.accordion-item')?.classList.contains('open')));
      header.addEventListener('click', () => toggleAccordion(header));
      header.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleAccordion(header);
        }
      });
    });

    const searchInput = document.getElementById('searchInput');
    searchInput.disabled = false;
    searchInput.addEventListener('input', searchIngredients);
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-ingredient-id]');
      if (target) navigateToIngredient(target.dataset.ingredientId);
    });
    window.addEventListener('popstate', applyLocation);
  }

  async function init() {
    try {
      const response = await fetch('./data/ingredients.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      ingredientDB = data.ingredients.map((item) => Object.assign({}, item, {
        searchText: [item.nameZh, ...item.aliases, item.summary].join(' ').toLowerCase(),
      }));
      document.getElementById('overviewIngredientCount').textContent = String(ingredientDB.length);
      document.getElementById('overviewRiskCount').textContent = String(new Set(ingredientDB.map((item) => item.legacyRisk)).size);
      bindInteractions();
      applyLocation();
    } catch (error) {
      const input = document.getElementById('searchInput');
      input.placeholder = '数据加载失败，请通过本地服务器或 GitHub Pages 打开';
      const message = document.createElement('p');
      message.className = 'status-message error';
      message.textContent = '成分数据未能加载。请确认 data/ingredients.json 可访问。';
      input.closest('.search-box').after(message);
      console.error(error);
    }
  }

  init();
})();
