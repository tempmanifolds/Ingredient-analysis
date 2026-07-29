import { categoryNames, categoryOrder, evidenceLabels } from './config.js';

function element(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function evidenceBadge(evidence) {
  const level = evidence?.level || 'insufficient';
  return element('span', `evidence-chip evidence-${level}`, evidenceLabels[level]);
}

function appendSourceLinks(container, sourceIds, sourcesById) {
  const links = element('span', 'source-links');
  [...new Set(sourceIds || [])].forEach((sourceId) => {
    const source = sourcesById.get(sourceId);
    if (!source) return;
    const link = element('a', '', `${source.publisher}（核对 ${source.checkedAt}）`);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = source.title;
    links.append(link);
  });
  if (links.childElementCount) container.append(links);
}

export function appendEvidence(container, ingredient, sourcesById) {
  const meta = element('div', 'evidence-meta');
  meta.append(evidenceBadge(ingredient.evidence));
  if (ingredient.evidence?.summary) {
    meta.append(element('span', 'evidence-summary', ingredient.evidence.summary));
  }
  appendSourceLinks(meta, ingredient.evidence?.sourceIds, sourcesById);
  container.append(meta);
}

function appendDetailRow(container, label, value, className = '') {
  const row = element('div', `detail-row ${className}`.trim());
  row.append(element('dt', '', label), element('dd', '', value));
  container.append(row);
  return row;
}

function safetyValue(value, fallback) {
  if (Array.isArray(value)) return value.length ? value.join('；') : fallback;
  return value || fallback;
}

function renderSafetyProfile(ingredient, sourcesById) {
  const profile = ingredient.safetyProfile || {};
  const list = element('dl', 'safety-profile');
  const fallback = '暂无成分级结论，需结合浓度、剂型、完整配方和个人耐受判断。';
  const irritation = appendDetailRow(list, '刺激与耐受', safetyValue(profile.irritationPotential, fallback));
  const sensitization = appendDetailRow(list, '致敏提示', safetyValue(profile.sensitization, fallback));
  const regulation = appendDetailRow(
    list,
    '法规状态',
    ingredient.regulation?.summary || '未记录成分级限用结论；不代表在所有法域、用途和浓度下均获准。',
  );
  appendDetailRow(list, '证据等级', `${evidenceLabels[ingredient.evidence.level]}：${ingredient.evidence.summary}`);
  const populations = appendDetailRow(list, '特殊人群', safetyValue(profile.specialPopulations, '暂无成分级特殊人群结论，应按成品标签及专业建议使用。'));

  appendSourceLinks(irritation.querySelector('dd'), ingredient.evidence?.sourceIds, sourcesById);
  appendSourceLinks(sensitization.querySelector('dd'), ingredient.evidence?.sourceIds, sourcesById);
  appendSourceLinks(regulation.querySelector('dd'), ingredient.regulation?.sourceIds, sourcesById);
  appendSourceLinks(populations.querySelector('dd'), ingredient.evidence?.sourceIds, sourcesById);
  return list;
}

export function renderIngredientAccordion(ingredient, sourcesById, category, open = false) {
  const isPrimary = category === ingredient.targetSection;
  const domSuffix = isPrimary ? ingredient.id : `${ingredient.id}-${category}`;
  const item = element('article', `accordion-item${open ? ' open' : ''}`);
  item.dataset.ingredientId = ingredient.id;
  item.id = `ingredient-${domSuffix}`;

  const header = element('button', 'accordion-header');
  header.type = 'button';
  header.id = `ingredient-toggle-${domSuffix}`;
  header.setAttribute('aria-expanded', String(open));
  header.setAttribute('aria-controls', `ingredient-panel-${domSuffix}`);
  const title = element('span', 'accordion-title');
  title.append(document.createTextNode(`${ingredient.nameZh} `), evidenceBadge(ingredient.evidence));
  header.append(title, element('span', 'arrow', '▼'));

  const body = element('div', 'accordion-body');
  body.id = `ingredient-panel-${domSuffix}`;
  body.setAttribute('role', 'region');
  body.setAttribute('aria-labelledby', header.id);
  body.hidden = !open;
  const summary = element('p', 'ingredient-summary');
  summary.append(element('span', 'tag tag-mech', '审慎说明'), document.createTextNode(` ${ingredient.summary}`));
  body.append(summary);

  const functions = element('p', 'ingredient-functions');
  functions.append(element('span', 'tag tag-use', '配方功能'), document.createTextNode(` ${ingredient.functions.join(' · ')}`));
  body.append(functions, renderSafetyProfile(ingredient, sourcesById));

  if (ingredient.cautions?.length) {
    const cautions = element('div', 'ingredient-cautions');
    cautions.append(element('strong', '', '补充注意：'));
    const list = element('ul');
    ingredient.cautions.forEach((caution) => list.append(element('li', '', caution)));
    cautions.append(list);
    appendSourceLinks(cautions, ingredient.evidence?.sourceIds, sourcesById);
    body.append(cautions);
  }
  appendEvidence(body, ingredient, sourcesById);
  item.append(header, body);
  return item;
}

export function renderCategories(ingredients, sourcesById, categoryMetadata) {
  categoryOrder.forEach((category) => {
    const section = document.getElementById(category);
    const mount = section?.querySelector('[data-category-ingredients]');
    if (!section || !mount) return;
    const metadata = categoryMetadata[category];
    section.querySelector('[data-category-title]').textContent = metadata.title;
    section.querySelector('[data-category-description]').textContent = metadata.description;
    const fragment = document.createDocumentFragment();
    ingredients
      .filter((ingredient) => ingredient.categories.includes(category))
      .forEach((ingredient, index) => fragment.append(renderIngredientAccordion(ingredient, sourcesById, category, index === 0)));
    mount.replaceChildren(fragment);
  });
}

export function renderCategoryGuides(categoryGuides, sourcesById) {
  Object.entries(categoryGuides || {}).forEach(([category, guides]) => {
    const section = document.getElementById(category);
    const accordion = section?.querySelector('[data-category-ingredients]');
    if (!section || !accordion) return;
    const container = element('div', 'section-guides');
    guides.forEach((guide) => {
      const card = element('aside', 'card info-box');
      card.append(element('h3', '', guide.title));
      guide.paragraphs.forEach((paragraph) => card.append(element('p', '', paragraph)));
      appendSourceLinks(card, guide.sourceIds, sourcesById);
      container.append(card);
    });
    accordion.after(container);
  });
}

export function renderSearchResults(results, container, sourcesById) {
  if (!results.length) {
    container.replaceChildren(element('p', 'status-message', '未找到匹配的成分。尝试其他关键词。'));
    return;
  }
  const fragment = document.createDocumentFragment();
  results.forEach((ingredient) => {
    const card = element('article', 'card search-result-card');
    const title = element('h3');
    title.append(document.createTextNode(`${ingredient.nameZh} `), evidenceBadge(ingredient.evidence));
    card.append(title, element('p', 'ingredient-summary', ingredient.summary));
    appendEvidence(card, ingredient, sourcesById);
    const action = element('a', 'ingredient-action', '查看详情 →');
    action.href = `#ingredient/${encodeURIComponent(ingredient.id)}`;
    action.dataset.ingredientId = ingredient.id;
    card.append(action);
    fragment.append(card);
  });
  container.replaceChildren(fragment);
}

function appendCell(row, text, className = '') {
  const cell = element('td', className, text);
  row.append(cell);
  return cell;
}

export function renderAllTable(ingredients, tableBody, sourcesById) {
  const categoryIndex = Object.fromEntries(categoryOrder.map((category, index) => [category, index]));
  const sorted = [...ingredients].sort((a, b) => {
    const difference = (categoryIndex[a.categories[0]] ?? 99) - (categoryIndex[b.categories[0]] ?? 99);
    return difference || a.nameZh.localeCompare(b.nameZh, 'zh-CN');
  });
  const fragment = document.createDocumentFragment();
  sorted.forEach((ingredient) => {
    const row = document.createElement('tr');
    const nameCell = appendCell(row, '');
    const nameLink = element('a', 'ingredient-link', ingredient.nameZh);
    nameLink.href = `#ingredient/${encodeURIComponent(ingredient.id)}`;
    nameLink.dataset.ingredientId = ingredient.id;
    nameCell.append(nameLink);
    appendCell(row, ingredient.categories.map((category) => categoryNames[category] || category).join(' · '));
    const evidenceCell = appendCell(row, '', 'evidence-cell');
    evidenceCell.append(evidenceBadge(ingredient.evidence));
    const summaryCell = appendCell(row, ingredient.summary, 'summary-cell');
    appendEvidence(summaryCell, ingredient, sourcesById);
    fragment.append(row);
  });
  tableBody.replaceChildren(fragment);
  return sorted.length;
}
