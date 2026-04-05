/**
 * sample.js
 * サンプルデータ定義 - バイクばらし（Miroボードから取得）
 *
 * データ構造:
 *   cols  : 列定義  { id, name, side:'elem'|'req', order }
 *   nodes : ノード  { id, colId, name }
 *   links : リンク  { id, f:fromId, t:toId, s:'strong'|'mid'|'weak' }
 *
 * 独自サンプルに差し替える場合はこのファイルを編集してください。
 */

function loadSample() {
  // リセット
  cols = []; nds = []; lks = []; idc = 1;
  hlState = { nodeId: null, depth: 0 };
  flipped = false;
  document.getElementById('flipBtn').textContent = '⇄ 左右反転';
  document.getElementById('flipBtn').style.color = '';
  document.getElementById('flipBtn').style.borderColor = '';
  document.getElementById('hlInd').classList.remove('show');

  // ── 列定義 ──────────────────────────────────────────
  // 要素側（左）: バイク全体 → 系統 → 主要部品 → 詳細部品
  // 要件側（右）: 機能要件(L1) → 走行性能(L0)
  const cBike   = uid(), cSys  = uid(), cPart   = uid(), cDetail = uid();
  const cFunc   = uid(), cPerf = uid();

  cols = [
    { id: cBike,   name: 'バイク',          side: 'elem', order: 0 },
    { id: cSys,    name: '系統',             side: 'elem', order: 1 },
    { id: cPart,   name: '主要部品',         side: 'elem', order: 2 },
    { id: cDetail, name: '詳細部品',         side: 'elem', order: 3 },
    { id: cFunc,   name: '機能要件（L1）',   side: 'req',  order: 0 },
    { id: cPerf,   name: '走行性能（L0）',   side: 'req',  order: 1 },
  ];

  // ── ノード定義 ───────────────────────────────────────
  // バイク
  const nBike = uid();

  // 系統（Miroボード「バイクばらし」の8カテゴリ）
  const nEng = uid(), nExh = uid(), nHnd = uid(), nSus = uid();
  const nBrk = uid(), nBdy = uid(), nElc = uid(), nCwl = uid();

  // 主要部品
  const pEng = uid(), pMfl = uid(), pHnd = uid(), pFSs = uid();
  const pRSs = uid(), pWhl = uid(), pBrk = uid(), pFrm = uid();
  const pLit = uid(), pBdC = uid();

  // 詳細部品（Miroボードから取得した実データ）
  const dCyl = uid(), dPst  = uid(), dCrk  = uid(), dCam  = uid(), dCon  = uid();
  const dExP = uid(), dMflC = uid();
  const dFrk = uid(), dRSk  = uid(), dSwA  = uid();
  const dThk = uid(), dClt  = uid(), dBkL  = uid();
  const dSpr = uid(), dChn  = uid();
  const dDsc = uid(), dCal  = uid(), dBkPed = uid();
  const dHdl = uid(), dTail = uid(), dWnk  = uid();
  const dBdCv = uid(), dFnd = uid(), dTlC  = uid();

  // 機能要件（L1）
  const rCmb = uid(), rExR = uid(), rStr = uid(), rAbs = uid();
  const rTrc = uid(), rBkF = uid(), rBkR = uid(), rLit = uid();

  // 走行性能（L0）
  const rPow = uid(), rHdl = uid(), rRid = uid();
  const rFul = uid(), rStp = uid(), rSaf = uid();

  nds = [
    // バイク
    { id: nBike,  colId: cBike,   name: 'バイク' },

    // 系統
    { id: nEng,   colId: cSys,    name: 'エンジン系' },
    { id: nExh,   colId: cSys,    name: '排気系' },
    { id: nHnd,   colId: cSys,    name: 'ハンドル・操作系' },
    { id: nSus,   colId: cSys,    name: 'サスペンション\nホイール系' },
    { id: nBrk,   colId: cSys,    name: 'ブレーキ系' },
    { id: nBdy,   colId: cSys,    name: '車体系' },
    { id: nElc,   colId: cSys,    name: '電装系' },
    { id: nCwl,   colId: cSys,    name: 'フレーム・カウル系' },

    // 主要部品
    { id: pEng,   colId: cPart,   name: 'エンジン' },
    { id: pMfl,   colId: cPart,   name: 'マフラー' },
    { id: pHnd,   colId: cPart,   name: 'ハンドルバー' },
    { id: pFSs,   colId: cPart,   name: 'フロントサス' },
    { id: pRSs,   colId: cPart,   name: 'リアサス' },
    { id: pWhl,   colId: cPart,   name: 'ホイール' },
    { id: pBrk,   colId: cPart,   name: 'ブレーキ' },
    { id: pFrm,   colId: cPart,   name: 'フレーム' },
    { id: pLit,   colId: cPart,   name: 'ライト' },
    { id: pBdC,   colId: cPart,   name: 'ボディカバー' },

    // 詳細部品（Miroデータ準拠）
    { id: dCyl,   colId: cDetail, name: 'シリンダー' },
    { id: dPst,   colId: cDetail, name: 'ピストンリング' },
    { id: dCrk,   colId: cDetail, name: 'クランクシャフト' },
    { id: dCam,   colId: cDetail, name: 'カム' },
    { id: dCon,   colId: cDetail, name: 'コンロッド' },
    { id: dExP,   colId: cDetail, name: 'エキゾーストパイプ' },
    { id: dMflC,  colId: cDetail, name: 'マフラーカバー' },
    { id: dFrk,   colId: cDetail, name: 'フロントフォーク' },
    { id: dRSk,   colId: cDetail, name: 'リアショックアブソーバー' },
    { id: dSwA,   colId: cDetail, name: 'スイングアーム' },
    { id: dThk,   colId: cDetail, name: 'スロットルボディ' },
    { id: dClt,   colId: cDetail, name: 'クラッチレバー' },
    { id: dBkL,   colId: cDetail, name: 'ブレーキレバー' },
    { id: dSpr,   colId: cDetail, name: 'スプロケット' },
    { id: dChn,   colId: cDetail, name: 'ドライブチェーン' },
    { id: dDsc,   colId: cDetail, name: 'ブレーキディスク' },
    { id: dCal,   colId: cDetail, name: 'ブレーキキャリパー' },
    { id: dBkPed, colId: cDetail, name: 'ブレーキペダル' },
    { id: dHdl,   colId: cDetail, name: 'ヘッドライト' },
    { id: dTail,  colId: cDetail, name: 'テールランプ' },
    { id: dWnk,   colId: cDetail, name: 'ウインカーランプ' },
    { id: dBdCv,  colId: cDetail, name: 'ボディカバー' },
    { id: dFnd,   colId: cDetail, name: 'フェンダー' },
    { id: dTlC,   colId: cDetail, name: 'テールカウル' },

    // 機能要件
    { id: rCmb,   colId: cFunc,   name: '燃焼・動力変換' },
    { id: rExR,   colId: cFunc,   name: '排気効率' },
    { id: rStr,   colId: cFunc,   name: 'ハンドル操舵' },
    { id: rAbs,   colId: cFunc,   name: '衝撃吸収' },
    { id: rTrc,   colId: cFunc,   name: 'トラクション' },
    { id: rBkF,   colId: cFunc,   name: '前輪制動' },
    { id: rBkR,   colId: cFunc,   name: '後輪制動' },
    { id: rLit,   colId: cFunc,   name: '照明・視認性' },

    // 走行性能
    { id: rPow,   colId: cPerf,   name: '出力・加速' },
    { id: rHdl,   colId: cPerf,   name: '操縦安定性' },
    { id: rRid,   colId: cPerf,   name: '乗り心地' },
    { id: rFul,   colId: cPerf,   name: '燃費効率' },
    { id: rStp,   colId: cPerf,   name: '制動性能' },
    { id: rSaf,   colId: cPerf,   name: '安全・視認性' },
  ];

  // ── リンク定義 ──────────────────────────────────────
  // lk(fromId, toId, strength:'strong'|'mid'|'weak')
  function lk(f, t, s) { lks.push({ id: uid(), f, t, s }); }

  // バイク → 系統
  lk(nBike, nEng, 'strong'); lk(nBike, nExh, 'strong'); lk(nBike, nHnd, 'strong');
  lk(nBike, nSus, 'strong'); lk(nBike, nBrk, 'strong'); lk(nBike, nBdy, 'strong');
  lk(nBike, nElc, 'mid');    lk(nBike, nCwl, 'mid');

  // 系統 → 主要部品
  lk(nEng, pEng, 'strong');  lk(nExh, pMfl, 'strong');  lk(nHnd, pHnd, 'strong');
  lk(nSus, pFSs, 'strong');  lk(nSus, pRSs, 'strong');  lk(nSus, pWhl, 'mid');
  lk(nBrk, pBrk, 'strong');  lk(nBdy, pFrm, 'strong');
  lk(nElc, pLit, 'strong');  lk(nCwl, pBdC, 'strong');

  // 主要部品 → 詳細部品
  lk(pEng, dCyl,  'strong'); lk(pEng, dPst,  'strong'); lk(pEng, dCrk,  'strong');
  lk(pEng, dCam,  'mid');    lk(pEng, dCon,  'mid');
  lk(pMfl, dExP,  'strong'); lk(pMfl, dMflC, 'mid');
  lk(pFSs, dFrk,  'strong');
  lk(pRSs, dRSk,  'strong'); lk(pRSs, dSwA,  'mid');
  lk(pWhl, dSpr,  'strong'); lk(pWhl, dChn,  'strong');
  lk(pHnd, dThk,  'strong'); lk(pHnd, dClt,  'mid');    lk(pHnd, dBkL,  'mid');
  lk(pBrk, dDsc,  'strong'); lk(pBrk, dCal,  'strong'); lk(pBrk, dBkPed,'mid');
  lk(pFrm, dSwA,  'strong');
  lk(pLit, dHdl,  'strong'); lk(pLit, dTail, 'strong'); lk(pLit, dWnk,  'mid');
  lk(pBdC, dBdCv, 'strong'); lk(pBdC, dFnd,  'mid');    lk(pBdC, dTlC,  'mid');

  // 詳細部品 → 機能要件
  lk(dCyl,   rCmb, 'strong'); lk(dPst,  rCmb, 'strong'); lk(dCrk,  rCmb, 'strong');
  lk(dCam,   rCmb, 'mid');    lk(dCon,  rCmb, 'mid');
  lk(dExP,   rExR, 'strong'); lk(dMflC, rExR, 'mid');
  lk(dFrk,   rAbs, 'strong'); lk(dRSk,  rAbs, 'strong'); lk(dSwA,  rAbs, 'mid');
  lk(dThk,   rStr, 'strong'); lk(dClt,  rStr, 'mid');    lk(dBkL,  rStr, 'weak');
  lk(dSpr,   rTrc, 'strong'); lk(dChn,  rTrc, 'strong');
  lk(dDsc,   rBkF, 'strong'); lk(dCal,  rBkF, 'strong'); lk(dBkL,  rBkF, 'mid');
  lk(dDsc,   rBkR, 'mid');    lk(dCal,  rBkR, 'mid');    lk(dBkPed,rBkR, 'strong');
  lk(dHdl,   rLit, 'strong'); lk(dTail, rLit, 'strong'); lk(dWnk,  rLit, 'mid');

  // 機能要件 → 走行性能
  lk(rCmb, rPow, 'strong'); lk(rTrc, rPow, 'mid');
  lk(rStr, rHdl, 'strong'); lk(rAbs, rHdl, 'mid');
  lk(rAbs, rRid, 'strong'); lk(rTrc, rRid, 'weak');
  lk(rCmb, rFul, 'mid');    lk(rExR, rFul, 'mid');
  lk(rBkF, rStp, 'strong'); lk(rBkR, rStp, 'strong');
  lk(rLit, rSaf, 'strong');

  fitView();
  render();
}
