# 🧻 衛生紙每抽價格計算機

輸入「每包抽數」、「包數」與「組合總價」，立即算出這個組合 **每一抽多少錢**。
可以新增多個組合互相比較，自動標出最划算的那一組，並顯示其他組合貴了幾 %。

👉 **線上使用：<https://andyciu.github.io/20260925-tissue-price-per-sheet/>**

## 功能

- 每抽價格、每 100 抽價格、每包價格、總抽數
- 多組合比較，標示「最划算」與價差百分比
- RWD：手機單欄、平板兩欄、桌機三欄；數字鍵盤、按 Enter 跳下一格
- 支援深色模式
- 輸入內容自動存在瀏覽器（localStorage），不會上傳
- PWA：可以安裝到手機主畫面，像一般 App 一樣開啟，沒有網路也能用
- 純 HTML / CSS / JavaScript，不需要建置

## 安裝到手機

- **Android（Chrome）**：打開網址 → 右上角選單 → **安裝應用程式**（或 **加到主畫面**）
- **iPhone（Safari）**：打開網址 → 分享按鈕 → **加入主畫面**

安裝後從主畫面開啟會是獨立視窗、沒有網址列，離線也能使用。
網站更新後，App 會在下次開啟時自動換成新版。

## 本機執行

直接用瀏覽器打開 `index.html` 即可（這種開法不會啟用離線功能）。

要測試 PWA（安裝、離線），需要透過 HTTP 開啟，例如：

```bash
python3 -m http.server 8000
# 瀏覽 http://localhost:8000/
```

本機測試時，service worker 會把檔案快取起來；修改檔案後，請在 DevTools →
Application → Service workers 勾選 **Update on reload**，或清除網站資料再重新整理。

執行測試（需要 Node.js 18+）：

```bash
node --test
```

## 部署到 GitHub Pages

本專案已附 `.github/workflows/pages.yml`，推送到 `main` 分支時會先跑測試再自動部署。

1. 到 GitHub repo 的 **Settings → Pages**
2. **Build and deployment → Source** 選擇 **GitHub Actions**
3. 把程式碼合併／推送到 `main`，完成後網址會是
   `https://<你的帳號>.github.io/20260925-tissue-price-per-sheet/`

> 部署流程會把 `sw.js` 裡的 `__BUILD__` 換成 commit SHA，讓已安裝的 App 知道有新版。
> 所以請使用 **GitHub Actions** 部署，不要改用 **Deploy from a branch**，否則已安裝的 App 會一直停在舊版。

## App 圖示

圖示放在 `icons/`，由 `tools/make-icons.js` 產生。修改設計後重新產生：

```bash
npm i --no-save playwright && node tools/make-icons.js
```
