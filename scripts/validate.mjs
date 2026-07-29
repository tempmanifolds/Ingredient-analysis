import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const requiredFiles = [
  'index.html', 'about.html', '404.html', 'robots.txt', '.nojekyll',
  'css/main.css', 'js/app.js', 'data/ingredients.json', 'data/sources.json',
  'legacy/护肤品成分研究报告.html', '.github/workflows/pages.yml',
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
const allowedCategories = new Set(['moisture', 'whitening', 'antiaging', 'acne', 'repair', 'sunscreen', 'cleanse', 'safety', 'base']);

if (!Array.isArray(ingredients)) fail('ingredients 必须是数组。');
if (ingredients.length !== data.expectedCount) fail(`成分数量 ${ingredients.length} 与 expectedCount ${data.expectedCount} 不一致。`);

const ids = new Set();
const names = new Set();
for (const [index, item] of ingredients.entries()) {
  const label = `第 ${index + 1} 条`;
  if (!/^[a-z]+-\d{3}$/.test(item.id || '')) fail(`${label} 的 id 不符合稳定格式：${item.id}`);
  if (ids.has(item.id)) fail(`重复 id：${item.id}`);
  ids.add(item.id);
  if (!item.nameZh?.trim()) fail(`${label} 缺少 nameZh。`);
  if (names.has(item.nameZh)) fail(`重复中文名：${item.nameZh}`);
  names.add(item.nameZh);
  if (!Array.isArray(item.aliases)) fail(`${item.id} 的 aliases 必须是数组。`);
  if (!Array.isArray(item.categories) || !item.categories.length) fail(`${item.id} 缺少 categories。`);
  for (const category of item.categories || []) {
    if (!allowedCategories.has(category)) fail(`${item.id} 使用未知分类：${category}`);
  }
  if (!item.categories?.includes(item.targetSection)) fail(`${item.id} 的 targetSection 不在 categories 中。`);
  if (!item.summary?.trim()) fail(`${item.id} 缺少 summary。`);
  if (!['高', '中', '低'].includes(item.legacyRisk)) fail(`${item.id} 的旧版风险标签无效。`);
  if (!item.pinyinInitials?.trim()) fail(`${item.id} 缺少拼音首字母索引。`);
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

const categoryCounts = Object.fromEntries([...allowedCategories].map((category) => [category, ingredients.filter((item) => item.categories.includes(category)).length]));
if (categoryCounts.sunscreen !== 4) fail(`防晒多标签计数应为 4，实际为 ${categoryCounts.sunscreen}。`);
if (categoryCounts.safety !== 11) fail(`安全多标签计数应为 11，实际为 ${categoryCounts.safety}。`);

const searchMatches = (query, id) => ingredients.some((item) => {
  const searchText = [item.nameZh, ...item.aliases, item.summary].join(' ').toLowerCase();
  return item.id === id && (searchText.includes(query) || item.pinyinInitials.includes(query));
});
if (!searchMatches('yxa', 'whitening-001')) fail('拼音搜索 yxa 未命中烟酰胺记录。');
if (!searchMatches('tmzs', 'moisture-001')) fail('拼音搜索 tmzs 未命中透明质酸记录。');

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
if (!indexHtml.includes('id="overviewIngredientCount">—</div>')) fail('首页成分总数应使用加载前占位符。');
if (!indexHtml.includes('id="overviewEvidenceCount">—</div>')) fail('首页证据分级数量应由数据动态生成。');
if (!indexHtml.includes('id="overviewSourceCount">—</div>')) fail('首页可靠来源数量应由数据动态生成。');
if (!indexHtml.includes('./data/ingredients.json') && !fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8').includes("fetch('./data/ingredients.json')")) {
  fail('页面未使用相对路径加载 ingredients.json。');
}
if (!fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8').includes("fetch('./data/sources.json')")) fail('页面未加载 sources.json。');

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
const appJs = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
if (!appJs.includes('hydrateIngredientAccordions()')) fail('任务 C06 缺少详情卡风险来源的运行时渲染。');
const requiredTaskDText = [
  '常见机制之一', '不是按分子量截断的二元开关', '叠加可能增加刺激',
  '保湿、肤感或光学提亮可能即时或数天可见', '严重眼唇舌肿胀',
  '人体研究常受混合暴露', '2 mg/cm²', '双指法', '至少每2小时补涂', '6个月以下婴儿',
];
for (const text of requiredTaskDText) {
  if (!indexHtml.includes(text)) fail(`任务 D 页面描述缺少：${text}`);
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
if (ingredientById.get('safety-004')?.legacyRisk === '高') fail('Parabens不得继续保留整族高风险标签。');
if (ingredientById.get('antiaging-009')?.functions?.includes('抗老')) fail('植醇不得把抗老保留为已确认配方功能。');
if (ingredientById.get('antiaging-012')?.evidence?.level !== 'insufficient') fail('三叶鬼针草提取物应标为独立证据不足。');

if (failures.length) {
  console.error('校验失败：');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`校验通过：${ingredients.length} 个唯一成分 ID。`);
console.log('分类展示计数：' + Object.entries(categoryCounts).map(([key, count]) => `${key}=${count}`).join(', '));
