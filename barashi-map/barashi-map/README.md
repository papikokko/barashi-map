# 🏍️ バイクばらし 要件×要素 マッピングツール

バイクの部品構造（要素）と走行性能要件（要件）を双方向にマッピングするビジュアルツールです。
Miroボードから取得したバイクばらしデータをもとに構築しています。

![ツールのスクリーンショット](docs/screenshot.png)

---

## 📁 ファイル構成

```
barashi-map/
├── index.html       # メインHTML（構造のみ）
├── css/
│   └── style.css    # スタイル定義
├── js/
│   ├── app.js       # アプリケーションロジック
│   └── sample.js    # サンプルデータ（独自データに差し替え可）
└── README.md
```

---

## 🚀 使い方

### ローカルで開く
```bash
git clone https://github.com/YOUR_USERNAME/barashi-map.git
cd barashi-map
# index.html をブラウザで開くだけでOK（サーバー不要）
open index.html
```

### GitHub Pages で公開
1. リポジトリの **Settings → Pages**
2. Source を `main` ブランチ・`/(root)` に設定
3. `https://YOUR_USERNAME.github.io/barashi-map/` でアクセス可能

---

## 🎮 操作方法

| 操作 | 説明 |
|------|------|
| ドラッグ | キャンバスを移動 |
| スクロール | ズームイン／アウト |
| ノードをクリック | ハイライト（段階的に拡大） |
| 同じノードを再クリック | ハイライト範囲を1段階拡大 |
| 空白をクリック | ハイライト解除 |
| ⇄ 左右反転 | 要素側と要件側を左右入れ替え |
| ＋ボタン（列内） | ノードを追加 |
| 🔗 リンク追加 | ノード間の関係を追加 |
| Miro用コピー | Miroに貼り付け可能なMarkdownを生成 |

### ハイライト段階
- **1クリック（●○○）** — 直接つながるノードのみ
- **2クリック（●●○）** — 2階層先まで
- **3クリック（●●●）** — 全連鎖（端から端まで）
- **4クリック** — 解除

---

## 📊 データ構造

### 列（cols）
```js
{ id: 'n1', name: '系統', side: 'elem'|'req', order: 0 }
```

### ノード（nds）
```js
{ id: 'n2', colId: 'n1', name: 'エンジン系' }
```

### リンク（lks）
```js
{ id: 'n3', f: 'n2', t: 'n4', s: 'strong'|'mid'|'weak' }
```

---

## 🔧 サンプルデータの差し替え

`js/sample.js` の `loadSample()` 関数を編集するだけで独自データに切り替えられます。

```js
// 列を定義
const cMyCol = uid();
cols = [
  { id: cMyCol, name: '自分の列', side: 'elem', order: 0 },
  // ...
];

// ノードを定義
const nMyNode = uid();
nds = [
  { id: nMyNode, colId: cMyCol, name: '自分のノード' },
  // ...
];

// リンクを定義
lk(nMyNode, otherNodeId, 'strong');
```

---

## 🗂️ データソース

サンプルデータは以下のMiroボードから取得しています：

- **バイクばらし**（系統・部品構成）
- **エンジン性能パラメーター**

---

## 📝 ライセンス

MIT License

---

## Reproducible Notes

This branch adds a data-driven workflow without changing the core static app structure.

### Added files

- `data/sample.js`
  - moved default sample loader from `js/sample.js`
- `data/catalog.js`
  - dropdown source for selectable datasets
- `data/sample-bike-map.js`
  - minimal external sample dataset
- `data/バイクばらし１.js`
  - Yamaha-based bike structure dataset with references and descriptions
- `data/バイクばらし１-sources.md`
  - source URL list used while building `バイクばらし１`
- `js/data-loader.js`
  - external data loading, save, save-as, and serialization support

### Current behavior

- `Load Sample`
  - loads the default sample from `data/sample.js`
- dataset dropdown + `Load Data`
  - loads entries listed in `data/catalog.js`
- `New Data`
  - creates a new blank working dataset
- `Save`
  - overwrites the current file inside the selected `data` folder
- `Save As`
  - saves a new file inside the selected `data` folder
- node hover
  - shows a short description when `description` exists
- node reference link
  - opens the source URL when `refUrl` exists

### Data format

Each dataset exports:

```js
window.BARASHI_DATA_PAYLOAD = {
  cols: [
    { key: 'l0-bike', name: 'L0_バイク', side: 'elem', order: 0 }
  ],
  nodes: [
    {
      id: 'bike',
      name: 'バイク',
      colKey: 'l0-bike',
      description: 'short explanation',
      refUrl: 'https://example.com',
      refLabel: 'src'
    }
  ],
  links: [
    { fromId: 'bike', toId: 'sys-power', strength: 'strong' }
  ]
};
```

### How to reproduce

1. Clone the repository.
2. Open `barashi-map/index.html`.
3. Select a dataset from the dropdown populated by `data/catalog.js`.
4. Click `Load Data`.
5. Hover nodes to see descriptions.
6. Click `↗` or `ref` to open the source page.
7. Use `Save` or `Save As` and select the repository `data` folder when the browser asks for a directory.

### Notes

- This app is still a static HTML/CSS/JS project.
- Browser support for `Save` / `Save As` depends on `showDirectoryPicker`.
- The intended save target is the repository `data` folder for reproducibility.
