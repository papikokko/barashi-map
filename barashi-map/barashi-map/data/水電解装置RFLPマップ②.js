/*
 * 水電解装置RFLPマップ
 * 起点情報:
 * - カナデビア 水素製造装置 HYDROSPRING 公式ページ
 * - カナデビア EVOLIoT 遠隔監視事例
 */
window.BARASHI_DATA_PAYLOAD = (function () {
  const SOURCES = {
    officialJa: {
      url: 'https://www.kanadevia.com/business/field/electrolytic-hydrogen/hydrogen-generator.html',
      label: 'src'
    },
    officialEn: {
      url: 'https://www.kanadevia.com/english/business/field/electrolytic-hydrogen/hydrogen-generator.html',
      label: 'src'
    },
    evoliot: {
      url: 'https://www.kanadevia.com/company/dx/evoliot/',
      label: 'src'
    }
  };

  const cols = [
    { key: 'device', name: '装置', side: 'elem', order: 0 },
    { key: 'system', name: 'システム', side: 'elem', order: 1 },
    { key: 'subsystem', name: 'サブシステム', side: 'elem', order: 2 },
    { key: 'unit', name: 'ユニット', side: 'elem', order: 3 },
    { key: 'component', name: 'コンポ', side: 'elem', order: 4 },
    { key: 'logic', name: 'ロジック', side: 'req', order: 0 },
    { key: 'function', name: '機能', side: 'req', order: 1 },
    { key: 'requirement', name: '要求', side: 'req', order: 2 }
  ];

  const nodes = [];
  const links = [];

  function addNode(id, name, colKey, description, sourceKey) {
    const node = { id: id, name: name, colKey: colKey };
    if (description) node.description = description;
    if (sourceKey && SOURCES[sourceKey]) {
      node.refUrl = SOURCES[sourceKey].url;
      node.refLabel = SOURCES[sourceKey].label;
    }
    nodes.push(node);
  }

  function addLink(fromId, toId, strength) {
    links.push({
      fromId: fromId,
      toId: toId,
      strength: strength || 'strong'
    });
  }

  addNode(
    'dev-hydrospring',
    '水素製造装置 HYDROSPRING',
    'device',
    '水を電気分解して高純度の水素をオンサイトで製造・供給するカナデビアの水電解装置。',
    'officialJa'
  );

  addNode('sys-electrolysis', '水電解システム', 'system', 'PEM電解槽を中心に水を電気分解して水素を生成する。', 'officialJa');
  addNode('sys-water', '水処理・給水システム', 'system', '純水の供給と循環で電解運転を支える。', 'officialEn');
  addNode('sys-gas', 'ガス処理システム', 'system', '生成ガスの分離、乾燥、圧力調整を担う。', 'officialEn');
  addNode('sys-power-control', '電源・制御システム', 'system', '電力変換と運転制御で効率と追従性を作る。', 'officialJa');
  addNode('sys-monitoring', '監視・保全システム', 'system', '遠隔監視とアラートで保守性を高める。', 'evoliot');
  addNode('sys-package', 'パッケージ・設置システム', 'system', 'コンテナ化と現地接続で設置容易性を作る。', 'officialEn');

  addNode('sub-pem-stack', 'PEM電解槽', 'subsystem', '高効率・負荷変動追従性の中核となる固体高分子型電解槽。', 'officialJa');
  addNode('sub-cell-balance', 'セル監視・バランス', 'subsystem', 'セル状態の監視と安定運転を担う。', 'officialEn');
  addNode('sub-pure-water', '純水供給', 'subsystem', '電解用の純水を保持・供給する。', 'officialEn');
  addNode('sub-water-loop', '水循環・補給', 'subsystem', '水の循環と補給を安定化する。', 'officialEn');
  addNode('sub-separation', '気液分離', 'subsystem', '電解後のガスと水分を分離する。', 'officialEn');
  addNode('sub-drying', '乾燥・精製', 'subsystem', '露点と純度を満たすように水素を仕上げる。', 'officialEn');
  addNode('sub-outlet', '圧力調整・供給', 'subsystem', '所定圧力で利用先へ供給する。', 'officialEn');
  addNode('sub-power-conversion', '受電・電力変換', 'subsystem', '交流入力を電解に必要な直流へ変換する。', 'officialEn');
  addNode('sub-operation-control', '運転制御', 'subsystem', '起動停止、自動運転、負荷追従を制御する。', 'officialJa');
  addNode('sub-safety', '安全保護', 'subsystem', '漏えい、圧力、温度などの異常から装置を保護する。', 'officialJa');
  addNode('sub-remote', '遠隔監視', 'subsystem', '遠隔から状態確認と監視を行う。', 'evoliot');
  addNode('sub-diagnostics', '状態診断・アラート', 'subsystem', 'モジュールごとの状態監視と原因究明を支援する。', 'evoliot');
  addNode('sub-container', 'コンテナパッケージ', 'subsystem', '装置の可搬性と屋外設置性を実現する。', 'officialJa');
  addNode('sub-site-interface', '現地接続インターフェース', 'subsystem', '水、電力、水素配管などの現地接続をまとめる。', 'officialEn');

  addNode('unit-electrolysis-stack', '電解スタック', 'unit', '水素発生装置の心臓部。容量拡大の中心。', 'officialEn');
  addNode('unit-cell-monitor', 'セル監視ユニット', 'unit', 'セル電圧や運転状態を監視する。', 'officialEn');
  addNode('unit-pure-water-feed', '純水供給ユニット', 'unit', '純水の保持と供給を担う。', 'officialEn');
  addNode('unit-water-circulation', '循環ユニット', 'unit', '水の循環・補給を担う。', 'officialEn');
  addNode('unit-gas-separator', '気液分離ユニット', 'unit', '生成直後のガスから液分を分離する。', 'officialEn');
  addNode('unit-h2-dryer', '水素乾燥ユニット', 'unit', '露点を下げるために水素を乾燥する。', 'officialEn');
  addNode('unit-outlet-control', '出口圧力制御ユニット', 'unit', '供給圧と流れを整える。', 'officialEn');
  addNode('unit-dc-power', '直流電源ユニット', 'unit', 'PEM電解槽へ適切な直流電力を供給する。', 'officialEn');
  addNode('unit-plc-hmi', 'PLC/HMIユニット', 'unit', '起動停止、自動運転、表示操作を担う。', 'officialJa');
  addNode('unit-interlock', '安全インターロックユニット', 'unit', '異常時の保護停止を担う。', 'officialJa');
  addNode('unit-remote-gateway', '遠隔監視ユニット', 'unit', '遠隔可視化とデータ収集を担う。', 'evoliot');
  addNode('unit-alert-diagnostics', 'アラート診断ユニット', 'unit', 'アラート通知とモジュール診断を担う。', 'evoliot');
  addNode('unit-container-body', 'コンテナ筐体ユニット', 'unit', '40ftコンテナなどの筐体に装置を内蔵する。', 'officialEn');
  addNode('unit-site-connection', '現地接続ユニット', 'unit', '受電、水、ガスの外部接続を担う。', 'officialEn');

  addNode('comp-electrolysis-cell', '電解セル', 'component', '水を電気分解して水素と酸素を生成するセル。', 'officialJa');
  addNode('comp-mea', 'PEM膜/MEA', 'component', 'PEM方式の中核。高効率と薬液レス運転を支える。', 'officialEn');
  addNode('comp-stack-frame', 'スタックフレーム', 'component', 'フィルタープレス技術を活かした大型化の基盤。', 'officialEn');
  addNode('comp-cell-voltage-monitor', 'セル電圧モニタ', 'component', 'セル状態を監視して安定運転を支える。', 'officialEn');
  addNode('comp-pure-water-tank', '純水タンク', 'component', '電解用純水を保持する。', 'officialEn');
  addNode('comp-feed-water-pump', '給水ポンプ', 'component', '純水を電解槽へ供給する。', 'officialEn');
  addNode('comp-flowmeter', '流量計', 'component', '水やガスの流れを監視する。', 'officialEn');
  addNode('comp-circulation-pump', '循環ポンプ', 'component', '循環流量を維持する。', 'officialEn');
  addNode('comp-manifold', '配管マニホールド', 'component', '水・ガスの分配と回収を行う。', 'officialEn');
  addNode('comp-gas-liquid-separator', '気液分離器', 'component', '生成ガスから水分を分離する。', 'officialEn');
  addNode('comp-hydrogen-dryer', '水素乾燥器', 'component', '低露点の水素品質を作る。', 'officialEn');
  addNode('comp-pressure-regulator', '圧力調整弁', 'component', '供給圧を0.8MPaG級へ整える。', 'officialEn');
  addNode('comp-h2-outlet-manifold', '水素出口マニホールド', 'component', '利用先へ水素を送り出す出口部。', 'officialEn');
  addNode('comp-rectifier', '整流器/DC電源', 'component', '交流を直流へ変換して電解へ供給する。', 'officialEn');
  addNode('comp-control-panel', '制御盤', 'component', '装置全体の操作・制御の中心。', 'officialJa');
  addNode('comp-start-stop-button', '起動停止ボタン', 'component', 'ワンボタン操作を実現する。', 'officialEn');
  addNode('comp-plc', 'PLC', 'component', '自動運転、シーケンス、負荷追従を担う。', 'officialJa');
  addNode('comp-h2-leak-sensor', '水素濃度センサ', 'component', '漏えい検知で安全停止へつなぐ。', 'officialJa');
  addNode('comp-pressure-sensor', '圧力センサ', 'component', '圧力異常を監視する。', 'officialJa');
  addNode('comp-temperature-sensor', '温度センサ', 'component', '温度異常を監視する。', 'officialJa');
  addNode('comp-remote-gateway', '遠隔監視ゲートウェイ', 'component', '現場データを遠隔可視化へ送る。', 'evoliot');
  addNode('comp-alert-function', 'アラート通知機能', 'component', '異常発生時に通知して早期復旧を支援する。', 'evoliot');
  addNode('comp-container-frame', 'コンテナ筐体', 'component', '屋外設置・可搬性・単一パッケージ化を実現する。', 'officialEn');
  addNode('comp-site-piping', '現地接続配管', 'component', '電源、水、ガスの現地接続をまとめる。', 'officialEn');

  addNode('comp-valve', 'バルブ', 'component', '流体の遮断・切替・圧力調整に使うバルブ類。', 'officialEn');
  addNode('comp-process-piping', '配管類', 'component', '装置内のプロセス配管の総称。', 'officialEn');
  addNode('comp-transformer', 'トランス', 'component', '整流器の前段で電圧条件を整える変圧器。', 'officialEn');
  addNode('comp-electrode', '電極', 'component', '電解反応の電流授受を担う電極。', 'officialEn');
  addNode('comp-busbar', 'ブスバー', 'component', '大電流をスタックへ分配する導体。', 'officialEn');
  addNode('comp-degassing-column', '脱気筒', 'component', '循環流体中のガス抜きを行う筒体。', 'officialEn');
  addNode('comp-strainer', 'ストレーナー', 'component', '異物除去でポンプ・計器を保護する。', 'officialEn');
  addNode('comp-instrument-parts', '電気・計装部品', 'component', '計装・電装の補機部品群。', 'officialEn');
  addNode('comp-pipe-support', '配管サポート', 'component', '配管を保持し振動・荷重を支える。', 'officialEn');
  addNode('comp-cs-rl-tank', 'CS+RLタンク', 'component', '循環・補給用途の鋼製タンク。', 'officialEn');
  addNode('comp-pe-frp-tank', 'PE・FRPタンク', 'component', '樹脂系タンクの総称。', 'officialEn');
  addNode('comp-sus-piping', 'SUS配管', 'component', '耐食用途のステンレス配管。', 'officialEn');
  addNode('comp-compressor', 'コンプレッサー', 'component', '水素ガス圧力を上げる圧縮機。', 'officialEn');
  addNode('comp-unit-cooler', 'ユニットクーラー', 'component', '装置熱を逃がす冷却器。', 'officialEn');
  addNode('comp-o2-gas-liquid-separator', '酸素気液分離器', 'component', '酸素側の気液分離器。', 'officialEn');
  addNode('comp-h2-gas-liquid-separator', '水素気液分離器', 'component', '水素側の気液分離器。', 'officialEn');
  addNode('comp-catalyst-cartridge', '触媒筒', 'component', '触媒充填によるガス調質部位。', 'officialEn');
  addNode('comp-ion-exchange-column', 'イオン樹脂筒', 'component', '純水品質維持のためのイオン交換筒。', 'officialEn');
  addNode('comp-aux-instrument', 'その他計器', 'component', '個別名称で切られていない補助計器。', 'officialEn');
  addNode('comp-blower', 'ブロワー', 'component', '低圧気体搬送用の送風機。', 'officialEn');
  addNode('comp-motor', 'モータ', 'component', 'ポンプ・補機駆動のモータ。', 'officialEn');
  addNode('comp-ladder', 'ラダー', 'component', '保守アクセス用の梯子。', 'officialEn');
  addNode('comp-h2-storage-tank', '水素貯蔵タンク', 'component', '一時貯蔵用の水素タンク。', 'officialEn');
  addNode('comp-stack-casing-frp', '電解槽ケーシング（FRP）', 'component', 'FRP製の電解槽ケーシング。', 'officialEn');
  addNode('comp-electromagnetic-flowmeter', '電磁流量計', 'component', '導電性流体の流量を測る電磁流量計。', 'officialEn');

  addLink('dev-hydrospring', 'sys-electrolysis');
  addLink('dev-hydrospring', 'sys-water');
  addLink('dev-hydrospring', 'sys-gas');
  addLink('dev-hydrospring', 'sys-power-control');
  addLink('dev-hydrospring', 'sys-monitoring');
  addLink('dev-hydrospring', 'sys-package');

  addLink('sys-electrolysis', 'sub-pem-stack');
  addLink('sys-electrolysis', 'sub-cell-balance', 'mid');
  addLink('sys-water', 'sub-pure-water');
  addLink('sys-water', 'sub-water-loop', 'mid');
  addLink('sys-gas', 'sub-separation');
  addLink('sys-gas', 'sub-drying');
  addLink('sys-gas', 'sub-outlet', 'mid');
  addLink('sys-power-control', 'sub-power-conversion');
  addLink('sys-power-control', 'sub-operation-control');
  addLink('sys-power-control', 'sub-safety', 'mid');
  addLink('sys-monitoring', 'sub-remote');
  addLink('sys-monitoring', 'sub-diagnostics', 'mid');
  addLink('sys-package', 'sub-container');
  addLink('sys-package', 'sub-site-interface', 'mid');

  addLink('sub-pem-stack', 'unit-electrolysis-stack');
  addLink('sub-cell-balance', 'unit-cell-monitor');
  addLink('sub-pure-water', 'unit-pure-water-feed');
  addLink('sub-water-loop', 'unit-water-circulation');
  addLink('sub-separation', 'unit-gas-separator');
  addLink('sub-drying', 'unit-h2-dryer');
  addLink('sub-outlet', 'unit-outlet-control');
  addLink('sub-power-conversion', 'unit-dc-power');
  addLink('sub-operation-control', 'unit-plc-hmi');
  addLink('sub-safety', 'unit-interlock');
  addLink('sub-remote', 'unit-remote-gateway');
  addLink('sub-diagnostics', 'unit-alert-diagnostics');
  addLink('sub-container', 'unit-container-body');
  addLink('sub-site-interface', 'unit-site-connection');
  addLink('unit-outlet-control', 'comp-valve', 'mid');
  addLink('unit-water-circulation', 'comp-process-piping', 'weak');
  addLink('unit-dc-power', 'comp-transformer', 'mid');
  addLink('unit-electrolysis-stack', 'comp-electrode', 'mid');
  addLink('unit-dc-power', 'comp-busbar', 'mid');
  addLink('unit-water-circulation', 'comp-degassing-column', 'weak');
  addLink('unit-pure-water-feed', 'comp-strainer', 'mid');
  addLink('unit-plc-hmi', 'comp-instrument-parts', 'weak');
  addLink('unit-site-connection', 'comp-pipe-support', 'weak');
  addLink('unit-water-circulation', 'comp-cs-rl-tank', 'weak');
  addLink('unit-pure-water-feed', 'comp-pe-frp-tank', 'weak');
  addLink('unit-site-connection', 'comp-sus-piping', 'weak');
  addLink('unit-outlet-control', 'comp-compressor', 'weak');
  addLink('unit-water-circulation', 'comp-unit-cooler', 'weak');
  addLink('unit-gas-separator', 'comp-o2-gas-liquid-separator', 'mid');
  addLink('unit-gas-separator', 'comp-h2-gas-liquid-separator', 'mid');
  addLink('unit-h2-dryer', 'comp-catalyst-cartridge', 'weak');
  addLink('unit-pure-water-feed', 'comp-ion-exchange-column', 'mid');
  addLink('unit-alert-diagnostics', 'comp-aux-instrument', 'weak');
  addLink('unit-gas-separator', 'comp-blower', 'weak');
  addLink('unit-water-circulation', 'comp-motor', 'weak');
  addLink('unit-container-body', 'comp-ladder', 'weak');
  addLink('unit-outlet-control', 'comp-h2-storage-tank', 'weak');
  addLink('unit-electrolysis-stack', 'comp-stack-casing-frp', 'mid');
  addLink('unit-pure-water-feed', 'comp-electromagnetic-flowmeter', 'weak');

  addLink('unit-electrolysis-stack', 'comp-electrolysis-cell');
  addLink('unit-electrolysis-stack', 'comp-mea');
  addLink('unit-electrolysis-stack', 'comp-stack-frame', 'mid');
  addLink('unit-cell-monitor', 'comp-cell-voltage-monitor');
  addLink('unit-pure-water-feed', 'comp-pure-water-tank');
  addLink('unit-pure-water-feed', 'comp-feed-water-pump');
  addLink('unit-pure-water-feed', 'comp-flowmeter', 'mid');
  addLink('unit-water-circulation', 'comp-circulation-pump');
  addLink('unit-water-circulation', 'comp-manifold', 'mid');
  addLink('unit-gas-separator', 'comp-gas-liquid-separator');
  addLink('unit-h2-dryer', 'comp-hydrogen-dryer');
  addLink('unit-outlet-control', 'comp-pressure-regulator');
  addLink('unit-outlet-control', 'comp-h2-outlet-manifold', 'mid');
  addLink('unit-dc-power', 'comp-rectifier');
  addLink('unit-plc-hmi', 'comp-control-panel');
  addLink('unit-plc-hmi', 'comp-start-stop-button', 'mid');
  addLink('unit-plc-hmi', 'comp-plc');
  addLink('unit-interlock', 'comp-h2-leak-sensor');
  addLink('unit-interlock', 'comp-pressure-sensor');
  addLink('unit-interlock', 'comp-temperature-sensor', 'mid');
  addLink('unit-remote-gateway', 'comp-remote-gateway');
  addLink('unit-alert-diagnostics', 'comp-alert-function');
  addLink('unit-container-body', 'comp-container-frame');
  addLink('unit-site-connection', 'comp-site-piping');

  addNode('req-safety', '安全性・法規対応', 'requirement', 'オンサイト水素製造で搬送・保管リスクを下げ、安全に使えること。', 'officialEn');
  addNode('req-efficiency', '電解効率', 'requirement', 'PEM方式と適切な電力供給で高効率に水素を製造すること。', 'officialEn');
  addNode('req-load-follow', '負荷変動追従性', 'requirement', '風力・太陽光などの急変動電力に追従できること。', 'officialEn');
  addNode('req-quality', '水素純度・露点', 'requirement', '99.9〜99.999%の純度と低露点の水素を供給できること。', 'officialEn');
  addNode('req-operability', '操作性・自動運転', 'requirement', '起動停止が簡単で、遠隔監視・自動運転ができること。', 'officialJa');
  addNode('req-maintainability', '保守性・遠隔保全', 'requirement', 'モジュール状態を遠隔で確認し、早期復旧できること。', 'evoliot');
  addNode('req-installation', '設置性・可搬性', 'requirement', 'コンテナ化により屋外設置しやすく、建屋新設を抑えられること。', 'officialJa');
  addNode('req-scale', '拡張性・大容量化', 'requirement', '需要に応じてMW級・大容量化に対応できること。', 'officialEn');
  addNode('req-environment', '環境性・廃液レス', 'requirement', 'アルカリ薬液を使わず、廃液処理を不要にすること。', 'officialEn');
  addNode('req-p2g', '再エネ活用適合性', 'requirement', 'Power to Gas用途で再エネ由来電力を水素へ変換できること。', 'officialJa');

  addNode('fun-safe-onsite', 'オンサイトで安全に供給する', 'function', 'ボンベ搬送を避けつつ、異常時は確実に保護する。', 'officialEn');
  addNode('fun-efficient-electrolysis', '高効率に電気分解する', 'function', 'PEM方式と最適電源でエネルギー損失を抑える。', 'officialEn');
  addNode('fun-follow-renewables', '変動電力に追従する', 'function', '再エネ変動に合わせて出力を制御する。', 'officialEn');
  addNode('fun-condition-hydrogen', '高品質の水素に仕上げる', 'function', '分離、乾燥、圧力制御で所定品質にする。', 'officialEn');
  addNode('fun-easy-operation', '簡単に起動停止・自動運転する', 'function', 'ワンボタン操作と自動運転を実現する。', 'officialJa');
  addNode('fun-remote-maintenance', '遠隔で監視・保全する', 'function', 'データ可視化とアラートで保守効率を上げる。', 'evoliot');
  addNode('fun-easy-installation', '現地工事を簡略化する', 'function', 'コンテナパッケージで屋外設置性を高める。', 'officialEn');
  addNode('fun-scale-up', '容量を拡張する', 'function', '大型電解槽と単一パッケージで大容量へ対応する。', 'officialEn');
  addNode('fun-no-chemical', '薬液レスで運転する', 'function', 'アルカリ液なしで水電解を成立させる。', 'officialJa');
  addNode('fun-power-to-gas', '再エネ電力を水素へ変換する', 'function', '電気と水だけでオンタイムに水素を作り利用先へつなぐ。', 'officialEn');

  addNode('log-no-cylinder-handling', 'オンサイト製造でボンベ搬送・交換をなくす', 'logic', '搬送・保管・交換をなくして安全性と利便性を両立する。', 'officialEn');
  addNode('log-interlock-protection', '漏えい・圧力・温度監視でインターロック停止する', 'logic', '異常兆候を検知して安全側へ遷移する。', 'officialJa');
  addNode('log-pem-efficiency', 'PEM電解槽で高効率に電気分解する', 'logic', 'PEM方式を採用して高効率化する。', 'officialEn');
  addNode('log-dc-feed', '整流器で電解に適した直流を供給する', 'logic', '交流入力を電解に必要な直流へ変換する。', 'officialEn');
  addNode('log-power-ramp', '電流・電圧制御で急な電力変動に追従する', 'logic', '風力・太陽光の急変動を受け止めて出力を変える。', 'officialEn');
  addNode('log-auto-sequence', 'PLCで起動停止と負荷追従を自動化する', 'logic', '運転シーケンスを自動化して変動運転を成立させる。', 'officialJa');
  addNode('log-gas-separation', '生成直後に気液分離して下流品質を安定化する', 'logic', '乾燥器に入る前に液分を確実に除去する。', 'officialEn');
  addNode('log-drying', '乾燥器で露点を下げて高純度水素を作る', 'logic', '低露点の水素品質へ仕上げる。', 'officialEn');
  addNode('log-pressure-control', '供給圧を整えて利用先へ安定供給する', 'logic', '約0.8MPaG級の供給条件へ調整する。', 'officialEn');
  addNode('log-one-button', '起動停止をワンボタン化する', 'logic', '誰でもすぐ使える操作性を作る。', 'officialEn');
  addNode('log-remote-auto', '遠隔監視と自動運転で省人化する', 'logic', '現場常駐なしでも状態確認と運転継続を可能にする。', 'officialJa');
  addNode('log-module-visibility', 'モジュールごとのデータを遠隔収集して原因究明する', 'logic', '複数モジュールのデータをまとめて可視化する。', 'evoliot');
  addNode('log-alert-recovery', 'アラート監視で異常を早期通知して復旧を早める', 'logic', '現場訪問前に状態を把握し、早期復旧へつなげる。', 'evoliot');
  addNode('log-containerized', 'コンテナ内蔵で屋外設置しやすくする', 'logic', '屋外仕様ではコンテナ内蔵として可搬性を持たせる。', 'officialJa');
  addNode('log-no-new-building', '単一パッケージ化で建屋新設と現地工事を減らす', 'logic', 'パッケージ化により施工の簡略化と低コスト化を図る。', 'officialEn');
  addNode('log-large-tank', '電解槽を大型化して処理量を増やす', 'logic', '心臓部の電解槽大型化で大容量需要に応える。', 'officialJa');
  addNode('log-mw-package', '40ftコンテナ単一パッケージでMW級へ拡張する', 'logic', '大容量装置もパッケージとして展開する。', 'officialEn');
  addNode('log-no-alkaline', 'アルカリ液を使わず廃液処理を不要にする', 'logic', '薬液レス運転で後処理負担を減らす。', 'officialEn');
  addNode('log-pure-water-feed', '純水供給で薬液レスの安定運転を成立させる', 'logic', '電解に必要な純水を安定供給する。', 'officialEn');
  addNode('log-onsite-ontime', '電気と水だけでオンサイト／オンタイム製造する', 'logic', '再エネ電力を必要時に水素へ変換する。', 'officialEn');
  addNode('log-h2-supply-use', '水素エネルギー利用先へ所定圧で供給する', 'logic', '燃料電池や製造プロセスへ水素をつなぐ。', 'officialEn');

  addLink('fun-safe-onsite', 'req-safety');
  addLink('fun-efficient-electrolysis', 'req-efficiency');
  addLink('fun-follow-renewables', 'req-load-follow');
  addLink('fun-condition-hydrogen', 'req-quality');
  addLink('fun-easy-operation', 'req-operability');
  addLink('fun-remote-maintenance', 'req-maintainability');
  addLink('fun-easy-installation', 'req-installation');
  addLink('fun-scale-up', 'req-scale');
  addLink('fun-no-chemical', 'req-environment');
  addLink('fun-power-to-gas', 'req-p2g');

  addLink('log-no-cylinder-handling', 'fun-safe-onsite');
  addLink('log-interlock-protection', 'fun-safe-onsite');
  addLink('log-pem-efficiency', 'fun-efficient-electrolysis');
  addLink('log-dc-feed', 'fun-efficient-electrolysis');
  addLink('log-power-ramp', 'fun-follow-renewables');
  addLink('log-auto-sequence', 'fun-follow-renewables');
  addLink('log-gas-separation', 'fun-condition-hydrogen');
  addLink('log-drying', 'fun-condition-hydrogen');
  addLink('log-pressure-control', 'fun-condition-hydrogen', 'mid');
  addLink('log-one-button', 'fun-easy-operation');
  addLink('log-remote-auto', 'fun-easy-operation');
  addLink('log-module-visibility', 'fun-remote-maintenance');
  addLink('log-alert-recovery', 'fun-remote-maintenance');
  addLink('log-containerized', 'fun-easy-installation');
  addLink('log-no-new-building', 'fun-easy-installation');
  addLink('log-large-tank', 'fun-scale-up');
  addLink('log-mw-package', 'fun-scale-up');
  addLink('log-no-alkaline', 'fun-no-chemical');
  addLink('log-pure-water-feed', 'fun-no-chemical');
  addLink('log-onsite-ontime', 'fun-power-to-gas');
  addLink('log-h2-supply-use', 'fun-power-to-gas');

  addLink('comp-container-frame', 'log-no-cylinder-handling', 'mid');
  addLink('comp-h2-outlet-manifold', 'log-no-cylinder-handling', 'weak');
  addLink('comp-h2-leak-sensor', 'log-interlock-protection');
  addLink('comp-pressure-sensor', 'log-interlock-protection');
  addLink('comp-temperature-sensor', 'log-interlock-protection', 'mid');

  addLink('comp-mea', 'log-pem-efficiency');
  addLink('comp-electrolysis-cell', 'log-pem-efficiency');
  addLink('comp-rectifier', 'log-dc-feed');

  addLink('comp-rectifier', 'log-power-ramp');
  addLink('comp-plc', 'log-power-ramp', 'mid');
  addLink('comp-plc', 'log-auto-sequence');
  addLink('comp-control-panel', 'log-auto-sequence', 'mid');
  addLink('comp-start-stop-button', 'log-auto-sequence', 'weak');

  addLink('comp-gas-liquid-separator', 'log-gas-separation');
  addLink('comp-hydrogen-dryer', 'log-drying');
  addLink('comp-pressure-regulator', 'log-pressure-control');
  addLink('comp-h2-outlet-manifold', 'log-pressure-control', 'mid');

  addLink('comp-start-stop-button', 'log-one-button');
  addLink('comp-control-panel', 'log-one-button', 'mid');
  addLink('comp-remote-gateway', 'log-remote-auto');
  addLink('comp-plc', 'log-remote-auto', 'mid');

  addLink('comp-remote-gateway', 'log-module-visibility');
  addLink('comp-cell-voltage-monitor', 'log-module-visibility', 'mid');
  addLink('comp-alert-function', 'log-alert-recovery');
  addLink('comp-remote-gateway', 'log-alert-recovery', 'mid');

  addLink('comp-container-frame', 'log-containerized');
  addLink('comp-container-frame', 'log-no-new-building');
  addLink('comp-site-piping', 'log-no-new-building', 'mid');

  addLink('comp-stack-frame', 'log-large-tank');
  addLink('comp-electrolysis-cell', 'log-large-tank', 'mid');
  addLink('comp-container-frame', 'log-mw-package');
  addLink('comp-site-piping', 'log-mw-package', 'weak');

  addLink('comp-mea', 'log-no-alkaline');
  addLink('comp-pure-water-tank', 'log-no-alkaline', 'weak');
  addLink('comp-pure-water-tank', 'log-pure-water-feed');
  addLink('comp-feed-water-pump', 'log-pure-water-feed', 'mid');

  addLink('comp-electrolysis-cell', 'log-onsite-ontime');
  addLink('comp-feed-water-pump', 'log-onsite-ontime', 'mid');
  addLink('comp-pressure-regulator', 'log-h2-supply-use');
  addLink('comp-h2-outlet-manifold', 'log-h2-supply-use', 'mid');
  addLink('comp-valve', 'log-pressure-control', 'mid');
  addLink('comp-process-piping', 'log-onsite-ontime', 'weak');
  addLink('comp-transformer', 'log-dc-feed', 'mid');
  addLink('comp-electrode', 'log-pem-efficiency', 'mid');
  addLink('comp-busbar', 'log-dc-feed', 'mid');
  addLink('comp-degassing-column', 'log-gas-separation', 'weak');
  addLink('comp-strainer', 'log-pure-water-feed', 'mid');
  addLink('comp-instrument-parts', 'log-module-visibility', 'weak');
  addLink('comp-pipe-support', 'log-no-new-building', 'weak');
  addLink('comp-cs-rl-tank', 'log-pure-water-feed', 'weak');
  addLink('comp-pe-frp-tank', 'log-no-alkaline', 'weak');
  addLink('comp-sus-piping', 'log-no-new-building', 'weak');
  addLink('comp-compressor', 'log-h2-supply-use', 'weak');
  addLink('comp-unit-cooler', 'log-power-ramp', 'weak');
  addLink('comp-o2-gas-liquid-separator', 'log-gas-separation', 'mid');
  addLink('comp-h2-gas-liquid-separator', 'log-gas-separation', 'mid');
  addLink('comp-catalyst-cartridge', 'log-drying', 'weak');
  addLink('comp-ion-exchange-column', 'log-pure-water-feed', 'mid');
  addLink('comp-aux-instrument', 'log-module-visibility', 'weak');
  addLink('comp-blower', 'log-gas-separation', 'weak');
  addLink('comp-motor', 'log-power-ramp', 'weak');
  addLink('comp-ladder', 'log-containerized', 'weak');
  addLink('comp-h2-storage-tank', 'log-h2-supply-use', 'weak');
  addLink('comp-stack-casing-frp', 'log-large-tank', 'weak');
  addLink('comp-electromagnetic-flowmeter', 'log-pure-water-feed', 'mid');

  const structureView = {
    title: '水電解装置 構造ビュー',
    description: 'RFLPの要素を、実際の装置ブロック構成に寄せて見せるビューです。',
    width: 720,
    height: 520,
    blocks: [
      {
        id: 'blk-water',
        label: '純水供給',
        x: 34,
        y: 96,
        w: 144,
        h: 94,
        tone: 'water',
        focusNodeId: 'unit-pure-water-feed',
        nodeIds: ['unit-pure-water-feed', 'unit-water-circulation', 'comp-pure-water-tank', 'comp-feed-water-pump', 'comp-flowmeter', 'comp-electromagnetic-flowmeter', 'comp-strainer', 'comp-degassing-column', 'comp-cs-rl-tank', 'comp-pe-frp-tank', 'comp-ion-exchange-column', 'comp-unit-cooler', 'comp-motor', 'comp-process-piping'],
        note: '純水タンク / 給水ポンプ / 流量計'
      },
      {
        id: 'blk-stack',
        label: 'PEM電解スタック',
        x: 230,
        y: 78,
        w: 170,
        h: 120,
        tone: 'process',
        focusNodeId: 'unit-electrolysis-stack',
        nodeIds: ['unit-electrolysis-stack', 'comp-electrolysis-cell', 'comp-mea', 'comp-stack-frame', 'comp-electrode', 'comp-stack-casing-frp'],
        note: 'MEA / 電解セル / スタックフレーム'
      },
      {
        id: 'blk-separation',
        label: '気液分離・乾燥',
        x: 452,
        y: 80,
        w: 168,
        h: 118,
        tone: 'process',
        focusNodeId: 'unit-gas-separator',
        nodeIds: ['unit-gas-separator', 'unit-h2-dryer', 'comp-gas-liquid-separator', 'comp-hydrogen-dryer', 'comp-o2-gas-liquid-separator', 'comp-h2-gas-liquid-separator', 'comp-catalyst-cartridge', 'comp-blower'],
        note: '気液分離器 / 乾燥器'
      },
      {
        id: 'blk-outlet',
        label: '出口圧制御・供給',
        x: 452,
        y: 238,
        w: 168,
        h: 92,
        tone: 'process',
        focusNodeId: 'unit-outlet-control',
        nodeIds: ['unit-outlet-control', 'comp-pressure-regulator', 'comp-h2-outlet-manifold', 'comp-valve', 'comp-compressor', 'comp-h2-storage-tank'],
        note: '圧力調整弁 / 出口マニホールド'
      },
      {
        id: 'blk-control',
        label: '電源・制御・安全',
        x: 214,
        y: 254,
        w: 202,
        h: 132,
        tone: 'control',
        focusNodeId: 'unit-plc-hmi',
        nodeIds: ['unit-dc-power', 'unit-plc-hmi', 'unit-interlock', 'comp-rectifier', 'comp-transformer', 'comp-busbar', 'comp-control-panel', 'comp-start-stop-button', 'comp-plc', 'comp-h2-leak-sensor', 'comp-pressure-sensor', 'comp-temperature-sensor', 'comp-instrument-parts'],
        note: '整流器 / PLC-HMI / センサ群'
      },
      {
        id: 'blk-monitor',
        label: '遠隔監視・診断',
        x: 34,
        y: 258,
        w: 142,
        h: 128,
        tone: 'package',
        focusNodeId: 'unit-remote-gateway',
        nodeIds: ['unit-remote-gateway', 'unit-alert-diagnostics', 'comp-remote-gateway', 'comp-alert-function', 'comp-cell-voltage-monitor', 'comp-aux-instrument'],
        note: '遠隔GW / アラート / セル監視'
      },
      {
        id: 'blk-package',
        label: 'コンテナ・現地接続',
        x: 452,
        y: 374,
        w: 168,
        h: 92,
        tone: 'package',
        focusNodeId: 'unit-container-body',
        nodeIds: ['unit-container-body', 'unit-site-connection', 'comp-container-frame', 'comp-site-piping', 'comp-pipe-support', 'comp-sus-piping', 'comp-ladder'],
        note: '40ftコンテナ / 現地配管'
      }
    ],
    connectors: [
      { from: 'blk-water', to: 'blk-stack', label: '純水' },
      { from: 'blk-stack', to: 'blk-separation', label: '水素' },
      { from: 'blk-separation', to: 'blk-outlet', label: '高純度H2' },
      { from: 'blk-control', to: 'blk-stack', label: '電力・制御' },
      { from: 'blk-control', to: 'blk-separation', label: '制御' },
      { from: 'blk-monitor', to: 'blk-control', label: '監視' },
      { from: 'blk-package', to: 'blk-water', label: '設置' },
      { from: 'blk-package', to: 'blk-outlet', label: '供給口' }
    ]
  };

  Object.assign(structureView, {
    title: '水電解装置 機能ブロック図',
    description: '純水供給から水素供給までの主系統と、制御・監視・設置系の関係を俯瞰するビューです。',
    width: 920,
    height: 620,
    blocks: [
      {
        id: 'blk-package-frame',
        kind: 'frame',
        label: 'コンテナ・現地接続',
        x: 24,
        y: 56,
        w: 872,
        h: 540,
        tone: 'package',
        note: '屋外パッケージ / 配管・配線・保守動線'
      },
      {
        id: 'blk-water',
        label: '純水供給',
        x: 56,
        y: 122,
        w: 180,
        h: 96,
        tone: 'water',
        focusNodeId: 'unit-pure-water-feed',
        nodeIds: ['sys-water', 'sub-pure-water', 'unit-pure-water-feed', 'unit-water-circulation', 'comp-pure-water-tank', 'comp-feed-water-pump', 'comp-flowmeter', 'comp-electromagnetic-flowmeter', 'comp-strainer', 'comp-degassing-column', 'comp-cs-rl-tank', 'comp-pe-frp-tank', 'comp-ion-exchange-column', 'comp-unit-cooler', 'comp-motor', 'comp-process-piping'],
        note: '純水タンク / 給水ポンプ / 流量計'
      },
      {
        id: 'blk-stack',
        label: 'PEM電解スタック',
        x: 296,
        y: 120,
        w: 246,
        h: 102,
        tone: 'process',
        focusNodeId: 'unit-electrolysis-stack',
        nodeIds: ['sys-electrolysis', 'sub-pem-stack', 'unit-electrolysis-stack', 'comp-electrolysis-cell', 'comp-mea', 'comp-stack-frame', 'comp-electrode', 'comp-stack-casing-frp'],
        note: 'MEA / 電解セル / スタックフレーム'
      },
      {
        id: 'blk-separation',
        label: '気液分離・乾燥',
        x: 602,
        y: 120,
        w: 228,
        h: 102,
        tone: 'process',
        focusNodeId: 'unit-gas-separator',
        nodeIds: ['sys-gas', 'sub-separation', 'sub-drying', 'unit-gas-separator', 'unit-h2-dryer', 'comp-gas-liquid-separator', 'comp-hydrogen-dryer', 'comp-o2-gas-liquid-separator', 'comp-h2-gas-liquid-separator', 'comp-catalyst-cartridge', 'comp-blower'],
        note: '気液分離器 / 乾燥器 / 触媒筒'
      },
      {
        id: 'blk-outlet',
        label: '出口圧制御・供給',
        x: 602,
        y: 286,
        w: 228,
        h: 102,
        tone: 'process',
        focusNodeId: 'unit-outlet-control',
        nodeIds: ['sub-outlet', 'unit-outlet-control', 'comp-pressure-regulator', 'comp-h2-outlet-manifold', 'comp-valve', 'comp-compressor', 'comp-h2-storage-tank'],
        note: '圧力調整弁 / バルブ / 供給マニホールド'
      },
      {
        id: 'blk-control',
        label: '電源・制御・安全',
        x: 296,
        y: 278,
        w: 246,
        h: 118,
        tone: 'control',
        focusNodeId: 'unit-plc-hmi',
        nodeIds: ['sys-power-control', 'sub-power-conversion', 'sub-operation-control', 'sub-safety', 'unit-dc-power', 'unit-plc-hmi', 'unit-interlock', 'comp-rectifier', 'comp-transformer', 'comp-busbar', 'comp-control-panel', 'comp-start-stop-button', 'comp-plc', 'comp-h2-leak-sensor', 'comp-pressure-sensor', 'comp-temperature-sensor', 'comp-instrument-parts'],
        note: '整流器 / PLC-HMI / 安全インターロック'
      },
      {
        id: 'blk-monitor',
        label: '遠隔監視・診断',
        x: 56,
        y: 278,
        w: 180,
        h: 118,
        tone: 'package',
        focusNodeId: 'unit-remote-gateway',
        nodeIds: ['sys-monitoring', 'sub-remote', 'sub-diagnostics', 'unit-remote-gateway', 'unit-alert-diagnostics', 'comp-remote-gateway', 'comp-alert-function', 'comp-cell-voltage-monitor', 'comp-aux-instrument'],
        note: '遠隔GW / アラート / セル監視'
      },
      {
        id: 'blk-package',
        label: '現地接続・筐体',
        x: 56,
        y: 462,
        w: 774,
        h: 76,
        tone: 'package',
        focusNodeId: 'unit-container-body',
        nodeIds: ['sys-package', 'sub-container', 'sub-site-interface', 'unit-container-body', 'unit-site-connection', 'comp-container-frame', 'comp-site-piping', 'comp-pipe-support', 'comp-sus-piping', 'comp-ladder'],
        note: '40ftコンテナ / 現地配管 / 保守アクセス'
      }
    ],
    connectors: [
      { from: 'blk-water', to: 'blk-stack', label: '純水供給' },
      { from: 'blk-stack', to: 'blk-separation', label: '生成ガス' },
      { from: 'blk-separation', to: 'blk-outlet', label: '高純度H2' },
      { from: 'blk-control', to: 'blk-stack', label: '直流電力・制御' },
      { from: 'blk-control', to: 'blk-separation', label: '監視制御' },
      { from: 'blk-control', to: 'blk-outlet', label: '圧力・安全制御' },
      { from: 'blk-monitor', to: 'blk-control', label: '遠隔監視' },
      { from: 'blk-package', to: 'blk-water', label: '給水接続' },
      { from: 'blk-package', to: 'blk-control', label: '電源・通信' },
      { from: 'blk-package', to: 'blk-outlet', label: '供給接続' }
    ]
  });

  Object.assign(structureView, {
    title: '水電解装置 機能ブロック図',
    description: '要求書サンプルに合わせて、機器のまとまりと接続経路を読みやすく整理した構造ビューです。',
    width: 1320,
    height: 760,
    blocks: [
      {
        id: 'frame-control',
        kind: 'frame',
        label: '電力・制御・監視',
        x: 40,
        y: 80,
        w: 220,
        h: 610,
        tone: 'control',
        note: '遠隔監視、診断、PLC-HMI、安全I/F、直流電源を左レーンに集約'
      },
      {
        id: 'frame-main',
        kind: 'frame',
        label: '主プロセス',
        x: 300,
        y: 80,
        w: 980,
        h: 400,
        tone: 'process',
        note: '純水供給 → 水循環 → 電解 → 気液分離 → 乾燥 → 出口圧制御 → 供給/貯蔵'
      },
      {
        id: 'frame-site',
        kind: 'frame',
        label: '現地・筐体',
        x: 300,
        y: 520,
        w: 980,
        h: 160,
        tone: 'package',
        note: 'コンテナ筐体、現地接続ユニット、補機タンク群を下段に分離'
      },
      {
        id: 'blk-remote',
        label: '遠隔GW',
        x: 72,
        y: 120,
        w: 150,
        h: 62,
        tone: 'package',
        focusNodeId: 'unit-remote-gateway',
        nodeIds: ['unit-remote-gateway', 'comp-remote-gateway'],
        note: '遠隔監視'
      },
      {
        id: 'blk-diagnostics',
        label: '診断・警報',
        x: 72,
        y: 220,
        w: 150,
        h: 62,
        tone: 'package',
        focusNodeId: 'unit-alert-diagnostics',
        nodeIds: ['unit-alert-diagnostics', 'comp-alert-function', 'comp-cell-voltage-monitor', 'comp-aux-instrument'],
        note: '状態監視'
      },
      {
        id: 'blk-plc',
        label: 'PLC / HMI',
        x: 72,
        y: 332,
        w: 150,
        h: 72,
        tone: 'control',
        focusNodeId: 'unit-plc-hmi',
        nodeIds: ['unit-plc-hmi', 'comp-plc', 'comp-control-panel', 'comp-start-stop-button'],
        note: '運転制御'
      },
      {
        id: 'blk-interlock',
        label: '安全I/F',
        x: 72,
        y: 446,
        w: 150,
        h: 62,
        tone: 'control',
        focusNodeId: 'unit-interlock',
        nodeIds: ['unit-interlock', 'comp-h2-leak-sensor', 'comp-pressure-sensor', 'comp-temperature-sensor', 'comp-instrument-parts'],
        note: '漏洩・圧温'
      },
      {
        id: 'blk-dc-power',
        label: '直流電源',
        x: 72,
        y: 546,
        w: 150,
        h: 72,
        tone: 'control',
        focusNodeId: 'unit-dc-power',
        nodeIds: ['unit-dc-power', 'comp-transformer', 'comp-rectifier', 'comp-busbar'],
        note: '変圧・整流'
      },
      {
        id: 'blk-pure-water',
        label: '純水供給ユニット',
        x: 360,
        y: 132,
        w: 180,
        h: 72,
        tone: 'water',
        focusNodeId: 'unit-pure-water-feed',
        nodeIds: ['unit-pure-water-feed', 'comp-pure-water-tank', 'comp-feed-water-pump'],
        note: '純水タンク / 純水ポンプ'
      },
      {
        id: 'blk-water-circ',
        label: '水循環ユニット',
        x: 360,
        y: 298,
        w: 180,
        h: 88,
        tone: 'water',
        focusNodeId: 'unit-water-circulation',
        nodeIds: ['unit-water-circulation', 'comp-process-piping', 'comp-flowmeter', 'comp-electromagnetic-flowmeter', 'comp-strainer', 'comp-degassing-column', 'comp-ion-exchange-column', 'comp-unit-cooler', 'comp-circulation-pump', 'comp-motor'],
        note: '配管 / 流量計 / ストレーナー'
      },
      {
        id: 'blk-stack',
        label: '電解スタック',
        x: 620,
        y: 214,
        w: 182,
        h: 92,
        tone: 'process',
        focusNodeId: 'unit-electrolysis-stack',
        nodeIds: ['unit-electrolysis-stack', 'comp-electrolysis-cell', 'comp-mea', 'comp-electrode', 'comp-stack-frame', 'comp-stack-casing-frp'],
        note: 'MEA / 電解セル / 電極'
      },
      {
        id: 'blk-h2-sep',
        label: '水素気液分離器',
        x: 896,
        y: 132,
        w: 160,
        h: 72,
        tone: 'process',
        focusNodeId: 'unit-gas-separator',
        nodeIds: ['unit-gas-separator', 'comp-h2-gas-liquid-separator'],
        note: 'H2側'
      },
      {
        id: 'blk-o2-sep',
        label: '酸素気液分離器',
        x: 896,
        y: 300,
        w: 160,
        h: 72,
        tone: 'process',
        focusNodeId: 'unit-gas-separator',
        nodeIds: ['unit-gas-separator', 'comp-o2-gas-liquid-separator', 'comp-gas-liquid-separator', 'comp-blower'],
        note: 'O2側'
      },
      {
        id: 'blk-dryer',
        label: '水素乾燥器',
        x: 1112,
        y: 132,
        w: 140,
        h: 72,
        tone: 'process',
        focusNodeId: 'unit-h2-dryer',
        nodeIds: ['unit-h2-dryer', 'comp-hydrogen-dryer', 'comp-catalyst-cartridge'],
        note: '露点管理'
      },
      {
        id: 'blk-outlet',
        label: '出口圧制御',
        x: 1112,
        y: 236,
        w: 140,
        h: 72,
        tone: 'process',
        focusNodeId: 'unit-outlet-control',
        nodeIds: ['unit-outlet-control', 'comp-pressure-regulator', 'comp-valve', 'comp-h2-outlet-manifold'],
        note: '圧力調整'
      },
      {
        id: 'blk-storage',
        label: '供給/貯蔵',
        x: 1112,
        y: 340,
        w: 140,
        h: 72,
        tone: 'process',
        focusNodeId: 'comp-h2-storage-tank',
        nodeIds: ['comp-h2-storage-tank', 'comp-compressor'],
        note: '圧縮・貯蔵'
      },
      {
        id: 'blk-container',
        label: 'コンテナ筐体',
        x: 360,
        y: 562,
        w: 190,
        h: 70,
        tone: 'package',
        focusNodeId: 'unit-container-body',
        nodeIds: ['unit-container-body', 'comp-container-frame', 'comp-ladder'],
        note: '40ft筐体'
      },
      {
        id: 'blk-site-connection',
        label: '現地接続ユニット',
        x: 640,
        y: 562,
        w: 220,
        h: 70,
        tone: 'package',
        focusNodeId: 'unit-site-connection',
        nodeIds: ['unit-site-connection', 'comp-site-piping', 'comp-sus-piping', 'comp-pipe-support'],
        note: '給水・供給接続'
      },
      {
        id: 'blk-water-tanks',
        label: '補機タンク群',
        x: 950,
        y: 562,
        w: 190,
        h: 70,
        tone: 'water',
        focusNodeId: 'comp-cs-rl-tank',
        nodeIds: ['comp-cs-rl-tank', 'comp-pe-frp-tank'],
        note: '補助液槽'
      }
    ],
    connectors: [
      { from: 'blk-remote', to: 'blk-diagnostics', label: '遠隔監視', labelPos: { x: 194, y: 204 }, points: [{ x: 147, y: 182 }, { x: 147, y: 220 }] },
      { from: 'blk-diagnostics', to: 'blk-plc', label: '状態監視', labelPos: { x: 194, y: 314 }, points: [{ x: 147, y: 282 }, { x: 147, y: 332 }] },
      { from: 'blk-interlock', to: 'blk-plc', label: '安全信号', labelPos: { x: 194, y: 434 }, points: [{ x: 147, y: 446 }, { x: 147, y: 404 }] },
      { from: 'blk-dc-power', to: 'blk-stack', label: '直流電力', labelPos: { x: 332, y: 248 }, points: [{ x: 222, y: 582 }, { x: 274, y: 582 }, { x: 274, y: 260 }, { x: 620, y: 260 }] },
      { from: 'blk-plc', to: 'blk-water-circ', label: '流量制御', labelPos: { x: 288, y: 330 }, points: [{ x: 222, y: 368 }, { x: 320, y: 368 }, { x: 320, y: 342 }, { x: 360, y: 342 }] },
      { from: 'blk-plc', to: 'blk-stack', label: '運転制御', labelPos: { x: 414, y: 230 }, points: [{ x: 222, y: 350 }, { x: 300, y: 350 }, { x: 300, y: 242 }, { x: 620, y: 242 }] },
      { from: 'blk-plc', to: 'blk-outlet', label: '圧力制御', labelPos: { x: 980, y: 372 }, points: [{ x: 222, y: 384 }, { x: 1080, y: 384 }, { x: 1080, y: 272 }, { x: 1112, y: 272 }] },
      { from: 'blk-pure-water', to: 'blk-water-circ', label: '純水', labelPos: { x: 494, y: 252 }, emphasis: true, points: [{ x: 450, y: 204 }, { x: 450, y: 298 }] },
      { from: 'blk-water-circ', to: 'blk-stack', label: '循環水', labelPos: { x: 570, y: 330 }, emphasis: true, points: [{ x: 540, y: 342 }, { x: 580, y: 342 }, { x: 580, y: 260 }, { x: 620, y: 260 }] },
      { from: 'blk-stack', to: 'blk-h2-sep', label: '水素系', labelPos: { x: 850, y: 198 }, emphasis: true, points: [{ x: 802, y: 238 }, { x: 850, y: 238 }, { x: 850, y: 168 }, { x: 896, y: 168 }] },
      { from: 'blk-stack', to: 'blk-o2-sep', label: '酸素系', labelPos: { x: 850, y: 330 }, points: [{ x: 802, y: 282 }, { x: 850, y: 282 }, { x: 850, y: 336 }, { x: 896, y: 336 }] },
      { from: 'blk-h2-sep', to: 'blk-dryer', label: '湿潤H2', labelPos: { x: 1086, y: 154 }, emphasis: true, points: [{ x: 1056, y: 168 }, { x: 1112, y: 168 }] },
      { from: 'blk-dryer', to: 'blk-outlet', label: '乾燥H2', labelPos: { x: 1222, y: 224 }, emphasis: true, points: [{ x: 1182, y: 204 }, { x: 1182, y: 236 }] },
      { from: 'blk-outlet', to: 'blk-storage', label: '供給H2', labelPos: { x: 1222, y: 328 }, emphasis: true, points: [{ x: 1182, y: 308 }, { x: 1182, y: 340 }] },
      { from: 'blk-container', to: 'blk-site-connection', label: '実装', labelPos: { x: 596, y: 584 }, points: [{ x: 550, y: 597 }, { x: 640, y: 597 }] },
      { from: 'blk-site-connection', to: 'blk-pure-water', label: '給水接続', labelPos: { x: 560, y: 456 }, points: [{ x: 750, y: 562 }, { x: 750, y: 468 }, { x: 450, y: 468 }, { x: 450, y: 204 }] },
      { from: 'blk-site-connection', to: 'blk-outlet', label: '供給接続', labelPos: { x: 982, y: 488 }, points: [{ x: 750, y: 562 }, { x: 1090, y: 562 }, { x: 1090, y: 272 }, { x: 1112, y: 272 }] },
      { from: 'blk-water-tanks', to: 'blk-water-circ', label: '補機供給', labelPos: { x: 760, y: 420 }, points: [{ x: 950, y: 597 }, { x: 900, y: 597 }, { x: 900, y: 430 }, { x: 450, y: 430 }, { x: 450, y: 386 }] }
    ]
  });

  const defectMap = {
    title: '電気分解装置 不具合ヒートマップ',
    description: '不具合件数を、RFLPノードと機能ブロック図へ対応づけた実装マスタです。',
    items: [
      { category: '電気分解', label: 'バルブ', count: 24, layer: 'component', targetLabel: 'comp-valve', targetNodeIds: ['comp-valve'], structureBlockIds: ['blk-outlet'] },
      { category: '電気分解', label: '配管類', count: 20, layer: 'component', targetLabel: 'comp-process-piping / comp-site-piping', targetNodeIds: ['comp-process-piping', 'comp-site-piping'], structureBlockIds: ['blk-water-circ', 'blk-site-connection'] },
      { category: '電気分解', label: 'トランス、整流器', count: 18, layer: 'component', targetLabel: 'comp-transformer / comp-rectifier', targetNodeIds: ['comp-transformer', 'comp-rectifier'], structureBlockIds: ['blk-dc-power'] },
      { category: '電気分解', label: '電解槽（単極）', count: 18, layer: 'component', targetLabel: 'comp-electrolysis-cell', targetNodeIds: ['comp-electrolysis-cell'], structureBlockIds: ['blk-stack'] },
      { category: '電気分解', label: 'ポンプ', count: 13, layer: 'unit+component', targetLabel: 'unit-pure-water-feed / unit-water-circulation', targetNodeIds: ['unit-pure-water-feed', 'unit-water-circulation', 'comp-feed-water-pump', 'comp-circulation-pump'], structureBlockIds: ['blk-pure-water', 'blk-water-circ'] },
      { category: '電気分解', label: '計器', count: 13, layer: 'component', targetLabel: '計装系コンポ', targetNodeIds: ['comp-flowmeter', 'comp-pressure-sensor', 'comp-temperature-sensor', 'comp-cell-voltage-monitor'], structureBlockIds: ['blk-water-circ', 'blk-diagnostics', 'blk-interlock'] },
      { category: '電気分解', label: '制御盤', count: 12, layer: 'component', targetLabel: 'comp-control-panel', targetNodeIds: ['comp-control-panel'], structureBlockIds: ['blk-plc'] },
      { category: '電気分解', label: '電解槽（複極）', count: 12, layer: 'unit+component', targetLabel: 'unit-electrolysis-stack / comp-stack-frame', targetNodeIds: ['unit-electrolysis-stack', 'comp-stack-frame'], structureBlockIds: ['blk-stack'] },
      { category: '電気分解', label: '電解槽', count: 11, layer: 'unit', targetLabel: 'unit-electrolysis-stack', targetNodeIds: ['unit-electrolysis-stack'], structureBlockIds: ['blk-stack'] },
      { category: '電気分解', label: 'その他', count: 8, layer: 'aggregate', targetLabel: '未分類', targetNodeIds: [], structureBlockIds: [] },
      { category: '電気分解', label: '流量計', count: 8, layer: 'component', targetLabel: 'comp-flowmeter / comp-electromagnetic-flowmeter', targetNodeIds: ['comp-flowmeter', 'comp-electromagnetic-flowmeter'], structureBlockIds: ['blk-water-circ'] },
      { category: '電気分解', label: 'ブスバー', count: 7, layer: 'component', targetLabel: 'comp-busbar', targetNodeIds: ['comp-busbar'], structureBlockIds: ['blk-dc-power'] },
      { category: '電気分解', label: '脱気筒', count: 7, layer: 'component', targetLabel: 'comp-degassing-column', targetNodeIds: ['comp-degassing-column'], structureBlockIds: ['blk-water-circ'] },
      { category: '電気分解', label: '電極', count: 5, layer: 'component', targetLabel: 'comp-electrode', targetNodeIds: ['comp-electrode'], structureBlockIds: ['blk-stack'] },
      { category: '電気分解', label: 'ストレーナー', count: 4, layer: 'component', targetLabel: 'comp-strainer', targetNodeIds: ['comp-strainer'], structureBlockIds: ['blk-water-circ'] },
      { category: '電気分解', label: '電気、計装部品', count: 4, layer: 'component', targetLabel: 'comp-instrument-parts / comp-plc', targetNodeIds: ['comp-instrument-parts', 'comp-plc'], structureBlockIds: ['blk-plc', 'blk-interlock'] },
      { category: '電気分解', label: '配管', count: 4, layer: 'component', targetLabel: 'comp-site-piping', targetNodeIds: ['comp-site-piping'], structureBlockIds: ['blk-site-connection'] },
      { category: '電気分解', label: '配管サポート', count: 3, layer: 'component', targetLabel: 'comp-pipe-support', targetNodeIds: ['comp-pipe-support'], structureBlockIds: ['blk-site-connection'] },
      { category: '電気分解', label: 'CS+RLタンク', count: 2, layer: 'component', targetLabel: 'comp-cs-rl-tank', targetNodeIds: ['comp-cs-rl-tank'], structureBlockIds: ['blk-water-tanks'] },
      { category: '電気分解', label: 'PE、FRPタンク', count: 2, layer: 'component', targetLabel: 'comp-pe-frp-tank', targetNodeIds: ['comp-pe-frp-tank'], structureBlockIds: ['blk-water-tanks'] },
      { category: '電気分解', label: 'SUS配管', count: 2, layer: 'component', targetLabel: 'comp-sus-piping', targetNodeIds: ['comp-sus-piping'], structureBlockIds: ['blk-site-connection'] },
      { category: '電気分解', label: 'コンプレッサー', count: 2, layer: 'component', targetLabel: 'comp-compressor', targetNodeIds: ['comp-compressor'], structureBlockIds: ['blk-storage'] },
      { category: '電気分解', label: 'ユニットクーラー', count: 2, layer: 'component', targetLabel: 'comp-unit-cooler', targetNodeIds: ['comp-unit-cooler'], structureBlockIds: ['blk-water-circ'] },
      { category: '電気分解', label: '酸素気液分離器', count: 2, layer: 'component', targetLabel: 'comp-o2-gas-liquid-separator', targetNodeIds: ['comp-o2-gas-liquid-separator'], structureBlockIds: ['blk-o2-sep'] },
      { category: '電気分解', label: '純水タンク', count: 2, layer: 'component', targetLabel: 'comp-pure-water-tank', targetNodeIds: ['comp-pure-water-tank'], structureBlockIds: ['blk-pure-water'] },
      { category: '電気分解', label: '純水ポンプ', count: 2, layer: 'component', targetLabel: 'comp-feed-water-pump', targetNodeIds: ['comp-feed-water-pump'], structureBlockIds: ['blk-pure-water'] },
      { category: '電気分解', label: '触媒筒', count: 2, layer: 'component', targetLabel: 'comp-catalyst-cartridge', targetNodeIds: ['comp-catalyst-cartridge'], structureBlockIds: ['blk-dryer'] },
      { category: '電気分解', label: '水素気液分離器', count: 2, layer: 'component', targetLabel: 'comp-h2-gas-liquid-separator', targetNodeIds: ['comp-h2-gas-liquid-separator'], structureBlockIds: ['blk-h2-sep'] },
      { category: '電気分解', label: '整流器', count: 2, layer: 'component', targetLabel: 'comp-rectifier', targetNodeIds: ['comp-rectifier'], structureBlockIds: ['blk-dc-power'] },
      { category: '電気分解', label: 'イオン樹脂筒', count: 1, layer: 'component', targetLabel: 'comp-ion-exchange-column', targetNodeIds: ['comp-ion-exchange-column'], structureBlockIds: ['blk-water-circ'] },
      { category: '電気分解', label: 'その他計器', count: 1, layer: 'component', targetLabel: 'comp-aux-instrument', targetNodeIds: ['comp-aux-instrument'], structureBlockIds: ['blk-diagnostics'] },
      { category: '電気分解', label: 'ブロワー', count: 1, layer: 'component', targetLabel: 'comp-blower', targetNodeIds: ['comp-blower'], structureBlockIds: ['blk-o2-sep'] },
      { category: '電気分解', label: 'モータ', count: 1, layer: 'component', targetLabel: 'comp-motor', targetNodeIds: ['comp-motor'], structureBlockIds: ['blk-water-circ'] },
      { category: '電気分解', label: 'ラダー', count: 1, layer: 'component', targetLabel: 'comp-ladder', targetNodeIds: ['comp-ladder'], structureBlockIds: ['blk-container'] },
      { category: '電気分解', label: '循環ポンプ', count: 1, layer: 'component', targetLabel: 'comp-circulation-pump', targetNodeIds: ['comp-circulation-pump'], structureBlockIds: ['blk-water-circ'] },
      { category: '電気分解', label: '水素貯蔵タンク', count: 1, layer: 'component', targetLabel: 'comp-h2-storage-tank', targetNodeIds: ['comp-h2-storage-tank'], structureBlockIds: ['blk-storage'] },
      { category: '電気分解', label: '電解槽ケーシング（FRP）', count: 1, layer: 'component', targetLabel: 'comp-stack-casing-frp', targetNodeIds: ['comp-stack-casing-frp'], structureBlockIds: ['blk-stack'] },
      { category: '電気分解', label: '電磁流量計', count: 1, layer: 'component', targetLabel: 'comp-electromagnetic-flowmeter', targetNodeIds: ['comp-electromagnetic-flowmeter'], structureBlockIds: ['blk-water-circ'] }
    ]
  };

  return {
    cols: cols,
    nodes: nodes,
    links: links,
    structureView: structureView,
    defectMap: defectMap
  };
})();
