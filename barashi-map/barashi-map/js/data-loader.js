(function () {
  const DATA_CATALOG_KEY = 'BARASHI_DATA_FILES';
  const DATA_PAYLOAD_KEY = 'BARASHI_DATA_PAYLOAD';
  const DEFAULT_NEW_FILE_NAME = 'barashi-map-data.js';
  let initialFlipButtonLabel = null;
  let currentDataEntry = null;
  let currentFileHandle = null;
  let currentDirectoryHandle = null;

  function resetWorkspace() {
    cols = [];
    nds = [];
    lks = [];
    idc = 1;
    hlState = { selected: [], activeNodeId: null, nodeId: null, depth: 0 };
    flipped = false;
    isolateMode = false;
    isolateLocked = false;
    isolateSnapshot = null;
    structureView = null;
    structurePanelOpen = false;
    defectMap = null;
    structureSelectedBlockId = null;
    defectReviewMode = false;

    const flipBtn = document.getElementById('flipBtn');
    if (flipBtn) {
      if (initialFlipButtonLabel === null) {
        initialFlipButtonLabel = flipBtn.textContent;
      }
      flipBtn.textContent = initialFlipButtonLabel;
      flipBtn.style.color = '';
      flipBtn.style.borderColor = '';
    }

    const indicator = document.getElementById('hlInd');
    if (indicator) {
      indicator.classList.remove('show');
    }

    if (typeof syncUiState === 'function') {
      syncUiState();
    }
  }

  function mapStructureViewForRuntime(definition, runtimeNodeIds) {
    if (!definition || !Array.isArray(definition.blocks) || !definition.blocks.length) {
      return null;
    }

    return {
      title: definition.title || '構造ビュー',
      description: definition.description || '',
      width: definition.width || 720,
      height: definition.height || 520,
      style: definition.style ? JSON.parse(JSON.stringify(definition.style)) : {},
      blocks: definition.blocks.map(function (block) {
        return {
          id: block.id,
          kind: block.kind || '',
          label: block.label,
          x: Number(block.x) || 0,
          y: Number(block.y) || 0,
          w: Number(block.w) || 140,
          h: Number(block.h) || 90,
          tone: block.tone || 'process',
          note: block.note || '',
          style: block.style ? JSON.parse(JSON.stringify(block.style)) : {},
          focusNodeId: runtimeNodeIds.get(block.focusNodeId) || null,
          nodeIds: (block.nodeIds || block.nodeRefs || [])
            .map(function (nodeId) { return runtimeNodeIds.get(nodeId); })
            .filter(Boolean)
        };
      }),
      connectors: (definition.connectors || []).map(function (connector) {
        return {
          from: connector.from,
          to: connector.to,
          label: connector.label || '',
          emphasis: !!connector.emphasis,
          style: connector.style ? JSON.parse(JSON.stringify(connector.style)) : {},
          labelPos: connector.labelPos ? {
            x: Number(connector.labelPos.x) || 0,
            y: Number(connector.labelPos.y) || 0
          } : null,
          points: Array.isArray(connector.points)
            ? connector.points.map(function (point) {
              return {
                x: Number(point.x) || 0,
                y: Number(point.y) || 0
              };
            })
            : null
        };
      })
    };
  }

  function serializeStructureView(nodeKeyMap) {
    if (!structureView || !Array.isArray(structureView.blocks) || !structureView.blocks.length) {
      return undefined;
    }

    return {
      title: structureView.title || '構造ビュー',
      description: structureView.description || '',
      width: structureView.width || 720,
      height: structureView.height || 520,
      style: structureView.style && Object.keys(structureView.style).length ? structureView.style : undefined,
      blocks: structureView.blocks.map(function (block) {
        return {
          id: block.id,
          kind: block.kind || undefined,
          label: block.label,
          x: block.x,
          y: block.y,
          w: block.w,
          h: block.h,
          tone: block.tone,
          note: block.note || undefined,
          style: block.style && Object.keys(block.style).length ? block.style : undefined,
          focusNodeId: block.focusNodeId ? nodeKeyMap.get(block.focusNodeId) : undefined,
          nodeIds: (block.nodeIds || [])
            .map(function (nodeId) { return nodeKeyMap.get(nodeId); })
            .filter(Boolean)
        };
      }),
      connectors: (structureView.connectors || []).map(function (connector) {
        return {
          from: connector.from,
          to: connector.to,
          label: connector.label || undefined,
          emphasis: connector.emphasis || undefined,
          style: connector.style && Object.keys(connector.style).length ? connector.style : undefined,
          labelPos: connector.labelPos || undefined,
          points: Array.isArray(connector.points) && connector.points.length ? connector.points : undefined
        };
      })
    };
  }

  function mapDefectMapForRuntime(definition, runtimeNodeIds) {
    if (!definition || !Array.isArray(definition.items) || !definition.items.length) {
      return null;
    }

    return {
      title: definition.title || '不具合ヒートマップ',
      description: definition.description || '',
      items: definition.items.map(function (item) {
        return {
          category: item.category || '',
          label: item.label || '',
          count: Number(item.count) || 0,
          layer: item.layer || '',
          targetLabel: item.targetLabel || '',
          structureBlockIds: Array.isArray(item.structureBlockIds) ? item.structureBlockIds.slice() : [],
          targetNodeIds: (item.targetNodeIds || [])
            .map(function (nodeId) { return runtimeNodeIds.get(nodeId); })
            .filter(Boolean)
        };
      })
    };
  }

  function serializeDefectMap(nodeKeyMap) {
    if (!defectMap || !Array.isArray(defectMap.items) || !defectMap.items.length) {
      return undefined;
    }

    return {
      title: defectMap.title || '不具合ヒートマップ',
      description: defectMap.description || '',
      items: defectMap.items.map(function (item) {
        return {
          category: item.category || undefined,
          label: item.label || '',
          count: Number(item.count) || 0,
          layer: item.layer || undefined,
          targetLabel: item.targetLabel || undefined,
          structureBlockIds: Array.isArray(item.structureBlockIds) && item.structureBlockIds.length ? item.structureBlockIds.slice() : undefined,
          targetNodeIds: (item.targetNodeIds || [])
            .map(function (nodeId) { return nodeKeyMap.get(nodeId); })
            .filter(Boolean)
        };
      })
    };
  }

  function applyDataPayload(payload) {
    if (!payload || !Array.isArray(payload.cols) || !Array.isArray(payload.nodes) || !Array.isArray(payload.links)) {
      throw new Error('Invalid data payload');
    }

    resetWorkspace();

    const colIdByName = new Map();
    const colIdByKey = new Map();
    payload.cols.forEach(function (col, index) {
      const id = uid();
      colIdByName.set(col.name, id);
      if (col.key) colIdByKey.set(col.key, id);
      cols.push({
        id: id,
        name: col.name,
        side: col.side === 'req' ? 'req' : 'elem',
        order: Number.isFinite(col.order) ? col.order : index
      });
    });

    const nodeIds = new Map();
    payload.nodes.forEach(function (node) {
      const colId = colIdByKey.get(node.colKey) || colIdByName.get(node.col);
      if (!colId) return;

      const id = uid();
      nodeIds.set(node.id || node.name, id);
      nds.push({
        id: id,
        colId: colId,
        name: node.name,
        description: node.description || '',
        refUrl: node.refUrl || '',
        refLabel: node.refLabel || ''
      });
    });

    payload.links.forEach(function (link) {
      const fromId = nodeIds.get(link.fromId || link.from);
      const toId = nodeIds.get(link.toId || link.to);
      if (!fromId || !toId || fromId === toId) return;

      lks.push({
        id: uid(),
        f: fromId,
        t: toId,
        s: link.strength === 'strong' || link.strength === 'mid' ? link.strength : 'weak'
      });
    });

    structureView = mapStructureViewForRuntime(payload.structureView, nodeIds);
    structurePanelOpen = !!structureView;
    defectMap = mapDefectMapForRuntime(payload.defectMap, nodeIds);

    fitView();
    render();
  }

  function createNewWorkspace() {
    resetWorkspace();
    const elementColId = uid();
    const reqColId = uid();
    cols.push({ id: elementColId, name: 'Elements', side: 'elem', order: 0 });
    cols.push({ id: reqColId, name: 'Requirements', side: 'req', order: 0 });
    currentDataEntry = {
      file: DEFAULT_NEW_FILE_NAME,
      label: DEFAULT_NEW_FILE_NAME,
      mode: 'payload'
    };
    currentFileHandle = null;
    fitView();
    render();
  }

  function slugifyFileName(value) {
    const base = (value || 'barashi-map-data')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return (base || 'barashi-map-data') + '.js';
  }

  async function ensureDataDirectoryHandle() {
    if (currentDirectoryHandle) {
      return currentDirectoryHandle;
    }

    if (!window.showDirectoryPicker) {
      throw new Error('Directory picker is not supported in this browser.');
    }

    currentDirectoryHandle = await window.showDirectoryPicker({
      id: 'barashi-map-data-folder',
      mode: 'readwrite'
    });

    return currentDirectoryHandle;
  }

  function buildCurrentPayload() {
    const orderedCols = getOrder();
    const colKeyMap = new Map();
    const nodeKeyMap = new Map();

    const payload = {
      cols: orderedCols.map(function (col, index) {
        const key = 'col-' + (index + 1);
        colKeyMap.set(col.id, key);
        return {
          key: key,
          name: col.name,
          side: col.side,
          order: col.order
        };
      }),
      nodes: nds.map(function (node, index) {
        const id = 'node-' + (index + 1);
        nodeKeyMap.set(node.id, id);
        return {
          id: id,
          name: node.name,
          colKey: colKeyMap.get(node.colId),
          description: node.description || undefined,
          refUrl: node.refUrl || undefined,
          refLabel: node.refLabel || undefined
        };
      }),
      links: lks
        .map(function (link) {
          return {
            fromId: nodeKeyMap.get(link.f),
            toId: nodeKeyMap.get(link.t),
            strength: link.s
          };
        })
        .filter(function (link) {
          return link.fromId && link.toId && link.fromId !== link.toId;
        }),
      structureView: serializeStructureView(nodeKeyMap),
      defectMap: serializeDefectMap(nodeKeyMap)
    };

    return payload;
  }

  function buildPayloadScriptText(payload) {
    return 'window.BARASHI_DATA_PAYLOAD = ' + JSON.stringify(payload, null, 2) + ';\n';
  }

  async function saveWithHandle(fileHandle, text) {
    const writable = await fileHandle.createWritable();
    await writable.write(text);
    await writable.close();
  }

  async function saveAsDataFile() {
    const suggestedName = slugifyFileName((currentDataEntry && currentDataEntry.label) || DEFAULT_NEW_FILE_NAME);
    const text = buildPayloadScriptText(buildCurrentPayload());
    const nextName = window.prompt('Save file name in data folder', suggestedName);
    if (nextName === null) {
      return;
    }

    const fileName = slugifyFileName(nextName);
    const directoryHandle = await ensureDataDirectoryHandle();
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    await saveWithHandle(fileHandle, text);
    currentDataEntry = {
      file: fileName,
      label: fileName.replace(/\.js$/i, ''),
      mode: 'payload'
    };
    currentFileHandle = fileHandle;
  }

  async function resolveCurrentFileHandle() {
    if (currentFileHandle) {
      return currentFileHandle;
    }

    if (!currentDataEntry || !currentDataEntry.file) {
      return null;
    }

    const directoryHandle = await ensureDataDirectoryHandle();
    currentFileHandle = await directoryHandle.getFileHandle(currentDataEntry.file, { create: true });
    return currentFileHandle;
  }

  async function saveCurrentDataFile() {
    const text = buildPayloadScriptText(buildCurrentPayload());
    const fileHandle = await resolveCurrentFileHandle();
    if (fileHandle) {
      await saveWithHandle(fileHandle, text);
      return;
    }

    await saveAsDataFile();
  }

  function loadDataScript(fileName, allowEmptyPayload) {
    return new Promise(function (resolve, reject) {
      window[DATA_PAYLOAD_KEY] = null;

      const existing = document.getElementById('barashi-data-script');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.id = 'barashi-data-script';
      script.src = 'data/' + fileName;
      script.onload = function () {
        if (!window[DATA_PAYLOAD_KEY] && !allowEmptyPayload) {
          reject(new Error('Payload not found'));
          return;
        }
        resolve(window[DATA_PAYLOAD_KEY] || null);
      };
      script.onerror = function () {
        reject(new Error('Failed to load data script'));
      };
      document.body.appendChild(script);
    });
  }

  function loadDataEntry(entry) {
    return loadDataScript(entry.file, entry.mode === 'function').then(function (payload) {
      if (entry.mode === 'function') {
        const action = window[entry.action];
        if (typeof action !== 'function') {
          throw new Error('Data action not found');
        }
        action();
        return null;
      }

      return payload;
    });
  }

  function loadCatalogScript() {
    return new Promise(function (resolve, reject) {
      if (Array.isArray(window[DATA_CATALOG_KEY])) {
        resolve(window[DATA_CATALOG_KEY]);
        return;
      }

      const existing = document.getElementById('barashi-catalog-script');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.id = 'barashi-catalog-script';
      script.src = 'data/catalog.js';
      script.onload = function () {
        resolve(window[DATA_CATALOG_KEY] || []);
      };
      script.onerror = function () {
        reject(new Error('Failed to load catalog script'));
      };
      document.body.appendChild(script);
    });
  }

  function buildLoaderUi(files) {
    const actions = document.querySelector('.actions');
    if (!actions || document.getElementById('barashiDataSelect')) return;

    const select = document.createElement('select');
    select.id = 'barashiDataSelect';
    select.className = 'btn';
    select.style.minWidth = '170px';

    files.forEach(function (item, index) {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = item.label || item.file;
      select.appendChild(option);
    });

    const button = document.createElement('button');
    button.className = 'btn';
    button.type = 'button';
    button.textContent = 'Load Data';
    button.addEventListener('click', async function () {
      const entry = files[Number(select.value)];
      if (!entry) return;

      try {
        const payload = await loadDataEntry(entry);
        currentDataEntry = entry;
        currentFileHandle = null;
        if (payload) {
          applyDataPayload(payload);
        }
      } catch (error) {
        console.error(error);
        alert('Failed to load data file.');
      }
    });

    const newButton = document.createElement('button');
    newButton.className = 'btn';
    newButton.type = 'button';
    newButton.textContent = 'New Data';
    newButton.addEventListener('click', function () {
      createNewWorkspace();
    });

    const saveButton = document.createElement('button');
    saveButton.className = 'btn';
    saveButton.type = 'button';
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', async function () {
      try {
        await saveCurrentDataFile();
      } catch (error) {
        console.error(error);
        alert('Failed to save data file in the data folder.');
      }
    });

    const saveAsButton = document.createElement('button');
    saveAsButton.className = 'btn';
    saveAsButton.type = 'button';
    saveAsButton.textContent = 'Save As';
    saveAsButton.addEventListener('click', async function () {
      try {
        await saveAsDataFile();
      } catch (error) {
        console.error(error);
        alert('Failed to save data file in the data folder.');
      }
    });

    actions.insertBefore(button, actions.lastElementChild);
    actions.insertBefore(saveAsButton, button);
    actions.insertBefore(saveButton, saveAsButton);
    actions.insertBefore(newButton, saveButton);
    actions.insertBefore(select, button);
  }

  document.addEventListener('DOMContentLoaded', async function () {
    const flipBtn = document.getElementById('flipBtn');
    if (flipBtn && initialFlipButtonLabel === null) {
      initialFlipButtonLabel = flipBtn.textContent;
    }

    if (typeof window.loadSample === 'function' && !window.loadSample.__barashiWrapped) {
      const originalLoadSample = window.loadSample;
      const wrappedLoadSample = function () {
        currentDataEntry = {
          file: 'sample.js',
          label: 'default-sample',
          mode: 'function',
          action: 'loadSample'
        };
        currentFileHandle = null;
        return originalLoadSample.apply(this, arguments);
      };
      wrappedLoadSample.__barashiWrapped = true;
      window.loadSample = wrappedLoadSample;
    }

    try {
      const files = await loadCatalogScript();
      if (!Array.isArray(files) || files.length === 0) return;
      buildLoaderUi(files);
    } catch (error) {
      console.warn(error);
    }
  });
})();
