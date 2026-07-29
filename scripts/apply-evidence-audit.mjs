import fs from 'node:fs';

const path = new URL('../data/ingredients.json', import.meta.url);
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const checkedAt = '2026-07-30';

const updates = {
  'moisture-001': {
    summary: '外用透明质酸可改善角质层含水量；效果受分子量、配方和使用环境影响。“携带500–1000倍水分”及“必须搭配封闭剂”不是可直接外推到成品的临床定律。',
    evidence: { level: 'moderate', summary: '有人体随机试验支持保湿，但不支持固定吸水倍数或通用搭配规则。', sourceIds: ['PUBMED-HA-2024'] },
  },
  'whitening-001': {
    summary: '2%与5%烟酰胺配方均有人体研究显示可改善色沉，但不同研究的配方和终点不同，不能据此建立“浓度越高、功效越全面”的通用剂量阶梯。',
    evidence: { level: 'moderate', summary: '小型人体研究支持改善色沉；缺少统一的跨浓度头对头比较。', sourceIds: ['PUBMED-NIACINAMIDE-2002'] },
  },
  'whitening-003': {
    summary: '熊果苷可影响酪氨酸酶相关通路；“α型比β型强15倍”主要来自特定实验条件，不能当作人体临床倍数。欧盟按分型和产品类别设有上限。',
    evidence: { level: 'strong', summary: '欧盟限量结论明确；量化功效比较仅属有限的实验室证据。', sourceIds: ['EU-2024-996'] },
    regulation: { jurisdiction: 'EU', status: 'restricted', summary: 'Alpha-Arbutin：面霜2%、身体乳0.5%；Arbutin：面霜7%，并要求氢醌为不可避免痕量。', sourceIds: ['EU-2024-996'], checkedAt },
  },
  'whitening-005': {
    summary: '曲酸可抑制酪氨酸酶相关黑色素生成；刺激性取决于浓度与配方。欧盟现行规则将面部和手部产品上限定为1%，不能再用“低于2%均安全”概括。',
    evidence: { level: 'strong', summary: '欧盟现行法规直接规定使用部位和最高浓度。', sourceIds: ['EU-2024-996'] },
    regulation: { jurisdiction: 'EU', status: 'restricted', summary: '面部和手部产品最高1%。', sourceIds: ['EU-2024-996'], checkedAt },
  },
  'whitening-006': {
    summary: '苯乙基间苯二酚是酪氨酸酶抑制剂，复配产品有人体研究；“曲酸22倍、熊果苷100倍”来自特定实验比较，不能表示成品在人体上的功效倍数。',
    evidence: { level: 'limited', summary: '人体资料多为复配产品，无法把效果单独归因于该原料，也不支持通用倍数。', sourceIds: ['PUBMED-PHENYLETHYL-2013'] },
  },
  'whitening-007': {
    summary: '阿魏酸具有抗氧化作用；15%维C+1%维E+0.5%阿魏酸的特定配方曾显示相对维C+维E约两倍的光保护，并非所有含阿魏酸产品“提升8倍”。',
    evidence: { level: 'limited', summary: '结论来自特定配方和受控紫外线实验，不能外推为原料通用倍数。', sourceIds: ['PUBMED-FERULIC-2005'] },
  },
  'antiaging-001': {
    summary: '外用视黄醇有改善光老化的证据，也常引起干燥、脱屑和刺激。孕期及备孕期按预防原则避免使用；意外少量外用不等同于口服异维A酸暴露，应咨询产科或皮肤科医生。',
    evidence: { level: 'strong', summary: '专业指南建议孕期避免外用维A类；观察性资料未显示明显风险增加，但不足以支持孕期主动使用。', sourceIds: ['FDA-PREGNANCY-ACOG', 'PUBMED-RETINOID-PREG-2015', 'EU-2024-996'] },
    regulation: { jurisdiction: 'EU', status: 'restricted', summary: 'Retinol/Retinyl Acetate/Retinyl Palmitate：身体乳最高0.05% RE，其他驻留/淋洗产品最高0.3% RE；标签须写“Contains Vitamin A. Consider your daily intake before use”。不合规新品自2025-11-01不得投放欧盟市场，既有产品自2027-05-01不得继续提供。', sourceIds: ['EU-2024-996'], checkedAt },
    cautions: ['孕期及备孕期按预防原则避免；意外接触时无需自行推断结局，应咨询医生。', '可能出现干燥、脱屑、泛红和刺痛。'],
  },
  'acne-001': {
    summary: '美国OTC痤疮产品中水杨酸允许浓度为0.5%–2%。刺激性取决于浓度、面积和配方；它不是典型光敏剂。ACOG把外用水杨酸列为孕期可用的OTC成分之一。',
    evidence: { level: 'strong', summary: 'FDA给出OTC痤疮用途浓度；ACOG给出孕期用药指导。', sourceIds: ['FDA-SALICYLIC-ACNE', 'FDA-PREGNANCY-ACOG'] },
    regulation: { jurisdiction: 'US', status: 'allowed-with-conditions', summary: 'OTC痤疮用途0.5%–2%。', sourceIds: ['FDA-SALICYLIC-ACNE'], checkedAt },
    cautions: ['按产品标签使用；高浓度焕肤、较大面积或破损皮肤使用应先咨询专业人士。'],
  },
  'repair-004': {
    inci: 'Oligopeptide-1',
    aliases: [],
    summary: 'Oligopeptide-1与人寡肽-1（EGF）不是同一名称。仅凭“小分子肽”不能证明其可深透皮层、促进胶原或修复创面；外用生长因子研究也存在制剂异质性，不能反向证明Oligopeptide-1的独立功效。',
    evidence: { level: 'strong', summary: '国家药监局明确了EGF与寡肽-1的名称边界；系统综述也显示外用生长因子研究在制剂与终点上差异较大，不能据此证明Oligopeptide-1的独立功效。', sourceIds: ['CN-NMPA-EGF-2019', 'PUBMED-GROWTH-FACTOR-2023'] },
    regulation: { jurisdiction: 'CN', status: 'naming-boundary', summary: 'EGF不得作为化妆品原料使用，配方或标签不得以EGF名义宣称；寡肽-1不能与EGF混同。', sourceIds: ['CN-NMPA-EGF-2019'], checkedAt },
    pinyinInitials: 'gt1oligopeptide1',
  },
  'acne-002': {
    summary: 'AHA可促进角质更新；刺激和日晒敏感性取决于游离酸浓度、pH和完整配方。FDA消费者参考条件为AHA不高于10%、成品pH不低于3.5并配合防晒，不能用固定浓度阶梯定义“医疗级功效”。',
    evidence: { level: 'strong', summary: 'FDA消费者安全指导支持浓度、pH和防晒限定，不支持成分间固定强弱排序。', sourceIds: ['FDA-AHA', 'FDA-PREGNANCY-ACOG'] },
    cautions: ['使用期间及停用后一周加强防晒；出现持续红肿、灼痛或起疱应停用并就医。'],
  },
  'acne-003': {
    summary: '壬二酸用于痤疮和色沉有临床应用。ACOG将其列为孕期可用的OTC成分之一；仍应按产品标签使用，持续刺激或正在接受处方治疗时咨询医生。',
    evidence: { level: 'strong', summary: '孕期结论来自专业学会指南；不支持“15–20%对所有人效果最佳”的绝对表述。', sourceIds: ['FDA-PREGNANCY-ACOG'] },
  },
  'safety-001': {
    summary: '氧苯酮是受监管的防晒剂。欧盟：脸/手/唇产品最高6%，身体产品通常2.2%，其他配方保护用途0.5%；同一配方兼作保护剂时UV滤剂量还会相应下调。FDA拟议结论为仍需更多安全数据，并非已判定不安全。',
    evidence: { level: 'strong', summary: '监管状态和限量证据明确；确定的人体内分泌损害结论证据不足。', sourceIds: ['EU-2022-1176', 'FDA-SUNSCREEN-ORDER'] },
    regulation: { jurisdiction: 'EU/US', status: 'restricted-or-under-review', summary: '欧盟：脸/手/唇6%、身体2.2%、其他用途0.5%；美国拟议评估为数据不足，不等于不安全。', sourceIds: ['EU-2022-1176', 'FDA-SUNSCREEN-ORDER'], checkedAt },
  },
  'safety-002': {
    summary: '二氧化钛和氧化锌防晒主要通过吸收并辅以散射/反射紫外线；氧化锌的长波UVA覆盖通常优于二氧化钛。FDA拟议评估支持非喷雾等规定剂型至25%的GRASE结论；皮肤涂抹与喷雾吸入风险需分开评估。',
    evidence: { level: 'strong', summary: '光学研究支持金属氧化物主要吸收紫外线，并显示氧化锌通常具有更好的长波UVA覆盖；FDA拟议评估支持规定剂型下的安全有效性。', sourceIds: ['FDA-SUNSCREEN-ORDER', 'FDA-SUNSCREEN-USE', 'PUBMED-MINERAL-UV-2016', 'PUBMED-UVA-FILTERS-2010'] },
  },
  'safety-003': {
    summary: '糖皮质激素是药物类别；中国禁用原料目录禁止其作为普通化妆品原料。违法的是把药物擅自加入或以化妆品名义销售，不等于经批准、按医嘱使用的外用激素药本身“非法”。',
    evidence: { level: 'strong', summary: '中国禁用原料目录对化妆品用途给出明确结论。', sourceIds: ['CN-NMPA-BANNED-2021'] },
    regulation: { jurisdiction: 'CN', status: 'prohibited-in-cosmetics', summary: '激素类（含糖皮质激素）不得作为化妆品原料。', sourceIds: ['CN-NMPA-BANNED-2021'], checkedAt },
    cautions: ['怀疑化妆品违法添加时停止继续使用并尽快就医；正在按医嘱使用药品者不要自行停药。'],
  },
  'safety-004': {
    aliases: ['对羟基苯甲酸酯', '羟苯甲酯', '羟苯乙酯', '羟苯丙酯', '羟苯丁酯', 'methylparaben', 'ethylparaben', 'propylparaben', 'butylparaben'],
    summary: 'Parabens是成分家族，不能整体标为“高风险内分泌干扰物”。欧盟Methylparaben、Ethylparaben单酯最高0.4%（以酸计），允许酯类混合物总量最高0.8%；Butylparaben与Propylparaben合计最高0.14%，并有儿童尿布区用途限制。FDA现有资料不足以证明化妆品当前使用方式会影响人体健康。',
    legacyRisk: '低',
    evidence: { level: 'strong', summary: '监管机构结论支持按具体成员和用量判断，不支持把乳腺癌或生殖毒性写成合规使用的确定后果。', sourceIds: ['EU-PARABENS-2014', 'EU-COSMETICS-CONSOLIDATED-2026', 'FDA-PARABENS'] },
    regulation: { jurisdiction: 'EU/US', status: 'restricted-by-member-and-use', summary: '欧盟Methylparaben、Ethylparaben单酯0.4%，酯类混合物总量0.8%；Butylparaben与Propylparaben合计0.14%并有儿童尿布区限制。美国FDA未把整个家族判定为当前化妆品用法有害。', sourceIds: ['EU-PARABENS-2014', 'EU-COSMETICS-CONSOLIDATED-2026', 'FDA-PARABENS'], checkedAt },
  },
  'safety-005': {
    summary: 'MIT与MCI/MI是重要接触致敏关注物。欧盟规定MIT单用或MCI/MI混合物均仅限淋洗类，成品最高0.0015%；原页面“MIT≤0.01%”已修正。',
    evidence: { level: 'strong', summary: '欧盟法规直接规定产品类别和最高浓度。', sourceIds: ['EU-MIT-2017', 'EU-MCI-MI-2014'] },
    regulation: { jurisdiction: 'EU', status: 'restricted', summary: '仅限淋洗类，最高0.0015%；MIT单用与MCI/MI混合物不能在同一产品并用。', sourceIds: ['EU-MIT-2017', 'EU-MCI-MI-2014'], checkedAt },
  },
  'safety-007': {
    summary: '香精及部分香料可引起接触过敏，但“无香”不等于零致敏风险。欧盟2023/1545新增56种需单独标示项目，通常在驻留产品超过0.001%、淋洗产品超过0.01%时标示；不合规新品过渡至2026-07-31，既有库存至2028-07-31。',
    evidence: { level: 'strong', summary: '欧盟标签法规明确；个体风险仍取决于具体过敏原和暴露。', sourceIds: ['EU-FRAGRANCE-2023'] },
    regulation: { jurisdiction: 'EU', status: 'labelled-above-threshold', summary: '新增56种需单独标示项目；通常驻留0.001%、淋洗0.01%，并设2026-07-31/2028-07-31过渡日期。', sourceIds: ['EU-FRAGRANCE-2023'], checkedAt },
  },
  'antiaging-008': {
    summary: '视黄醇棕榈酸酯是维A酯，外用抗老证据通常弱于视黄醇；欧盟将其纳入维A总量限制。孕期及备孕期按预防原则避免维A类外用。',
    evidence: { level: 'strong', summary: '欧盟限制和孕期专业指导明确；具体抗老转化率缺少可靠头对头人体比较。', sourceIds: ['EU-2024-996', 'FDA-PREGNANCY-ACOG'] },
    regulation: { jurisdiction: 'EU', status: 'restricted', summary: 'Retinyl Palmitate计入维A总量：身体乳最高0.05% RE，其他驻留/淋洗产品最高0.3% RE，并有维A标签和过渡期要求。', sourceIds: ['EU-2024-996'], checkedAt },
  },
  'antiaging-010': {
    summary: '视黄醇丙酸酯属于维A衍生物；“转化率和刺激性均居中”缺少可靠、统一的头对头人体证据。孕期及备孕期按预防原则避免维A类外用。',
    evidence: { level: 'limited', summary: '缺少足以支持固定强弱排序的人体比较；孕期建议适用于外用维A类。Retinyl Propionate不是欧盟2024/996列名的Retinol、Retinyl Acetate或Retinyl Palmitate，不能自动套用该法规数值。', sourceIds: ['FDA-PREGNANCY-ACOG', 'EU-2024-996'] },
  },
  'antiaging-011': {
    inci: 'Hydroxypinacolone Retinoate',
    summary: 'HPR是新型维A衍生物；受体作用等实验机制不能直接推出“无需转化且兼具A醇效果与更温和”。独立人体证据有限，孕期及备孕期按预防原则避免。',
    evidence: { level: 'limited', summary: '现有人体研究多为复配产品，不能支持与视黄醇的通用等效结论。', sourceIds: ['PUBMED-HPR-COMBO-2015', 'FDA-PREGNANCY-ACOG'] },
  },
  'sunscreen-001': {
    summary: '奥克立林用于UVB/短波UVA防护，可在部分配方中帮助光稳定。欧盟喷雾产品最高9%、其他产品最高10%；FDA拟议评估为仍需更多安全数据，不等于已判不安全。',
    evidence: { level: 'strong', summary: '法规限量明确；具体配方中的稳定作用不能一概而论。', sourceIds: ['EU-2022-1176', 'FDA-SUNSCREEN-ORDER'] },
    regulation: { jurisdiction: 'EU/US', status: 'restricted-or-under-review', summary: '欧盟推进剂喷雾最高9%，其他产品最高10%；美国拟议评估仍需更多数据。', sourceIds: ['EU-2022-1176', 'FDA-SUNSCREEN-ORDER'], checkedAt },
  },
  'sunscreen-002': {
    summary: '阿伏苯宗是UVA滤剂，光稳定性取决于完整配方；“30分钟降解50%”“必须搭配奥克立林”等固定结论不能外推到所有成品。FDA拟议评估为仍需更多安全数据。',
    evidence: { level: 'limited', summary: 'UVA滤剂身份明确；定量降解和唯一稳定方案缺少对所有成品可通用的证据。', sourceIds: ['FDA-SUNSCREEN-ORDER', 'PUBMED-UVA-FILTERS-2010'] },
  },
  'safety-011': {
    summary: 'BHT是配方抗氧化剂。欧盟上限为漱口水0.001%、牙膏0.1%、其他驻留或淋洗产品0.8%，不能只用“高浓度有争议”概括。',
    evidence: { level: 'strong', summary: '欧盟法规直接规定分产品类别限量。', sourceIds: ['EU-BHT-2022'] },
    regulation: { jurisdiction: 'EU', status: 'restricted', summary: '漱口水0.001%、牙膏0.1%、其他驻留或淋洗产品0.8%。', sourceIds: ['EU-BHT-2022'], checkedAt },
  },
  'safety-010': {
    summary: 'Ethyl Lauroyl Arginate HCl可作防腐剂，但“新型温和、安全性高”不是法规结论。欧盟漱口水最高0.15%且不得用于10岁以下儿童；其他允许产品最高0.4%，不得用于唇部、其他口腔或喷雾产品。',
    evidence: { level: 'strong', summary: '欧盟法规明确区分漱口水与其他产品，并规定浓度、年龄和产品类别限制。', sourceIds: ['EU-ETHYL-LAUROYL-2016'] },
    regulation: { jurisdiction: 'EU', status: 'restricted-as-preservative', summary: '漱口水0.15%，不得用于10岁以下儿童；其他产品0.4%，排除唇部、其他口腔和喷雾产品。', sourceIds: ['EU-ETHYL-LAUROYL-2016'], checkedAt },
  },
  'cleanse-001': {
    summary: 'SLS清洁力和刺激潜力受浓度、接触时间与完整配方影响。CIR认为在不造成刺激的配方条件下可安全使用；“致癌”没有可靠依据，但也不应写成“可完全洗净、绝无蓄积”。',
    evidence: { level: 'moderate', summary: '专家评估支持按使用条件判断，不能把原料名称单独等同于安全或危险。', sourceIds: ['CIR-SLS'] },
  },
  'cleanse-002': {
    summary: 'SLES通常比SLS刺激性低，但仍取决于配方。1,4-二氧六环是乙氧基化工艺杂质而非SLES本身；纽约州现行上限按法定类别区分：personal care为1 ppm，cosmetic products为10 ppm。',
    evidence: { level: 'strong', summary: '纽约州法规直接规定1,4-二氧六环限值；不能据此推断任一含SLES产品的实际杂质含量。', sourceIds: ['NY-1-4-DIOXANE'] },
  },
  'cleanse-010': {
    summary: 'ZPT可抑制马拉色菌。欧盟自2022-03-01禁用于化妆品：其被归为CMR 1B，且豁免所需的“无适当替代物”条件未被证明；这不等于SCCS认定1%去屑淋洗用途必然有害。美国OTC去屑专论仍规定可用条件。',
    evidence: { level: 'strong', summary: '欧盟禁用和美国OTC专论均为直接监管文本。', sourceIds: ['EU-ZPT-2021', 'FDA-DANDRUFF-M032'] },
    regulation: { jurisdiction: 'EU/US', status: 'jurisdiction-dependent', summary: '欧盟化妆品禁用；美国按OTC去屑药专论管理。', sourceIds: ['EU-ZPT-2021', 'FDA-DANDRUFF-M032'], checkedAt },
  },
  'cleanse-012': {
    summary: 'Climbazole为抗真菌去屑成分。欧盟允许去屑淋洗洗发水最高2%；作为防腐剂时按产品类别最高0.5%或0.2%。',
    evidence: { level: 'strong', summary: '欧盟法规直接区分去屑用途与防腐用途。', sourceIds: ['EU-CLIMBAZOLE-2019'] },
    regulation: { jurisdiction: 'EU', status: 'restricted', summary: '去屑淋洗洗发水最高2%；防腐用途依产品类别最高0.5%或0.2%。', sourceIds: ['EU-CLIMBAZOLE-2019'], checkedAt },
  },
  'cleanse-011': {
    summary: 'Piroctone Olamine可用于去屑配方。欧盟Annex V列出的淋洗1.0%、其他产品0.5%是其作为防腐剂时的规则；用于非防腐去屑目的时，不能把该条目直接当作用途批准或成品安全证明。',
    evidence: { level: 'strong', summary: '欧盟现行Annex V明确给出防腐用途限量；非防腐用途仍需独立证明其功能和成品安全。', sourceIds: ['EU-COSMETICS-CONSOLIDATED-2026'] },
    regulation: { jurisdiction: 'EU', status: 'preservative-limits-only', summary: '作为防腐剂：淋洗产品1.0%，其他产品0.5%；非防腐去屑用途不能直接套用该条目。', sourceIds: ['EU-COSMETICS-CONSOLIDATED-2026'], checkedAt },
  },
  'cleanse-007': {
    summary: '线性Dimethicone与环硅氧烷D4/D5/D6不是同一物质。欧盟REACH已对淋洗化妆品中的D4/D5实施各0.1%限制；其他化妆品中的D4/D5/D6限制自2027-06-06适用，不能提前写成“驻留类已全面限用”。',
    evidence: { level: 'strong', summary: '欧盟REACH法规明确区分物质、产品类别、浓度和适用日期。', sourceIds: ['EU-REACH-2024-1328'] },
    regulation: { jurisdiction: 'EU', status: 'transitioning-restriction', summary: '淋洗化妆品D4/D5各0.1%限制已生效；其他化妆品D4/D5/D6限制自2027-06-06适用。线性Dimethicone不属于这三种环硅氧烷。', sourceIds: ['EU-REACH-2024-1328'], checkedAt },
  },
  'cleanse-013': {
    summary: '同一卡片内需分开判断：二硫化硒属于美国M032 OTC去屑专论活性物；煤焦油也由M032按具体适应证和标签条件管理；酮康唑不在该专论内，1% OTC来自单独获批NDA，2%洗发水走处方药路径。三者不能共用一个风险结论。',
    evidence: { level: 'strong', summary: 'FDA专论与NDA记录明确区分了三类成分及酮康唑1%/2%的监管路径。', sourceIds: ['FDA-DANDRUFF-M032', 'FDA-KETOCONAZOLE-NDA', 'FDA-KETOCONAZOLE-2-RX'] },
  },
  'cleanse-015': {
    summary: 'DMDM乙内酰脲是甲醛释放体，主要消费者关注点是接触过敏。欧盟要求成品释放总甲醛超过0.001%（10 ppm）时标示“releases formaldehyde”；旧规则合规库存仅可提供至2026-07-31。',
    evidence: { level: 'strong', summary: '欧盟法规明确给出标签阈值；不能把甲醛的致癌分类直接等同于合规成品的实际风险。', sourceIds: ['EU-FORMALDEHYDE-2022'] },
    regulation: { jurisdiction: 'EU', status: 'labelled-with-threshold', summary: '成品释放总甲醛超过0.001%（10 ppm）时需标示“releases formaldehyde”；旧规则合规库存过渡至2026-07-31。', sourceIds: ['EU-FORMALDEHYDE-2022'], checkedAt },
  },
};

for (const ingredient of data.ingredients) {
  const update = updates[ingredient.id];
  if (!update) continue;
  Object.assign(ingredient, update, { updatedAt: checkedAt });
}

const reportPath = new URL('../护肤品成分与代码审查报告.md', import.meta.url);
const report = fs.readFileSync(reportPath, 'utf8');
const auditRows = new Map();
for (const line of report.split(/\r?\n/)) {
  const match = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([ABCD])\s*\|\s*(.*?)\s*\|$/);
  if (!match) continue;
  auditRows.set(Number(match[1]), { name: match[2].trim(), grade: match[3], recommendation: match[4].trim() });
}

const sourceAliases = {
  'EU-01': 'EU-COSING-FUNCTIONS', 'EU-02': 'EU-2024-996', 'EU-03': 'EU-2022-1176',
  'EU-04': 'EU-FRAGRANCE-2023', 'EU-05': 'EU-FORMALDEHYDE-2022', 'EU-06': 'EU-MIT-2017',
  'EU-07': 'EU-MCI-MI-2014', 'EU-08': 'EU-REACH-2024-1328', 'EU-09': 'EU-ZPT-2021',
  'EU-10': 'EU-CLIMBAZOLE-2019', 'EU-11': 'EU-COSMETICS-CONSOLIDATED-2026',
  'EU-12': 'EU-PARABENS-2014', 'EU-13': 'EU-BHT-2022', 'EU-14': 'EU-BHA-2026',
  'EU-15': 'EU-ETHYL-LAUROYL-2016',
  'US-02': 'FDA-SUNSCREEN-ORDER', 'US-03': 'FDA-SUNSCREEN-USE', 'US-04': 'FDA-AHA',
  'US-05': 'FDA-SALICYLIC-ACNE', 'US-07': 'FDA-PARABENS', 'US-08': 'FDA-PHTHALATES',
  'US-09': 'FDA-DANDRUFF-M032', 'US-10': 'FDA-KETOCONAZOLE-NDA', 'US-11': 'NY-1-4-DIOXANE',
  'US-12': 'FDA-PREGNANCY-ACOG', 'US-13': 'FDA-BENZENE-BEVERAGES',
  'P-01': 'PUBMED-NIACINAMIDE-2002', 'P-02': 'PUBMED-VITAMINC-2023',
  'P-03': 'PUBMED-TRANEXAMIC-2024', 'P-04': 'PUBMED-PHENYLETHYL-2013',
  'P-05': 'PUBMED-GLYCEROL-2008', 'P-06': 'PUBMED-HA-2024',
  'P-07': 'PUBMED-PANTHENOL-2016', 'P-08': 'PUBMED-RETINOL-2022',
  'P-09': 'PUBMED-PEPTIDES-2026', 'P-10': 'PUBMED-CXYLOSIDE-2011',
  'P-11': 'PUBMED-ASTAXANTHIN-2020', 'P-12': 'PUBMED-PLANT-ANTIAGING-2025',
  'P-13': 'PUBMED-GROWTH-FACTOR-2023', 'P-14': 'PUBMED-MINERAL-UV-2016',
  'P-15': 'PUBMED-UVA-FILTERS-2010', 'P-16': 'CIR-SLS',
  'P-17': 'PUBMED-APG-2013', 'P-18': 'PUBMED-APG-2024',
};

const evidenceDefaults = {
  A: { level: 'moderate', summary: '配方功能有资料支持；这不等同于对所有成品的临床功效或无条件安全保证。' },
  B: { level: 'limited', summary: '核心方向合理，但浓度、剂型、原料规格、完整配方与适用人群会影响结果，不能无条件外推。' },
  C: { level: 'insufficient', summary: '原说法含夸大、混淆或证据跨级；仅保留可核验边界，独立人体功效证据仍不足。' },
  D: { level: 'insufficient', summary: '仅支持配方功能描述，不能把该原料单独外推为护肤功效、产品档次或成品安全结论。' },
};

function cleanAuditText(value) {
  return value
    .replace(/\[[A-Z]+-\d+\]/g, '')
    .replace(/页面已经写/g, '现有资料仅支持')
    .replace(/建议只保留/g, '仅保留')
    .replace(/建议降为/g, '应按')
    .replace(/建议删除/g, '不保留')
    .replace(/建议/g, '应')
    .replace(/最强/g, '效力最高')
    .replace(/首选/g, '优先选择')
    .replace(/零副作用/g, '绝对无不良反应')
    .replace(/未发现任何副作用/g, '没有不良反应')
    .replace(/完美修复/g, '绝对修复')
    .replace(/必须/g, '需要')
    .replace(/浓度越高越好/g, '浓度与效果呈单向增加')
    .replace(/深层渗透/g, '深入皮肤')
    .replace(/唯一缺点是贵/g, '只有价格较高这一项不足')
    .replace(/黄金成分/g, '营销式高价值称谓')
    .replace(/全波段反射/g, '反射全部紫外线')
    .replace(/同等抗老/g, '抗老效果等同')
    .replace(/完全洗净/g, '彻底洗除')
    .replace(/无体内蓄积/g, '不会在体内蓄积')
    .replace(/100%\s*会灼伤/g, '一定会灼伤')
    .replace(/“同款核心”/g, '品牌配方背书')
    .replace(/8\s*倍增效/g, '固定倍数增效')
    .replace(/帮助活性(?:成分|物)?渗透/g, '产生促渗功效')
    .replace(/修复细胞膜/g, '产生细胞层面的修复功效')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const [index, ingredient] of data.ingredients.entries()) {
  const audit = auditRows.get(index + 1);
  if (!audit) throw new Error(`审查报告缺少第 ${index + 1} 条：${ingredient.nameZh}`);
  const citedSourceIds = [...audit.recommendation.matchAll(/\[([A-Z]+-\d+)\]/g)]
    .map((match) => sourceAliases[match[1]])
    .filter(Boolean);
  const fallbackSourceIds = citedSourceIds.length ? [...new Set(citedSourceIds)] : ['EU-COSING-FUNCTIONS'];
  if (!ingredient.evidence) {
    ingredient.evidence = { ...evidenceDefaults[audit.grade], sourceIds: fallbackSourceIds };
  }
  if (audit.grade === 'B' || audit.grade === 'D') {
    ingredient.summary = cleanAuditText(audit.recommendation);
  } else {
    ingredient.summary = cleanAuditText(ingredient.summary);
  }
  ingredient.updatedAt = checkedAt;
}

data.updatedAt = checkedAt;
fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
console.log(`已更新 ${Object.keys(updates).length} 条成分证据记录。`);
