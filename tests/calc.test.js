const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, compare, toNumber } = require('../calc.js');

test('基本計算：100 抽 × 12 包 = 240 元', () => {
  const r = calculate({ sheetsPerPack: '100', packs: '12', price: '240' });
  assert.equal(r.ok, true);
  assert.equal(r.totalSheets, 1200);
  assert.equal(r.perSheet, 0.2);
  assert.equal(r.perHundred, 20);
  assert.equal(r.perPack, 20);
});

test('接受千分位逗號與小數價格', () => {
  assert.equal(toNumber('1,299'), 1299);
  const r = calculate({ sheetsPerPack: '110', packs: '8', price: '189.5' });
  assert.equal(r.ok, true);
  assert.ok(Math.abs(r.perSheet - 189.5 / 880) < 1e-12);
});

test('欄位未填完時不算錯誤', () => {
  assert.deepEqual(calculate({ sheetsPerPack: '100', packs: '', price: '199' }), { ok: false, error: null });
});

test('無效輸入給出錯誤訊息', () => {
  assert.equal(calculate({ sheetsPerPack: '0', packs: '1', price: '1' }).error, '每包抽數必須大於 0');
  assert.equal(calculate({ sheetsPerPack: '100', packs: '-2', price: '1' }).error, '包數必須大於 0');
  assert.equal(calculate({ sheetsPerPack: '100', packs: '2', price: '-1' }).error, '價格不能是負數');
  assert.equal(calculate({ sheetsPerPack: 'abc', packs: '2', price: '1' }).ok, false);
});

test('比較：找出最便宜並算出貴多少', () => {
  const results = [
    calculate({ sheetsPerPack: '100', packs: '10', price: '250' }), // 0.25
    calculate({ sheetsPerPack: '100', packs: '10', price: '200' }), // 0.20
    calculate({ sheetsPerPack: '100', packs: '', price: '200' }),   // 未完成
  ];
  const { cheapestIndex, diffs } = compare(results);
  assert.equal(cheapestIndex, 1);
  assert.ok(Math.abs(diffs[0] - 0.25) < 1e-12);
  assert.equal(diffs[1], 0);
  assert.equal(diffs[2], null);
});

test('比較：沒有有效結果', () => {
  assert.deepEqual(compare([calculate({ sheetsPerPack: '', packs: '', price: '' })]), { cheapestIndex: -1, diffs: [null] });
});
