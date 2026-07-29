import fs from 'node:fs';
import path from 'node:path';
import { pinyin } from 'pinyin-pro';

const root = process.cwd();
const dataPath = path.join(root, 'data', 'ingredients.json');
const outputPath = path.join(root, 'js', 'pinyin.js');
const checkOnly = process.argv.includes('--check');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function initials(value) {
  const chinese = (value.match(/[\u3400-\u9fff]+/gu) || []).join('');
  if (!chinese) return '';
  return pinyin(chinese, { toneType: 'none', type: 'array', nonZh: 'removed' })
    .map((syllable) => syllable[0] || '')
    .join('')
    .toLowerCase();
}

const index = Object.fromEntries(data.ingredients.map((ingredient) => {
  const variants = [ingredient.nameZh, ...ingredient.aliases]
    .map(initials)
    .filter(Boolean);
  return [ingredient.id, [...new Set(variants)].join(' ')];
}));

const output = `// 由 scripts/generate-pinyin.mjs 生成，请勿手工编辑。\nexport const pinyinInitialsById = ${JSON.stringify(index, null, 2)};\n`;

if (checkOnly) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== output) {
    console.error('拼音索引不是最新版本；请运行 npm run generate:pinyin。');
    process.exit(1);
  }
  console.log(`拼音索引覆盖 ${Object.keys(index).length} 条成分。`);
} else {
  fs.writeFileSync(outputPath, output);
  console.log(`已生成 ${path.relative(root, outputPath)}（${Object.keys(index).length} 条）。`);
}
