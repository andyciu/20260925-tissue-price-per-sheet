(function () {
  'use strict';

  const STORAGE_KEY = 'tissue-price-per-sheet:v1';
  const FIELDS = ['sheetsPerPack', 'packs', 'price'];

  const cardsEl = document.getElementById('cards');
  const template = document.getElementById('card-template');
  const addBtn = document.getElementById('add');
  const resetBtn = document.getElementById('reset');

  let items = load();
  if (items.length === 0) items = [newItem()];

  function newItem() {
    return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: '', sheetsPerPack: '', packs: '', price: '' };
  }

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(data)) {
        return data.filter(function (d) { return d && typeof d.id === 'string'; }).map(function (d) {
          return {
            id: d.id,
            name: String(d.name || ''),
            sheetsPerPack: String(d.sheetsPerPack || ''),
            packs: String(d.packs || ''),
            price: String(d.price || ''),
          };
        });
      }
    } catch (e) { /* 無法讀取就從空白開始 */ }
    return [];
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* 忽略 */ }
  }

  function letter(index) {
    return '組合 ' + String.fromCharCode(65 + (index % 26)) + (index >= 26 ? Math.floor(index / 26) : '');
  }

  function fmt(n, min, max) {
    return n.toLocaleString('zh-TW', { minimumFractionDigits: min, maximumFractionDigits: max });
  }

  function formatPerSheet(n) {
    // 每抽通常不到 1 元，多給幾位小數才看得出差異
    return n >= 10 ? fmt(n, 2, 2) : fmt(n, 4, 4);
  }

  function formatPercent(ratio) {
    if (!Number.isFinite(ratio)) return '—';
    return fmt(ratio * 100, 0, 1) + '%';
  }

  /** 重新建立所有卡片（新增、刪除、重設時使用） */
  function render() {
    cardsEl.textContent = '';
    items.forEach(function (item, index) {
      const node = template.content.firstElementChild.cloneNode(true);
      node.dataset.id = item.id;

      const nameInput = node.querySelector('.name');
      nameInput.value = item.name;
      nameInput.placeholder = letter(index) + '（可輸入品牌名稱）';

      FIELDS.forEach(function (key) {
        node.querySelector('[data-key="' + key + '"]').value = item[key];
      });

      node.querySelector('.remove').hidden = items.length <= 1;
      cardsEl.appendChild(node);
    });
    updateResults();
  }

  /** 只更新計算結果，不動輸入框（避免手機上輸入時失去焦點） */
  function updateResults() {
    const results = items.map(function (item) { return TissueCalc.calculate(item); });
    const cmp = TissueCalc.compare(results);
    const validCount = results.filter(function (r) { return r.ok; }).length;

    Array.prototype.forEach.call(cardsEl.children, function (card, i) {
      const r = results[i];
      const hint = card.querySelector('.result-hint');
      const body = card.querySelector('.result-body');
      const badge = card.querySelector('.badge');
      card.classList.remove('is-cheapest', 'is-error');

      if (!r.ok) {
        body.hidden = true;
        hint.hidden = false;
        hint.textContent = r.error || '填完三個欄位就會顯示結果';
        if (r.error) card.classList.add('is-error');
        return;
      }

      hint.hidden = true;
      body.hidden = false;
      card.querySelector('.per-sheet').textContent = formatPerSheet(r.perSheet);
      card.querySelector('.per-hundred').textContent = fmt(r.perHundred, 2, 2) + ' 元';
      card.querySelector('.per-pack').textContent = fmt(r.perPack, 2, 2) + ' 元';
      card.querySelector('.total-sheets').textContent = fmt(r.totalSheets, 0, 2) + ' 抽';

      badge.hidden = true;
      badge.className = 'badge';
      if (validCount >= 2) {
        badge.hidden = false;
        if (i === cmp.cheapestIndex) {
          badge.textContent = '最划算';
          badge.classList.add('badge-best');
          card.classList.add('is-cheapest');
        } else if (cmp.diffs[i] === 0) {
          badge.textContent = '一樣便宜';
          badge.classList.add('badge-best');
        } else {
          badge.textContent = '貴 ' + formatPercent(cmp.diffs[i]);
          badge.classList.add('badge-worse');
        }
      }
    });
  }

  function findItem(card) {
    const id = card && card.dataset.id;
    return items.find(function (it) { return it.id === id; });
  }

  cardsEl.addEventListener('input', function (e) {
    const card = e.target.closest('.card');
    const item = findItem(card);
    if (!item) return;
    if (e.target.classList.contains('name')) {
      item.name = e.target.value;
    } else if (e.target.dataset.key) {
      item[e.target.dataset.key] = e.target.value;
      updateResults();
    }
    save();
  });

  // 按 Enter 跳到下一個欄位，手機輸入更順手
  cardsEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing || e.target.tagName !== 'INPUT') return;
    e.preventDefault();
    const inputs = Array.prototype.slice.call(cardsEl.querySelectorAll('input'));
    const next = inputs[inputs.indexOf(e.target) + 1];
    if (next) next.focus(); else e.target.blur();
  });

  cardsEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.remove');
    if (!btn) return;
    const item = findItem(btn.closest('.card'));
    if (!item) return;
    items = items.filter(function (it) { return it !== item; });
    save();
    render();
  });

  addBtn.addEventListener('click', function () {
    items.push(newItem());
    save();
    render();
    const last = cardsEl.lastElementChild;
    last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    last.querySelector('[data-key="sheetsPerPack"]').focus({ preventScroll: true });
  });

  resetBtn.addEventListener('click', function () {
    if (!confirm('確定要清除所有組合嗎？')) return;
    items = [newItem()];
    save();
    render();
  });

  render();
})();
