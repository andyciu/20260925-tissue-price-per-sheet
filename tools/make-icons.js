/**
 * 產生 App 圖示（SVG 與 PNG）。
 *
 * 一般不需要執行；只有修改圖示設計時才要重新產生：
 *   npm i --no-save playwright && node tools/make-icons.js
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'icons');
const BG = '#d9713b';

// 圖案：抽取式面紙盒 + 價格硬幣，畫在 512×512 的畫布上
const ART = `
  <rect x="104" y="252" width="304" height="168" rx="30" fill="#f6dccb"/>
  <rect x="104" y="252" width="304" height="146" rx="30" fill="#fff8f2"/>
  <rect x="172" y="268" width="168" height="26" rx="13" fill="#b95a28" opacity=".35"/>
  <path d="M184 284 C170 244 188 204 220 180 C238 166 240 132 268 108 C274 140 298 158 316 186 C336 218 336 256 326 284 Z" fill="#ffffff"/>
  <path d="M266 116 C250 168 238 222 250 284" fill="none" stroke="#f0d6c4" stroke-width="8" stroke-linecap="round"/>
  <circle cx="366" cy="372" r="74" fill="#2f8a55" stroke="${BG}" stroke-width="16"/>
  <text x="366" y="400" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="84" fill="#ffffff">$</text>
`;

function svg({ rounded, scale }) {
  const bg = rounded
    ? `<rect width="512" height="512" rx="112" fill="${BG}"/>`
    : `<rect width="512" height="512" fill="${BG}"/>`;
  const t = 256 * (1 - scale);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${bg}<g transform="translate(${t} ${t}) scale(${scale})">${ART}</g></svg>\n`;
}

// any：圓角、圖案較滿；maskable：滿版背景、圖案縮進安全區（中心 80% 圓內）
const icon = svg({ rounded: true, scale: 1 });
const maskable = svg({ rounded: false, scale: 0.78 });

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'icon.svg'), icon);
  fs.writeFileSync(path.join(OUT, 'icon-maskable.svg'), maskable);

  const { chromium } = require('playwright');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage();
  const render = async (source, size, file) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${source}`);
    await page.screenshot({ path: path.join(OUT, file), omitBackground: true });
  };
  await render(icon, 192, 'icon-192.png');
  await render(icon, 512, 'icon-512.png');
  await render(maskable, 512, 'icon-maskable-512.png');
  // iOS 會自己加圓角，所以用滿版版本
  await render(svg({ rounded: false, scale: 0.9 }), 180, 'apple-touch-icon.png');
  await browser.close();
  console.log('icons written to', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
