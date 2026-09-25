/**
 * 衛生紙每抽價格計算（純函式，瀏覽器與 Node 皆可使用）
 */
(function (root) {
  'use strict';

  /** 把輸入字串轉成數字；空字串或無效值回傳 NaN */
  function toNumber(value) {
    if (typeof value === 'number') return value;
    if (value == null) return NaN;
    const text = String(value).trim().replace(/,/g, '');
    if (text === '') return NaN;
    return Number(text);
  }

  /**
   * 計算單一組合
   * @param {{sheetsPerPack: any, packs: any, price: any}} input
   * @returns {{ok: true, totalSheets: number, perSheet: number, perHundred: number, perPack: number}
   *          | {ok: false, error: string|null}}
   *   error 為 null 表示尚未填完（不是錯誤，只是還不能算）
   */
  function calculate(input) {
    const sheetsPerPack = toNumber(input.sheetsPerPack);
    const packs = toNumber(input.packs);
    const price = toNumber(input.price);

    if ([sheetsPerPack, packs, price].some(Number.isNaN)) {
      return { ok: false, error: null };
    }
    if (!Number.isFinite(sheetsPerPack) || sheetsPerPack <= 0) {
      return { ok: false, error: '每包抽數必須大於 0' };
    }
    if (!Number.isFinite(packs) || packs <= 0) {
      return { ok: false, error: '包數必須大於 0' };
    }
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, error: '價格不能是負數' };
    }

    const totalSheets = sheetsPerPack * packs;
    const perSheet = price / totalSheets;
    return {
      ok: true,
      totalSheets: totalSheets,
      perSheet: perSheet,
      perHundred: perSheet * 100,
      perPack: price / packs,
    };
  }

  /**
   * 比較多個結果，回傳最便宜的索引與每個組合相對最便宜貴了多少（比例）
   * @param {Array<ReturnType<typeof calculate>>} results
   * @returns {{cheapestIndex: number, diffs: Array<number|null>}}
   */
  function compare(results) {
    let cheapestIndex = -1;
    results.forEach(function (r, i) {
      if (!r.ok) return;
      if (cheapestIndex === -1 || r.perSheet < results[cheapestIndex].perSheet) {
        cheapestIndex = i;
      }
    });
    const min = cheapestIndex === -1 ? null : results[cheapestIndex].perSheet;
    const diffs = results.map(function (r) {
      if (!r.ok || min === null) return null;
      if (min === 0) return r.perSheet === 0 ? 0 : Infinity;
      return r.perSheet / min - 1;
    });
    return { cheapestIndex: cheapestIndex, diffs: diffs };
  }

  const TissueCalc = { toNumber: toNumber, calculate: calculate, compare: compare };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TissueCalc;
  } else {
    root.TissueCalc = TissueCalc;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
