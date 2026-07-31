import fs from 'node:fs';
import path from 'node:path';
import { pinyinInitialsById } from '../js/pinyin.js';

const root = process.cwd();
const failures = [];
const requiredFiles = [
  'index.html', 'about.html', '404.html', 'robots.txt', '.nojekyll',
  'css/main.css', 'js/app.js', 'js/config.js', 'js/render.js', 'js/search.js', 'js/pinyin.js',
  'data/ingredients.json', 'data/sources.json', 'scripts/generate-pinyin.mjs',
  'legacy/护肤品成分研究报告.html', '.github/workflows/pages.yml', '.githooks/pre-commit',
];

function fail(message) {
  failures.push(message);
}

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) fail(`缺少文件：${relativePath}`);
}

const dataPath = path.join(root, 'data', 'ingredients.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const ingredients = data.ingredients;
const sourceData = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sources.json'), 'utf8'));
const sourceIds = new Set();
for (const source of sourceData.sources || []) {
  if (!source.id?.trim()) fail('来源缺少 id。');
  if (sourceIds.has(source.id)) fail(`重复来源 id：${source.id}`);
  sourceIds.add(source.id);
  if (!/^https:\/\//.test(source.url || '')) fail(`${source.id} 的链接必须使用 HTTPS。`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt || '')) fail(`${source.id} 缺少有效 checkedAt。`);
}
const expectedReportSourceIds = [
  ...Array.from({ length: 15 }, (_, index) => `EU-${String(index + 1).padStart(2, '0')}`),
  ...Array.from({ length: 13 }, (_, index) => `US-${String(index + 1).padStart(2, '0')}`),
  ...Array.from({ length: 18 }, (_, index) => `P-${String(index + 1).padStart(2, '0')}`),
];
for (const reportId of expectedReportSourceIds) {
  const sourceId = sourceData.reportSourceMap?.[reportId];
  if (!sourceId) fail(`F07 缺少审查报告来源映射：${reportId}`);
  else if (!sourceIds.has(sourceId)) fail(`F07 的 ${reportId} 映射到未定义来源：${sourceId}`);
}
for (const reportId of Object.keys(sourceData.reportSourceMap || {})) {
  if (!expectedReportSourceIds.includes(reportId)) fail(`F07 存在未知审查报告来源编号：${reportId}`);
}
const allowedCategories = new Set(['moisture', 'whitening', 'antiaging', 'acne', 'repair', 'sunscreen', 'cleanse', 'safety', 'base']);

if (!Array.isArray(ingredients)) fail('ingredients 必须是数组。');
if (ingredients.length !== data.expectedCount) fail(`成分数量 ${ingredients.length} 与 expectedCount ${data.expectedCount} 不一致。`);
if (data.schemaVersion !== 2) fail('任务 E 要求使用 schemaVersion 2。');
if (!data.categoryMetadata || Object.keys(data.categoryMetadata).length !== allowedCategories.size) fail('缺少九类分类元数据。');

const ids = new Set();
const names = new Set();
const inciNames = new Set();
for (const [index, item] of ingredients.entries()) {
  const label = `第 ${index + 1} 条`;
  for (const field of ['id', 'inci', 'nameZh', 'aliases', 'categories', 'functions', 'summary', 'evidence', 'regulation', 'cautions', 'updatedAt']) {
    if (!Object.hasOwn(item, field)) fail(`${label} 缺少 schema 字段：${field}`);
  }
  if (!/^[a-z]+-\d{3}$/.test(item.id || '')) fail(`${label} 的 id 不符合稳定格式：${item.id}`);
  if (ids.has(item.id)) fail(`重复 id：${item.id}`);
  ids.add(item.id);
  if (!item.nameZh?.trim()) fail(`${label} 缺少 nameZh。`);
  if (names.has(item.nameZh)) fail(`重复中文名：${item.nameZh}`);
  names.add(item.nameZh);
  if (item.inci !== null && typeof item.inci !== 'string') fail(`${item.id} 的 inci 必须是字符串或 null。`);
  if (typeof item.inci === 'string') {
    if (!item.inci.trim()) fail(`${item.id} 的 inci 不得是空字符串；未确认时使用 null。`);
    const normalizedInci = item.inci.trim().toLowerCase();
    if (inciNames.has(normalizedInci)) fail(`重复 INCI：${item.inci}`);
    inciNames.add(normalizedInci);
  }
  if (!Array.isArray(item.aliases)) fail(`${item.id} 的 aliases 必须是数组。`);
  if (!Array.isArray(item.categories) || !item.categories.length) fail(`${item.id} 缺少 categories。`);
  for (const category of item.categories || []) {
    if (!allowedCategories.has(category)) fail(`${item.id} 使用未知分类：${category}`);
  }
  if (!item.categories?.includes(item.targetSection)) fail(`${item.id} 的 targetSection 不在 categories 中。`);
  if (!item.summary?.trim()) fail(`${item.id} 缺少 summary。`);
  if (!Array.isArray(item.functions) || !item.functions.length || item.functions.some((value) => typeof value !== 'string' || !value.trim())) fail(`${item.id} 的 functions 必须是非空字符串数组。`);
  if (!Array.isArray(item.cautions) || item.cautions.some((value) => typeof value !== 'string' || !value.trim())) fail(`${item.id} 的 cautions 必须是字符串数组。`);
  if ('legacyRisk' in item) fail(`${item.id} 仍保留单一风险总分。`);
  if ('pinyinInitials' in item) fail(`${item.id} 仍保留手工拼音字段。`);
  if (!item.safetyProfile || !Object.hasOwn(item.safetyProfile, 'irritationPotential') || !Object.hasOwn(item.safetyProfile, 'sensitization')) {
    fail(`${item.id} 缺少刺激或致敏维度。`);
  }
  if (!Array.isArray(item.safetyProfile?.specialPopulations)) fail(`${item.id} 的特殊人群字段必须是数组。`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.updatedAt || '')) fail(`${item.id} 的 updatedAt 格式无效。`);
  if (!item.evidence) fail(`${item.id} 缺少证据等级。`);
  if (!['strong', 'moderate', 'limited', 'insufficient'].includes(item.evidence?.level)) fail(`${item.id} 的证据等级无效。`);
  if (!item.evidence?.summary?.trim()) fail(`${item.id} 的 evidence.summary 为空。`);
  if (!Array.isArray(item.evidence?.sourceIds) || !item.evidence.sourceIds.length) fail(`${item.id} 的证据结论缺少来源。`);
  for (const sourceId of item.evidence?.sourceIds || []) {
    if (!sourceIds.has(sourceId)) fail(`${item.id} 引用未定义来源：${sourceId}`);
  }
  if (item.regulation) {
    if (!Array.isArray(item.regulation.sourceIds) || !item.regulation.sourceIds.length) fail(`${item.id} 的法规结论缺少来源。`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.regulation.checkedAt || '')) fail(`${item.id} 的法规结论缺少有效 checkedAt。`);
    for (const sourceId of item.regulation.sourceIds || []) {
      if (!sourceIds.has(sourceId)) fail(`${item.id} 的法规结论引用未定义来源：${sourceId}`);
    }
  }
}

if (Object.keys(pinyinInitialsById).length !== ingredients.length) fail('构建期拼音索引数量与成分数量不一致。');
for (const id of ids) {
  if (!pinyinInitialsById[id]?.trim()) fail(`${id} 缺少构建期拼音索引。`);
}
for (const guides of Object.values(data.categoryGuides || {})) {
  for (const guide of guides) {
    if (!guide.title?.trim() || !Array.isArray(guide.paragraphs) || !guide.paragraphs.length) fail('分类指南缺少标题或正文。');
    for (const sourceId of guide.sourceIds || []) {
      if (!sourceIds.has(sourceId)) fail(`分类指南引用未定义来源：${sourceId}`);
    }
  }
}

const categoryCounts = Object.fromEntries([...allowedCategories].map((category) => [category, ingredients.filter((item) => item.categories.includes(category)).length]));
if (categoryCounts.sunscreen !== 11) fail(`防晒多标签计数应为 11，实际为 ${categoryCounts.sunscreen}。`);
if (categoryCounts.safety !== 12) fail(`安全多标签计数应为 12，实际为 ${categoryCounts.safety}。`);

const searchMatches = (query, id) => ingredients.some((item) => {
  const searchText = [item.nameZh, item.inci, ...item.aliases, item.summary].filter(Boolean).join(' ').toLowerCase();
  return item.id === id && (searchText.includes(query) || (pinyinInitialsById[item.id] || '').split(' ').some((value) => value.startsWith(query)));
});
if (!searchMatches('yxa', 'whitening-001')) fail('拼音搜索 yxa 未命中烟酰胺记录。');
if (!searchMatches('tmzs', 'moisture-001')) fail('拼音搜索 tmzs 未命中透明质酸记录。');
for (const item of ingredients) {
  if (!searchMatches(item.nameZh.toLowerCase(), item.id)) fail(`${item.id} 无法用中文名搜索。`);
  if (!item.targetSection || !allowedCategories.has(item.targetSection)) fail(`${item.id} 的深链接没有有效目标分类。`);
  if (!/^#ingredient\/[a-z]+-\d{3}$/.test(`#ingredient/${item.id}`)) fail(`${item.id} 无法生成稳定深链接。`);
}

const categoryIndex = Object.fromEntries([...allowedCategories].map((category, index) => [category, index]));
const sorted = [...ingredients].sort((a, b) => {
  const categoryDifference = (categoryIndex[a.categories[0]] ?? 99) - (categoryIndex[b.categories[0]] ?? 99);
  return categoryDifference || a.nameZh.localeCompare(b.nameZh, 'zh-CN');
});
if (sorted[0]?.categories[0] !== 'moisture') fail('分类排序未将保湿分类置于首位。');

for (const htmlFile of ['index.html', 'about.html', '404.html']) {
  const html = fs.readFileSync(path.join(root, htmlFile), 'utf8');
  if (/\son(?:click|input|change|submit)=/i.test(html)) fail(`${htmlFile} 仍包含内联事件处理器。`);
  if (/(?:href|src)=["']\/(?!\/)/i.test(html)) fail(`${htmlFile} 含域名根路径资源，不兼容 GitHub Pages 项目子路径。`);
  for (const match of html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/gi)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/i.test(reference)) continue;
    const resolved = path.resolve(root, path.dirname(htmlFile), reference);
    if (!fs.existsSync(resolved)) fail(`${htmlFile} 引用的文件不存在：${reference}`);
  }
}

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/\sstyle=["']/i.test(indexHtml)) fail('F04 要求 index.html 不再保留内联 style。');
if (!indexHtml.includes('id="overviewIngredientCount">—</div>')) fail('首页成分总数应使用加载前占位符。');
if (!indexHtml.includes('id="overviewEvidenceCount">—</div>')) fail('首页证据分级数量应由数据动态生成。');
if (!indexHtml.includes('id="overviewSourceCount">—</div>')) fail('首页可靠来源数量应由数据动态生成。');
if (!indexHtml.includes('./data/ingredients.json') && !fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8').includes("fetch('./data/ingredients.json')")) {
  fail('页面未使用相对路径加载 ingredients.json。');
}
if (!fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8').includes("fetch('./data/sources.json')")) fail('页面未加载 sources.json。');
if ((indexHtml.match(/data-category-ingredients=/g) || []).length !== allowedCategories.size) fail('九个分类未全部改为数据挂载点。');
if (indexHtml.includes('class="accordion-item')) fail('index.html 仍含手写成分详情，单一数据源尚未落地。');
if (!indexHtml.includes('<script type="module" src="./js/app.js"></script>')) fail('页面脚本未使用模块化入口。');
const preCommitHook = fs.readFileSync(path.join(root, '.githooks', 'pre-commit'), 'utf8');
if (!preCommitHook.includes('npm run validate')) fail('F03 的提交前钩子未执行 npm run validate。');

for (const jsFile of ['js/app.js', 'js/render.js', 'js/search.js']) {
  const source = fs.readFileSync(path.join(root, jsFile), 'utf8');
  if (/\.innerHTML\b/.test(source)) fail(`${jsFile} 仍使用 innerHTML。`);
}

const prohibitedClaims = [
  '孕妇绝对禁用', 'SPF30 = 延长30倍晒伤时间', 'α-熊果苷效果是β-熊果苷的15倍',
  '抑制能力是曲酸的22倍、熊果苷的100倍', '浓度越高效果越好（30%浓度',
  'MIT单用≤0.01%', '内分泌功能障碍、珊瑚生态破坏', '荧光增白剂</td>',
  '淋洗与驻留类已限用', 'SCCS 评估中、拟限制', '新型温和防腐剂，安全性高',
];
for (const claim of prohibitedClaims) {
  if (indexHtml.includes(claim) || JSON.stringify(data).includes(claim)) fail(`仍存在已驳回或过度断言：${claim}`);
}

const prohibitedWording = [
  '最强', '首选', '零副作用', '未发现任何副作用', '完美修复', '必须搭配', '必须使用',
  '浓度越高越好', '深层渗透', '唯一缺点是贵', '黄金成分', '全波段反射',
  '同等抗老', '完全洗净', '无体内蓄积', '100%会灼伤', '100% 会灼伤', '同款核心',
];
for (const wording of prohibitedWording) {
  if (indexHtml.includes(wording) || JSON.stringify(data).includes(wording)) fail(`任务 C 仍存在禁用措辞：${wording}`);
}

if (ingredients.some((item) => !item.evidence?.sourceIds?.length)) fail('任务 C04 要求全部成分完成证据分级并关联来源。');
const renderJs = fs.readFileSync(path.join(root, 'js', 'render.js'), 'utf8');
if (!renderJs.includes('renderSafetyProfile') || !renderJs.includes('appendSourceLinks')) fail('任务 C06 缺少风险维度与来源的运行时渲染。');
const requiredTaskDText = [
  '常见机制之一', '不是按分子量截断的二元开关', '叠加可能增加刺激',
  '保湿、肤感或光学提亮可能即时或数天可见', '严重眼唇舌肿胀',
  '人体研究常受混合暴露', '2 mg/cm²', '双指法', '至少每2小时补涂', '6个月以下婴儿',
];
const publishedContent = `${indexHtml}\n${JSON.stringify(data)}`;
for (const text of requiredTaskDText) {
  if (!publishedContent.includes(text)) fail(`任务 D 页面描述缺少：${text}`);
}
if (indexHtml.includes('<tr><td>VC</td><td>苯甲酸钠</td>')) fail('任务 D03 要求删除 VC 与苯甲酸钠的通用禁配行。');

const requiredTaskASources = [
  'EU-2024-996', 'EU-2022-1176', 'FDA-SUNSCREEN-ORDER',
  'EU-MIT-2017', 'EU-MCI-MI-2014', 'EU-PARABENS-2014', 'EU-FRAGRANCE-2023', 'EU-FORMALDEHYDE-2022',
  'EU-REACH-2024-1328', 'EU-ZPT-2021', 'EU-COSMETICS-CONSOLIDATED-2026',
  'FDA-DANDRUFF-M032', 'FDA-KETOCONAZOLE-NDA', 'NY-1-4-DIOXANE', 'FDA-HQ-OTC-2022', 'EU-BHT-2022',
  'EU-ETHYL-LAUROYL-2016', 'FDA-AHA', 'FDA-SALICYLIC-ACNE',
];
for (const sourceId of requiredTaskASources) {
  if (!sourceIds.has(sourceId)) fail(`任务 A 缺少必要来源：${sourceId}`);
}

const requiredTaskBSources = [
  'PUBMED-NIACINAMIDE-2002', 'PUBMED-PHENYLETHYL-2013', 'PUBMED-HPR-COMBO-2015',
  'PUBMED-PLANT-ANTIAGING-2025', 'PUBMED-GROWTH-FACTOR-2023', 'PUBMED-MINERAL-UV-2016',
  'PUBMED-UVA-FILTERS-2010', 'PUBMED-PAPAIN-2015', 'FDA-KETOCONAZOLE-2-RX',
];
for (const sourceId of requiredTaskBSources) {
  if (!sourceIds.has(sourceId)) fail(`任务 B 缺少必要来源：${sourceId}`);
}

const requiredSunscreenSources = [
  'EU-ANNEX-VI-UV-FILTERS', 'SCCS-EHMC-2025', 'SCCS-DHHB-2025',
  'FDA-BEMOTRIZINOL-2026', 'CN-NMPA-STSC-2015',
];
for (const sourceId of requiredSunscreenSources) {
  if (!sourceIds.has(sourceId)) fail(`新增防晒剂缺少必要来源：${sourceId}`);
}

const ingredientById = new Map(ingredients.map((item) => [item.id, item]));
const taskBIdentityChecks = [
  ['repair-004', 'EGF', '寡肽-1不得把EGF保留为搜索别名'],
  ['whitening-012', 'TXC', '双-二乙氧基二甘醇环己烷条目不得保留TXC错误别名'],
  ['whitening-012', '传明酸酯', '双-二乙氧基二甘醇环己烷条目不得保留传明酸酯错误别名'],
  ['base-019', '甜橙油', '酸橙果皮油不得保留甜橙油错误别名'],
  ['cleanse-006', '氨基酸洁面', 'SCI组合条目不得用氨基酸洁面概括'],
];
for (const [id, alias, message] of taskBIdentityChecks) {
  if (ingredientById.get(id)?.aliases?.includes(alias)) fail(message);
}
if ('legacyRisk' in ingredientById.get('safety-004')) fail('Parabens不得继续保留整族风险标签。');
if (ingredientById.get('antiaging-009')?.functions?.includes('抗老')) fail('植醇不得把抗老保留为已确认配方功能。');
if (ingredientById.get('antiaging-012')?.evidence?.level !== 'insufficient') fail('三叶鬼针草提取物应标为独立证据不足。');

if (failures.length) {
  console.error('校验失败：');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`校验通过：${ingredients.length} 个唯一成分 ID。`);
console.log('分类展示计数：' + Object.entries(categoryCounts).map(([key, count]) => `${key}=${count}`).join(', '));
