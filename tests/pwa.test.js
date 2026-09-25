const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('manifest.webmanifest'));

/** 讀 PNG 檔頭取得寬高 */
function pngSize(file) {
  const buf = fs.readFileSync(path.join(root, file));
  assert.equal(buf.toString('ascii', 1, 4), 'PNG', `${file} 不是 PNG`);
  return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
}

test('manifest 有可安裝所需的欄位', () => {
  for (const key of ['name', 'short_name', 'start_url', 'display', 'icons']) {
    assert.ok(manifest[key], `缺少 ${key}`);
  }
  const sizes = manifest.icons.filter((i) => i.type === 'image/png').map((i) => i.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'), '需要 192 與 512 的 PNG 圖示');
  assert.ok(manifest.icons.some((i) => i.purpose === 'maskable'), '需要 maskable 圖示');
});

test('manifest 的圖示與截圖檔案存在且尺寸正確', () => {
  for (const item of [...manifest.icons, ...(manifest.screenshots || [])]) {
    assert.ok(fs.existsSync(path.join(root, item.src)), `找不到 ${item.src}`);
    if (item.type === 'image/png') assert.equal(pngSize(item.src), item.sizes, item.src);
  }
});

test('service worker 預先快取的檔案都存在', () => {
  const sw = read('sw.js');
  const block = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
  assert.ok(block, '找不到 ASSETS 清單');
  const assets = [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  for (const asset of assets) {
    if (asset === './') continue;
    assert.ok(fs.existsSync(path.join(root, asset)), `找不到 ${asset}`);
  }
  // 部署時會替換這個佔位字串，讓每次部署都有新的快取名稱
  assert.match(sw, /__BUILD__/);
});

test('index.html 連結 manifest 與 iOS 圖示', () => {
  const html = read('index.html');
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png">/);
  assert.equal(pngSize('icons/apple-touch-icon.png'), '180x180');
});
