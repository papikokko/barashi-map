/**
 * app.js
 * バイクばらし 要件×要素 マッピングツール - メインロジック
 */

// ── グローバルステート ──────────────────────────────────
let cols = [];   // 列定義
let nds  = [];   // ノード
let lks  = [];   // リンク
let idc  = 1;    // IDカウンター
let tf   = { x: 0, y: 0, sc: 0.7 }; // キャンバス変換
let panning = false, ps = { x: 0, y: 0 };
let curTab  = 'cols';
let flipped = false;  // 左右反転フラグ
let hlState = { nodeId: null, depth: 0 }; // ハイライト状態

const SVG_NS = 'http://www.w3.org/2000/svg';

// レイアウト定数
const CW   = 148;  // 列幅
const CG   = 38;   // 列間ギャップ
const NH   = 32;   // ノード高さ
const NP   = 5;    // ノード間パディング
const CHH  = 36;   // 列ヘッダー高さ
const GRID = NH + NP;

// ── ユーティリティ ──────────────────────────────────────
function uid() { return 'n' + (idc++); }
function cc(s) { return s === 'req' ? '#2ea87e' : '#2e7ea8'; }
function cb(s) { return s === 'req' ? '#1a4a3a' : '#1a2a4a'; }
function lc(s) { return s === 'strong' ? 'rgba(90,150,255,0.9)' : s === 'mid' ? 'rgba(255,140,60,0.8)' : 'rgba(180,180,180,0.35)'; }
function lw(s) { return s === 'strong' ? 2.5 : s === 'mid' ? 1.8 : 1.1; }

function mk(tag, a = {}) {
  const e = document.createElementNS(SVG_NS, tag);
  Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

function openRefUrl(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function showNodeTip(e, text) {
  if (!text) return;
  hideNodeTip();
  const tip = document.createElement('div');
  tip.id = 'nodeTip';
  tip.className = 'node-tip';
  tip.textContent = text;
  tip.style.left = `${e.clientX + 12}px`;
  tip.style.top = `${e.clientY + 12}px`;
  document.body.appendChild(tip);
}

function moveNodeTip(e) {
  const tip = document.getElementById('nodeTip');
  if (!tip) return;
  tip.style.left = `${e.clientX + 12}px`;
  tip.style.top = `${e.clientY + 12}px`;
}

function hideNodeTip() {
  const tip = document.getElementById('nodeTip');
  if (tip) tip.remove();
}

// ── 列順（反転対応）────────────────────────────────────
function getOrder() {
  const e = cols.filter(c => c.side === 'elem').sort((a, b) => a.order - b.order);
  const r = cols.filter(c => c.side === 'req').sort((a, b) => a.order - b.order);
  if (!flipped) return [...e, ...r];
  return [...r.slice().reverse(), ...e.slice().reverse()];
}

function colIdx(colId) {
  return getOrder().findIndex(c => c.id === colId);
}

function cxById(colId) {
  const i = colIdx(colId);
  if (i < 0) return 0;
  const tot = getOrder().length * (CW + CG);
  return -tot / 2 + i * (CW + CG);
}

function maxNdCount() {
  if (!cols.length) return 1;
  return Math.max(...cols.map(c => nds.filter(n => n.colId === c.id).length), 1);
}

function ny(ndId) {
  const nd = nds.find(n => n.id === ndId);
  if (!nd) return 0;
  const cn  = nds.filter(n => n.colId === nd.colId);
  const idx = cn.findIndex(n => n.id === ndId);
  const mx  = maxNdCount();
  return CHH + 12 - (mx * GRID) / 2 + (mx - cn.length) * GRID / 2 + idx * GRID;
}

function ndCenter(id) {
  const nd = nds.find(n => n.id === id);
  if (!nd) return null;
  return { x: cxById(nd.colId) + CW / 2, y: ny(id) + NH / 2 };
}

// ── 段階ハイライト計算 ──────────────────────────────────
// depth=1: 直接つながるノード（前後1列）
// depth=2: さらに1段先まで（前後2列）
// depth=3: 全連鎖
function getHighlighted(startId, depth) {
  if (!startId || depth === 0) return { nodes: new Set(), links: new Set() };

  const hlNodes = new Set([startId]);
  const hlLinks = new Set();
  let frontier  = new Set([startId]);

  for (let d = 0; d < depth; d++) {
    const next = new Set();
    lks.forEach(l => {
      if (frontier.has(l.f) && !hlNodes.has(l.t)) {
        hlNodes.add(l.t); hlLinks.add(l.id); next.add(l.t);
      }
      if (frontier.has(l.t) && !hlNodes.has(l.f)) {
        hlNodes.add(l.f); hlLinks.add(l.id); next.add(l.f);
      }
      if (hlNodes.has(l.f) && hlNodes.has(l.t)) hlLinks.add(l.id);
    });
    frontier = next;
    if (next.size === 0) break;
  }
  return { nodes: hlNodes, links: hlLinks };
}

// ── ノードクリック処理 ──────────────────────────────────
function onNodeClick(e, ndId) {
  e.stopPropagation();
  if (hlState.nodeId === ndId) {
    hlState.depth = hlState.depth >= 3 ? 0 : hlState.depth + 1;
    if (hlState.depth === 0) hlState.nodeId = null;
  } else {
    hlState = { nodeId: ndId, depth: 1 };
  }
  updateHlIndicator();
  render();
}

function updateHlIndicator() {
  const ind = document.getElementById('hlInd');
  if (hlState.nodeId === null) { ind.classList.remove('show'); return; }
  ind.classList.add('show');
  const labels = ['直接接続のみ', '2階層先まで', '全連鎖'];
  document.getElementById('hlLabel').textContent = labels[hlState.depth - 1] || '';
  for (let i = 1; i <= 3; i++) {
    document.getElementById('hlS' + i).classList.toggle('active', i <= hlState.depth);
  }
}

// ── 反転 ────────────────────────────────────────────────
function flipLayout() {
  flipped = !flipped;
  const btn = document.getElementById('flipBtn');
  btn.textContent    = flipped ? '⇄ 元に戻す' : '⇄ 左右反転';
  btn.style.color    = flipped ? 'var(--accent)' : '';
  btn.style.borderColor = flipped ? 'var(--accent)' : '';
  render();
}

// ── 描画 ────────────────────────────────────────────────
function render() {
  const svg  = document.getElementById('cv');
  const wrap = document.getElementById('cwrap');
  const W = wrap.clientWidth, H = wrap.clientHeight;
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.innerHTML = '';

  const g = mk('g');
  g.setAttribute('transform', `translate(${tf.x + W / 2},${tf.y + H / 2}) scale(${tf.sc})`);
  svg.appendChild(g);

  const { nodes: hlN, links: hlL } = getHighlighted(hlState.nodeId, hlState.depth);
  const hasHL = hlState.nodeId !== null;

  const lg = mk('g'); g.appendChild(lg);
  lks.forEach(l => drawLink(lg, l, hasHL, hlL));
  getOrder().forEach(col => drawCol(g, col, hasHL, hlN));

  document.getElementById('zlbl').textContent = Math.round(tf.sc * 100) + '%';
  updateSidebar();
}

function drawCol(g, col, hasHL, hlN) {
  const x      = cxById(col.id);
  const cn     = nds.filter(n => n.colId === col.id);
  const mx     = maxNdCount();
  const colH   = Math.max(180, mx * GRID + CHH + 60);
  const color  = cc(col.side);
  const bgC    = cb(col.side);
  const allFaded = hasHL && cn.every(n => !hlN.has(n.id));

  g.appendChild(mk('rect', { x, y: -colH / 2, width: CW, height: colH, rx: 8, fill: bgC, stroke: color, 'stroke-opacity': allFaded ? '0.08' : '0.2', 'stroke-width': '1', opacity: allFaded ? '0.2' : '1' }));
  g.appendChild(mk('rect', { x, y: -colH / 2, width: CW, height: CHH, rx: 8, fill: color, 'fill-opacity': allFaded ? '0.3' : '0.88' }));
  g.appendChild(mk('rect', { x, y: -colH / 2 + CHH - 5, width: CW, height: 5, fill: color, 'fill-opacity': allFaded ? '0.3' : '0.88' }));

  const ht = mk('text', { x: x + CW / 2, y: -colH / 2 + CHH / 2 + 5, 'text-anchor': 'middle', fill: allFaded ? 'rgba(255,255,255,0.2)' : '#fff', 'font-size': '11', 'font-family': 'Noto Sans JP,sans-serif', 'font-weight': '600' });
  ht.textContent = col.name; g.appendChild(ht);

  const sl = mk('text', { x: x + CW - 5, y: -colH / 2 + 13, 'text-anchor': 'end', fill: allFaded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)', 'font-size': '8', 'font-family': 'DM Mono,monospace' });
  sl.textContent = col.side === 'req' ? '要件' : '要素'; g.appendChild(sl);

  cn.forEach(nd => drawNode(g, nd, col, x, hasHL, hlN));

  const btnY = -colH / 2 + CHH + 12 - (mx * GRID) / 2 + (mx - cn.length) * GRID / 2 + cn.length * GRID + 4;
  const at = mk('text', { x: x + CW / 2, y: btnY + 14, 'text-anchor': 'middle', fill: color, 'fill-opacity': '0.4', 'font-size': '20', cursor: 'pointer' });
  at.textContent = '+';
  at.addEventListener('click', () => openNM(col.id));
  at.addEventListener('mouseover', () => at.setAttribute('fill-opacity', '1'));
  at.addEventListener('mouseout',  () => at.setAttribute('fill-opacity', '0.4'));
  g.appendChild(at);
}

function drawNode(g, nd, col, colX, hasHL, hlN) {
  const y     = ny(nd.id);
  const nx    = colX + 7, nw = CW - 14;
  const color = cc(col.side);
  const isSel = nd.id === hlState.nodeId;
  const isHL  = hlN.has(nd.id);
  const faded = hasHL && !isHL;

  const rect = mk('rect', {
    x: nx, y, width: nw, height: NH, rx: 5,
    fill:           isSel ? cb(col.side) : faded ? '#080b0f' : '#0d1117',
    stroke:         isSel ? color : faded ? 'rgba(80,80,80,0.15)' : color,
    'stroke-width': isSel ? '2' : '1.5',
    'stroke-opacity': isSel ? '1' : faded ? '0.15' : '0.55',
    opacity: faded ? '0.25' : '1'
  });
  rect.style.cursor = 'pointer';

  const del = mk('text', { x: nx + nw - 4, y: y + 12, 'text-anchor': 'end', fill: 'rgba(200,80,80,0)', 'font-size': '11', cursor: 'pointer' });
  del.textContent = '×';

  rect.addEventListener('mouseover', () => {
    if (!faded) { rect.setAttribute('fill', cb(col.side)); rect.setAttribute('stroke-opacity', '1'); del.setAttribute('fill', 'rgba(200,80,80,0.8)'); }
  });
  rect.addEventListener('mouseout', () => {
    if (!isSel) rect.setAttribute('fill', faded ? '#080b0f' : '#0d1117');
    rect.setAttribute('stroke-opacity', isSel ? '1' : faded ? '0.15' : '0.55');
    del.setAttribute('fill', 'rgba(200,80,80,0)');
    hideNodeTip();
  });
  rect.addEventListener('mouseenter', e => showNodeTip(e, nd.description));
  rect.addEventListener('mousemove', moveNodeTip);
  rect.addEventListener('click', e => onNodeClick(e, nd.id));
  g.appendChild(rect);

  g.appendChild(mk('rect', { x: nx, y: y + 6, width: 3, height: NH - 12, rx: 1.5, fill: color, opacity: faded ? '0.15' : '1' }));

  const tx = mk('text', { x: nx + 11, y: y + NH / 2 + 4, fill: faded ? 'rgba(120,120,120,0.3)' : '#e6edf3', 'font-size': '10', 'font-family': 'Noto Sans JP,sans-serif' });
  const ml = 10; tx.textContent = nd.name.length > ml ? nd.name.slice(0, ml) + '…' : nd.name;
  tx.style.cursor = 'pointer';
  tx.addEventListener('mouseenter', e => showNodeTip(e, nd.description));
  tx.addEventListener('mousemove', moveNodeTip);
  tx.addEventListener('mouseleave', hideNodeTip);
  tx.addEventListener('click', e => onNodeClick(e, nd.id));
  g.appendChild(tx);

  if (nd.refUrl) {
    const ref = mk('text', { x: nx + nw - 18, y: y + NH / 2 + 4, fill: faded ? 'rgba(120,120,120,0.3)' : '#8ec5ff', 'font-size': '10', 'font-family': 'DM Mono,monospace' });
    ref.textContent = '↗';
    ref.style.cursor = 'pointer';
    ref.addEventListener('click', e => {
      e.stopPropagation();
      openRefUrl(nd.refUrl);
    });
    g.appendChild(ref);
  }

  del.addEventListener('click', e => { e.stopPropagation(); if (hlState.nodeId === nd.id) hlState = { nodeId: null, depth: 0 }; removeNd(nd.id); });
  g.appendChild(del);
}

function drawLink(g, lk, hasHL, hlL) {
  const fNd = nds.find(n => n.id === lk.f);
  const tNd = nds.find(n => n.id === lk.t);
  if (!fNd || !tNd) return;
  const fc = ndCenter(lk.f), tc = ndCenter(lk.t);
  if (!fc || !tc) return;

  const fIdx = colIdx(fNd.colId);
  const tIdx = colIdx(tNd.colId);
  let fx, tx2;
  if (fIdx < tIdx) {
    fx  = cxById(fNd.colId) + CW;
    tx2 = cxById(tNd.colId);
  } else {
    fx  = cxById(fNd.colId);
    tx2 = cxById(tNd.colId) + CW;
  }

  const dx    = Math.abs(tx2 - fx) * 0.42;
  const isHL  = hlL.has(lk.id);
  const faded = hasHL && !isHL;
  const dir   = fIdx < tIdx ? 1 : -1;

  const path = mk('path', {
    d: `M ${fx} ${fc.y} C ${fx + dir * dx} ${fc.y}, ${tx2 - dir * dx} ${tc.y}, ${tx2} ${tc.y}`,
    stroke: faded ? 'rgba(80,80,80,0.12)' : lc(lk.s),
    'stroke-width': isHL ? lw(lk.s) + 0.8 : lw(lk.s),
    fill: 'none', 'stroke-linecap': 'round',
    opacity: faded ? '0.2' : '1'
  });
  path.style.cursor = 'pointer';
  path.addEventListener('click', e => { e.stopPropagation(); removeLk(lk.id); });
  g.appendChild(path);
}

// ── CRUD ───────────────────────────────────────────────
function removeNd(id) {
  nds = nds.filter(n => n.id !== id);
  lks = lks.filter(l => l.f !== id && l.t !== id);
  render();
}
function removeLk(id) { lks = lks.filter(l => l.id !== id); render(); }
function removeCol(id) {
  const ni = nds.filter(n => n.colId === id).map(n => n.id);
  nds = nds.filter(n => n.colId !== id);
  lks = lks.filter(l => !ni.includes(l.f) && !ni.includes(l.t));
  cols = cols.filter(c => c.id !== id);
  if (ni.includes(hlState.nodeId)) hlState = { nodeId: null, depth: 0 };
  render();
}

// ── ドラッグ＆ズーム ────────────────────────────────────
const cvEl = document.getElementById('cv');
cvEl.addEventListener('mousedown', e => {
  if (e.target === cvEl || e.target.tagName === 'g' || e.target.tagName === 'svg') {
    panning = true; ps = { x: e.clientX - tf.x, y: e.clientY - tf.y }; cvEl.classList.add('grab');
  }
});
window.addEventListener('mousemove', e => { if (!panning) return; tf.x = e.clientX - ps.x; tf.y = e.clientY - ps.y; render(); });
window.addEventListener('mouseup',   () => { panning = false; cvEl.classList.remove('grab'); });
cvEl.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY); }, { passive: false });

document.getElementById('cv').addEventListener('click', e => {
  if (e.target === document.getElementById('cv')) {
    hlState = { nodeId: null, depth: 0 }; updateHlIndicator(); render();
  }
});

function zoom(f, cx2, cy) {
  const w = document.getElementById('cwrap');
  const W = w.clientWidth, H = w.clientHeight;
  const px = (cx2 ?? W / 2) - W / 2, py = (cy ?? H / 2) - H / 2;
  tf.x = px + (tf.x - px) * f; tf.y = py + (tf.y - py) * f;
  tf.sc = Math.max(0.1, Math.min(4, tf.sc * f));
  render();
}
function fitView() { tf = { x: 0, y: 0, sc: 0.7 }; render(); }

// ── モーダル ────────────────────────────────────────────
function openLinkModal() {
  const opts = nds.map(n => { const c = cols.find(c => c.id === n.colId); return `<option value="${n.id}">[${c?.name}] ${n.name}</option>`; }).join('');
  document.getElementById('lFrom').innerHTML = opts;
  document.getElementById('lTo').innerHTML   = opts;
  document.getElementById('mLink').classList.add('on');
}
function closeLM() { document.getElementById('mLink').classList.remove('on'); }
function addLink() {
  const f = document.getElementById('lFrom').value;
  const t = document.getElementById('lTo').value;
  const s = document.getElementById('lStr').value;
  if (!f || !t || f === t) return;
  lks.push({ id: uid(), f, t, s });
  closeLM(); render();
}

function openNM(colId) {
  const c = cols.find(c => c.id === colId);
  document.getElementById('mNT').textContent  = `「${c?.name}」にノードを追加`;
  document.getElementById('nCol').innerHTML   = cols.map(c => `<option value="${c.id}"${c.id === colId ? ' selected' : ''}>${c.name}</option>`).join('');
  document.getElementById('nName').value      = '';
  document.getElementById('mNode').classList.add('on');
  setTimeout(() => document.getElementById('nName').focus(), 100);
}
function closeNM() { document.getElementById('mNode').classList.remove('on'); }
function confirmNode() {
  const name  = document.getElementById('nName').value.trim();
  const colId = document.getElementById('nCol').value;
  if (!name) return;
  nds.push({ id: uid(), colId, name });
  closeNM(); render();
}
document.getElementById('nName').addEventListener('keydown', e => { if (e.key === 'Enter') confirmNode(); });

// ── サイドバー ──────────────────────────────────────────
function switchTab(tab, el) {
  curTab = tab;
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('on'));
  el.classList.add('on'); updateSidebar();
}
function updateSidebar() {
  const b = document.getElementById('sbody');
  if (curTab === 'cols')       renderColsTab(b);
  else if (curTab === 'nodes') renderNodesTab(b);
  else                          renderLinksTab(b);
}
function renderColsTab(b) {
  b.innerHTML = '';
  [['elem', '要素列'], ['req', '要件列']].forEach(([side, label]) => {
    const cs = cols.filter(c => c.side === side).sort((a, b) => a.order - b.order);
    const sec = document.createElement('div'); sec.className = 'slabel'; sec.textContent = label; b.appendChild(sec);
    const list = document.createElement('div'); list.className = 'slist';
    cs.forEach(col => {
      const item = document.createElement('div'); item.className = 'sitem';
      item.innerHTML = `<div class="sdot" style="background:${cc(col.side)}"></div><span class="sname">${col.name}</span><span class="sbadge b-${col.side}">${col.side === 'req' ? '要件' : '要素'}</span><span style="cursor:pointer;color:#e05050;font-size:13px;padding:0 2px" onclick="removeCol('${col.id}')">×</span>`;
      list.appendChild(item);
    });
    b.appendChild(list);
    const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:6px;margin-bottom:4px';
    row.innerHTML = `<input class="mi" id="nc_${side}" type="text" placeholder="列名..." style="margin:0;flex:1"><button class="btn" style="padding:5px 8px;font-size:11px" onclick="addCol('${side}')">＋</button>`;
    b.appendChild(row);
    row.querySelector('input').addEventListener('keydown', e => { if (e.key === 'Enter') addCol(side); });
  });
}
function renderNodesTab(b) {
  b.innerHTML = '';
  const sec = document.createElement('div'); sec.className = 'slabel'; sec.textContent = `全ノード（${nds.length}件）`; b.appendChild(sec);
  if (!nds.length) { b.innerHTML += '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px">ノードがありません</div>'; return; }
  const list = document.createElement('div'); list.className = 'slist';
  nds.forEach(n => {
    const col  = cols.find(c => c.id === n.colId);
    const item = document.createElement('div'); item.className = 'sitem';
    item.innerHTML = `<div class="sdot" style="background:${cc(col?.side || 'req')}"></div><span class="sname">${n.name}</span><span style="font-size:10px;color:var(--text-muted)">${col?.name || '?'}</span><span style="cursor:pointer;color:#e05050;font-size:13px;padding:0 2px" onclick="removeNd('${n.id}')">×</span>`;
    if (n.refUrl) {
      const ref = document.createElement('span');
      ref.textContent = n.refLabel || 'ref';
      ref.style.cssText = 'cursor:pointer;color:#8ec5ff;font-size:10px;padding:0 4px';
      ref.addEventListener('click', e => {
        e.stopPropagation();
        openRefUrl(n.refUrl);
      });
      item.appendChild(ref);
    }
    list.appendChild(item);
  });
  b.appendChild(list);
}
function renderLinksTab(b) {
  b.innerHTML = '';
  const sec = document.createElement('div'); sec.className = 'slabel'; sec.textContent = `リンク（${lks.length}件）`; b.appendChild(sec);
  if (!lks.length) { b.innerHTML += '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px">🔗から追加</div>'; return; }
  const list = document.createElement('div'); list.className = 'slist';
  lks.forEach(l => {
    const fn = nds.find(n => n.id === l.f), tn = nds.find(n => n.id === l.t);
    const item = document.createElement('div'); item.className = 'sitem';
    const sl = l.s === 'strong' ? '強' : l.s === 'mid' ? '中' : '弱';
    item.innerHTML = `<div style="width:18px;height:2px;background:${lc(l.s)};flex-shrink:0"></div><span class="sname" style="font-size:10px">${fn?.name || '?'} → ${tn?.name || '?'}</span><span style="font-size:9px;color:var(--text-muted)">${sl}</span><span style="cursor:pointer;color:#e05050;font-size:13px" onclick="removeLk('${l.id}')">×</span>`;
    list.appendChild(item);
  });
  b.appendChild(list);
}
function addCol(side) {
  const inp = document.getElementById('nc_' + side);
  const name = inp.value.trim(); if (!name) return;
  const ex = cols.filter(c => c.side === side);
  cols.push({ id: uid(), name, side, order: ex.length });
  inp.value = ''; render();
}

// ── Miroエクスポート ────────────────────────────────────
function exportMiro() {
  let md = '# バイク 要件×要素 マッピング\n\n';
  getOrder().forEach(col => {
    md += `## ${col.name}\n`;
    nds.filter(n => n.colId === col.id).forEach(n => md += `- ${n.name}\n`);
    md += '\n';
  });
  md += '## リンク\n';
  lks.forEach(l => {
    const fn = nds.find(n => n.id === l.f), tn = nds.find(n => n.id === l.t);
    const s  = l.s === 'strong' ? '強' : l.s === 'mid' ? '中' : '弱';
    md += `- ${fn?.name} → ${tn?.name}（${s}）\n`;
  });
  navigator.clipboard.writeText(md).then(() => {
    const btn = event.currentTarget; const orig = btn.textContent;
    btn.textContent = '✓ コピー完了'; setTimeout(() => btn.textContent = orig, 2000);
  });
}

// ── 初期化 ──────────────────────────────────────────────
window.addEventListener('resize', render);
window.addEventListener('DOMContentLoaded', () => loadSample());
