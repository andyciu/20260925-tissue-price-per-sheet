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
- 純 HTML / CSS / JavaScript，不需要建置

## 本機執行

直接用瀏覽器打開 `index.html` 即可。

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

> 也可以改用 **Deploy from a branch**，選 `main` 分支、`/ (root)` 資料夾，一樣可以運作。
