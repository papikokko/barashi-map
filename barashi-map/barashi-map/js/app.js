/**
 * app.js
 * barashi-map main logic
 */

let cols = [];
let nds = [];
let lks = [];
let idc = 1;
let tf = { x: 0, y: 0, sc: 0.7 };
let panning = false;
let ps = { x: 0, y: 0 };
let panOrigin = null;
let suppressCanvasClick = false;
let panModifierActive = false;
let curTab = 'cols';
let flipped = false;
let isolateMode = false;
let isolateLocked = false;
let isolateSnapshot = null;
let structureView = null;
let structurePanelOpen = false;
let workspaceMode = 'map';
let defectMap = null;
let structureSelectedBlockId = null;
let structureEditSelection = null;
let defectReviewMode = false;
let structureScreenZoom = 1;
let autoAlignMode = false;
let hlState = { selected: [], activeNodeId: null, nodeId: null, depth: 0 };
let renderState = null;

const SVG_NS = 'http://www.w3.org/2000/svg';

const CW = 148;
const CG = 38;
const NH = 32;
const NP = 5;
const CHH = 36;
const GRID = NH + NP;
const MAX_HIGHLIGHT_SELECTIONS = 5;
const PAN_CLICK_THRESHOLD = 4;
const STRUCTURE_PANEL_WIDTH = 460;

function createEmptyIsolateSnapshot() {
  return {
    nodeIds: new Set(),
    linkIds: new Set(),
    colIds: new Set()
  };
}

function clearIsolateState() {
  isolateMode = false;
  isolateLocked = false;
  isolateSnapshot = null;
}

function getIsolateButtonLabel() {
  if (isolateLocked) return '蝗ｺ螳夊ｧ｣髯､';
  if (isolateMode) return '髱櫁｡ｨ遉ｺ繧貞崋螳・';
  return '驕ｸ謚樔ｻ･螟夜撼陦ｨ遉ｺ';
}

function lockCurrentIsolateView() {
  const snapshotSource = renderState || buildRenderState();
  isolateSnapshot = createEmptyIsolateSnapshot();
  snapshotSource.visibleNodeIds.forEach(function (id) { isolateSnapshot.nodeIds.add(id); });
  lks.forEach(function (link) {
    if (isolateSnapshot.nodeIds.has(link.f) && isolateSnapshot.nodeIds.has(link.t)) {
      isolateSnapshot.linkIds.add(link.id);
    }
  });
  snapshotSource.displayOrder.forEach(function (col) { isolateSnapshot.colIds.add(col.id); });
  isolateMode = true;
  isolateLocked = true;
}

function getSelectedHighlights() {
  return hlState.selected || [];
}

function getHighlightEntry(nodeId) {
  return getSelectedHighlights().find(function (item) {
    return item.nodeId === nodeId;
  }) || null;
}

function getHighlightDepth(nodeId) {
  const entry = getHighlightEntry(nodeId);
  return entry ? entry.depth : 0;
}

function isNodeSelected(nodeId) {
  return getHighlightDepth(nodeId) > 0;
}

function getActiveHighlight() {
  const activeId = hlState.activeNodeId;
  return activeId ? getHighlightEntry(activeId) : (getSelectedHighlights()[0] || null);
}

function applyHighlightState(selected, activeNodeId) {
  const validSelected = selected
    .filter(function (item) {
      return item && item.nodeId && item.depth > 0;
    })
    .slice(-MAX_HIGHLIGHT_SELECTIONS);
  const resolvedActiveNodeId = validSelected.some(function (item) { return item.nodeId === activeNodeId; })
    ? activeNodeId
    : (validSelected.length ? validSelected[validSelected.length - 1].nodeId : null);
  const activeEntry = resolvedActiveNodeId
    ? validSelected.find(function (item) { return item.nodeId === resolvedActiveNodeId; }) || null
    : null;

  hlState = {
    selected: validSelected,
    activeNodeId: resolvedActiveNodeId,
    nodeId: activeEntry ? activeEntry.nodeId : null,
    depth: activeEntry ? activeEntry.depth : 0
  };

  if (!validSelected.length && !isolateLocked) {
    clearIsolateState();
  }

  syncUiState();
}

function uid() {
  return 'n' + idc++;
}

function cc(side) {
  return side === 'req' ? '#2ea87e' : '#2e7ea8';
}

function cb(side) {
  return side === 'req' ? '#1a4a3a' : '#1a2a4a';
}

function lc(strength) {
  if (strength === 'strong') return 'rgba(90,150,255,0.9)';
  if (strength === 'mid') return 'rgba(255,140,60,0.8)';
  return 'rgba(180,180,180,0.35)';
}

function lw(strength) {
  if (strength === 'strong') return 2.5;
  if (strength === 'mid') return 1.8;
  return 1.1;
}

function overlapStrokeColor(count) {
  if (count >= 3) return '#ff5f7a';
  if (count === 2) return '#ffc500';
  return null;
}

function overlapTextColor(count) {
  if (count >= 3) return '#ffb3c1';
  if (count === 2) return '#ffe082';
  return null;
}

function overlapFillColor(count) {
  if (count >= 3) return '#24131a';
  if (count === 2) return '#171e27';
  return null;
}

function mk(tag, attrs) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs || {}).forEach(function ([key, value]) {
    element.setAttribute(key, value);
  });
  return element;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getNodeById(id) {
  return nds.find(function (node) { return node.id === id; }) || null;
}

function getColById(id) {
  return cols.find(function (col) { return col.id === id; }) || null;
}

function getNodeLinkCount(id) {
  return lks.filter(function (link) {
    return link.f === id || link.t === id;
  }).length;
}

function openRefUrl(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function hasStructureView() {
  return !!(structureView && Array.isArray(structureView.blocks) && structureView.blocks.length);
}

function hasDefectMap() {
  return !!(defectMap && Array.isArray(defectMap.items) && defectMap.items.length);
}

function getStructurePanelWidth() {
  return 0;
}

function isStructureMode() {
  return workspaceMode === 'structure' && hasStructureView();
}

function showNodeTip(event, text) {
  if (!text) return;
  hideNodeTip();
  const tip = document.createElement('div');
  tip.id = 'nodeTip';
  tip.className = 'node-tip';
  tip.textContent = text;
  tip.style.left = (event.clientX + 12) + 'px';
  tip.style.top = (event.clientY + 12) + 'px';
  document.body.appendChild(tip);
}

function moveNodeTip(event) {
  const tip = document.getElementById('nodeTip');
  if (!tip) return;
  tip.style.left = (event.clientX + 12) + 'px';
  tip.style.top = (event.clientY + 12) + 'px';
}

function hideNodeTip() {
  const tip = document.getElementById('nodeTip');
  if (tip) tip.remove();
}

function getOrder() {
  const elemCols = cols
    .filter(function (col) { return col.side === 'elem'; })
    .sort(function (a, b) { return a.order - b.order; });
  const reqCols = cols
    .filter(function (col) { return col.side === 'req'; })
    .sort(function (a, b) { return a.order - b.order; });

  if (!flipped) return elemCols.concat(reqCols);
  return reqCols.slice().reverse().concat(elemCols.slice().reverse());
}

function getNodeColIndex(nodeId) {
  const node = getNodeById(nodeId);
  if (!node) return -1;
  return getOrder().findIndex(function (col) {
    return col.id === node.colId;
  });
}

function getAdjacentNodesByDirection(nodeId) {
  const startNode = getNodeById(nodeId);
  const startIndex = getNodeColIndex(nodeId);
  const groups = {
    previous: [],
    next: []
  };

  if (!startNode || startIndex < 0) {
    return groups;
  }

  const seen = new Set();

  lks.forEach(function (link) {
    if (link.f !== nodeId && link.t !== nodeId) return;

    const adjacentId = link.f === nodeId ? link.t : link.f;
    if (seen.has(adjacentId)) return;

    const adjacentNode = getNodeById(adjacentId);
    const adjacentIndex = getNodeColIndex(adjacentId);
    const adjacentCol = adjacentNode ? getColById(adjacentNode.colId) : null;

    if (!adjacentNode || adjacentIndex < 0 || adjacentIndex === startIndex) return;

    seen.add(adjacentId);

    const item = {
      id: adjacentNode.id,
      name: adjacentNode.name,
      description: adjacentNode.description || '',
      colName: adjacentCol ? adjacentCol.name : '?',
      colIndex: adjacentIndex,
      side: adjacentCol ? adjacentCol.side : 'elem'
    };

    if (adjacentIndex < startIndex) groups.previous.push(item);
    if (adjacentIndex > startIndex) groups.next.push(item);
  });

  ['previous', 'next'].forEach(function (key) {
    groups[key].sort(function (a, b) {
      if (a.colIndex !== b.colIndex) {
        return key === 'previous' ? b.colIndex - a.colIndex : a.colIndex - b.colIndex;
      }
      return a.name.localeCompare(b.name, 'ja');
    });
  });

  return groups;
}

function getTraversalTargets() {
  const activeHighlight = getActiveHighlight();
  const groups = {
    previous: [],
    next: []
  };

  if (!activeHighlight) {
    return groups;
  }

  const startId = activeHighlight.nodeId;
  const startIndex = getNodeColIndex(startId);
  const highlighted = getHighlighted(startId, activeHighlight.depth || 1);
  const seen = new Set();

  if (startIndex < 0) {
    return groups;
  }

  lks.forEach(function (link) {
    if (!highlighted.links.has(link.id)) return;
    if (link.f !== startId && link.t !== startId) return;

    const adjacentId = link.f === startId ? link.t : link.f;
    if (seen.has(adjacentId) || !highlighted.nodes.has(adjacentId)) return;

    const adjacentNode = getNodeById(adjacentId);
    const adjacentIndex = getNodeColIndex(adjacentId);
    const adjacentCol = adjacentNode ? getColById(adjacentNode.colId) : null;

    if (!adjacentNode || adjacentIndex < 0 || adjacentIndex === startIndex) return;

    seen.add(adjacentId);

    const item = {
      id: adjacentNode.id,
      name: adjacentNode.name,
      colName: adjacentCol ? adjacentCol.name : '?',
      side: adjacentCol ? adjacentCol.side : 'elem',
      colIndex: adjacentIndex
    };

    if (adjacentIndex < startIndex) groups.previous.push(item);
    if (adjacentIndex > startIndex) groups.next.push(item);
  });

  ['previous', 'next'].forEach(function (key) {
    groups[key].sort(function (a, b) {
      if (a.colIndex !== b.colIndex) {
        return key === 'previous' ? b.colIndex - a.colIndex : a.colIndex - b.colIndex;
      }
      return a.name.localeCompare(b.name, 'ja');
    });
  });

  return groups;
}

function getDirectionalHighlight(startId) {
  const highlightedNodes = new Set([startId]);
  const highlightedLinks = new Set();
  const startIndex = getNodeColIndex(startId);

  if (startIndex < 0) {
    return { nodes: highlightedNodes, links: highlightedLinks };
  }

  const queue = [];
  const visited = new Set([startId + ':0']);

  lks.forEach(function (link) {
    if (link.f !== startId && link.t !== startId) return;

    const nextId = link.f === startId ? link.t : link.f;
    const nextIndex = getNodeColIndex(nextId);
    const dir = nextIndex === startIndex ? 0 : (nextIndex < startIndex ? -1 : 1);

    highlightedNodes.add(nextId);
    highlightedLinks.add(link.id);

    if (dir === 0) return;

    const key = nextId + ':' + dir;
    if (!visited.has(key)) {
      visited.add(key);
      queue.push({ nodeId: nextId, dir: dir });
    }
  });

  while (queue.length) {
    const current = queue.shift();
    const currentIndex = getNodeColIndex(current.nodeId);

    lks.forEach(function (link) {
      if (link.f !== current.nodeId && link.t !== current.nodeId) return;

      const nextId = link.f === current.nodeId ? link.t : link.f;
      const nextIndex = getNodeColIndex(nextId);

      if (nextIndex < 0) return;
      if (current.dir < 0 && nextIndex >= currentIndex) return;
      if (current.dir > 0 && nextIndex <= currentIndex) return;

      highlightedNodes.add(nextId);
      highlightedLinks.add(link.id);

      const key = nextId + ':' + current.dir;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ nodeId: nextId, dir: current.dir });
      }
    });
  }

  return { nodes: highlightedNodes, links: highlightedLinks };
}

function getHighlighted(startId, depth) {
  if (!startId || depth === 0) {
    return { nodes: new Set(), links: new Set() };
  }

  const highlightedNodes = new Set([startId]);
  const highlightedLinks = new Set();

  if (depth === 1) {
    lks.forEach(function (link) {
      if (link.f === startId || link.t === startId) {
        highlightedNodes.add(link.f);
        highlightedNodes.add(link.t);
        highlightedLinks.add(link.id);
      }
    });
    return { nodes: highlightedNodes, links: highlightedLinks };
  }

  return getDirectionalHighlight(startId);
}

function buildRenderState() {
  const selectedHighlights = getSelectedHighlights();
  const highlightedNodes = new Set();
  const highlightedLinks = new Set();
  const highlightNodeCounts = new Map();
  const highlightLinkCounts = new Map();
  const hasHighlight = selectedHighlights.length > 0;

  selectedHighlights.forEach(function (item) {
    const highlighted = getHighlighted(item.nodeId, item.depth);
    highlighted.nodes.forEach(function (id) {
      highlightedNodes.add(id);
      highlightNodeCounts.set(id, (highlightNodeCounts.get(id) || 0) + 1);
    });
    highlighted.links.forEach(function (id) {
      highlightedLinks.add(id);
      highlightLinkCounts.set(id, (highlightLinkCounts.get(id) || 0) + 1);
    });
  });

  const visibleNodeIds = new Set(
    nds.map(function (node) { return node.id; })
  );
  const visibleLinkIds = new Set(
    lks.map(function (link) { return link.id; })
  );

  if (isolateMode) {
    visibleNodeIds.clear();
    visibleLinkIds.clear();

    if (isolateLocked && isolateSnapshot) {
      isolateSnapshot.nodeIds.forEach(function (id) { visibleNodeIds.add(id); });
      isolateSnapshot.linkIds.forEach(function (id) { visibleLinkIds.add(id); });
    } else if (hasHighlight) {
      highlightedNodes.forEach(function (id) { visibleNodeIds.add(id); });
      highlightedLinks.forEach(function (id) { visibleLinkIds.add(id); });
    }
  }

  const visibleColIds = new Set();
  nds.forEach(function (node) {
    if (visibleNodeIds.has(node.id)) visibleColIds.add(node.colId);
  });

  const displayOrder = getOrder().filter(function (col) {
    return !isolateMode || visibleColIds.has(col.id);
  });

  return {
    highlightedNodes: highlightedNodes,
    highlightedLinks: highlightedLinks,
    highlightNodeCounts: highlightNodeCounts,
    highlightLinkCounts: highlightLinkCounts,
    hasHighlight: hasHighlight,
    visibleNodeIds: visibleNodeIds,
    visibleLinkIds: visibleLinkIds,
    displayOrder: displayOrder
  };
}

function colIdx(colId) {
  const order = renderState ? renderState.displayOrder : getOrder();
  return order.findIndex(function (col) { return col.id === colId; });
}

function cxById(colId) {
  const order = renderState ? renderState.displayOrder : getOrder();
  const index = order.findIndex(function (col) { return col.id === colId; });
  if (index < 0) return 0;
  const total = order.length * (CW + CG);
  return -total / 2 + index * (CW + CG);
}

function maxNdCount() {
  const visibleNodeIds = renderState ? renderState.visibleNodeIds : null;
  if (!cols.length) return 1;

  return Math.max.apply(null, cols.map(function (col) {
    return nds.filter(function (node) {
      return node.colId === col.id && (!visibleNodeIds || visibleNodeIds.has(node.id));
    }).length;
  }).concat(1));
}

function getVisibleColumnNodes(colId) {
  const visibleNodeIds = renderState ? renderState.visibleNodeIds : null;
  return nds.filter(function (item) {
    return item.colId === colId && (!visibleNodeIds || visibleNodeIds.has(item.id));
  });
}

function getBaseColumnNodes(colId) {
  return getVisibleColumnNodes(colId);
}

function getBaseNodeY(nodeId) {
  const node = getNodeById(nodeId);
  if (!node) return 0;
  const layoutNodes = getBaseColumnNodes(node.colId);
  const index = layoutNodes.findIndex(function (item) { return item.id === nodeId; });
  const maxNodes = maxNdCount();
  return CHH + 12 - (maxNodes * GRID) / 2 + (maxNodes - layoutNodes.length) * GRID / 2 + index * GRID;
}

function getAutoAlignedColumnNodes(colId) {
  const layoutNodes = getBaseColumnNodes(colId);
  if (!(autoAlignMode && renderState && renderState.hasHighlight && hlState.nodeId)) {
    return layoutNodes;
  }

  const anchorNode = getNodeById(hlState.nodeId);
  if (!anchorNode) return layoutNodes;

  if (anchorNode.colId === colId) {
    return layoutNodes;
  }

  const highlightedNodes = layoutNodes.filter(function (item) {
    return renderState.highlightedNodes.has(item.id);
  });
  if (!highlightedNodes.length || highlightedNodes.length === layoutNodes.length) {
    return layoutNodes;
  }

  const otherNodes = layoutNodes.filter(function (item) {
    return !renderState.highlightedNodes.has(item.id);
  });

  const anchorY = getBaseNodeY(anchorNode.id);
  const candidateYs = layoutNodes.map(function (item) { return getBaseNodeY(item.id); });
  let nearestIndex = 0;
  let nearestDistance = Infinity;
  candidateYs.forEach(function (value, index) {
    const distance = Math.abs(value - anchorY);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  const blockSize = highlightedNodes.length;
  let insertIndex = nearestIndex - Math.floor(blockSize / 2);
  insertIndex = Math.max(0, Math.min(otherNodes.length, insertIndex));

  const sortedHighlighted = highlightedNodes.slice().sort(function (a, b) {
    return getBaseNodeY(a.id) - getBaseNodeY(b.id);
  });

  return otherNodes
    .slice(0, insertIndex)
    .concat(sortedHighlighted)
    .concat(otherNodes.slice(insertIndex));
}

function ny(nodeId) {
  const node = getNodeById(nodeId);
  if (!node) return 0;

  const layoutNodes = getAutoAlignedColumnNodes(node.colId);
  const index = layoutNodes.findIndex(function (item) { return item.id === nodeId; });
  const maxNodes = maxNdCount();
  return CHH + 12 - (maxNodes * GRID) / 2 + (maxNodes - layoutNodes.length) * GRID / 2 + index * GRID;
}

function ndCenter(nodeId) {
  const node = getNodeById(nodeId);
  if (!node) return null;
  return {
    x: cxById(node.colId) + CW / 2,
    y: ny(nodeId) + NH / 2
  };
}

function centerOnNode(nodeId) {
  const previousState = renderState;
  renderState = buildRenderState();
  const center = ndCenter(nodeId);
  renderState = previousState;
  if (!center) return;
  tf.x = -center.x * tf.sc;
  tf.y = -center.y * tf.sc;
}

function syncUiState() {
  updateHlIndicator();
  updateIsolateButton();
  updateAutoAlignButton();
  updateMapViewButton();
  updateStructureButton();
  updateDefectReviewButton();
  updateDefectLegend();
  const isolateButton = document.getElementById('isolateBtn');
  if (isolateButton) {
    isolateButton.textContent = getIsolateButtonLabel();
  }
}

function clearHighlight() {
  if (!isolateLocked) {
    clearIsolateState();
  }
  applyHighlightState([], null);
}

function setSingleHighlight(nodeId, depth) {
  applyHighlightState([{ nodeId: nodeId, depth: depth || 1 }], nodeId);
}

function setNodeHighlight(nodeId, depth, additive) {
  if (!additive) {
    setSingleHighlight(nodeId, depth);
    return;
  }

  const next = getSelectedHighlights().filter(function (item) {
    return item.nodeId !== nodeId;
  });
  next.push({ nodeId: nodeId, depth: depth || 1 });
  applyHighlightState(next, nodeId);
}

function removeNodeHighlight(nodeId) {
  applyHighlightState(
    getSelectedHighlights().filter(function (item) {
      return item.nodeId !== nodeId;
    }),
    hlState.activeNodeId === nodeId ? null : hlState.activeNodeId
  );
}

function moveActiveHighlight(nodeId) {
  const activeHighlight = getActiveHighlight();
  if (!activeHighlight) {
    focusNode(nodeId, 1);
    return;
  }

  const next = getSelectedHighlights().filter(function (item) {
    return item.nodeId !== activeHighlight.nodeId;
  });

  next.push({
    nodeId: nodeId,
    depth: activeHighlight.depth || 1
  });

  applyHighlightState(next, nodeId);
  centerOnNode(nodeId);
  render();
}

function moveHighlightStep(direction) {
  const targets = getTraversalTargets();
  const group = direction === 'previous' ? targets.previous : targets.next;
  if (!group.length) return;
  moveActiveHighlight(group[0].id);
}

function cycleNodeHighlight(nodeId, additive) {
  const entry = getHighlightEntry(nodeId);

  if (!additive) {
    if (!entry || getSelectedHighlights().length > 1) {
      setSingleHighlight(nodeId, 1);
      return;
    }

    if (entry.depth === 1) {
      setSingleHighlight(nodeId, 2);
      return;
    }

    clearHighlight();
    return;
  }

  if (!entry) {
    setNodeHighlight(nodeId, 1, true);
    return;
  }

  if (entry.depth === 1) {
    setNodeHighlight(nodeId, 2, true);
    return;
  }

  removeNodeHighlight(nodeId);
}

function focusNode(nodeId, depth) {
  setSingleHighlight(nodeId, depth || getHighlightDepth(nodeId) || 1);
  centerOnNode(nodeId);
  render();
}

function selectNode(nodeId, depth) {
  setSingleHighlight(nodeId, depth || 1);
  render();
}

function focusOnlyNode(nodeId, depth) {
  isolateMode = true;
  setSingleHighlight(nodeId, depth || 1);
  centerOnNode(nodeId);
  render();
}

function traverseToNode(nodeId, additive) {
  if (additive) {
    setNodeHighlight(nodeId, getHighlightDepth(nodeId) || 1, true);
    centerOnNode(nodeId);
    render();
    return;
  }

  focusNode(nodeId, getHighlightDepth(nodeId) || 1);
}

function onNodeClick(event, nodeId) {
  event.stopPropagation();
  if (suppressCanvasClick) {
    suppressCanvasClick = false;
    return;
  }
  cycleNodeHighlight(nodeId, event.ctrlKey || event.metaKey);
  render();
}

function updateHlIndicator() {
  const indicator = document.getElementById('hlInd');
  const label = document.getElementById('hlLabel');
  const helper = document.getElementById('hlHint');
  const steps = [document.getElementById('hlS1'), document.getElementById('hlS2')];
  const activeHighlight = getActiveHighlight();
  const selectedCount = getSelectedHighlights().length;

  if (!indicator || !label || !helper) return;

  if (!activeHighlight) {
    indicator.classList.remove('show');
    return;
  }

  const labels = {
    1: '蜑榊ｾ後Ξ繧､繝､繝ｼ',
    2: '遶ｯ縺九ｉ遶ｯ縺ｾ縺ｧ'
  };

  indicator.classList.add('show');
  label.textContent = selectedCount > 1
    ? '隍・焚驕ｸ謚・' + selectedCount + '莉ｶ / ' + (labels[activeHighlight.depth] || '')
    : (labels[activeHighlight.depth] || '');
  helper.textContent = isolateMode ? '髱櫁｡ｨ遉ｺ繝｢繝ｼ繝我ｸｭ / 繧ｯ繝ｪ繝・け縺ｧ谿ｵ髫主､画峩 / 遨ｺ逋ｽ縺ｧ隗｣髯､' : '繧ｯ繝ｪ繝・け縺ｧ谿ｵ髫主､画峩 / 遨ｺ逋ｽ縺ｧ隗｣髯､';

  steps.forEach(function (step, index) {
    if (!step) return;
    step.classList.toggle('active', index < hlState.depth);
  });
}

function flipLayout() {
  flipped = !flipped;
  const button = document.getElementById('flipBtn');
  if (button) {
    button.textContent = flipped ? 'Flip戻す' : 'Flip';
    button.style.color = flipped ? 'var(--accent)' : '';
    button.style.borderColor = flipped ? 'var(--accent)' : '';
  }
  render();
}

function toggleIsolateMode(force) {
  const selectedCount = getSelectedHighlights().length;
  if (typeof force === 'boolean') {
    if (!force) {
      clearIsolateState();
    } else if (selectedCount > 0) {
      isolateMode = true;
      isolateLocked = false;
      isolateSnapshot = null;
    }
  } else if (!isolateMode) {
    if (!selectedCount) return;
    isolateMode = true;
    isolateLocked = false;
    isolateSnapshot = null;
  } else if (!isolateLocked) {
    if (!selectedCount) return;
    lockCurrentIsolateView();
  } else {
    clearIsolateState();
  }

  syncUiState();
  render();
}

function updateIsolateButton() {
  const button = document.getElementById('isolateBtn');
  if (!button) return;
  const active = isolateMode;
  button.textContent = active ? '髱櫁｡ｨ遉ｺ隗｣髯､' : '驕ｸ謚樔ｻ･螟夜撼陦ｨ遉ｺ';
  button.classList.toggle('btn-active', active);
}

function updateStructureButton() {
  const button = document.getElementById('structureBtn');
  if (!button) return;
  const enabled = hasStructureView();
  button.disabled = !enabled;
  button.classList.toggle('btn-active', enabled && isStructureMode());
  button.textContent = enabled ? '讖溯・繝悶Ο繝・け蝗ｳ' : '讖溯・繝悶Ο繝・け蝗ｳ N/A';
}

function updateMapViewButton() {
  const button = document.getElementById('mapViewBtn');
  if (!button) return;
  button.classList.toggle('btn-active', workspaceMode === 'map' || !hasStructureView());
}

function canUseDefectReviewMode() {
  return workspaceMode === 'map' && hasDefectMap();
}

function toggleDefectReviewMode(force) {
  if (!hasDefectMap()) {
    defectReviewMode = false;
    syncUiState();
    render();
    return;
  }
  defectReviewMode = typeof force === 'boolean' ? force : !defectReviewMode;
  syncUiState();
  render();
}

function toggleAutoAlignMode(force) {
  autoAlignMode = typeof force === 'boolean' ? force : !autoAlignMode;
  syncUiState();
  render();
}

function updateAutoAlignButton() {
  const button = document.getElementById('autoAlignBtn');
  if (!button) return;
  button.classList.toggle('btn-active', autoAlignMode && workspaceMode === 'map');
}

function updateDefectReviewButton() {
  const button = document.getElementById('defectReviewBtn');
  if (!button) return;
  const enabled = hasDefectMap();
  if (!enabled) {
    defectReviewMode = false;
  }
  button.disabled = !enabled;
  button.textContent = enabled ? '不具合確認' : '不具合確認 N/A';
  button.classList.toggle('btn-active', enabled && defectReviewMode && workspaceMode === 'map');
}

function updateDefectLegend() {
  const legend = document.getElementById('defectLegend');
  if (!legend) return;
  const visible = defectReviewMode && canUseDefectReviewMode();
  legend.classList.toggle('show', visible);
  if (!visible) return;
  const maxCount = getMaxNodeDefectCount();
  const minLabel = document.getElementById('defectLegendMin');
  const midLabel = document.getElementById('defectLegendMid');
  const maxLabel = document.getElementById('defectLegendMax');
  if (minLabel) minLabel.textContent = '0莉ｶ';
  if (midLabel) midLabel.textContent = maxCount > 0 ? Math.max(1, Math.round(maxCount / 2)) + '莉ｶ' : '荳ｭ';
  if (maxLabel) maxLabel.textContent = maxCount + '莉ｶ';
}

function setWorkspaceMode(mode) {
  if (mode === 'structure' && !hasStructureView()) {
    workspaceMode = 'map';
  } else {
    workspaceMode = mode === 'structure' ? 'structure' : 'map';
  }
  if (workspaceMode !== 'map') {
    updateDefectLegend();
  }
  structurePanelOpen = isStructureMode();
  render();
}

function toggleStructurePanel(force) {
  if (typeof force === 'boolean') {
    setWorkspaceMode(force ? 'structure' : 'map');
    return;
  }
  setWorkspaceMode(isStructureMode() ? 'map' : 'structure');
}

function blockIntersectsHighlight(block) {
  if (!block || !Array.isArray(block.nodeIds) || !renderState) return false;
  return block.nodeIds.some(function (nodeId) {
    return renderState.highlightedNodes.has(nodeId);
  });
}

function blockContainsActiveNode(block) {
  const activeHighlight = getActiveHighlight();
  if (!block || !activeHighlight) return false;
  return Array.isArray(block.nodeIds) && block.nodeIds.indexOf(activeHighlight.nodeId) >= 0;
}

function getStructureBlockSummary(block) {
  if (!block || !Array.isArray(block.nodeIds)) return '';
  return block.nodeIds
    .map(function (nodeId) { return getNodeById(nodeId); })
    .filter(Boolean)
    .slice(0, 4)
    .map(function (node) { return node.name; })
    .join(' / ');
}

function getStructureInteractiveBlocks() {
  return (structureView && Array.isArray(structureView.blocks))
    ? structureView.blocks.filter(function (block) { return block.kind !== 'frame'; })
    : [];
}

function getStructureBlockById(blockId) {
  return getStructureInteractiveBlocks().find(function (block) {
    return block.id === blockId;
  }) || null;
}

function getDefaultStructureBlock() {
  const blocks = getStructureInteractiveBlocks();
  if (!blocks.length) return null;
  if (hlState && hlState.activeNodeId) {
    const activeMatch = blocks.find(function (block) {
      return Array.isArray(block.nodeIds) && block.nodeIds.indexOf(hlState.activeNodeId) >= 0;
    });
    if (activeMatch) return activeMatch;
  }
  return blocks[0];
}

function getSelectedStructureBlock() {
  return getStructureBlockById(structureSelectedBlockId) || getDefaultStructureBlock();
}

function focusStructureBlock(block, additive) {
  if (!block) return;
  const targetId = block.focusNodeId || (block.nodeIds && block.nodeIds[0]);
  if (!targetId) return;
  if (isStructureMode()) {
    if (additive) {
      setNodeHighlight(targetId, getHighlightDepth(targetId) || 1, true);
    } else {
      setSingleHighlight(targetId, getHighlightDepth(targetId) || 1);
    }
    setWorkspaceMode('map');
    centerOnNode(targetId);
    return;
  }
  if (additive) {
    setNodeHighlight(targetId, getHighlightDepth(targetId) || 1, true);
    centerOnNode(targetId);
    render();
    return;
  }
  focusNode(targetId, getHighlightDepth(targetId) || 1);
}

function getDefectEntriesForBlock(block) {
  if (!hasDefectMap() || !block) return [];
  return defectMap.items.filter(function (item) {
    if (Array.isArray(item.structureBlockIds) && item.structureBlockIds.indexOf(block.id) >= 0) {
      return true;
    }
    if (!Array.isArray(item.targetNodeIds) || !Array.isArray(block.nodeIds)) {
      return false;
    }
    return item.targetNodeIds.some(function (nodeId) {
      return block.nodeIds.indexOf(nodeId) >= 0;
    });
  });
}

function getDefectCountForBlock(block) {
  return getDefectEntriesForBlock(block).reduce(function (sum, item) {
    return sum + (Number(item.count) || 0);
  }, 0);
}

function getDefectEntriesForNode(nodeId) {
  if (!hasDefectMap() || !nodeId) return [];
  return defectMap.items.filter(function (item) {
    return Array.isArray(item.targetNodeIds) && item.targetNodeIds.indexOf(nodeId) >= 0;
  });
}

function getDefectCountForNode(nodeId) {
  return getDefectEntriesForNode(nodeId).reduce(function (sum, item) {
    return sum + (Number(item.count) || 0);
  }, 0);
}

function getMaxNodeDefectCount() {
  if (!hasDefectMap()) return 0;
  return Math.max.apply(null, nds.map(function (node) {
    return getDefectCountForNode(node.id);
  }).concat(0));
}

function getNodeHeatFill(side, ratio, active) {
  if (active) return cb(side);
  const base = { r: 14, g: 19, b: 27 };
  const blend = { r: 138, g: 41, b: 31 };
  const t = Math.max(0, Math.min(1, ratio || 0));
  const r = Math.round(base.r + (blend.r - base.r) * t);
  const g = Math.round(base.g + (blend.g - base.g) * t);
  const b = Math.round(base.b + (blend.b - base.b) * t);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function getNodeHeatTextColor(ratio) {
  const t = Math.max(0, Math.min(1, ratio || 0));
  if (t > 0.66) return '#fff7f3';
  if (t > 0.33) return '#ffe7df';
  return '#f0f4fa';
}

function getMaxBlockDefectCount() {
  if (!hasStructureView()) return 0;
  return Math.max.apply(null, structureView.blocks.map(function (block) {
    return getDefectCountForBlock(block);
  }).concat(0));
}

function getTopDefectEntries(limit) {
  if (!hasDefectMap()) return [];
  return defectMap.items
    .slice()
    .sort(function (a, b) { return (b.count || 0) - (a.count || 0); })
    .slice(0, limit || 5);
}

function getStructureStyleDefaults() {
  return {
    arrowScale: 0.58,
    arrowRefX: 9.2,
    lineWidth: 2,
    emphasisLineWidth: 2.4,
    labelFontSize: 10,
    frameTitleFontSize: 22,
    frameNoteFontSize: 10,
    blockTitleFontSize: 14,
    blockMetaFontSize: 10
  };
}

function ensureStructureStyle() {
  if (!structureView) return getStructureStyleDefaults();
  if (!structureView.style) {
    structureView.style = {};
  }
  const defaults = getStructureStyleDefaults();
  Object.keys(defaults).forEach(function (key) {
    if (structureView.style[key] === undefined || structureView.style[key] === null || structureView.style[key] === '') {
      structureView.style[key] = defaults[key];
    }
  });
  return structureView.style;
}

function getStructureSelectionTarget() {
  if (!structureView || !structureEditSelection) return null;
  if (structureEditSelection.type === 'block') {
    return (structureView.blocks || []).find(function (block) { return block.id === structureEditSelection.id; }) || null;
  }
  if (structureEditSelection.type === 'connector') {
    return (structureView.connectors || []).find(function (connector) {
      return (connector.id || (connector.from + '->' + connector.to)) === structureEditSelection.id;
    }) || null;
  }
  return null;
}

function setStructureSelection(type, id) {
  structureEditSelection = type && id ? { type: type, id: id } : null;
}

function ensureStructureSelection() {
  if (!structureView) {
    structureEditSelection = null;
    return;
  }
  const target = getStructureSelectionTarget();
  if (target) return;
  const firstBlock = (structureView.blocks || []).find(function (block) { return block.kind !== 'frame'; });
  if (firstBlock) {
    structureEditSelection = { type: 'block', id: firstBlock.id };
  } else {
    structureEditSelection = null;
  }
}

function getStructureConnectorId(connector) {
  return connector.id || (connector.from + '->' + connector.to);
}

function ensureStructureItemStyle(item) {
  if (!item) return {};
  if (!item.style) item.style = {};
  return item.style;
}

function updateStructureNumber(target, key, value, fallback) {
  if (!target) return;
  const next = Number(value);
  target[key] = Number.isFinite(next) ? next : fallback;
  renderStructureScreen();
}

function createStructureNumberField(labelText, value, step, onChange) {
  const wrap = document.createElement('label');
  wrap.className = 'sbd-field';
  const label = document.createElement('span');
  label.className = 'sbd-field-label';
  label.textContent = labelText;
  const input = document.createElement('input');
  input.className = 'sbd-field-input';
  input.type = 'number';
  input.step = step || '1';
  input.value = value;
  input.addEventListener('input', function () {
    onChange(input.value);
  });
  wrap.appendChild(label);
  wrap.appendChild(input);
  return wrap;
}

function createStructureActionButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className || 'btn';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function createStructureArrowMarker(defs, markerId, scale, refX, fill) {
  const marker = document.createElementNS(SVG_NS, 'marker');
  const markerScale = Math.max(0.25, Number(scale) || 1);
  const markerRefX = Number.isFinite(Number(refX)) ? Number(refX) : 9.2;
  const markerSize = 10 * markerScale;
  marker.setAttribute('id', markerId);
  marker.setAttribute('markerUnits', 'userSpaceOnUse');
  marker.setAttribute('markerWidth', String(markerSize));
  marker.setAttribute('markerHeight', String(markerSize));
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', String(markerRefX));
  marker.setAttribute('refY', '5');
  marker.setAttribute('orient', 'auto');
  const arrowPath = document.createElementNS(SVG_NS, 'path');
  arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  arrowPath.setAttribute('fill', fill || '#cfd7e6');
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  return markerId;
}

function getStructureFrameChildren(frameBlock) {
  if (!structureView || !Array.isArray(structureView.blocks)) return [];
  return structureView.blocks.filter(function (candidate) {
    if (!candidate || candidate.id === frameBlock.id || candidate.kind === 'frame') return false;
    return candidate.x >= frameBlock.x &&
      candidate.y >= frameBlock.y &&
      candidate.x + candidate.w <= frameBlock.x + frameBlock.w &&
      candidate.y + candidate.h <= frameBlock.y + frameBlock.h;
  });
}

function getStructureFrameLayout(frameBlock, blockStyle, structureStyle) {
  const children = getStructureFrameChildren(frameBlock);
  const titleFontSize = blockStyle.titleFontSize || structureStyle.frameTitleFontSize;
  const noteFontSize = blockStyle.noteFontSize || structureStyle.frameNoteFontSize;
  const titleOffsetX = Number(blockStyle.titleOffsetX) || 0;
  const titleOffsetY = Number(blockStyle.titleOffsetY) || 0;
  const noteOffsetY = Number(blockStyle.noteOffsetY) || 0;
  const childTop = children.reduce(function (minY, child) {
    return Math.min(minY, child.y);
  }, frameBlock.y + frameBlock.h);
  const topRoom = Math.max(0, childTop - frameBlock.y);
  const showNote = !!frameBlock.note && topRoom >= Math.max(72, titleFontSize + noteFontSize + 24);
  return {
    titleFontSize: titleFontSize,
    noteFontSize: noteFontSize,
    titleTop: -Math.max(14, Math.round(titleFontSize * 0.6)) + titleOffsetY,
    titleLeft: 16 + titleOffsetX,
    noteTop: 18 + noteOffsetY,
    noteLeft: 20,
    showNote: showNote
  };
}

function getStructureToneBase(tone) {
  if (tone === 'water') return '#f4faff';
  if (tone === 'control') return '#f5f8fe';
  if (tone === 'package') return '#faf7ff';
  return '#f5fbf6';
}

function getStructureHeatBackground(tone, ratio) {
  const ratioClamped = Math.max(0, Math.min(1, ratio || 0));
  const warmth = 100 - Math.round(ratioClamped * 18);
  return 'linear-gradient(180deg, #ffffff 0%, hsl(12 100% ' + warmth + '%) 100%)';
}

function getStructureHeatBorder(ratio) {
  const alpha = 0.28 + Math.min(0.54, (ratio || 0) * 0.36);
  return 'rgba(217, 119, 6, ' + alpha + ')';
}

function renderStructurePanel() {
  return;
}

function renderStructureScreen() {
  const panel = document.getElementById('structurePanel');
  const wrap = document.getElementById('cwrap');
  const workspace = document.getElementById('workspace');
  if (!panel || !wrap) return;

  const showStructure = isStructureMode();
  document.body.classList.toggle('light-shell', false);
  if (workspace) workspace.classList.toggle('structure-mode', showStructure);
  wrap.classList.toggle('structure-screen', showStructure);
  wrap.classList.toggle('structure-open', false);
  panel.classList.toggle('show', showStructure);
  panel.classList.toggle('screen', showStructure);
  panel.innerHTML = '';

  if (!showStructure) return;
  ensureStructureSelection();
  const structureStyle = ensureStructureStyle();

  const head = document.createElement('div');
  head.className = 'structure-head';
  head.innerHTML =
    '<div class="structure-kicker">Structure View</div>' +
    '<div class="structure-title">' + escapeHtml((structureView && structureView.title) || '構造ビュー') + '</div>' +
    '<div class="structure-desc">' + escapeHtml((structureView && structureView.description) || '装置構造を追うためのビューです。') + '</div>' +
    '<div class="structure-note-inline">クリックで選択 / ダブルクリックでRFLPへ移動 / 右上の + - Fit で拡大縮小 / Saveで調整を保存</div>';
  panel.appendChild(head);

  const shell = document.createElement('div');
  shell.className = 'sbd-shell';
  panel.appendChild(shell);

  if (!hasStructureView()) {
    shell.innerHTML = '<div class="structure-foot"><div class="structure-foot-title">構造ビューなし</div><div class="structure-foot-text">このデータセットには構造ビュー定義がありません。</div></div>';
    return;
  }

  const viewWidth = structureView.width || 920;
  const viewHeight = structureView.height || 620;
  const editorWidth = 320;
  const availableWidth = Math.max(520, (panel.clientWidth || wrap.clientWidth) - editorWidth - 78);
  const availableHeight = Math.max(420, (panel.clientHeight || wrap.clientHeight) - 140);
  const baseScale = Math.min(1, (availableWidth - 36) / viewWidth, (availableHeight - 36) / viewHeight);
  const scale = baseScale * structureScreenZoom;
  const scaledWidth = Math.ceil(viewWidth * scale);
  const scaledHeight = Math.ceil(viewHeight * scale);

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'sbd-canvas-wrap';
  shell.appendChild(canvasWrap);

  const canvas = document.createElement('div');
  canvas.className = 'sbd-canvas';
  canvas.style.width = (scaledWidth + 36) + 'px';
  canvas.style.height = (scaledHeight + 36) + 'px';
  canvasWrap.appendChild(canvas);

  const stage = document.createElement('div');
  stage.className = 'sbd-stage';
  stage.style.width = viewWidth + 'px';
  stage.style.height = viewHeight + 'px';
  stage.style.transform = 'scale(' + scale + ')';
  canvas.appendChild(stage);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'sbd-svg');
  svg.setAttribute('viewBox', '0 0 ' + viewWidth + ' ' + viewHeight);

  const defs = document.createElementNS(SVG_NS, 'defs');
  createStructureArrowMarker(defs, 'structureArrow', structureStyle.arrowScale, structureStyle.arrowRefX, '#cfd7e6');
  svg.appendChild(defs);
  stage.appendChild(svg);

  const blockById = new Map();
  (structureView.blocks || []).forEach(function (block) {
    blockById.set(block.id, block);
  });

  (structureView.connectors || []).forEach(function (connector) {
    const fromBlock = blockById.get(connector.from);
    const toBlock = blockById.get(connector.to);
    if (!fromBlock || !toBlock) return;
    const connectorStyle = ensureStructureItemStyle(connector);

    let pathData;
    let labelX;
    let labelY;
    if (Array.isArray(connector.points) && connector.points.length >= 2) {
      pathData = connector.points.map(function (point, index) {
        return (index === 0 ? 'M ' : 'L ') + point.x + ' ' + point.y;
      }).join(' ');
      if (connector.labelPos) {
        labelX = connector.labelPos.x;
        labelY = connector.labelPos.y;
      } else {
        const pivot = connector.points[Math.floor(connector.points.length / 2)];
        labelX = pivot.x;
        labelY = pivot.y - 8;
      }
    } else {
      const horizontalFirst = Math.abs((toBlock.x + toBlock.w / 2) - (fromBlock.x + fromBlock.w / 2))
        >= Math.abs((toBlock.y + toBlock.h / 2) - (fromBlock.y + fromBlock.h / 2));

      if (horizontalFirst) {
        const leftToRight = fromBlock.x <= toBlock.x;
        const x1 = leftToRight ? fromBlock.x + fromBlock.w : fromBlock.x;
        const y1 = fromBlock.y + fromBlock.h / 2;
        const x2 = leftToRight ? toBlock.x : toBlock.x + toBlock.w;
        const y2 = toBlock.y + toBlock.h / 2;
        const midX = x1 + (x2 - x1) / 2;
        pathData = 'M ' + x1 + ' ' + y1 + ' L ' + midX + ' ' + y1 + ' L ' + midX + ' ' + y2 + ' L ' + x2 + ' ' + y2;
        labelX = midX;
        labelY = y1 + (y2 - y1) / 2 - 8;
      } else {
        const topToBottom = fromBlock.y <= toBlock.y;
        const x1 = fromBlock.x + fromBlock.w / 2;
        const y1 = topToBottom ? fromBlock.y + fromBlock.h : fromBlock.y;
        const x2 = toBlock.x + toBlock.w / 2;
        const y2 = topToBottom ? toBlock.y : toBlock.y + toBlock.h;
        const midY = y1 + (y2 - y1) / 2;
        pathData = 'M ' + x1 + ' ' + y1 + ' L ' + x1 + ' ' + midY + ' L ' + x2 + ' ' + midY + ' L ' + x2 + ' ' + y2;
        labelX = x1 + (x2 - x1) / 2;
        labelY = midY - 8;
      }
    }

    const connectorId = getStructureConnectorId(connector);
    const markerScale = connectorStyle.arrowScale || structureStyle.arrowScale;
    const markerRefX = connectorStyle.arrowRefX || structureStyle.arrowRefX;
    let markerId = 'structureArrow';
    if (markerScale !== structureStyle.arrowScale || markerRefX !== structureStyle.arrowRefX) {
      markerId = 'structureArrow-' + connectorId.replace(/[^a-zA-Z0-9_-]/g, '_');
      createStructureArrowMarker(defs, markerId, markerScale, markerRefX, '#cfd7e6');
    }

    const line = document.createElementNS(SVG_NS, 'path');
    line.setAttribute('d', pathData);
    line.setAttribute('class', connector.emphasis ? 'sbd-line sbd-line-emphasis' : 'sbd-line');
    line.setAttribute('stroke-width', String(connectorStyle.lineWidth || (connector.emphasis ? structureStyle.emphasisLineWidth : structureStyle.lineWidth)));
    line.setAttribute('marker-end', 'url(#' + markerId + ')');
    line.style.cursor = 'pointer';
    if (structureEditSelection && structureEditSelection.type === 'connector' && structureEditSelection.id === connectorId) {
      line.classList.add('selected');
    }
    line.addEventListener('click', function (event) {
      event.stopPropagation();
      setStructureSelection('connector', connectorId);
      renderStructureScreen();
    });
    svg.appendChild(line);

    if (connector.label) {
      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('class', 'sbd-line-label');
      label.setAttribute('x', labelX);
      label.setAttribute('y', labelY);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', String(connectorStyle.labelFontSize || structureStyle.labelFontSize));
      label.textContent = connector.label;
      label.style.cursor = 'pointer';
      label.addEventListener('click', function (event) {
        event.stopPropagation();
        setStructureSelection('connector', connectorId);
        renderStructureScreen();
      });
      svg.appendChild(label);
    }
  });

  (structureView.blocks || []).forEach(function (block) {
    const blockStyle = ensureStructureItemStyle(block);

    if (block.kind === 'frame') {
      const frameLayout = getStructureFrameLayout(block, blockStyle, structureStyle);
      const frameEl = document.createElement('div');
      frameEl.className = 'sbd-frame tone-' + (block.tone || 'package');
      frameEl.style.left = block.x + 'px';
      frameEl.style.top = block.y + 'px';
      frameEl.style.width = block.w + 'px';
      frameEl.style.height = block.h + 'px';
      if (structureEditSelection && structureEditSelection.type === 'block' && structureEditSelection.id === block.id) {
        frameEl.classList.add('selected');
      }
      frameEl.innerHTML =
        '<div class="sbd-frame-title">' + escapeHtml(block.label) + '</div>' +
        (frameLayout.showNote ? '<div class="sbd-frame-note">' + escapeHtml(block.note) + '</div>' : '');
      const titleEl = frameEl.querySelector('.sbd-frame-title');
      const noteEl = frameEl.querySelector('.sbd-frame-note');
      if (titleEl) {
        titleEl.style.fontSize = frameLayout.titleFontSize + 'px';
        titleEl.style.left = frameLayout.titleLeft + 'px';
        titleEl.style.top = frameLayout.titleTop + 'px';
      }
      if (noteEl) {
        noteEl.style.fontSize = frameLayout.noteFontSize + 'px';
        noteEl.style.left = frameLayout.noteLeft + 'px';
        noteEl.style.top = frameLayout.noteTop + 'px';
      }
      frameEl.style.pointerEvents = 'auto';
      frameEl.style.cursor = 'pointer';
      frameEl.addEventListener('click', function (event) {
        event.stopPropagation();
        setStructureSelection('block', block.id);
        renderStructureScreen();
      });
      stage.appendChild(frameEl);
      return;
    }

    const defectCount = getDefectCountForBlock(block);
    const blockEl = document.createElement('button');
    blockEl.type = 'button';
    blockEl.className = 'sbd-block tone-' + (block.tone || 'process');
    if (structureEditSelection && structureEditSelection.type === 'block' && structureEditSelection.id === block.id) {
      blockEl.classList.add('selected');
    }
    blockEl.style.left = block.x + 'px';
    blockEl.style.top = block.y + 'px';
    blockEl.style.width = block.w + 'px';
    blockEl.style.height = block.h + 'px';
    blockEl.innerHTML =
      '<div class="sbd-block-title">' + escapeHtml(block.label) + '</div>' +
      '<div class="sbd-block-meta">' + escapeHtml(block.note || getStructureBlockSummary(block)) + '</div>' +
      (defectCount > 0 ? '<div class="sbd-block-badge">' + defectCount + '件</div>' : '');
    blockEl.addEventListener('click', function (event) {
      event.stopPropagation();
      setStructureSelection('block', block.id);
      renderStructureScreen();
    });
    blockEl.addEventListener('dblclick', function (event) {
      event.stopPropagation();
      focusStructureBlock(block, event.ctrlKey || event.metaKey);
    });
    const titleEl = blockEl.querySelector('.sbd-block-title');
    const metaEl = blockEl.querySelector('.sbd-block-meta');
    if (titleEl) titleEl.style.fontSize = (blockStyle.titleFontSize || structureStyle.blockTitleFontSize) + 'px';
    if (metaEl) metaEl.style.fontSize = (blockStyle.metaFontSize || structureStyle.blockMetaFontSize) + 'px';
    stage.appendChild(blockEl);
  });

  const editor = document.createElement('aside');
  editor.className = 'sbd-editor';
  shell.appendChild(editor);

  const selectedTarget = getStructureSelectionTarget();
  const globalCard = document.createElement('div');
  globalCard.className = 'sbd-editor-card';
  globalCard.innerHTML = '<h3>全体調整</h3><p>矢印、線、文字の基準値です。Saveでこの状態を保存できます。</p>';
  const globalGrid = document.createElement('div');
  globalGrid.className = 'sbd-editor-grid';
  globalGrid.appendChild(createStructureNumberField('Arrow', structureStyle.arrowScale, '0.05', function (value) {
    updateStructureNumber(structureStyle, 'arrowScale', value, 0.58);
  }));
  globalGrid.appendChild(createStructureNumberField('RefX', structureStyle.arrowRefX, '0.2', function (value) {
    updateStructureNumber(structureStyle, 'arrowRefX', value, 9.2);
  }));
  globalGrid.appendChild(createStructureNumberField('Line', structureStyle.lineWidth, '0.1', function (value) {
    updateStructureNumber(structureStyle, 'lineWidth', value, 2);
  }));
  globalGrid.appendChild(createStructureNumberField('Emphasis', structureStyle.emphasisLineWidth, '0.1', function (value) {
    updateStructureNumber(structureStyle, 'emphasisLineWidth', value, 2.4);
  }));
  globalGrid.appendChild(createStructureNumberField('Label', structureStyle.labelFontSize, '1', function (value) {
    updateStructureNumber(structureStyle, 'labelFontSize', value, 10);
  }));
  globalGrid.appendChild(createStructureNumberField('Frame title', structureStyle.frameTitleFontSize, '1', function (value) {
    updateStructureNumber(structureStyle, 'frameTitleFontSize', value, 22);
  }));
  globalGrid.appendChild(createStructureNumberField('Frame note', structureStyle.frameNoteFontSize, '1', function (value) {
    updateStructureNumber(structureStyle, 'frameNoteFontSize', value, 10);
  }));
  globalGrid.appendChild(createStructureNumberField('Block title', structureStyle.blockTitleFontSize, '1', function (value) {
    updateStructureNumber(structureStyle, 'blockTitleFontSize', value, 14);
  }));
  globalGrid.appendChild(createStructureNumberField('Block note', structureStyle.blockMetaFontSize, '1', function (value) {
    updateStructureNumber(structureStyle, 'blockMetaFontSize', value, 10);
  }));
  globalCard.appendChild(globalGrid);
  editor.appendChild(globalCard);

  const selectedCard = document.createElement('div');
  selectedCard.className = 'sbd-editor-card';
  if (!selectedTarget || !structureEditSelection) {
    selectedCard.innerHTML = '<h3>選択中</h3><p>ブロック、背景グループ、矢印をクリックすると個別調整できます。</p>';
    editor.appendChild(selectedCard);
    return;
  }

  const selectedStyle = ensureStructureItemStyle(selectedTarget);
  selectedCard.innerHTML =
    '<h3>選択中</h3>' +
    '<div class="sbd-editor-target">' + escapeHtml(structureEditSelection.type === 'connector'
      ? ('矢印: ' + (selectedTarget.label || getStructureConnectorId(selectedTarget)))
      : selectedTarget.label) + '</div>';
  const selectedGrid = document.createElement('div');
  selectedGrid.className = 'sbd-editor-grid';

  if (structureEditSelection.type === 'block') {
    selectedGrid.appendChild(createStructureNumberField('X', selectedTarget.x, '1', function (value) {
      updateStructureNumber(selectedTarget, 'x', value, selectedTarget.x);
    }));
    selectedGrid.appendChild(createStructureNumberField('Y', selectedTarget.y, '1', function (value) {
      updateStructureNumber(selectedTarget, 'y', value, selectedTarget.y);
    }));
    selectedGrid.appendChild(createStructureNumberField('Width', selectedTarget.w, '1', function (value) {
      updateStructureNumber(selectedTarget, 'w', value, selectedTarget.w);
    }));
    selectedGrid.appendChild(createStructureNumberField('Height', selectedTarget.h, '1', function (value) {
      updateStructureNumber(selectedTarget, 'h', value, selectedTarget.h);
    }));
    selectedGrid.appendChild(createStructureNumberField('Title', selectedStyle.titleFontSize || '', '1', function (value) {
      updateStructureNumber(selectedStyle, 'titleFontSize', value, selectedTarget.kind === 'frame' ? structureStyle.frameTitleFontSize : structureStyle.blockTitleFontSize);
    }));
    if (selectedTarget.kind === 'frame') {
      selectedGrid.appendChild(createStructureNumberField('Note', selectedStyle.noteFontSize || '', '1', function (value) {
        updateStructureNumber(selectedStyle, 'noteFontSize', value, structureStyle.frameNoteFontSize);
      }));
      selectedGrid.appendChild(createStructureNumberField('Title X', selectedStyle.titleOffsetX || '', '1', function (value) {
        updateStructureNumber(selectedStyle, 'titleOffsetX', value, 0);
      }));
      selectedGrid.appendChild(createStructureNumberField('Title Y', selectedStyle.titleOffsetY || '', '1', function (value) {
        updateStructureNumber(selectedStyle, 'titleOffsetY', value, 0);
      }));
      selectedGrid.appendChild(createStructureNumberField('Note Y', selectedStyle.noteOffsetY || '', '1', function (value) {
        updateStructureNumber(selectedStyle, 'noteOffsetY', value, 0);
      }));
    } else {
      selectedGrid.appendChild(createStructureNumberField('Note', selectedStyle.metaFontSize || '', '1', function (value) {
        updateStructureNumber(selectedStyle, 'metaFontSize', value, structureStyle.blockMetaFontSize);
      }));
    }
    selectedCard.appendChild(selectedGrid);

    const actionRow = document.createElement('div');
    actionRow.className = 'sbd-editor-actions';
    if (selectedTarget.kind !== 'frame') {
      actionRow.appendChild(createStructureActionButton('RFLPで開く', 'btn btn-active', function () {
        focusStructureBlock(selectedTarget, false);
      }));
    }
    actionRow.appendChild(createStructureActionButton('選択解除', 'btn', function () {
      setStructureSelection(null, null);
      renderStructureScreen();
    }));
    selectedCard.appendChild(actionRow);
  } else if (structureEditSelection.type === 'connector') {
    selectedGrid.appendChild(createStructureNumberField('Label X', selectedTarget.labelPos ? selectedTarget.labelPos.x : '', '1', function (value) {
      if (!selectedTarget.labelPos) selectedTarget.labelPos = { x: 0, y: 0 };
      updateStructureNumber(selectedTarget.labelPos, 'x', value, 0);
    }));
    selectedGrid.appendChild(createStructureNumberField('Label Y', selectedTarget.labelPos ? selectedTarget.labelPos.y : '', '1', function (value) {
      if (!selectedTarget.labelPos) selectedTarget.labelPos = { x: 0, y: 0 };
      updateStructureNumber(selectedTarget.labelPos, 'y', value, 0);
    }));
    selectedGrid.appendChild(createStructureNumberField('Arrow', selectedStyle.arrowScale || '', '0.05', function (value) {
      updateStructureNumber(selectedStyle, 'arrowScale', value, structureStyle.arrowScale);
    }));
    selectedGrid.appendChild(createStructureNumberField('RefX', selectedStyle.arrowRefX || '', '0.2', function (value) {
      updateStructureNumber(selectedStyle, 'arrowRefX', value, structureStyle.arrowRefX);
    }));
    selectedGrid.appendChild(createStructureNumberField('Line', selectedStyle.lineWidth || '', '0.1', function (value) {
      updateStructureNumber(selectedStyle, 'lineWidth', value, selectedTarget.emphasis ? structureStyle.emphasisLineWidth : structureStyle.lineWidth);
    }));
    selectedGrid.appendChild(createStructureNumberField('Label', selectedStyle.labelFontSize || '', '1', function (value) {
      updateStructureNumber(selectedStyle, 'labelFontSize', value, structureStyle.labelFontSize);
    }));
    selectedCard.appendChild(selectedGrid);

    const connectorActions = document.createElement('div');
    connectorActions.className = 'sbd-editor-actions';
    connectorActions.appendChild(createStructureActionButton('選択解除', 'btn', function () {
      setStructureSelection(null, null);
      renderStructureScreen();
    }));
    selectedCard.appendChild(connectorActions);
  }

  editor.appendChild(selectedCard);
}

function render() {
  const svg = document.getElementById('cv');
  const wrap = document.getElementById('cwrap');
  const workspace = document.getElementById('workspace');
  const width = Math.max(240, wrap.clientWidth - getStructurePanelWidth());
  const height = wrap.clientHeight;

  renderState = buildRenderState();
  if (workspace) workspace.classList.toggle('structure-mode', isStructureMode());

  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.style.width = width + 'px';
  svg.innerHTML = '';

  if (isStructureMode()) {
    document.getElementById('zlbl').textContent = Math.round(tf.sc * 100) + '%';
    renderStructureScreen();
    updateSidebar();
    syncUiState();
    return;
  }

  const group = mk('g');
  group.setAttribute('transform', 'translate(' + (tf.x + width / 2) + ',' + (tf.y + height / 2) + ') scale(' + tf.sc + ')');
  svg.appendChild(group);

  const linkGroup = mk('g');
  group.appendChild(linkGroup);

  lks.forEach(function (link) {
    if (!renderState.visibleLinkIds.has(link.id)) return;
    drawLink(linkGroup, link);
  });

  renderState.displayOrder.forEach(function (col) {
    drawCol(group, col);
  });

  document.getElementById('zlbl').textContent = Math.round(tf.sc * 100) + '%';
  renderStructureScreen();
  updateSidebar();
  syncUiState();
}

function drawCol(group, col) {
  const x = cxById(col.id);
  const nodesInCol = nds.filter(function (node) {
    return node.colId === col.id && renderState.visibleNodeIds.has(node.id);
  });
  const maxNodes = maxNdCount();
  const colHeight = Math.max(180, maxNodes * GRID + CHH + 60);
  const color = cc(col.side);
  const bgColor = cb(col.side);
  const allFaded = renderState.hasHighlight && !isolateMode && nodesInCol.length > 0 && nodesInCol.every(function (node) {
    return !renderState.highlightedNodes.has(node.id);
  });

  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2,
    width: CW,
    height: colHeight,
    rx: 8,
    fill: bgColor,
    stroke: color,
    'stroke-opacity': allFaded ? '0.08' : '0.2',
    'stroke-width': '1',
    opacity: allFaded ? '0.2' : '1'
  }));
  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2,
    width: CW,
    height: CHH,
    rx: 8,
    fill: color,
    'fill-opacity': allFaded ? '0.3' : '0.88'
  }));
  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2 + CHH - 5,
    width: CW,
    height: 5,
    fill: color,
    'fill-opacity': allFaded ? '0.3' : '0.88'
  }));

  const headerText = mk('text', {
    x: x + CW / 2,
    y: -colHeight / 2 + CHH / 2 + 5,
    'text-anchor': 'middle',
    fill: allFaded ? 'rgba(255,255,255,0.2)' : '#fff',
    'font-size': '11',
    'font-family': 'Noto Sans JP,sans-serif',
    'font-weight': '600'
  });
  headerText.textContent = col.name;
  group.appendChild(headerText);

  const sideLabel = mk('text', {
    x: x + CW - 5,
    y: -colHeight / 2 + 13,
    'text-anchor': 'end',
    fill: allFaded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
    'font-size': '8',
    'font-family': 'DM Mono,monospace'
  });
  sideLabel.textContent = col.side === 'req' ? '隕∽ｻｶ' : '隕∫ｴ';
  group.appendChild(sideLabel);

  nodesInCol.forEach(function (node) {
    drawNode(group, node, col, x);
  });

  if (!isolateMode || !renderState.hasHighlight) {
    const buttonY = -colHeight / 2 + CHH + 12 - (maxNodes * GRID) / 2 + (maxNodes - nodesInCol.length) * GRID / 2 + nodesInCol.length * GRID + 4;
    const addButton = mk('text', {
      x: x + CW / 2,
      y: buttonY + 14,
      'text-anchor': 'middle',
      fill: color,
      'fill-opacity': '0.4',
      'font-size': '20',
      cursor: 'pointer'
    });
    addButton.textContent = '+';
    addButton.addEventListener('click', function () { openNM(col.id); });
    addButton.addEventListener('mouseover', function () { addButton.setAttribute('fill-opacity', '1'); });
    addButton.addEventListener('mouseout', function () { addButton.setAttribute('fill-opacity', '0.4'); });
    group.appendChild(addButton);
  }
}

function drawNode(group, node, col, colX) {
  const y = ny(node.id);
  const nx = colX + 7;
  const width = CW - 14;
  const color = cc(col.side);
  const showDefectHeat = defectReviewMode && canUseDefectReviewMode();
  const defectCount = showDefectHeat ? getDefectCountForNode(node.id) : 0;
  const maxDefectCount = showDefectHeat ? getMaxNodeDefectCount() : 0;
  const defectRatio = maxDefectCount > 0 ? defectCount / maxDefectCount : 0;
  const isSelected = isNodeSelected(node.id);
  const isActive = node.id === hlState.nodeId;
  const isHighlighted = renderState.highlightedNodes.has(node.id);
  const highlightCount = renderState.highlightNodeCounts.get(node.id) || 0;
  const isOverlap = highlightCount > 1;
  const faded = !isolateMode && renderState.hasHighlight && !isHighlighted;
  const overlapStroke = overlapStrokeColor(highlightCount);
  const overlapText = overlapTextColor(highlightCount);
  const overlapFill = overlapFillColor(highlightCount);
  const defectTextColor = getNodeHeatTextColor(defectRatio);
  const strokeColor = isOverlap ? overlapStroke : color;
  const fillColor = isActive
    ? cb(col.side)
    : (isOverlap ? overlapFill : (faded ? '#080b0f' : (defectCount > 0 ? getNodeHeatFill(col.side, defectRatio, isActive) : '#0d1117')));

  const rect = mk('rect', {
    x: nx,
    y: y,
    width: width,
    height: NH,
    rx: 5,
    fill: fillColor,
    stroke: isSelected ? strokeColor : (faded ? 'rgba(80,80,80,0.15)' : strokeColor),
    'stroke-width': isOverlap ? '2.6' : (isSelected ? '2' : '1.5'),
    'stroke-opacity': isSelected || isOverlap ? '1' : (faded ? '0.15' : '0.55'),
    opacity: faded ? '0.25' : '1'
  });
  rect.style.cursor = 'pointer';

  const deleteText = mk('text', {
    x: nx + width - 4,
    y: y + 12,
    'text-anchor': 'end',
    fill: 'rgba(200,80,80,0)',
    'font-size': '11',
    cursor: 'pointer'
  });
  deleteText.textContent = 'x';

  rect.addEventListener('mouseover', function () {
    if (faded) return;
    if (showDefectHeat && defectCount > 0 && !isOverlap && !isActive) {
      rect.setAttribute('fill', getNodeHeatFill(col.side, Math.min(1, defectRatio + 0.12), false));
    } else {
      rect.setAttribute('fill', isOverlap && !isActive ? overlapFill : cb(col.side));
    }
    rect.setAttribute('stroke-opacity', '1');
    deleteText.setAttribute('fill', 'rgba(200,80,80,0.8)');
  });
  rect.addEventListener('mouseout', function () {
    rect.setAttribute('fill', fillColor);
    rect.setAttribute('stroke-opacity', isSelected || isOverlap ? '1' : (faded ? '0.15' : '0.55'));
    deleteText.setAttribute('fill', 'rgba(200,80,80,0)');
    hideNodeTip();
  });
  rect.addEventListener('mouseenter', function (event) { showNodeTip(event, node.description); });
  rect.addEventListener('mousemove', moveNodeTip);
  rect.addEventListener('click', function (event) { onNodeClick(event, node.id); });
  group.appendChild(rect);

  group.appendChild(mk('rect', {
    x: nx,
    y: y + 6,
    width: 3,
    height: NH - 12,
    rx: 1.5,
    fill: color,
    opacity: faded ? '0.15' : '1'
  }));

  const text = mk('text', {
    x: nx + 11,
    y: y + NH / 2 + 4,
    fill: faded ? 'rgba(120,120,120,0.3)' : (isOverlap ? overlapText : (showDefectHeat && defectCount > 0 ? defectTextColor : '#e6edf3')),
    'font-size': '10',
    'font-family': 'Noto Sans JP,sans-serif'
  });
  const maxLength = 10;
  text.textContent = node.name.length > maxLength ? node.name.slice(0, maxLength) + '窶ｦ' : node.name;
  text.style.cursor = 'pointer';
  text.addEventListener('mouseenter', function (event) { showNodeTip(event, node.description); });
  text.addEventListener('mousemove', moveNodeTip);
  text.addEventListener('mouseleave', hideNodeTip);
  text.addEventListener('click', function (event) { onNodeClick(event, node.id); });
  group.appendChild(text);

  if (node.refUrl) {
    const ref = mk('text', {
      x: nx + width - 12,
      y: y + NH / 2 + 4,
      fill: faded ? 'rgba(120,120,120,0.3)' : '#8ec5ff',
      'font-size': '10',
      'font-family': 'DM Mono,monospace'
    });
    ref.textContent = '↗';
    ref.style.cursor = 'pointer';
    ref.addEventListener('click', function (event) {
      event.stopPropagation();
      openRefUrl(node.refUrl);
    });
    group.appendChild(ref);
  }

  if (defectCount > 0) {
    const defectBadge = mk('text', {
      x: nx + width - (node.refUrl ? 28 : 14),
      y: y + 11,
      fill: faded ? 'rgba(255,180,180,0.25)' : '#ffb4a7',
      'font-size': '9',
      'font-family': 'DM Mono,monospace',
      'text-anchor': 'end'
    });
    defectBadge.textContent = defectCount + '莉ｶ';
    group.appendChild(defectBadge);
  }

  if (isOverlap) {
    const overlapBadge = mk('text', {
      x: nx + width - (node.refUrl ? 52 : (defectCount > 0 ? 40 : 18)),
      y: y + NH / 2 + 4,
      fill: overlapStroke,
      'font-size': '9',
      'font-family': 'DM Mono,monospace',
      'text-anchor': 'end'
    });
    overlapBadge.textContent = 'x' + highlightCount;
    group.appendChild(overlapBadge);
  }

  deleteText.addEventListener('click', function (event) {
    event.stopPropagation();
    if (isNodeSelected(node.id)) removeNodeHighlight(node.id);
    removeNd(node.id);
  });
  group.appendChild(deleteText);
}

function drawLink(group, link) {
  const fromNode = getNodeById(link.f);
  const toNode = getNodeById(link.t);
  if (!fromNode || !toNode) return;

  const fromCenter = ndCenter(link.f);
  const toCenter = ndCenter(link.t);
  if (!fromCenter || !toCenter) return;

  const fromIndex = colIdx(fromNode.colId);
  const toIndex = colIdx(toNode.colId);
  let fromX;
  let toX;

  if (fromIndex < toIndex) {
    fromX = cxById(fromNode.colId) + CW;
    toX = cxById(toNode.colId);
  } else {
    fromX = cxById(fromNode.colId);
    toX = cxById(toNode.colId) + CW;
  }

  const dx = Math.abs(toX - fromX) * 0.42;
  const isHighlighted = renderState.highlightedLinks.has(link.id);
  const highlightCount = renderState.highlightLinkCounts.get(link.id) || 0;
  const isOverlap = highlightCount > 1;
  const faded = !isolateMode && renderState.hasHighlight && !isHighlighted;
  const defectMuted = defectReviewMode && canUseDefectReviewMode() && !isHighlighted;
  const direction = fromIndex < toIndex ? 1 : -1;
  const overlapStroke = overlapStrokeColor(highlightCount);
  const defaultStroke = isOverlap ? overlapStroke : lc(link.s);
  const defectStroke = 'rgba(120,132,150,0.16)';

  const path = mk('path', {
    d: 'M ' + fromX + ' ' + fromCenter.y + ' C ' + (fromX + direction * dx) + ' ' + fromCenter.y + ', ' + (toX - direction * dx) + ' ' + toCenter.y + ', ' + toX + ' ' + toCenter.y,
    stroke: faded ? 'rgba(80,80,80,0.12)' : (defectMuted ? defectStroke : defaultStroke),
    'stroke-width': defectMuted ? Math.max(1, lw(link.s) - 0.4) : (isOverlap ? lw(link.s) + 1.6 : (isHighlighted ? lw(link.s) + 0.8 : lw(link.s))),
    fill: 'none',
    'stroke-linecap': 'round',
    opacity: faded ? '0.2' : (defectMuted ? '0.45' : '1')
  });
  path.style.cursor = 'pointer';
  path.addEventListener('click', function (event) {
    event.stopPropagation();
    removeLk(link.id);
  });
  group.appendChild(path);
}

function removeNd(id) {
  nds = nds.filter(function (node) { return node.id !== id; });
  lks = lks.filter(function (link) { return link.f !== id && link.t !== id; });
  if (isNodeSelected(id)) {
    removeNodeHighlight(id);
  }
  render();
}

function removeLk(id) {
  lks = lks.filter(function (link) { return link.id !== id; });
  render();
}

function removeCol(id) {
  const nodeIds = nds.filter(function (node) {
    return node.colId === id;
  }).map(function (node) {
    return node.id;
  });

  nds = nds.filter(function (node) { return node.colId !== id; });
  lks = lks.filter(function (link) {
    return !nodeIds.includes(link.f) && !nodeIds.includes(link.t);
  });
  cols = cols.filter(function (col) { return col.id !== id; });
  if (nodeIds.some(function (nodeId) { return isNodeSelected(nodeId); })) {
    applyHighlightState(
      getSelectedHighlights().filter(function (item) {
        return !nodeIds.includes(item.nodeId);
      }),
      hlState.activeNodeId
    );
  }
  render();
}

const cvEl = document.getElementById('cv');
window.addEventListener('keydown', function (event) {
  const tagName = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '';
  const isTypingTarget = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  if (isTypingTarget) return;
  if (isolateLocked && event.key === 'ArrowLeft') {
    moveHighlightStep('previous');
    event.preventDefault();
    return;
  }
  if (isolateLocked && event.key === 'ArrowRight') {
    moveHighlightStep('next');
    event.preventDefault();
    return;
  }
  if (event.code === 'Space') {
    panModifierActive = true;
    event.preventDefault();
  }
});

window.addEventListener('keyup', function (event) {
  if (event.code === 'Space') {
    panModifierActive = false;
  }
});

cvEl.addEventListener('mousedown', function (event) {
  const isBackgroundTarget = event.target === cvEl || event.target.tagName === 'g' || event.target.tagName === 'svg';
  if (isBackgroundTarget || panModifierActive) {
    panning = true;
    ps = { x: event.clientX - tf.x, y: event.clientY - tf.y };
    panOrigin = { x: event.clientX, y: event.clientY };
    suppressCanvasClick = !!panModifierActive;
    cvEl.classList.add('grab');
    event.preventDefault();
  }
});

window.addEventListener('mousemove', function (event) {
  if (!panning) return;
  if (panOrigin) {
    const dx = event.clientX - panOrigin.x;
    const dy = event.clientY - panOrigin.y;
    if (Math.abs(dx) > PAN_CLICK_THRESHOLD || Math.abs(dy) > PAN_CLICK_THRESHOLD) {
      suppressCanvasClick = true;
    }
  }
  tf.x = event.clientX - ps.x;
  tf.y = event.clientY - ps.y;
  render();
});

window.addEventListener('mouseup', function () {
  panning = false;
  panOrigin = null;
  cvEl.classList.remove('grab');
});

cvEl.addEventListener('wheel', function (event) {
  event.preventDefault();
  const hasHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 0;
  if (hasHorizontalIntent || event.shiftKey) {
    const panDelta = hasHorizontalIntent ? event.deltaX : event.deltaY;
    tf.x -= panDelta * 0.8;
    render();
    return;
  }
  zoom(event.deltaY < 0 ? 1.1 : 0.9, event.clientX, event.clientY);
}, { passive: false });

cvEl.addEventListener('click', function (event) {
  if (suppressCanvasClick) {
    suppressCanvasClick = false;
    return;
  }
  if (event.target === cvEl) {
    clearHighlight();
    render();
  }
});

function zoom(factor, cx2, cy2) {
  if (isStructureMode()) {
    structureScreenZoom = Math.max(0.5, Math.min(3, structureScreenZoom * factor));
    renderStructureScreen();
    return;
  }
  const wrap = document.getElementById('cwrap');
  const width = wrap.clientWidth;
  const height = wrap.clientHeight;
  const px = (cx2 != null ? cx2 : width / 2) - width / 2;
  const py = (cy2 != null ? cy2 : height / 2) - height / 2;

  tf.x = px + (tf.x - px) * factor;
  tf.y = py + (tf.y - py) * factor;
  tf.sc = Math.max(0.1, Math.min(4, tf.sc * factor));
  render();
}

function fitView() {
  if (isStructureMode()) {
    structureScreenZoom = 1;
    renderStructureScreen();
    return;
  }
  tf = { x: 0, y: 0, sc: 0.7 };
  render();
}

function openLinkModal() {
  const options = nds.map(function (node) {
    const col = getColById(node.colId);
    return '<option value="' + node.id + '">[' + (col ? escapeHtml(col.name) : '?') + '] ' + escapeHtml(node.name) + '</option>';
  }).join('');

  document.getElementById('lFrom').innerHTML = options;
  document.getElementById('lTo').innerHTML = options;
  document.getElementById('mLink').classList.add('on');
}

function closeLM() {
  document.getElementById('mLink').classList.remove('on');
}

function addLink() {
  const fromId = document.getElementById('lFrom').value;
  const toId = document.getElementById('lTo').value;
  const strength = document.getElementById('lStr').value;
  if (!fromId || !toId || fromId === toId) return;
  lks.push({ id: uid(), f: fromId, t: toId, s: strength });
  closeLM();
  render();
}

function openNM(colId) {
  const col = getColById(colId);
  document.getElementById('mNT').textContent = '[' + (col ? col.name : '') + '] にノードを追加';
  document.getElementById('nCol').innerHTML = cols.map(function (item) {
    return '<option value="' + item.id + '"' + (item.id === colId ? ' selected' : '') + '>' + escapeHtml(item.name) + '</option>';
  }).join('');
  document.getElementById('nName').value = '';
  document.getElementById('mNode').classList.add('on');
  setTimeout(function () {
    document.getElementById('nName').focus();
  }, 100);
}

function closeNM() {
  document.getElementById('mNode').classList.remove('on');
}

function confirmNode() {
  const name = document.getElementById('nName').value.trim();
  const colId = document.getElementById('nCol').value;
  if (!name) return;
  nds.push({ id: uid(), colId: colId, name: name });
  closeNM();
  render();
}

document.getElementById('nName').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') confirmNode();
});

function switchTab(tab, element) {
  curTab = tab;
  document.querySelectorAll('.stab').forEach(function (tabEl) {
    tabEl.classList.remove('on');
  });
  element.classList.add('on');
  updateSidebar();
}

function updateSidebar() {
  const body = document.getElementById('sbody');
  if (curTab === 'cols') {
    renderColsTab(body);
  } else if (curTab === 'nodes') {
    renderNodesTab(body);
  } else {
    renderLinksTab(body);
  }
}

function renderColsTab(body) {
  body.innerHTML = '';

  [['elem', '要素列'], ['req', '要求列']].forEach(function (config) {
    const side = config[0];
    const label = config[1];
    const sideCols = cols
      .filter(function (col) { return col.side === side; })
      .sort(function (a, b) { return a.order - b.order; });

    const section = document.createElement('div');
    section.className = 'slabel';
    section.textContent = label;
    body.appendChild(section);

    const list = document.createElement('div');
    list.className = 'slist';

    sideCols.forEach(function (col) {
      const item = document.createElement('div');
      item.className = 'sitem';
      item.innerHTML =
        '<div class="sdot" style="background:' + cc(col.side) + '"></div>' +
        '<span class="sname">' + escapeHtml(col.name) + '</span>' +
        '<span class="sbadge b-' + col.side + '">' + (col.side === 'req' ? '隕∽ｻｶ' : '隕∫ｴ') + '</span>';

      const remove = document.createElement('button');
      remove.className = 'sicon danger';
      remove.textContent = 'x';
      remove.addEventListener('click', function () {
        removeCol(col.id);
      });

      item.appendChild(remove);
      list.appendChild(item);
    });

    body.appendChild(list);

    const row = document.createElement('div');
    row.className = 'inline-row';
    row.innerHTML =
      '<input class="mi" id="nc_' + side + '" type="text" placeholder="蛻怜錐...">' +
      '<button class="btn btn-mini" type="button">+</button>';
    const input = row.querySelector('input');
    const button = row.querySelector('button');
    button.addEventListener('click', function () { addCol(side); });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') addCol(side);
    });
    body.appendChild(row);
  });
}

function renderSelectedNodeSummary(body) {
  if (!hlState.nodeId) return;
  const node = getNodeById(hlState.nodeId);
  if (!node) return;
  const col = getColById(node.colId);

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = '驕ｸ謚樔ｸｭ';
  body.appendChild(section);

  const card = document.createElement('div');
  card.className = 'sitem selected';
  card.innerHTML =
    '<div class="sdot" style="background:' + cc(col ? col.side : 'elem') + '"></div>' +
    '<div class="sstack">' +
      '<div class="shead"><span class="sname">' + escapeHtml(node.name) + '</span></div>' +
      '<div class="smeta">' + escapeHtml(col ? col.name : '?') + ' / 髢｢騾｣ ' + getNodeLinkCount(node.id) + '莉ｶ</div>' +
      (node.description ? '<div class="sdesc">' + escapeHtml(node.description) + '</div>' : '') +
    '</div>';

  const actions = document.createElement('div');
  actions.className = 'sactions';
  [
    { label: 'Focus', onClick: function () { focusNode(node.id, hlState.depth || 1); } },
    { label: '霑大ｍ', onClick: function () { focusNode(node.id, 1); } },
    { label: 'Full', onClick: function () { focusNode(node.id, 2); } },
    { label: isolateMode ? '隗｣髯､' : 'Solo', onClick: function () { if (isolateMode) toggleIsolateMode(false); else focusOnlyNode(node.id, hlState.depth || 1); } }
  ].forEach(function (config) {
    const button = document.createElement('button');
    button.className = 'sbtn';
    button.type = 'button';
    button.textContent = config.label;
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      config.onClick();
    });
    actions.appendChild(button);
  });

  card.appendChild(actions);
  if (node.refUrl) {
    const ref = document.createElement('button');
    ref.className = 'sbtn sbtn-link';
    ref.type = 'button';
    ref.textContent = node.refLabel || 'ref';
    ref.addEventListener('click', function (event) {
      event.stopPropagation();
      openRefUrl(node.refUrl);
    });
    actions.appendChild(ref);
  }

  body.appendChild(card);
}

function renderTraversalList(body, label, items) {
  const subLabel = document.createElement('div');
  subLabel.className = 'trav-subhead';
  subLabel.textContent = label + ' (' + items.length + ')';
  body.appendChild(subLabel);

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'trav-empty';
    empty.textContent = '謗･邯壹ヮ繝ｼ繝峨・縺ゅｊ縺ｾ縺帙ｓ';
    body.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'trav-list';

  items.forEach(function (item) {
    const row = document.createElement('button');
    row.className = 'trav-item';
    row.type = 'button';
    row.innerHTML =
      '<span class="trav-dot" style="background:' + cc(item.side) + '"></span>' +
      '<span class="trav-stack">' +
        '<span class="trav-name">' + escapeHtml(item.name) + '</span>' +
        '<span class="trav-meta">' + escapeHtml(item.colName) + '</span>' +
      '</span>';
    row.title = item.description || (item.colName + ' / click: focus, Ctrl/Cmd+click: add');
    row.addEventListener('click', function (event) {
      event.stopPropagation();
      traverseToNode(item.id, event.ctrlKey || event.metaKey);
    });
    list.appendChild(row);
  });

  body.appendChild(list);
}

function renderTraversalSection(body) {
  const activeHighlight = getActiveHighlight();

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'たどる';
  body.appendChild(section);

  const panel = document.createElement('div');
  panel.className = 'trav-panel';
  body.appendChild(panel);

  if (!activeHighlight) {
    panel.classList.add('trav-panel-empty');

    const emptyTitle = document.createElement('div');
    emptyTitle.className = 'trav-panel-title';
    emptyTitle.textContent = '繝弱・繝峨ｒ驕ｸ縺ｶ縺ｨ謗･邯壼・繧定｡ｨ遉ｺ';
    panel.appendChild(emptyTitle);

    const emptyBody = document.createElement('div');
    emptyBody.className = 'trav-hint';
    emptyBody.textContent = 'ノードをクリックすると、前後レイヤーの接続先をここに表示します。Clickで移動、Ctrl/Cmd+clickで追加選択できます。';
    panel.appendChild(emptyBody);
    return;
  }

  const groups = getAdjacentNodesByDirection(activeHighlight.nodeId);
  const activeNode = getNodeById(activeHighlight.nodeId);
  const activeCol = activeNode ? getColById(activeNode.colId) : null;

  const activeTitle = document.createElement('div');
  activeTitle.className = 'trav-panel-title';
  activeTitle.textContent = '謗･邯壼・繝翫ン';
  panel.appendChild(activeTitle);

  const modeHint = document.createElement('div');
  modeHint.className = 'trav-hint';
  modeHint.textContent = isolateLocked
    ? '固定中: ← → キーで移動できます'
    : '矢印キー移動は固定中のみ有効です';
  panel.appendChild(modeHint);

  const activeMeta = document.createElement('div');
  activeMeta.className = 'trav-current';
  activeMeta.innerHTML =
    '<span class="trav-current-name">' + escapeHtml(activeNode ? activeNode.name : '') + '</span>' +
    '<span class="trav-current-meta">' + escapeHtml(activeCol ? activeCol.name : '?') + '</span>';
  panel.appendChild(activeMeta);

  const hint = document.createElement('div');
  hint.className = 'trav-hint';
  hint.textContent = 'click: jump / Ctrl or Cmd+click: compare add';
  panel.appendChild(hint);

  renderTraversalList(panel, '蜑阪Ξ繧､繝､繝ｼ', groups.previous);
  renderTraversalList(panel, '谺｡繝ｬ繧､繝､繝ｼ', groups.next);
}

function renderStepTraversalList(body, label, items) {
  const subLabel = document.createElement('div');
  subLabel.className = 'trav-subhead';
  subLabel.textContent = label + ' (' + items.length + ')';
  body.appendChild(subLabel);

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'trav-empty';
    empty.textContent = '蛟呵｣懊・縺ゅｊ縺ｾ縺帙ｓ';
    body.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'trav-list';

  items.forEach(function (item) {
    const row = document.createElement('button');
    row.className = 'trav-item';
    row.type = 'button';
    row.innerHTML =
      '<span class="trav-dot" style="background:' + cc(item.side) + '"></span>' +
      '<span class="trav-stack">' +
        '<span class="trav-name">' + escapeHtml(item.name) + '</span>' +
        '<span class="trav-meta">' + escapeHtml(item.colName) + '</span>' +
      '</span>';
    row.addEventListener('click', function (event) {
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey) {
        traverseToNode(item.id, true);
        return;
      }
      moveActiveHighlight(item.id);
    });
    list.appendChild(row);
  });

  body.appendChild(list);
}

function renderStepTraversalSection(body) {
  const activeHighlight = getActiveHighlight();

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'たどる';
  body.appendChild(section);

  const panel = document.createElement('div');
  panel.className = 'trav-panel';
  body.appendChild(panel);

  if (!activeHighlight) {
    panel.classList.add('trav-panel-empty');

    const emptyTitle = document.createElement('div');
    emptyTitle.className = 'trav-panel-title';
    emptyTitle.textContent = 'ハイライトを選ぶと移動できます';
    panel.appendChild(emptyTitle);

    const emptyBody = document.createElement('div');
    emptyBody.className = 'trav-hint';
    emptyBody.textContent = '中央のノードをクリックしてハイライトすると、この枠から前後へたどれます。';
    panel.appendChild(emptyBody);
    return;
  }

  const activeNode = getNodeById(activeHighlight.nodeId);
  const activeCol = activeNode ? getColById(activeNode.colId) : null;
  const targets = getTraversalTargets();
  const previousTarget = targets.previous[0] || null;
  const nextTarget = targets.next[0] || null;

  const activeTitle = document.createElement('div');
  activeTitle.className = 'trav-panel-title';
  activeTitle.textContent = 'ハイライト移動';
  panel.appendChild(activeTitle);

  const activeMeta = document.createElement('div');
  activeMeta.className = 'trav-current';
  activeMeta.innerHTML =
    '<span class="trav-current-name">' + escapeHtml(activeNode ? activeNode.name : '') + '</span>' +
    '<span class="trav-current-meta">' + escapeHtml(activeCol ? activeCol.name : '?') + '</span>';
  panel.appendChild(activeMeta);

  const nav = document.createElement('div');
  nav.className = 'trav-nav';
  panel.appendChild(nav);

  [
    {
      className: 'trav-nav-btn prev',
      label: '\u2190 蜑阪∈',
      target: previousTarget,
      count: targets.previous.length,
      handler: function () { moveHighlightStep('previous'); }
    },
    {
      className: 'trav-nav-btn next',
      label: '谺｡縺ｸ \u2192',
      target: nextTarget,
      count: targets.next.length,
      handler: function () { moveHighlightStep('next'); }
    }
  ].forEach(function (config) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = config.className;
    button.disabled = !config.target;
    button.innerHTML =
      '<span class="trav-nav-label">' + config.label + '</span>' +
      '<span class="trav-nav-target">' + escapeHtml(config.target ? config.target.name : '移動先なし') + '</span>' +
      '<span class="trav-nav-meta">' + (config.count > 1 ? '蛟呵｣・' + config.count + '莉ｶ' : (config.target ? escapeHtml(config.target.colName) : '')) + '</span>';
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      config.handler();
    });
    nav.appendChild(button);
  });

  const hint = document.createElement('div');
  hint.className = 'trav-hint';
  hint.textContent = '候補が複数あるときは下のボタンから移動できます。';
  panel.appendChild(hint);

  renderStepTraversalList(panel, '前レイヤー候補', targets.previous);
  renderStepTraversalList(panel, '次レイヤー候補', targets.next);
}

function renderNodesTab(body) {
  body.innerHTML = '';

  renderSelectedNodeSummary(body);
  renderStepTraversalSection(body);
  const selectedHighlights = getSelectedHighlights();

  if (selectedHighlights.length > 1) {
    const compareLabel = document.createElement('div');
    compareLabel.className = 'slabel';
    compareLabel.textContent = 'Compare';
    body.appendChild(compareLabel);

    const compareCard = document.createElement('div');
    compareCard.className = 'sitem';
    compareCard.innerHTML = '<div class="sstack"><div class="smeta">Ctrl/Cmd+click 縺ｧ譛螟ｧ5莉ｶ縺ｾ縺ｧ菫晄戟縲るｻ・牡繧・ｵ､邉ｻ縺ｮ繝弱・繝・繝ｪ繝ｳ繧ｯ縺ｯ驥阪↑繧顔ｵ瑚ｷｯ縺ｧ縺吶・/div></div>';
    body.appendChild(compareCard);
  }

  const toolsLabel = document.createElement('div');
  toolsLabel.className = 'slabel';
  toolsLabel.textContent = '陦ｨ遉ｺ';
  body.appendChild(toolsLabel);

  const tools = document.createElement('div');
  tools.className = 'toolbar-row';
  const isolateButton = document.createElement('button');
  isolateButton.className = 'btn btn-small';
  isolateButton.type = 'button';
  isolateButton.textContent = isolateMode && hlState.nodeId ? '髱櫁｡ｨ遉ｺ隗｣髯､' : '驕ｸ謚樔ｻ･螟夜撼陦ｨ遉ｺ';
  isolateButton.classList.toggle('btn-active', isolateMode && selectedHighlights.length > 0);
  isolateButton.textContent = getIsolateButtonLabel();
  isolateButton.addEventListener('click', function () {
    if (!selectedHighlights.length && !isolateMode) return;
    toggleIsolateMode();
  });
  tools.appendChild(isolateButton);
  body.appendChild(tools);

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = '全ノード: ' + nds.length + '件';
  body.appendChild(section);

  if (!nds.length) {
    body.innerHTML += '<div class="sblank">繝弱・繝峨′縺ゅｊ縺ｾ縺帙ｓ</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'slist';

  nds.slice().sort(function (a, b) {
    const aSelected = isNodeSelected(a.id);
    const bSelected = isNodeSelected(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    if (a.id === hlState.nodeId) return -1;
    if (b.id === hlState.nodeId) return 1;
    const colA = getColById(a.colId);
    const colB = getColById(b.colId);
    const orderA = colA ? colA.order : 0;
    const orderB = colB ? colB.order : 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, 'ja');
  }).forEach(function (node) {
    const col = getColById(node.colId);
    const item = document.createElement('div');
    item.className = 'sitem node-item' + (isNodeSelected(node.id) ? ' selected' : '');
    item.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey) {
        cycleNodeHighlight(node.id, true);
        render();
        return;
      }
      focusNode(node.id, 1);
    });

    const header = document.createElement('div');
    header.className = 'sitem-main';
    header.innerHTML =
      '<div class="sdot" style="background:' + cc(col ? col.side : 'elem') + '"></div>' +
      '<div class="sstack">' +
        '<div class="shead"><span class="sname">' + escapeHtml(node.name) + '</span></div>' +
        '<div class="smeta">' + escapeHtml(col ? col.name : '?') + ' / 髢｢騾｣ ' + getNodeLinkCount(node.id) + '莉ｶ</div>' +
        (node.description ? '<div class="sdesc">' + escapeHtml(node.description) + '</div>' : '') +
      '</div>';
    item.appendChild(header);

    const actions = document.createElement('div');
    actions.className = 'sactions';

    [
      { label: 'Focus', onClick: function () { focusNode(node.id, getHighlightDepth(node.id) || 1); } },
      { label: 'Near', onClick: function () { setNodeHighlight(node.id, 1, true); render(); } },
      { label: 'Full', onClick: function () { setNodeHighlight(node.id, 2, true); render(); } },
      { label: 'Solo', onClick: function () { focusOnlyNode(node.id, 1); } }
    ].forEach(function (config) {
      const button = document.createElement('button');
      button.className = 'sbtn';
      button.type = 'button';
      button.textContent = config.label;
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        config.onClick();
      });
      actions.appendChild(button);
    });

    if (node.refUrl) {
      const ref = document.createElement('button');
      ref.className = 'sbtn sbtn-link';
      ref.type = 'button';
      ref.textContent = node.refLabel || 'ref';
      ref.addEventListener('click', function (event) {
        event.stopPropagation();
        openRefUrl(node.refUrl);
      });
      actions.appendChild(ref);
    }

    const remove = document.createElement('button');
    remove.className = 'sbtn sbtn-danger';
    remove.type = 'button';
    remove.textContent = '蜑企勁';
    remove.addEventListener('click', function (event) {
      event.stopPropagation();
      removeNd(node.id);
    });
    actions.appendChild(remove);

    item.appendChild(actions);
    list.appendChild(item);
  });

  body.appendChild(list);
}

function renderLinksTab(body) {
  body.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = '全リンク: ' + lks.length + '件';
  body.appendChild(section);

  if (!lks.length) {
    body.innerHTML += '<div class="sblank">縲後Μ繝ｳ繧ｯ霑ｽ蜉縲阪°繧芽ｿｽ蜉</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'slist';

  lks.forEach(function (link) {
    const fromNode = getNodeById(link.f);
    const toNode = getNodeById(link.t);
    const item = document.createElement('div');
    item.className = 'sitem';
    const strengthLabel = link.s === 'strong' ? '蠑ｷ' : (link.s === 'mid' ? '荳ｭ' : '蠑ｱ');
    item.innerHTML =
      '<div style="width:18px;height:2px;background:' + lc(link.s) + ';flex-shrink:0"></div>' +
      '<span class="sname" style="font-size:10px">' + escapeHtml(fromNode ? fromNode.name : '?') + ' 竊・' + escapeHtml(toNode ? toNode.name : '?') + '</span>' +
      '<span style="font-size:9px;color:var(--text-muted)">' + strengthLabel + '</span>';

    const remove = document.createElement('button');
    remove.className = 'sicon danger';
    remove.textContent = 'x';
    remove.addEventListener('click', function () {
      removeLk(link.id);
    });
    item.appendChild(remove);
    list.appendChild(item);
  });

  body.appendChild(list);
}

function addCol(side) {
  const input = document.getElementById('nc_' + side);
  const name = input.value.trim();
  if (!name) return;
  const existing = cols.filter(function (col) { return col.side === side; });
  cols.push({ id: uid(), name: name, side: side, order: existing.length });
  input.value = '';
  render();
}

function exportMiro() {
  let markdown = '# 繝舌Λ繧ｷ 隕∽ｻｶﾃ苓ｦ∫ｴ繝槭ャ繝斐Φ繧ｰ\n\n';
  getOrder().forEach(function (col) {
    markdown += '## ' + col.name + '\n';
    nds.filter(function (node) {
      return node.colId === col.id;
    }).forEach(function (node) {
      markdown += '- ' + node.name + '\n';
    });
    markdown += '\n';
  });
  markdown += '## 繝ｪ繝ｳ繧ｯ\n';
  lks.forEach(function (link) {
    const fromNode = getNodeById(link.f);
    const toNode = getNodeById(link.t);
    const strength = link.s === 'strong' ? '蠑ｷ' : (link.s === 'mid' ? '荳ｭ' : '蠑ｱ');
    markdown += '- ' + (fromNode ? fromNode.name : '?') + ' -> ' + (toNode ? toNode.name : '?') + ' (' + strength + ')\\n';
  });

  navigator.clipboard.writeText(markdown).then(function () {
    const button = document.getElementById('miroBtn');
    if (!button) return;
    const original = button.textContent;
    button.textContent = 'コピー完了';
    setTimeout(function () {
      button.textContent = original;
    }, 2000);
  });
}

function getIsolateButtonLabel() {
  if (isolateLocked) return '固定解除';
  if (isolateMode) return '非表示を固定';
  return '選択以外非表示';
}

function updateHlIndicator() {
  const indicator = document.getElementById('hlInd');
  const label = document.getElementById('hlLabel');
  const helper = document.getElementById('hlHint');
  const steps = [document.getElementById('hlS1'), document.getElementById('hlS2')];
  const activeHighlight = getActiveHighlight();
  const selectedCount = getSelectedHighlights().length;

  if (!indicator || !label || !helper) return;
  if (!activeHighlight) {
    indicator.classList.remove('show');
    return;
  }

  const labels = {
    1: '前後レイヤー',
    2: '端までたどる'
  };

  indicator.classList.add('show');
  label.textContent = selectedCount > 1
    ? '比較選択 ' + selectedCount + '件 / ' + (labels[activeHighlight.depth] || '')
    : (labels[activeHighlight.depth] || '');
  helper.textContent = isolateMode
    ? 'クリックで段階変更 / 空白で解除 / 固定中は表示範囲を維持'
    : 'クリックで段階変更 / 空白で解除';

  steps.forEach(function (step, index) {
    if (!step) return;
    step.classList.toggle('active', index < hlState.depth);
  });
}

function flipLayout() {
  flipped = !flipped;
  const button = document.getElementById('flipBtn');
  if (button) {
    button.textContent = flipped ? '⇄ 元に戻す' : '⇄ 左右反転';
    button.style.color = flipped ? 'var(--accent)' : '';
    button.style.borderColor = flipped ? 'var(--accent)' : '';
  }
  render();
}

function updateIsolateButton() {
  const button = document.getElementById('isolateBtn');
  if (!button) return;
  button.textContent = getIsolateButtonLabel();
  button.classList.toggle('btn-active', isolateMode);
}

function updateStructureButton() {
  const button = document.getElementById('structureBtn');
  if (!button) return;
  const enabled = hasStructureView();
  button.disabled = !enabled;
  button.classList.toggle('btn-active', enabled && isStructureMode());
  button.textContent = enabled ? '機能ブロック図' : '機能ブロック図 N/A';
}

function updateDefectReviewButton() {
  const button = document.getElementById('defectReviewBtn');
  if (!button) return;
  const enabled = hasDefectMap();
  if (!enabled) defectReviewMode = false;
  button.disabled = !enabled;
  button.textContent = enabled ? '不具合確認' : '不具合確認 N/A';
  button.classList.toggle('btn-active', enabled && defectReviewMode && workspaceMode === 'map');
}

function updateDefectLegend() {
  const legend = document.getElementById('defectLegend');
  if (!legend) return;
  const visible = defectReviewMode && canUseDefectReviewMode();
  legend.classList.toggle('show', visible);
  if (!visible) return;
  const maxCount = getMaxNodeDefectCount();
  const minLabel = document.getElementById('defectLegendMin');
  const midLabel = document.getElementById('defectLegendMid');
  const maxLabel = document.getElementById('defectLegendMax');
  if (minLabel) minLabel.textContent = '0件';
  if (midLabel) midLabel.textContent = maxCount > 0 ? Math.max(1, Math.round(maxCount / 2)) + '件' : '中';
  if (maxLabel) maxLabel.textContent = maxCount + '件';
}

function fitView() {
  if (isStructureMode()) {
    structureScreenZoom = 1;
    renderStructureScreen();
    return;
  }

  const wrap = document.getElementById('cwrap');
  const order = getOrder();
  const maxNodes = Math.max.apply(null, cols.map(function (col) {
    return nds.filter(function (node) { return node.colId === col.id; }).length;
  }).concat(1));

  const contentWidth = Math.max(CW, order.length * (CW + CG) - CG) + 48;
  const contentHeight = Math.max(220, maxNodes * GRID + CHH + 84);

  let scale = 0.7;
  if (wrap) {
    const availableWidth = Math.max(280, wrap.clientWidth - 64);
    const availableHeight = Math.max(220, wrap.clientHeight - 64);
    scale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);
    scale = Math.max(0.28, scale);
  }

  tf = { x: 0, y: 0, sc: scale };
  render();
}

function renderColsTab(body) {
  body.innerHTML = '';

  [['elem', '要素列'], ['req', '要求列']].forEach(function (config) {
    const side = config[0];
    const label = config[1];
    const sideCols = cols
      .filter(function (col) { return col.side === side; })
      .sort(function (a, b) { return a.order - b.order; });

    const section = document.createElement('div');
    section.className = 'slabel';
    section.textContent = label;
    body.appendChild(section);

    const list = document.createElement('div');
    list.className = 'slist';

    sideCols.forEach(function (col) {
      const item = document.createElement('div');
      item.className = 'sitem';
      item.innerHTML =
        '<div class="sdot" style="background:' + cc(col.side) + '"></div>' +
        '<span class="sname">' + escapeHtml(col.name) + '</span>' +
        '<span class="sbadge b-' + col.side + '">' + (col.side === 'req' ? '要件' : '要素') + '</span>';

      const remove = document.createElement('button');
      remove.className = 'sicon danger';
      remove.textContent = 'x';
      remove.addEventListener('click', function () {
        removeCol(col.id);
      });

      item.appendChild(remove);
      list.appendChild(item);
    });

    body.appendChild(list);

    const row = document.createElement('div');
    row.className = 'inline-row';
    row.innerHTML =
      '<input class="mi" id="nc_' + side + '" type="text" placeholder="列名...">' +
      '<button class="btn btn-mini" type="button">+</button>';
    const input = row.querySelector('input');
    const button = row.querySelector('button');
    button.addEventListener('click', function () { addCol(side); });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') addCol(side);
    });
    body.appendChild(row);
  });
}

function renderSelectedNodeSummary(body) {
  if (!hlState.nodeId) return;
  const node = getNodeById(hlState.nodeId);
  if (!node) return;
  const col = getColById(node.colId);

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = '選択中';
  body.appendChild(section);

  const card = document.createElement('div');
  card.className = 'sitem selected';
  card.innerHTML =
    '<div class="sdot" style="background:' + cc(col ? col.side : 'elem') + '"></div>' +
    '<div class="sstack">' +
      '<div class="shead"><span class="sname">' + escapeHtml(node.name) + '</span></div>' +
      '<div class="smeta">' + escapeHtml(col ? col.name : '?') + ' / 関連 ' + getNodeLinkCount(node.id) + '件</div>' +
      (node.description ? '<div class="sdesc">' + escapeHtml(node.description) + '</div>' : '') +
    '</div>';

  const actions = document.createElement('div');
  actions.className = 'sactions';
  [
    { label: 'Focus', onClick: function () { focusNode(node.id, hlState.depth || 1); } },
    { label: '近傍', onClick: function () { focusNode(node.id, 1); } },
    { label: '全体', onClick: function () { focusNode(node.id, 2); } },
    { label: isolateMode ? '解除' : 'Solo', onClick: function () { if (isolateMode) toggleIsolateMode(false); else focusOnlyNode(node.id, hlState.depth || 1); } }
  ].forEach(function (config) {
    const button = document.createElement('button');
    button.className = 'sbtn';
    button.type = 'button';
    button.textContent = config.label;
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      config.onClick();
    });
    actions.appendChild(button);
  });

  card.appendChild(actions);
  if (node.refUrl) {
    const ref = document.createElement('button');
    ref.className = 'sbtn sbtn-link';
    ref.type = 'button';
    ref.textContent = node.refLabel || 'ref';
    ref.addEventListener('click', function (event) {
      event.stopPropagation();
      openRefUrl(node.refUrl);
    });
    actions.appendChild(ref);
  }

  body.appendChild(card);
}

function renderTraversalList(body, label, items) {
  const subLabel = document.createElement('div');
  subLabel.className = 'trav-subhead';
  subLabel.textContent = label + ' (' + items.length + ')';
  body.appendChild(subLabel);

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'trav-empty';
    empty.textContent = '接続先はありません';
    body.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'trav-list';

  items.forEach(function (item) {
    const row = document.createElement('button');
    row.className = 'trav-item';
    row.type = 'button';
    row.innerHTML =
      '<span class="trav-dot" style="background:' + cc(item.side) + '"></span>' +
      '<span class="trav-stack">' +
        '<span class="trav-name">' + escapeHtml(item.name) + '</span>' +
        '<span class="trav-meta">' + escapeHtml(item.colName) + '</span>' +
      '</span>';
    row.title = item.description || (item.colName + ' / click: focus, Ctrl/Cmd+click: add');
    row.addEventListener('click', function (event) {
      event.stopPropagation();
      traverseToNode(item.id, event.ctrlKey || event.metaKey);
    });
    list.appendChild(row);
  });

  body.appendChild(list);
}

function renderTraversalSection(body) {
  const activeHighlight = getActiveHighlight();

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'たどる';
  body.appendChild(section);

  const panel = document.createElement('div');
  panel.className = 'trav-panel';
  body.appendChild(panel);

  if (!activeHighlight) {
    panel.classList.add('trav-panel-empty');

    const emptyTitle = document.createElement('div');
    emptyTitle.className = 'trav-panel-title';
    emptyTitle.textContent = 'ノードを選ぶと接続先を表示';
    panel.appendChild(emptyTitle);

    const emptyBody = document.createElement('div');
    emptyBody.className = 'trav-hint';
    emptyBody.textContent = '中央のノードをクリックすると、前後レイヤーの接続先がここに出ます。クリックで移動、Ctrl/Cmd+クリックで比較選択に追加できます。';
    panel.appendChild(emptyBody);
    return;
  }

  const groups = getAdjacentNodesByDirection(activeHighlight.nodeId);
  const activeNode = getNodeById(activeHighlight.nodeId);
  const activeCol = activeNode ? getColById(activeNode.colId) : null;

  const activeTitle = document.createElement('div');
  activeTitle.className = 'trav-panel-title';
  activeTitle.textContent = '接続先ナビ';
  panel.appendChild(activeTitle);

  const modeHint = document.createElement('div');
  modeHint.className = 'trav-hint';
  modeHint.textContent = isolateLocked
    ? '固定中: ← → キーでも移動できます'
    : '矢印キー移動は固定中のみ有効です';
  panel.appendChild(modeHint);

  const activeMeta = document.createElement('div');
  activeMeta.className = 'trav-current';
  activeMeta.innerHTML =
    '<span class="trav-current-name">' + escapeHtml(activeNode ? activeNode.name : '') + '</span>' +
    '<span class="trav-current-meta">' + escapeHtml(activeCol ? activeCol.name : '?') + '</span>';
  panel.appendChild(activeMeta);

  const hint = document.createElement('div');
  hint.className = 'trav-hint';
  hint.textContent = 'click: jump / Ctrl or Cmd+click: compare add';
  panel.appendChild(hint);

  renderTraversalList(panel, '前レイヤー', groups.previous);
  renderTraversalList(panel, '次レイヤー', groups.next);
}

function renderStepTraversalList(body, label, items) {
  const subLabel = document.createElement('div');
  subLabel.className = 'trav-subhead';
  subLabel.textContent = label + ' (' + items.length + ')';
  body.appendChild(subLabel);

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'trav-empty';
    empty.textContent = '移動先はありません';
    body.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'trav-list';

  items.forEach(function (item) {
    const row = document.createElement('button');
    row.className = 'trav-item';
    row.type = 'button';
    row.innerHTML =
      '<span class="trav-dot" style="background:' + cc(item.side) + '"></span>' +
      '<span class="trav-stack">' +
        '<span class="trav-name">' + escapeHtml(item.name) + '</span>' +
        '<span class="trav-meta">' + escapeHtml(item.colName) + '</span>' +
      '</span>';
    row.addEventListener('click', function (event) {
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey) {
        traverseToNode(item.id, true);
        return;
      }
      moveActiveHighlight(item.id);
    });
    list.appendChild(row);
  });

  body.appendChild(list);
}

function renderStepTraversalSection(body) {
  const activeHighlight = getActiveHighlight();

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'たどる';
  body.appendChild(section);

  const panel = document.createElement('div');
  panel.className = 'trav-panel';
  body.appendChild(panel);

  if (!activeHighlight) {
    panel.classList.add('trav-panel-empty');

    const emptyTitle = document.createElement('div');
    emptyTitle.className = 'trav-panel-title';
    emptyTitle.textContent = 'ハイライトを選ぶと移動できます';
    panel.appendChild(emptyTitle);

    const emptyBody = document.createElement('div');
    emptyBody.className = 'trav-hint';
    emptyBody.textContent = '中央のノードをクリックしてハイライトすると、この枠から前後へたどれます。';
    panel.appendChild(emptyBody);
    return;
  }

  const activeNode = getNodeById(activeHighlight.nodeId);
  const activeCol = activeNode ? getColById(activeNode.colId) : null;
  const targets = getTraversalTargets();
  const previousTarget = targets.previous[0] || null;
  const nextTarget = targets.next[0] || null;

  const activeTitle = document.createElement('div');
  activeTitle.className = 'trav-panel-title';
  activeTitle.textContent = 'ハイライト移動';
  panel.appendChild(activeTitle);

  const activeMeta = document.createElement('div');
  activeMeta.className = 'trav-current';
  activeMeta.innerHTML =
    '<span class="trav-current-name">' + escapeHtml(activeNode ? activeNode.name : '') + '</span>' +
    '<span class="trav-current-meta">' + escapeHtml(activeCol ? activeCol.name : '?') + '</span>';
  panel.appendChild(activeMeta);

  const nav = document.createElement('div');
  nav.className = 'trav-nav';
  panel.appendChild(nav);

  [
    {
      className: 'trav-nav-btn prev',
      label: '← 前へ',
      target: previousTarget,
      count: targets.previous.length,
      handler: function () { moveHighlightStep('previous'); }
    },
    {
      className: 'trav-nav-btn next',
      label: '次へ →',
      target: nextTarget,
      count: targets.next.length,
      handler: function () { moveHighlightStep('next'); }
    }
  ].forEach(function (config) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = config.className;
    button.disabled = !config.target;
    button.innerHTML =
      '<span class="trav-nav-label">' + config.label + '</span>' +
      '<span class="trav-nav-target">' + escapeHtml(config.target ? config.target.name : '移動先なし') + '</span>' +
      '<span class="trav-nav-meta">' + (config.count > 1 ? '候補 ' + config.count + '件' : (config.target ? escapeHtml(config.target.colName) : '')) + '</span>';
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      config.handler();
    });
    nav.appendChild(button);
  });

  const hint = document.createElement('div');
  hint.className = 'trav-hint';
  hint.textContent = '候補が複数あるときは、下の一覧から直接移動できます。';
  panel.appendChild(hint);

  renderStepTraversalList(panel, '前レイヤー候補', targets.previous);
  renderStepTraversalList(panel, '次レイヤー候補', targets.next);
}

function renderNodesTab(body) {
  body.innerHTML = '';

  renderSelectedNodeSummary(body);
  renderStepTraversalSection(body);
  const selectedHighlights = getSelectedHighlights();

  if (selectedHighlights.length > 1) {
    const compareLabel = document.createElement('div');
    compareLabel.className = 'slabel';
    compareLabel.textContent = 'Compare';
    body.appendChild(compareLabel);

    const compareCard = document.createElement('div');
    compareCard.className = 'sitem';
    compareCard.innerHTML = '<div class="sstack"><div class="smeta">Ctrl/Cmd+click で追加できます。最大5件まで比較でき、共通経路は色で重なりが分かります。</div></div>';
    body.appendChild(compareCard);
  }

  const toolsLabel = document.createElement('div');
  toolsLabel.className = 'slabel';
  toolsLabel.textContent = '操作';
  body.appendChild(toolsLabel);

  const tools = document.createElement('div');
  tools.className = 'toolbar-row';
  const isolateButton = document.createElement('button');
  isolateButton.className = 'btn btn-small';
  isolateButton.type = 'button';
  isolateButton.textContent = getIsolateButtonLabel();
  isolateButton.classList.toggle('btn-active', isolateMode && selectedHighlights.length > 0);
  isolateButton.addEventListener('click', function () {
    if (!selectedHighlights.length && !isolateMode) return;
    toggleIsolateMode();
  });
  tools.appendChild(isolateButton);
  body.appendChild(tools);

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = '全ノード: ' + nds.length + '件';
  body.appendChild(section);

  if (!nds.length) {
    body.innerHTML += '<div class="sblank">ノードがありません</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'slist';

  nds.slice().sort(function (a, b) {
    const aSelected = isNodeSelected(a.id);
    const bSelected = isNodeSelected(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    if (a.id === hlState.nodeId) return -1;
    if (b.id === hlState.nodeId) return 1;
    const colA = getColById(a.colId);
    const colB = getColById(b.colId);
    const orderA = colA ? colA.order : 0;
    const orderB = colB ? colB.order : 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, 'ja');
  }).forEach(function (node) {
    const col = getColById(node.colId);
    const item = document.createElement('div');
    item.className = 'sitem node-item' + (isNodeSelected(node.id) ? ' selected' : '');
    item.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey) {
        cycleNodeHighlight(node.id, true);
        render();
        return;
      }
      focusNode(node.id, 1);
    });

    const header = document.createElement('div');
    header.className = 'sitem-main';
    header.innerHTML =
      '<div class="sdot" style="background:' + cc(col ? col.side : 'elem') + '"></div>' +
      '<div class="sstack">' +
        '<div class="shead"><span class="sname">' + escapeHtml(node.name) + '</span></div>' +
        '<div class="smeta">' + escapeHtml(col ? col.name : '?') + ' / 関連 ' + getNodeLinkCount(node.id) + '件</div>' +
        (node.description ? '<div class="sdesc">' + escapeHtml(node.description) + '</div>' : '') +
      '</div>';
    item.appendChild(header);

    const actions = document.createElement('div');
    actions.className = 'sactions';

    [
      { label: 'Focus', onClick: function () { focusNode(node.id, getHighlightDepth(node.id) || 1); } },
      { label: 'Near', onClick: function () { setNodeHighlight(node.id, 1, true); render(); } },
      { label: 'Full', onClick: function () { setNodeHighlight(node.id, 2, true); render(); } },
      { label: 'Solo', onClick: function () { focusOnlyNode(node.id, 1); } }
    ].forEach(function (config) {
      const button = document.createElement('button');
      button.className = 'sbtn';
      button.type = 'button';
      button.textContent = config.label;
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        config.onClick();
      });
      actions.appendChild(button);
    });

    if (node.refUrl) {
      const ref = document.createElement('button');
      ref.className = 'sbtn sbtn-link';
      ref.type = 'button';
      ref.textContent = node.refLabel || 'ref';
      ref.addEventListener('click', function (event) {
        event.stopPropagation();
        openRefUrl(node.refUrl);
      });
      actions.appendChild(ref);
    }

    const remove = document.createElement('button');
    remove.className = 'sbtn sbtn-danger';
    remove.type = 'button';
    remove.textContent = '削除';
    remove.addEventListener('click', function (event) {
      event.stopPropagation();
      removeNd(node.id);
    });
    actions.appendChild(remove);

    item.appendChild(actions);
    list.appendChild(item);
  });

  body.appendChild(list);
}

function renderLinksTab(body) {
  body.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = '全リンク: ' + lks.length + '件';
  body.appendChild(section);

  if (!lks.length) {
    body.innerHTML += '<div class="sblank">リンクがありません</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'slist';

  lks.forEach(function (link) {
    const fromNode = getNodeById(link.f);
    const toNode = getNodeById(link.t);
    const item = document.createElement('div');
    item.className = 'sitem';
    const strengthLabel = link.s === 'strong' ? '強' : (link.s === 'mid' ? '中' : '弱');
    item.innerHTML =
      '<div style="width:18px;height:2px;background:' + lc(link.s) + ';flex-shrink:0"></div>' +
      '<span class="sname" style="font-size:10px">' + escapeHtml(fromNode ? fromNode.name : '?') + ' → ' + escapeHtml(toNode ? toNode.name : '?') + '</span>' +
      '<span style="font-size:9px;color:var(--text-muted)">' + strengthLabel + '</span>';

    const remove = document.createElement('button');
    remove.className = 'sicon danger';
    remove.textContent = 'x';
    remove.addEventListener('click', function () {
      removeLk(link.id);
    });
    item.appendChild(remove);
    list.appendChild(item);
  });

  body.appendChild(list);
}

function exportMiro() {
  let markdown = '# BARASHI 要件×要素 マップ\n\n';
  getOrder().forEach(function (col) {
    markdown += '## ' + col.name + '\n';
    nds.filter(function (node) {
      return node.colId === col.id;
    }).forEach(function (node) {
      markdown += '- ' + node.name + '\n';
    });
    markdown += '\n';
  });
  markdown += '## リンク\n';
  lks.forEach(function (link) {
    const fromNode = getNodeById(link.f);
    const toNode = getNodeById(link.t);
    const strength = link.s === 'strong' ? '強' : (link.s === 'mid' ? '中' : '弱');
    markdown += '- ' + (fromNode ? fromNode.name : '?') + ' -> ' + (toNode ? toNode.name : '?') + ' (' + strength + ')\n';
  });

  navigator.clipboard.writeText(markdown).then(function () {
    const button = document.getElementById('miroBtn');
    if (!button) return;
    const original = button.textContent;
    button.textContent = 'コピー完了';
    setTimeout(function () {
      button.textContent = original;
    }, 2000);
  });
}

function drawCol(group, col) {
  const x = cxById(col.id);
  const nodesInCol = nds.filter(function (node) {
    return node.colId === col.id && renderState.visibleNodeIds.has(node.id);
  });
  const maxNodes = maxNdCount();
  const colHeight = Math.max(180, maxNodes * GRID + CHH + 60);
  const color = cc(col.side);
  const bgColor = cb(col.side);
  const allFaded = renderState.hasHighlight && !isolateMode && nodesInCol.length > 0 && nodesInCol.every(function (node) {
    return !renderState.highlightedNodes.has(node.id);
  });

  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2,
    width: CW,
    height: colHeight,
    rx: 8,
    fill: bgColor,
    stroke: color,
    'stroke-opacity': allFaded ? '0.08' : '0.2',
    'stroke-width': '1',
    opacity: allFaded ? '0.2' : '1'
  }));
  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2,
    width: CW,
    height: CHH,
    rx: 8,
    fill: color,
    'fill-opacity': allFaded ? '0.3' : '0.88'
  }));
  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2 + CHH - 5,
    width: CW,
    height: 5,
    fill: color,
    'fill-opacity': allFaded ? '0.3' : '0.88'
  }));

  const headerText = mk('text', {
    x: x + CW / 2,
    y: -colHeight / 2 + CHH / 2 + 5,
    'text-anchor': 'middle',
    fill: allFaded ? 'rgba(255,255,255,0.2)' : '#fff',
    'font-size': '11',
    'font-family': 'Noto Sans JP,sans-serif',
    'font-weight': '600'
  });
  headerText.textContent = col.name;
  group.appendChild(headerText);

  const sideLabel = mk('text', {
    x: x + CW - 5,
    y: -colHeight / 2 + 13,
    'text-anchor': 'end',
    fill: allFaded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
    'font-size': '8',
    'font-family': 'DM Mono,monospace'
  });
  sideLabel.textContent = col.side === 'req' ? '要件' : '要素';
  group.appendChild(sideLabel);

  nodesInCol.forEach(function (node) {
    drawNode(group, node, col, x);
  });

  if (!isolateMode || !renderState.hasHighlight) {
    const buttonY = -colHeight / 2 + CHH + 12 - (maxNodes * GRID) / 2 + (maxNodes - nodesInCol.length) * GRID / 2 + nodesInCol.length * GRID + 4;
    const addButton = mk('text', {
      x: x + CW / 2,
      y: buttonY + 14,
      'text-anchor': 'middle',
      fill: color,
      'fill-opacity': '0.4',
      'font-size': '20',
      cursor: 'pointer'
    });
    addButton.textContent = '+';
    addButton.addEventListener('click', function () { openNM(col.id); });
    addButton.addEventListener('mouseover', function () { addButton.setAttribute('fill-opacity', '1'); });
    addButton.addEventListener('mouseout', function () { addButton.setAttribute('fill-opacity', '0.4'); });
    group.appendChild(addButton);
  }
}

function drawNode(group, node, col, colX) {
  const y = ny(node.id);
  const nx = colX + 7;
  const width = CW - 14;
  const color = cc(col.side);
  const showDefectHeat = defectReviewMode && canUseDefectReviewMode();
  const defectCount = showDefectHeat ? getDefectCountForNode(node.id) : 0;
  const maxDefectCount = showDefectHeat ? getMaxNodeDefectCount() : 0;
  const defectRatio = maxDefectCount > 0 ? defectCount / maxDefectCount : 0;
  const isSelected = isNodeSelected(node.id);
  const isActive = node.id === hlState.nodeId;
  const isHighlighted = renderState.highlightedNodes.has(node.id);
  const highlightCount = renderState.highlightNodeCounts.get(node.id) || 0;
  const isOverlap = highlightCount > 1;
  const faded = !isolateMode && renderState.hasHighlight && !isHighlighted;
  const overlapStroke = overlapStrokeColor(highlightCount);
  const overlapText = overlapTextColor(highlightCount);
  const overlapFill = overlapFillColor(highlightCount);
  const defectTextColor = getNodeHeatTextColor(defectRatio);
  const strokeColor = isOverlap ? overlapStroke : color;
  const fillColor = isActive
    ? cb(col.side)
    : (isOverlap ? overlapFill : (faded ? '#080b0f' : (defectCount > 0 ? getNodeHeatFill(col.side, defectRatio, isActive) : '#0d1117')));

  const rect = mk('rect', {
    x: nx,
    y: y,
    width: width,
    height: NH,
    rx: 5,
    fill: fillColor,
    stroke: isSelected ? strokeColor : (faded ? 'rgba(80,80,80,0.15)' : strokeColor),
    'stroke-width': isOverlap ? '2.6' : (isSelected ? '2' : '1.5'),
    'stroke-opacity': isSelected || isOverlap ? '1' : (faded ? '0.15' : '0.55'),
    opacity: faded ? '0.25' : '1'
  });
  rect.style.cursor = 'pointer';

  const deleteText = mk('text', {
    x: nx + width - 4,
    y: y + 12,
    'text-anchor': 'end',
    fill: 'rgba(200,80,80,0)',
    'font-size': '11',
    cursor: 'pointer'
  });
  deleteText.textContent = 'x';

  rect.addEventListener('mouseover', function () {
    if (faded) return;
    if (showDefectHeat && defectCount > 0 && !isOverlap && !isActive) {
      rect.setAttribute('fill', getNodeHeatFill(col.side, Math.min(1, defectRatio + 0.12), false));
    } else {
      rect.setAttribute('fill', isOverlap && !isActive ? overlapFill : cb(col.side));
    }
    rect.setAttribute('stroke-opacity', '1');
    deleteText.setAttribute('fill', 'rgba(200,80,80,0.8)');
  });
  rect.addEventListener('mouseout', function () {
    rect.setAttribute('fill', fillColor);
    rect.setAttribute('stroke-opacity', isSelected || isOverlap ? '1' : (faded ? '0.15' : '0.55'));
    deleteText.setAttribute('fill', 'rgba(200,80,80,0)');
    hideNodeTip();
  });
  rect.addEventListener('mouseenter', function (event) { showNodeTip(event, node.description); });
  rect.addEventListener('mousemove', moveNodeTip);
  rect.addEventListener('click', function (event) { onNodeClick(event, node.id); });
  group.appendChild(rect);

  group.appendChild(mk('rect', {
    x: nx,
    y: y + 6,
    width: 3,
    height: NH - 12,
    rx: 1.5,
    fill: color,
    opacity: faded ? '0.15' : '1'
  }));

  const text = mk('text', {
    x: nx + 11,
    y: y + NH / 2 + 4,
    fill: faded ? 'rgba(120,120,120,0.3)' : (isOverlap ? overlapText : (showDefectHeat && defectCount > 0 ? defectTextColor : '#e6edf3')),
    'font-size': '10',
    'font-family': 'Noto Sans JP,sans-serif'
  });
  const maxLength = 10;
  text.textContent = node.name.length > maxLength ? node.name.slice(0, maxLength) + '…' : node.name;
  text.style.cursor = 'pointer';
  text.addEventListener('mouseenter', function (event) { showNodeTip(event, node.description); });
  text.addEventListener('mousemove', moveNodeTip);
  text.addEventListener('mouseleave', hideNodeTip);
  text.addEventListener('click', function (event) { onNodeClick(event, node.id); });
  group.appendChild(text);

  if (node.refUrl) {
    const ref = mk('text', {
      x: nx + width - 12,
      y: y + NH / 2 + 4,
      fill: faded ? 'rgba(120,120,120,0.3)' : '#8ec5ff',
      'font-size': '10',
      'font-family': 'DM Mono,monospace'
    });
    ref.textContent = '↗';
    ref.style.cursor = 'pointer';
    ref.addEventListener('click', function (event) {
      event.stopPropagation();
      openRefUrl(node.refUrl);
    });
    group.appendChild(ref);
  }

  if (defectCount > 0) {
    const defectBadge = mk('text', {
      x: nx + width - (node.refUrl ? 28 : 14),
      y: y + 11,
      fill: faded ? 'rgba(255,180,180,0.25)' : '#ffb4a7',
      'font-size': '9',
      'font-family': 'DM Mono,monospace',
      'text-anchor': 'end'
    });
    defectBadge.textContent = defectCount + '件';
    group.appendChild(defectBadge);
  }

  if (isOverlap) {
    const overlapBadge = mk('text', {
      x: nx + width - (node.refUrl ? 52 : (defectCount > 0 ? 40 : 18)),
      y: y + NH / 2 + 4,
      fill: overlapStroke,
      'font-size': '9',
      'font-family': 'DM Mono,monospace',
      'text-anchor': 'end'
    });
    overlapBadge.textContent = 'x' + highlightCount;
    group.appendChild(overlapBadge);
  }

  deleteText.addEventListener('click', function (event) {
    event.stopPropagation();
    if (isNodeSelected(node.id)) removeNodeHighlight(node.id);
    removeNd(node.id);
  });
  group.appendChild(deleteText);
}

function replaceBrokenRenderedText(value) {
  return String(value || '')
    .replace(/莉ｶ/g, '件')
    .replace(/闔会ｽｶ/g, '件')
    .replace(/髫補或・ｻ・ｶ/g, '要件')
    .replace(/髫補悪・ｴ・ｰ/g, '要素')
    .replace(/遯ｶ・ｦ/g, '…')
    .replace(/窶ｦ/g, '…')
    .replace(/竊・/g, '↗');
}

function normalizeRenderedText(root) {
  const scope = root || document;
  const selectors = ['svg text', '.sbd-block-badge', '.sbd-frame-title', '.sbd-frame-note', '.sbd-block-title', '.sbd-block-meta'];
  scope.querySelectorAll(selectors.join(',')).forEach(function (node) {
    const next = replaceBrokenRenderedText(node.textContent);
    if (next !== node.textContent) {
      node.textContent = next;
    }
  });
}

const __barashiRender = render;
render = function () {
  __barashiRender();
  normalizeRenderedText(document);
};

const __barashiRenderStructureScreen = renderStructureScreen;
renderStructureScreen = function () {
  __barashiRenderStructureScreen();
  normalizeRenderedText(document);
};

window.addEventListener('resize', render);
window.addEventListener('DOMContentLoaded', function () {
  syncUiState();
  loadSample();
});

function getIsolateButtonLabel() {
  if (isolateLocked) return 'Unlock';
  if (isolateMode) return 'Lock Filter';
  return 'Hide Others';
}

function updateHlIndicator() {
  const indicator = document.getElementById('hlInd');
  const label = document.getElementById('hlLabel');
  const helper = document.getElementById('hlHint');
  const steps = [document.getElementById('hlS1'), document.getElementById('hlS2')];
  const activeHighlight = getActiveHighlight();
  const selectedCount = getSelectedHighlights().length;

  if (!indicator || !label || !helper) return;
  if (!activeHighlight) {
    indicator.classList.remove('show');
    return;
  }

  const labels = { 1: 'Neighbor Layers', 2: 'Trace To Edge' };
  indicator.classList.add('show');
  label.textContent = selectedCount > 1
    ? 'Compare ' + selectedCount + ' / ' + (labels[activeHighlight.depth] || '')
    : (labels[activeHighlight.depth] || '');
  helper.textContent = isolateMode
    ? 'Click to change level / blank to clear / lock keeps current visible range'
    : 'Click to change level / blank to clear';

  steps.forEach(function (step, index) {
    if (!step) return;
    step.classList.toggle('active', index < hlState.depth);
  });
}

function flipLayout() {
  flipped = !flipped;
  const button = document.getElementById('flipBtn');
  if (button) {
    button.textContent = flipped ? '⇄ Reset Flip' : '⇄ Flip';
    button.style.color = flipped ? 'var(--accent)' : '';
    button.style.borderColor = flipped ? 'var(--accent)' : '';
  }
  render();
}

function updateIsolateButton() {
  const button = document.getElementById('isolateBtn');
  if (!button) return;
  button.textContent = getIsolateButtonLabel();
  button.classList.toggle('btn-active', isolateMode);
}

function updateStructureButton() {
  const button = document.getElementById('structureBtn');
  if (!button) return;
  const enabled = hasStructureView();
  button.disabled = !enabled;
  button.classList.toggle('btn-active', enabled && isStructureMode());
  button.textContent = enabled ? 'Block Diagram' : 'Block Diagram N/A';
}

function updateDefectReviewButton() {
  const button = document.getElementById('defectReviewBtn');
  if (!button) return;
  const enabled = hasDefectMap();
  if (!enabled) defectReviewMode = false;
  button.disabled = !enabled;
  button.textContent = enabled ? 'Defect Review' : 'Defect Review N/A';
  button.classList.toggle('btn-active', enabled && defectReviewMode && workspaceMode === 'map');
}

function updateDefectLegend() {
  const legend = document.getElementById('defectLegend');
  if (!legend) return;
  const visible = defectReviewMode && canUseDefectReviewMode();
  legend.classList.toggle('show', visible);
  if (!visible) return;
  const maxCount = getMaxNodeDefectCount();
  const minLabel = document.getElementById('defectLegendMin');
  const midLabel = document.getElementById('defectLegendMid');
  const maxLabel = document.getElementById('defectLegendMax');
  if (minLabel) minLabel.textContent = '0';
  if (midLabel) midLabel.textContent = maxCount > 0 ? String(Math.max(1, Math.round(maxCount / 2))) : 'mid';
  if (maxLabel) maxLabel.textContent = String(maxCount);
}

function fitView() {
  if (isStructureMode()) {
    structureScreenZoom = 1;
    renderStructureScreen();
    return;
  }

  const wrap = document.getElementById('cwrap');
  const order = getOrder();
  const maxNodes = Math.max.apply(null, cols.map(function (col) {
    return nds.filter(function (node) { return node.colId === col.id; }).length;
  }).concat(1));

  const contentWidth = Math.max(CW, order.length * (CW + CG) - CG) + 48;
  const contentHeight = Math.max(220, maxNodes * GRID + CHH + 84);

  let scale = 0.7;
  if (wrap) {
    const availableWidth = Math.max(280, wrap.clientWidth - 64);
    const availableHeight = Math.max(220, wrap.clientHeight - 64);
    scale = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight);
    scale = Math.max(0.28, scale);
  }

  tf = { x: 0, y: 0, sc: scale };
  render();
}

function renderColsTab(body) {
  body.innerHTML = '';

  [['elem', 'Element Columns'], ['req', 'Requirement Columns']].forEach(function (config) {
    const side = config[0];
    const label = config[1];
    const sideCols = cols
      .filter(function (col) { return col.side === side; })
      .sort(function (a, b) { return a.order - b.order; });

    const section = document.createElement('div');
    section.className = 'slabel';
    section.textContent = label;
    body.appendChild(section);

    const list = document.createElement('div');
    list.className = 'slist';

    sideCols.forEach(function (col) {
      const item = document.createElement('div');
      item.className = 'sitem';
      item.innerHTML =
        '<div class="sdot" style="background:' + cc(col.side) + '"></div>' +
        '<span class="sname">' + escapeHtml(col.name) + '</span>' +
        '<span class="sbadge b-' + col.side + '">' + (col.side === 'req' ? 'REQ' : 'ELEM') + '</span>';

      const remove = document.createElement('button');
      remove.className = 'sicon danger';
      remove.textContent = 'x';
      remove.addEventListener('click', function () {
        removeCol(col.id);
      });

      item.appendChild(remove);
      list.appendChild(item);
    });

    body.appendChild(list);

    const row = document.createElement('div');
    row.className = 'inline-row';
    row.innerHTML =
      '<input class="mi" id="nc_' + side + '" type="text" placeholder="Column name...">' +
      '<button class="btn btn-mini" type="button">+</button>';
    const input = row.querySelector('input');
    const button = row.querySelector('button');
    button.addEventListener('click', function () { addCol(side); });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') addCol(side);
    });
    body.appendChild(row);
  });
}

function renderSelectedNodeSummary(body) {
  if (!hlState.nodeId) return;
  const node = getNodeById(hlState.nodeId);
  if (!node) return;
  const col = getColById(node.colId);

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'Selected';
  body.appendChild(section);

  const card = document.createElement('div');
  card.className = 'sitem selected';
  card.innerHTML =
    '<div class="sdot" style="background:' + cc(col ? col.side : 'elem') + '"></div>' +
    '<div class="sstack">' +
      '<div class="shead"><span class="sname">' + escapeHtml(node.name) + '</span></div>' +
      '<div class="smeta">' + escapeHtml(col ? col.name : '?') + ' / Links ' + getNodeLinkCount(node.id) + '</div>' +
      (node.description ? '<div class="sdesc">' + escapeHtml(node.description) + '</div>' : '') +
    '</div>';

  const actions = document.createElement('div');
  actions.className = 'sactions';
  [
    { label: 'Focus', onClick: function () { focusNode(node.id, hlState.depth || 1); } },
    { label: 'Near', onClick: function () { focusNode(node.id, 1); } },
    { label: 'Full', onClick: function () { focusNode(node.id, 2); } },
    { label: isolateMode ? 'Clear' : 'Solo', onClick: function () { if (isolateMode) toggleIsolateMode(false); else focusOnlyNode(node.id, hlState.depth || 1); } }
  ].forEach(function (config) {
    const button = document.createElement('button');
    button.className = 'sbtn';
    button.type = 'button';
    button.textContent = config.label;
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      config.onClick();
    });
    actions.appendChild(button);
  });

  card.appendChild(actions);
  if (node.refUrl) {
    const ref = document.createElement('button');
    ref.className = 'sbtn sbtn-link';
    ref.type = 'button';
    ref.textContent = node.refLabel || 'ref';
    ref.addEventListener('click', function (event) {
      event.stopPropagation();
      openRefUrl(node.refUrl);
    });
    actions.appendChild(ref);
  }

  body.appendChild(card);
}

function renderTraversalList(body, label, items) {
  const subLabel = document.createElement('div');
  subLabel.className = 'trav-subhead';
  subLabel.textContent = label + ' (' + items.length + ')';
  body.appendChild(subLabel);

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'trav-empty';
    empty.textContent = 'No connected nodes';
    body.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'trav-list';

  items.forEach(function (item) {
    const row = document.createElement('button');
    row.className = 'trav-item';
    row.type = 'button';
    row.innerHTML =
      '<span class="trav-dot" style="background:' + cc(item.side) + '"></span>' +
      '<span class="trav-stack">' +
        '<span class="trav-name">' + escapeHtml(item.name) + '</span>' +
        '<span class="trav-meta">' + escapeHtml(item.colName) + '</span>' +
      '</span>';
    row.title = item.description || (item.colName + ' / click: focus, Ctrl/Cmd+click: add');
    row.addEventListener('click', function (event) {
      event.stopPropagation();
      traverseToNode(item.id, event.ctrlKey || event.metaKey);
    });
    list.appendChild(row);
  });

  body.appendChild(list);
}

function renderTraversalSection(body) {
  const activeHighlight = getActiveHighlight();
  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'Traverse';
  body.appendChild(section);

  const panel = document.createElement('div');
  panel.className = 'trav-panel';
  body.appendChild(panel);

  if (!activeHighlight) {
    panel.classList.add('trav-panel-empty');
    panel.innerHTML =
      '<div class="trav-panel-title">Select a node to show connected nodes</div>' +
      '<div class="trav-hint">Click a node in the map. Direct connections will appear here.</div>';
    return;
  }

  const groups = getAdjacentNodesByDirection(activeHighlight.nodeId);
  const activeNode = getNodeById(activeHighlight.nodeId);
  const activeCol = activeNode ? getColById(activeNode.colId) : null;

  const activeTitle = document.createElement('div');
  activeTitle.className = 'trav-panel-title';
  activeTitle.textContent = 'Connection Navigator';
  panel.appendChild(activeTitle);

  const modeHint = document.createElement('div');
  modeHint.className = 'trav-hint';
  modeHint.textContent = isolateLocked
    ? 'Locked: left/right keys are enabled'
    : 'Arrow-key traversal is available only while locked';
  panel.appendChild(modeHint);

  const activeMeta = document.createElement('div');
  activeMeta.className = 'trav-current';
  activeMeta.innerHTML =
    '<span class="trav-current-name">' + escapeHtml(activeNode ? activeNode.name : '') + '</span>' +
    '<span class="trav-current-meta">' + escapeHtml(activeCol ? activeCol.name : '?') + '</span>';
  panel.appendChild(activeMeta);

  const hint = document.createElement('div');
  hint.className = 'trav-hint';
  hint.textContent = 'click: jump / Ctrl or Cmd+click: add to compare';
  panel.appendChild(hint);

  renderTraversalList(panel, 'Previous Layer', groups.previous);
  renderTraversalList(panel, 'Next Layer', groups.next);
}

function renderStepTraversalList(body, label, items) {
  const subLabel = document.createElement('div');
  subLabel.className = 'trav-subhead';
  subLabel.textContent = label + ' (' + items.length + ')';
  body.appendChild(subLabel);

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'trav-empty';
    empty.textContent = 'No target';
    body.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'trav-list';

  items.forEach(function (item) {
    const row = document.createElement('button');
    row.className = 'trav-item';
    row.type = 'button';
    row.innerHTML =
      '<span class="trav-dot" style="background:' + cc(item.side) + '"></span>' +
      '<span class="trav-stack">' +
        '<span class="trav-name">' + escapeHtml(item.name) + '</span>' +
        '<span class="trav-meta">' + escapeHtml(item.colName) + '</span>' +
      '</span>';
    row.addEventListener('click', function (event) {
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey) {
        traverseToNode(item.id, true);
        return;
      }
      moveActiveHighlight(item.id);
    });
    list.appendChild(row);
  });

  body.appendChild(list);
}

function renderStepTraversalSection(body) {
  const activeHighlight = getActiveHighlight();
  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'Traverse';
  body.appendChild(section);

  const panel = document.createElement('div');
  panel.className = 'trav-panel';
  body.appendChild(panel);

  if (!activeHighlight) {
    panel.classList.add('trav-panel-empty');
    panel.innerHTML =
      '<div class="trav-panel-title">Select a highlight path to move</div>' +
      '<div class="trav-hint">After highlighting a node, you can move across the visible path here.</div>';
    return;
  }

  const activeNode = getNodeById(activeHighlight.nodeId);
  const activeCol = activeNode ? getColById(activeNode.colId) : null;
  const targets = getTraversalTargets();
  const previousTarget = targets.previous[0] || null;
  const nextTarget = targets.next[0] || null;

  const activeTitle = document.createElement('div');
  activeTitle.className = 'trav-panel-title';
  activeTitle.textContent = 'Highlight Traverse';
  panel.appendChild(activeTitle);

  const activeMeta = document.createElement('div');
  activeMeta.className = 'trav-current';
  activeMeta.innerHTML =
    '<span class="trav-current-name">' + escapeHtml(activeNode ? activeNode.name : '') + '</span>' +
    '<span class="trav-current-meta">' + escapeHtml(activeCol ? activeCol.name : '?') + '</span>';
  panel.appendChild(activeMeta);

  const nav = document.createElement('div');
  nav.className = 'trav-nav';
  panel.appendChild(nav);

  [
    { className: 'trav-nav-btn prev', label: '\u2190 Prev', target: previousTarget, count: targets.previous.length, handler: function () { moveHighlightStep('previous'); } },
    { className: 'trav-nav-btn next', label: 'Next \u2192', target: nextTarget, count: targets.next.length, handler: function () { moveHighlightStep('next'); } }
  ].forEach(function (config) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = config.className;
    button.disabled = !config.target;
    button.innerHTML =
      '<span class="trav-nav-label">' + config.label + '</span>' +
      '<span class="trav-nav-target">' + escapeHtml(config.target ? config.target.name : 'No target') + '</span>' +
      '<span class="trav-nav-meta">' + (config.count > 1 ? 'Candidates ' + config.count : (config.target ? escapeHtml(config.target.colName) : '')) + '</span>';
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      config.handler();
    });
    nav.appendChild(button);
  });

  const hint = document.createElement('div');
  hint.className = 'trav-hint';
  hint.textContent = 'If there are multiple candidates, choose directly from the lists below.';
  panel.appendChild(hint);

  renderStepTraversalList(panel, 'Previous Candidates', targets.previous);
  renderStepTraversalList(panel, 'Next Candidates', targets.next);
}

function renderNodesTab(body) {
  body.innerHTML = '';
  renderSelectedNodeSummary(body);
  renderStepTraversalSection(body);
  const selectedHighlights = getSelectedHighlights();

  if (selectedHighlights.length > 1) {
    const compareLabel = document.createElement('div');
    compareLabel.className = 'slabel';
    compareLabel.textContent = 'Compare';
    body.appendChild(compareLabel);

    const compareCard = document.createElement('div');
    compareCard.className = 'sitem';
    compareCard.innerHTML = '<div class="sstack"><div class="smeta">Ctrl/Cmd+click adds nodes. Up to 5 selections can be compared, and overlap is color-coded.</div></div>';
    body.appendChild(compareCard);
  }

  const toolsLabel = document.createElement('div');
  toolsLabel.className = 'slabel';
  toolsLabel.textContent = 'Actions';
  body.appendChild(toolsLabel);

  const tools = document.createElement('div');
  tools.className = 'toolbar-row';
  const isolateButton = document.createElement('button');
  isolateButton.className = 'btn btn-small';
  isolateButton.type = 'button';
  isolateButton.textContent = getIsolateButtonLabel();
  isolateButton.classList.toggle('btn-active', isolateMode && selectedHighlights.length > 0);
  isolateButton.addEventListener('click', function () {
    if (!selectedHighlights.length && !isolateMode) return;
    toggleIsolateMode();
  });
  tools.appendChild(isolateButton);
  body.appendChild(tools);

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'All Nodes: ' + nds.length;
  body.appendChild(section);

  if (!nds.length) {
    body.innerHTML += '<div class="sblank">No nodes</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'slist';

  nds.slice().sort(function (a, b) {
    const aSelected = isNodeSelected(a.id);
    const bSelected = isNodeSelected(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    if (a.id === hlState.nodeId) return -1;
    if (b.id === hlState.nodeId) return 1;
    const colA = getColById(a.colId);
    const colB = getColById(b.colId);
    const orderA = colA ? colA.order : 0;
    const orderB = colB ? colB.order : 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, 'ja');
  }).forEach(function (node) {
    const col = getColById(node.colId);
    const item = document.createElement('div');
    item.className = 'sitem node-item' + (isNodeSelected(node.id) ? ' selected' : '');
    item.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey) {
        cycleNodeHighlight(node.id, true);
        render();
        return;
      }
      focusNode(node.id, 1);
    });

    const header = document.createElement('div');
    header.className = 'sitem-main';
    header.innerHTML =
      '<div class="sdot" style="background:' + cc(col ? col.side : 'elem') + '"></div>' +
      '<div class="sstack">' +
        '<div class="shead"><span class="sname">' + escapeHtml(node.name) + '</span></div>' +
        '<div class="smeta">' + escapeHtml(col ? col.name : '?') + ' / Links ' + getNodeLinkCount(node.id) + '</div>' +
        (node.description ? '<div class="sdesc">' + escapeHtml(node.description) + '</div>' : '') +
      '</div>';
    item.appendChild(header);

    const actions = document.createElement('div');
    actions.className = 'sactions';
    [
      { label: 'Focus', onClick: function () { focusNode(node.id, getHighlightDepth(node.id) || 1); } },
      { label: 'Near', onClick: function () { setNodeHighlight(node.id, 1, true); render(); } },
      { label: 'Full', onClick: function () { setNodeHighlight(node.id, 2, true); render(); } },
      { label: 'Solo', onClick: function () { focusOnlyNode(node.id, 1); } }
    ].forEach(function (config) {
      const button = document.createElement('button');
      button.className = 'sbtn';
      button.type = 'button';
      button.textContent = config.label;
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        config.onClick();
      });
      actions.appendChild(button);
    });

    if (node.refUrl) {
      const ref = document.createElement('button');
      ref.className = 'sbtn sbtn-link';
      ref.type = 'button';
      ref.textContent = node.refLabel || 'ref';
      ref.addEventListener('click', function (event) {
        event.stopPropagation();
        openRefUrl(node.refUrl);
      });
      actions.appendChild(ref);
    }

    const remove = document.createElement('button');
    remove.className = 'sbtn sbtn-danger';
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.addEventListener('click', function (event) {
      event.stopPropagation();
      removeNd(node.id);
    });
    actions.appendChild(remove);

    item.appendChild(actions);
    list.appendChild(item);
  });

  body.appendChild(list);
}

function renderLinksTab(body) {
  body.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'slabel';
  section.textContent = 'All Links: ' + lks.length;
  body.appendChild(section);

  if (!lks.length) {
    body.innerHTML += '<div class="sblank">No links</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'slist';

  lks.forEach(function (link) {
    const fromNode = getNodeById(link.f);
    const toNode = getNodeById(link.t);
    const item = document.createElement('div');
    item.className = 'sitem';
    const strengthLabel = link.s === 'strong' ? 'Strong' : (link.s === 'mid' ? 'Mid' : 'Weak');
    item.innerHTML =
      '<div style="width:18px;height:2px;background:' + lc(link.s) + ';flex-shrink:0"></div>' +
      '<span class="sname" style="font-size:10px">' + escapeHtml(fromNode ? fromNode.name : '?') + ' \u2192 ' + escapeHtml(toNode ? toNode.name : '?') + '</span>' +
      '<span style="font-size:9px;color:var(--text-muted)">' + strengthLabel + '</span>';

    const remove = document.createElement('button');
    remove.className = 'sicon danger';
    remove.textContent = 'x';
    remove.addEventListener('click', function () {
      removeLk(link.id);
    });
    item.appendChild(remove);
    list.appendChild(item);
  });

  body.appendChild(list);
}

function exportMiro() {
  let markdown = '# BARASHI Map\n\n';
  getOrder().forEach(function (col) {
    markdown += '## ' + col.name + '\n';
    nds.filter(function (node) {
      return node.colId === col.id;
    }).forEach(function (node) {
      markdown += '- ' + node.name + '\n';
    });
    markdown += '\n';
  });
  markdown += '## Links\n';
  lks.forEach(function (link) {
    const fromNode = getNodeById(link.f);
    const toNode = getNodeById(link.t);
    const strength = link.s === 'strong' ? 'Strong' : (link.s === 'mid' ? 'Mid' : 'Weak');
    markdown += '- ' + (fromNode ? fromNode.name : '?') + ' -> ' + (toNode ? toNode.name : '?') + ' (' + strength + ')\n';
  });

  navigator.clipboard.writeText(markdown).then(function () {
    const button = document.getElementById('miroBtn');
    if (!button) return;
    const original = button.textContent;
    button.textContent = 'Copied';
    setTimeout(function () {
      button.textContent = original;
    }, 2000);
  });
}

function drawCol(group, col) {
  const x = cxById(col.id);
  const nodesInCol = nds.filter(function (node) {
    return node.colId === col.id && renderState.visibleNodeIds.has(node.id);
  });
  const maxNodes = maxNdCount();
  const colHeight = Math.max(180, maxNodes * GRID + CHH + 60);
  const color = cc(col.side);
  const bgColor = cb(col.side);
  const allFaded = renderState.hasHighlight && !isolateMode && nodesInCol.length > 0 && nodesInCol.every(function (node) {
    return !renderState.highlightedNodes.has(node.id);
  });

  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2,
    width: CW,
    height: colHeight,
    rx: 8,
    fill: bgColor,
    stroke: color,
    'stroke-opacity': allFaded ? '0.08' : '0.2',
    'stroke-width': '1',
    opacity: allFaded ? '0.2' : '1'
  }));
  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2,
    width: CW,
    height: CHH,
    rx: 8,
    fill: color,
    'fill-opacity': allFaded ? '0.3' : '0.88'
  }));
  group.appendChild(mk('rect', {
    x: x,
    y: -colHeight / 2 + CHH - 5,
    width: CW,
    height: 5,
    fill: color,
    'fill-opacity': allFaded ? '0.3' : '0.88'
  }));

  const headerText = mk('text', {
    x: x + CW / 2,
    y: -colHeight / 2 + CHH / 2 + 5,
    'text-anchor': 'middle',
    fill: allFaded ? 'rgba(255,255,255,0.2)' : '#fff',
    'font-size': '11',
    'font-family': 'Noto Sans JP,sans-serif',
    'font-weight': '600'
  });
  headerText.textContent = col.name;
  group.appendChild(headerText);

  const sideLabel = mk('text', {
    x: x + CW - 5,
    y: -colHeight / 2 + 13,
    'text-anchor': 'end',
    fill: allFaded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
    'font-size': '8',
    'font-family': 'DM Mono,monospace'
  });
  sideLabel.textContent = col.side === 'req' ? 'REQ' : 'ELEM';
  group.appendChild(sideLabel);

  nodesInCol.forEach(function (node) {
    drawNode(group, node, col, x);
  });

  if (!isolateMode || !renderState.hasHighlight) {
    const buttonY = -colHeight / 2 + CHH + 12 - (maxNodes * GRID) / 2 + (maxNodes - nodesInCol.length) * GRID / 2 + nodesInCol.length * GRID + 4;
    const addButton = mk('text', {
      x: x + CW / 2,
      y: buttonY + 14,
      'text-anchor': 'middle',
      fill: color,
      'fill-opacity': '0.4',
      'font-size': '20',
      cursor: 'pointer'
    });
    addButton.textContent = '+';
    addButton.addEventListener('click', function () { openNM(col.id); });
    addButton.addEventListener('mouseover', function () { addButton.setAttribute('fill-opacity', '1'); });
    addButton.addEventListener('mouseout', function () { addButton.setAttribute('fill-opacity', '0.4'); });
    group.appendChild(addButton);
  }
}


