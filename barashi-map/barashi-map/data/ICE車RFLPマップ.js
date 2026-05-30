(function () {
  const SOURCES = {
    toyotaPowertrain: {
      url: 'https://global.toyota/en/detail/14391907',
      label: 'src'
    },
    toyotaDirectInjection: {
      url: 'https://global.toyota/en/detail/7901843',
      label: 'src'
    },
    toyotaDieselScr: {
      url: 'https://global.toyota/en/detail/8348091',
      label: 'src'
    },
    boschGdi: {
      url: 'https://www.bosch-mobility.com/en/solutions/powertrain/gasoline/gasoline-direct-injection/',
      label: 'src'
    },
    boschEngineEcu: {
      url: 'https://www.bosch-mobility.com/en/solutions/control-units/engine-control-unit/',
      label: 'src'
    },
    boschMapBoost: {
      url: 'https://www.bosch-mobility.com/en/solutions/sensors/intake-manifold-and-boost-pressure-sensor/',
      label: 'src'
    },
    boschWidebandLambda: {
      url: 'https://www.bosch-mobility.com/en/solutions/exhaust-gas-treatment/wideband-lambda-sensor/',
      label: 'src'
    },
    boschAbs: {
      url: 'https://www.bosch-mobility.com/en/solutions/driving-safety/antilock-braking-system/',
      label: 'src'
    },
    boschEsp: {
      url: 'https://www.bosch-mobility.com/en/solutions/driving-safety/electronic-stability-program/',
      label: 'src'
    },
    boschEps: {
      url: 'https://www.bosch-mobility.com/en/solutions/steering/electric-power-steering-systems/',
      label: 'src'
    },
    boschTransmissionSensors: {
      url: 'https://www.bosch-mobility.com/en/solutions/sensors/transmission-sensors/',
      label: 'src'
    },
    boschLinearSolenoid: {
      url: 'https://www.bosch-mobility.com/en/solutions/transmission-technology/linear-force-solenoid/',
      label: 'src'
    },
    saeJ670: {
      url: 'https://www.sae.org/standards/j670_202206-vehicle-dynamics-terminology',
      label: 'src'
    },
    unR13H: {
      url: 'https://www.mlit.go.jp/jidosha/un/UN_R013H.pdf',
      label: 'src'
    },
    epaObd: {
      url: 'https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P1009Z15.TXT',
      label: 'src'
    },
    saeJ1979: {
      url: 'https://www.sae.org/standards/j1979_202505-e-e-diagnostic-test-modes',
      label: 'src'
    },
    kybDamperReport: {
      url: 'https://www.kyb.co.jp/products/technical-report/files/products-technical-report_data_no55j_all.pdf',
      label: 'src'
    },
    zfChassis: {
      url: 'https://aftermarket.zf.com/en/aftermarket-portal/our-portfolio/passenger-cars/products/steering-chassis-parts/',
      label: 'src'
    },
    jsaeRideComfort: {
      url: 'https://www.jstage.jst.go.jp/article/jsaeronbun/50/6/50_20194920/_pdf/-char/ja',
      label: 'src'
    },
    mazdaNvh2022: {
      url: 'https://www.mazda.com/globalassets/ja/assets/innovation/technology/gihou/2022/files/2022_no013.pdf',
      label: 'src'
    },
    mazdaBody2020: {
      url: 'https://www.mazda.com/content/dam/mazda/corporate/mazda-com/ja/pdf/innovation/monozukuri/technology/tech-review/2020/giho_all2020.pdf',
      label: 'src'
    },
    hondaDurability: {
      url: 'https://www.jstage.jst.go.jp/article/hondatechnicalreview/25/1/25_2013_25_1_14/_pdf/-char/en',
      label: 'src'
    },
    iso8608: {
      url: 'https://www.iso.org/standard/71202.html',
      label: 'src'
    },
    jsaeHighCompression: {
      url: 'https://www.jstage.jst.go.jp/article/jsaeronbun/49/6/49_20184660/_pdf/-char/ja',
      label: 'src'
    },
    jsaeModelPredictiveAF: {
      url: 'https://www.jstage.jst.go.jp/article/jsaeronbun/48/3/48_20174457/_article/-char/ja/',
      label: 'src'
    },
    jsaeSpotWeld: {
      url: 'https://www.jstage.jst.go.jp/article/jsaeronbun/56/3/56_20254194/_pdf/-char/ja',
      label: 'src'
    }
  };

  const cols = [
    { key: 'car', name: '車', side: 'elem', order: 0 },
    { key: 'system', name: 'システム', side: 'elem', order: 1 },
    { key: 'subsystem', name: 'サブシステム', side: 'elem', order: 2 },
    { key: 'unit', name: 'ユニット', side: 'elem', order: 3 },
    { key: 'component', name: 'コンポ', side: 'elem', order: 4 },
    { key: 'logic', name: 'ロジック', side: 'req', order: 0 },
    { key: 'function', name: '機能', side: 'req', order: 1 },
    { key: 'requirement', name: '要求', side: 'req', order: 2 }
  ];

  const requirements = [
    {
      key: 'fuel-economy',
      name: '燃費',
      description: '燃料消費とCO2排出を抑えながら必要な走行性能を満たす。',
      ref: 'toyotaPowertrain'
    },
    {
      key: 'acceleration',
      name: '加速性能',
      description: '発進や追い越しで必要な加速応答と車輪トルクを確保する。',
      ref: 'toyotaPowertrain'
    },
    {
      key: 'top-speed',
      name: '最高速',
      description: '高速域で必要出力と空気抵抗打破能力を確保する。今回は主要な機能のみ接続。',
      ref: 'toyotaPowertrain'
    },
    {
      key: 'gradeability',
      name: '登坂性能',
      description: '勾配路で速度を維持できる駆動力と熱余裕を確保する。',
      ref: 'toyotaPowertrain'
    },
    {
      key: 'braking',
      name: '制動性能',
      description: '停止距離、操舵性、姿勢安定を両立して減速できること。',
      ref: 'unR13H'
    },
    {
      key: 'handling',
      name: '操縦安定性',
      description: '操舵に対する応答性と限界域までの安定した車両挙動を確保する。',
      ref: 'saeJ670'
    },
    {
      key: 'ride',
      name: '乗り心地',
      description: 'ばね上加速度や突き上げを抑え、快適に移動できること。',
      ref: 'jsaeRideComfort'
    },
    {
      key: 'nvh',
      name: '静粛性・振動',
      description: '騒音、振動、ショックを抑え、車室品質を高めること。',
      ref: 'mazdaNvh2022'
    },
    {
      key: 'emissions',
      name: '排ガス性能',
      description: '排出ガスを法規水準で抑え、後処理と診断を成立させること。',
      ref: 'epaObd'
    },
    {
      key: 'durability',
      name: '耐久性・信頼性',
      description: '熱、荷重、振動、悪路入力に対して寿命と信頼性を確保する。',
      ref: 'hondaDurability'
    },
    {
      key: 'crash-safety',
      name: '衝突安全',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。'
    },
    {
      key: 'preventive-safety',
      name: '予防安全',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。',
      ref: 'boschEsp'
    },
    {
      key: 'habitability',
      name: '居住性',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。'
    },
    {
      key: 'climate-comfort',
      name: '空調快適性',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。'
    },
    {
      key: 'visibility-operability',
      name: '視認性・操作性',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。'
    },
    {
      key: 'convenience',
      name: '利便性',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。'
    },
    {
      key: 'cost',
      name: 'コスト',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。'
    },
    {
      key: 'serviceability',
      name: '整備性',
      description: 'OBDや診断通信を中心に一部の機能を先行接続している。',
      ref: 'saeJ1979'
    },
    {
      key: 'weight',
      name: '重量',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。'
    },
    {
      key: 'package',
      name: 'パッケージ',
      description: '今回は要求ノードのみ。今後、機能とロジックを展開する。'
    }
  ];

  const elementTree = {
    'パワートレイン': {
      'エンジン': {
        '吸気系': ['エアクリーナ', 'スロットルボディ', 'インテークマニホールド', '吸気圧センサ', 'MAP/過給圧センサ', 'インテークレゾネータ'],
        '燃料供給系': ['フューエルポンプ', '高圧燃料ポンプ', 'インジェクタ', 'ピエゾインジェクタ', 'フューエルレール', 'コモンレール', '燃圧レギュレータ'],
        '点火系': ['点火コイル', 'スパークプラグ', 'クランク角センサ'],
        '潤滑系': ['オイルポンプ', 'オイルパン', 'オイルフィルタ', 'オイル通路'],
        '冷却系': ['ウォータポンプ', 'サーモスタット', 'ラジエータ', '冷却ファン'],
        '排気系': ['エキゾーストマニホールド', '触媒', '三元触媒', 'マフラー', '排気レゾネータ', 'O2センサ'],
        'エンジン本体': ['シリンダブロック', 'シリンダヘッド', 'ピストン', 'コンロッド', 'クランクシャフト'],
        '動弁系': ['VVTアクチュエータ'],
        '過給系': ['ターボチャージャ', 'インタークーラ'],
        '排気後処理系': ['ワイドバンドO2センサ', 'スイッチングO2センサ', 'NOxセンサ', '差圧センサ', 'PMセンサ', 'AdBlueドージングモジュール'],
        'EGR系': ['EGRバルブ'],
        'エンジンマネジメント': ['エンジンECU', 'ノックセンサ'],
        '予熱系': ['グロープラグ'],
        'マウント系': ['液封エンジンマウント', '油圧エンジンマウント']
      },
      'トランスミッション': {
        '変速機構': ['ギアセット', 'シンクロ', 'クラッチパック', 'バルブボディ'],
        'クラッチ/トルコン': ['クラッチディスク', 'プレッシャプレート', 'トルクコンバータ'],
        '制御系': ['回転センサ', '油圧ソレノイド'],
        '変速制御系': ['TCU', 'トランスミッション速度センサ', 'リニアソレノイド', '可変力ソレノイド'],
        '断接/発進機構': ['デュアルマスフライホイール', 'ロックアップクラッチ', '遠心振り子動吸振器']
      },
      '駆動伝達系': {
        'プロペラシャフト': ['シャフト', 'ユニバーサルジョイント'],
        'デファレンシャル': ['リングギア', 'ピニオンギア', 'デフケース'],
        'ドライブシャフト': ['シャフト', 'CVジョイント']
      }
    },
    'シャシー': {
      'ブレーキ': {
        '液圧発生系': ['ブレーキペダル', 'ブレーキブースタ', 'マスタシリンダ', 'リザーバタンク'],
        '車輪制動系': ['キャリパ', 'ブレーキパッド', 'ディスクロータ', 'ドラム/シュー'],
        '制御系': ['ABS ECU', 'ABS/ESC ECU', '車輪速センサ', 'ABS油圧モジュレータ', 'ヨーレートセンサ']
      },
      'ステアリング': {
        '操作入力系': ['ステアリングホイール', 'ステアリングシャフト', 'トルクセンサ', '操舵角センサ'],
        '操舵機構': ['ラック&ピニオン', 'タイロッド', 'ナックル'],
        '電動/油圧アシスト系': ['EPSモータ', 'EPS ECU', '減速機']
      },
      'サスペンション': {
        '前輪懸架': ['ストラット', 'コイルスプリング', 'ロアアーム', 'スタビライザ'],
        '後輪懸架': ['ダンパ', 'スプリング', 'リンク', 'ブッシュ'],
        '懸架機構': ['ダンパ', '可変減衰ダンパ', 'コイルスプリング', 'スタビライザ', 'サスペンションブッシュ', 'サブフレームブッシュ'],
        'マウント系': ['ハイドロマウント']
      },
      'タイヤ・ホイール': {
        'タイヤ': ['タイヤトレッド', 'サイドウォール', 'ビード'],
        'ホイール': ['ホイール', 'リム', 'ディスク']
      }
    },
    'ボディ': {
      '車体構造': {
        'ボディインホワイト': ['フロア', 'サイドメンバ', 'ピラー', 'ルーフ'],
        'クロージャ': ['ドア', 'フード', 'バックドア', 'ヒンジ/ラッチ'],
        'ボディ骨格': ['車体サイドメンバ', 'サスペンションタワー'],
        'ボディ接合': ['スポット溶接継手', '構造用接着継手', 'ボルト締結部'],
        '車体制振系': ['ボディ加速度センサ', 'ボディ制振ダンパ']
      },
      '内装': {
        'インパネ': ['インストルメントパネル', 'スイッチ類', 'メータ'],
        'シート': ['シートフレーム', 'シートクッション', 'クッション', 'シートベルト'],
        'トリム': ['ドアトリム', 'ヘッドライナ', 'カーペット']
      },
      '外装': {
        '灯火類': ['ヘッドランプ', 'テールランプ', 'ウインカ'],
        '外装部品': ['バンパ', 'グリル', 'ミラー']
      }
    },
    'E/E・制御': {
      '電源供給': {
        '発電系': ['オルタネータ', 'レギュレータ', 'ベルト'],
        '蓄電系': ['12Vバッテリ', '端子', 'バッテリセンサ'],
        '配電系': ['ヒューズ', 'リレー', 'ジャンクションボックス'],
        '始動系': ['スタータモータ']
      },
      '車載ネットワーク': {
        '通信系': ['CAN ECU', 'LINノード', 'ゲートウェイECU', 'ハーネス'],
        'センサ/アクチュエータI/F': ['各種センサ', '各種アクチュエータ']
      },
      'ECU群': {
        'パワートレイン制御': ['ECM', 'TCM'],
        'シャシー制御': ['ABS/ESC ECU', 'EPS ECU'],
        'ボディ制御': ['BCM', 'エアコンECU']
      },
      '診断': {
        '診断系': ['OBD ECU', '診断通信ECU']
      }
    },
    '熱マネジメント': {
      'パワートレイン冷却': {
        'エンジン冷却': ['ラジエータ', 'ウォータポンプ', 'サーモスタット'],
        'AT/CVT冷却': ['ATFクーラ', 'ホース']
      },
      '空調': {
        '冷媒回路': ['コンプレッサ', 'コンデンサ', 'エバポレータ', '膨張弁'],
        '空気搬送系': ['ブロアファン', 'ヒータコア', 'ダクト/ダンパ']
      }
    },
    '安全': {
      '受動安全': {
        '乗員拘束': ['エアバッグ', 'シートベルト', 'プリテンショナ'],
        '衝突吸収構造': ['クラッシャブルゾーン', 'サイドインパクトビーム', 'ステアリングコラム']
      },
      '予防安全/ADAS': {
        '認知系': ['前方カメラ', 'ミリ波レーダ', '超音波センサ', '周辺カメラ'],
        '判断系': ['ADAS ECU', '制御ソフト'],
        '介入系': ['ブレーキアクチュエータ', 'EPS', '警報デバイス']
      }
    },
    'HMI・利便': {
      '表示・操作': {
        '表示系': ['メータ', 'センターディスプレイ', 'HUD'],
        '入力系': ['スイッチ', 'タッチパネル', '音声入力マイク']
      },
      'インフォテインメント': {
        '音響': ['ヘッドユニット', 'アンプ', 'スピーカ'],
        '接続': ['Bluetoothモジュール', 'GPSアンテナ', '通信モジュール']
      },
      'ボディ電装': {
        'ワイパ/ウォッシャ': ['ワイパモータ', 'リンク機構', 'ウォッシャポンプ'],
        'パワーウインドウ': ['レギュレータ', 'モータ', 'スイッチ'],
        'ドアロック': ['アクチュエータ', 'ラッチ', 'キー/受信機']
      }
    }
  };

  const PARTS = {
    piston: ['パワートレイン', 'エンジン', 'エンジン本体', 'ピストン'],
    injector: ['パワートレイン', 'エンジン', '燃料供給系', 'インジェクタ'],
    widebandO2: ['パワートレイン', 'エンジン', '排気後処理系', 'ワイドバンドO2センサ'],
    engineEcu: ['パワートレイン', 'エンジン', 'エンジンマネジメント', 'エンジンECU'],
    throttleBody: ['パワートレイン', 'エンジン', '吸気系', 'スロットルボディ'],
    vvtActuator: ['パワートレイン', 'エンジン', '動弁系', 'VVTアクチュエータ'],
    turbocharger: ['パワートレイン', 'エンジン', '過給系', 'ターボチャージャ'],
    mapBoostSensor: ['パワートレイン', 'エンジン', '吸気系', 'MAP/過給圧センサ'],
    oilPump: ['パワートレイン', 'エンジン', '潤滑系', 'オイルポンプ'],
    clutchPack: ['パワートレイン', 'トランスミッション', '変速機構', 'クラッチパック'],
    thermostat: ['パワートレイン', 'エンジン', '冷却系', 'サーモスタット'],
    exhaustManifold: ['パワートレイン', 'エンジン', '排気系', 'エキゾーストマニホールド'],
    starterMotor: ['E/E・制御', '電源供給', '始動系', 'スタータモータ'],
    glowPlug: ['パワートレイン', 'エンジン', '予熱系', 'グロープラグ'],
    tcu: ['パワートレイン', 'トランスミッション', '変速制御系', 'TCU'],
    linearSolenoid: ['パワートレイン', 'トランスミッション', '変速制御系', 'リニアソレノイド'],
    tireTread: ['シャシー', 'タイヤ・ホイール', 'タイヤ', 'タイヤトレッド'],
    lowerArm: ['シャシー', 'サスペンション', '前輪懸架', 'ロアアーム'],
    knockSensor: ['パワートレイン', 'エンジン', 'エンジンマネジメント', 'ノックセンサ'],
    intercooler: ['パワートレイン', 'エンジン', '過給系', 'インタークーラ'],
    highPressureFuelPump: ['パワートレイン', 'エンジン', '燃料供給系', '高圧燃料ポンプ'],
    ignitionCoil: ['パワートレイン', 'エンジン', '点火系', '点火コイル'],
    commonRail: ['パワートレイン', 'エンジン', '燃料供給系', 'コモンレール'],
    piezoInjector: ['パワートレイン', 'エンジン', '燃料供給系', 'ピエゾインジェクタ'],
    gearSet: ['パワートレイン', 'トランスミッション', '変速機構', 'ギアセット'],
    transmissionSpeedSensor: ['パワートレイン', 'トランスミッション', '変速制御系', 'トランスミッション速度センサ'],
    variableForceSolenoid: ['パワートレイン', 'トランスミッション', '変速制御系', '可変力ソレノイド'],
    damper: ['シャシー', 'サスペンション', '懸架機構', 'ダンパ'],
    radiator: ['パワートレイン', 'エンジン', '冷却系', 'ラジエータ'],
    coolingFan: ['パワートレイン', 'エンジン', '冷却系', '冷却ファン'],
    brakeBooster: ['シャシー', 'ブレーキ', '液圧発生系', 'ブレーキブースタ'],
    masterCylinder: ['シャシー', 'ブレーキ', '液圧発生系', 'マスタシリンダ'],
    caliper: ['シャシー', 'ブレーキ', '車輪制動系', 'キャリパ'],
    discRotor: ['シャシー', 'ブレーキ', '車輪制動系', 'ディスクロータ'],
    absModulator: ['シャシー', 'ブレーキ', '制御系', 'ABS油圧モジュレータ'],
    absEscEcu: ['シャシー', 'ブレーキ', '制御系', 'ABS/ESC ECU'],
    wheelSpeedSensor: ['シャシー', 'ブレーキ', '制御系', '車輪速センサ'],
    yawRateSensor: ['シャシー', 'ブレーキ', '制御系', 'ヨーレートセンサ'],
    steeringAngleSensor: ['シャシー', 'ステアリング', '操作入力系', '操舵角センサ'],
    brakePad: ['シャシー', 'ブレーキ', '車輪制動系', 'ブレーキパッド'],
    suspensionBushing: ['シャシー', 'サスペンション', '懸架機構', 'サスペンションブッシュ'],
    steeringShaft: ['シャシー', 'ステアリング', '操作入力系', 'ステアリングシャフト'],
    rackAndPinion: ['シャシー', 'ステアリング', '操舵機構', 'ラック&ピニオン'],
    torqueSensor: ['シャシー', 'ステアリング', '操作入力系', 'トルクセンサ'],
    epsMotor: ['シャシー', 'ステアリング', '電動/油圧アシスト系', 'EPSモータ'],
    tieRod: ['シャシー', 'ステアリング', '操舵機構', 'タイロッド'],
    knuckle: ['シャシー', 'ステアリング', '操舵機構', 'ナックル'],
    stabilizer: ['シャシー', 'サスペンション', '懸架機構', 'スタビライザ'],
    coilSpring: ['シャシー', 'サスペンション', '懸架機構', 'コイルスプリング'],
    variableDamper: ['シャシー', 'サスペンション', '懸架機構', '可変減衰ダンパ'],
    epsEcu: ['シャシー', 'ステアリング', '電動/油圧アシスト系', 'EPS ECU'],
    bodySideMember: ['ボディ', '車体構造', 'ボディ骨格', '車体サイドメンバ'],
    suspensionTower: ['ボディ', '車体構造', 'ボディ骨格', 'サスペンションタワー'],
    hydroMount: ['シャシー', 'サスペンション', 'マウント系', 'ハイドロマウント'],
    liquidEngineMount: ['パワートレイン', 'エンジン', 'マウント系', '液封エンジンマウント'],
    hydraulicEngineMount: ['パワートレイン', 'エンジン', 'マウント系', '油圧エンジンマウント'],
    subframeBushing: ['シャシー', 'サスペンション', '懸架機構', 'サブフレームブッシュ'],
    seatCushion: ['ボディ', '内装', 'シート', 'シートクッション'],
    seatFrame: ['ボディ', '内装', 'シート', 'シートフレーム'],
    bodyAccelerationSensor: ['ボディ', '車体構造', '車体制振系', 'ボディ加速度センサ'],
    wheel: ['シャシー', 'タイヤ・ホイール', 'ホイール', 'ホイール'],
    threeWayCatalyst: ['パワートレイン', 'エンジン', '排気系', '三元触媒'],
    noxSensor: ['パワートレイン', 'エンジン', '排気後処理系', 'NOxセンサ'],
    adblueModule: ['パワートレイン', 'エンジン', '排気後処理系', 'AdBlueドージングモジュール'],
    diffPressureSensor: ['パワートレイン', 'エンジン', '排気後処理系', '差圧センサ'],
    pmSensor: ['パワートレイン', 'エンジン', '排気後処理系', 'PMセンサ'],
    egrValve: ['パワートレイン', 'エンジン', 'EGR系', 'EGRバルブ'],
    switchingO2: ['パワートレイン', 'エンジン', '排気後処理系', 'スイッチングO2センサ'],
    crankAngleSensor: ['パワートレイン', 'エンジン', '点火系', 'クランク角センサ'],
    obdEcu: ['E/E・制御', '診断', '診断系', 'OBD ECU'],
    diagnosticCommEcu: ['E/E・制御', '診断', '診断系', '診断通信ECU'],
    airCleaner: ['パワートレイン', 'エンジン', '吸気系', 'エアクリーナ'],
    intakeResonator: ['パワートレイン', 'エンジン', '吸気系', 'インテークレゾネータ'],
    exhaustResonator: ['パワートレイン', 'エンジン', '排気系', '排気レゾネータ'],
    muffler: ['パワートレイン', 'エンジン', '排気系', 'マフラー'],
    dualMassFlywheel: ['パワートレイン', 'トランスミッション', '断接/発進機構', 'デュアルマスフライホイール'],
    lockupClutch: ['パワートレイン', 'トランスミッション', '断接/発進機構', 'ロックアップクラッチ'],
    bodyDampingDamper: ['ボディ', '車体構造', '車体制振系', 'ボディ制振ダンパ'],
    pendulumAbsorber: ['パワートレイン', 'トランスミッション', '断接/発進機構', '遠心振り子動吸振器'],
    spotWeldJoint: ['ボディ', '車体構造', 'ボディ接合', 'スポット溶接継手'],
    structuralAdhesiveJoint: ['ボディ', '車体構造', 'ボディ接合', '構造用接着継手'],
    boltJoint: ['ボディ', '車体構造', 'ボディ接合', 'ボルト締結部'],
    oilFilter: ['パワートレイン', 'エンジン', '潤滑系', 'オイルフィルタ']
  };

  const groupDefinitions = [
    {
      key: 'fuel',
      requirements: ['燃費'],
      ref: 'toyotaPowertrain',
      functions: [
        {
          key: 'thermal-efficiency',
          name: '燃焼熱効率を高める',
          logics: [
            { key: 'high-compression', name: '高圧縮比で有効膨張比を増やす', ref: 'jsaeHighCompression', path: PARTS.piston },
            { key: 'direct-injection-cooling', name: '直噴で筒内冷却を使いノック余裕を確保する', ref: 'toyotaDirectInjection', path: PARTS.injector }
          ]
        },
        {
          key: 'air-fuel-precision',
          name: '空燃比を高精度に維持する',
          ref: 'boschWidebandLambda',
          logics: [
            { key: 'closed-loop-o2', name: '残留酸素を計測して閉ループ補正する', path: PARTS.widebandO2 },
            { key: 'transient-mpc', name: '過渡空燃比をモデル予測で補償する', ref: 'jsaeModelPredictiveAF', path: PARTS.engineEcu }
          ]
        },
        {
          key: 'pumping-loss',
          name: 'ポンピング損失を下げる',
          logics: [
            { key: 'electronic-throttle', name: '電子スロットルで吸気絞りを最小化する', path: PARTS.throttleBody },
            { key: 'internal-egr-vvt', name: '内部EGR/VVTでスロットル開度要求を緩和する', path: PARTS.vvtActuator }
          ]
        },
        {
          key: 'volumetric-efficiency',
          name: '吸気充填効率を高める',
          logics: [
            { key: 'boost-control', name: '過給圧を制御して空気量を増やす', path: PARTS.turbocharger },
            { key: 'map-temp-correction', name: '吸気圧と温度を計測して噴射量を補正する', ref: 'boschMapBoost', path: PARTS.mapBoostSensor }
          ]
        },
        {
          key: 'mechanical-loss',
          name: '機械損失を下げる',
          logics: [
            { key: 'oil-pressure-demand', name: '油圧を需要に合わせて最小化する', path: PARTS.oilPump },
            { key: 'clutch-friction-loss', name: 'クラッチ摩擦損失を低減する', path: PARTS.clutchPack }
          ]
        },
        {
          key: 'heat-loss',
          name: '熱損失を下げる',
          logics: [
            { key: 'coolant-demand-control', name: '冷却流量を需要制御して過冷却を避ける', path: PARTS.thermostat },
            { key: 'integrated-manifold-warmup', name: '排気一体マニで暖機を早める', path: PARTS.exhaustManifold }
          ]
        },
        {
          key: 'warmup-idle-loss',
          name: '暖機・アイドル損失を減らす',
          logics: [
            { key: 'idle-stop', name: 'アイドル停止で無駄燃焼を止める', path: PARTS.starterMotor },
            { key: 'preheat-cold-start', name: '予熱で冷間時の未燃と騒音を抑える', ref: 'toyotaDieselScr', path: PARTS.glowPlug }
          ]
        },
        {
          key: 'shift-efficiency',
          name: '変速効率を高める',
          logics: [
            { key: 'optimal-shift-point', name: '最適変速点を選択して高効率域を使う', path: PARTS.tcu },
            { key: 'precision-clutch-pressure', name: 'ソレノイドでクラッチ圧を精密制御する', ref: 'boschLinearSolenoid', path: PARTS.linearSolenoid }
          ]
        },
        {
          key: 'tractive-force-reduction',
          name: '必要駆動力そのものを下げる',
          logics: [
            { key: 'rolling-resistance', name: '低転がり抵抗で損失を下げる', path: PARTS.tireTread },
            { key: 'alignment', name: 'アライメントで転がりと抗力を抑える', ref: 'zfChassis', path: PARTS.lowerArm }
          ]
        },
        {
          key: 'knock-margin',
          name: 'ノック限界を拡大する',
          logics: [
            { key: 'knock-feedback', name: 'ノック信号で点火を最適化する', ref: 'toyotaDirectInjection', path: PARTS.knockSensor },
            { key: 'intake-charge-cooling', name: '吸気冷却で自己着火を避ける', path: PARTS.intercooler }
          ]
        }
      ]
    },
    {
      key: 'accel',
      requirements: ['加速性能', '登坂性能'],
      ref: 'toyotaPowertrain',
      functions: [
        {
          key: 'low-speed-torque',
          name: '低速域で高トルクを発生する',
          logics: [
            { key: 'gdi-charge-cooling', name: '直噴で充填冷却を得てトルクを上げる', ref: 'boschGdi', path: PARTS.injector },
            { key: 'low-speed-boost', name: '低速過給で筒内空気量を増やす', path: PARTS.turbocharger }
          ]
        },
        {
          key: 'air-charge-response',
          name: '吸気量を素早く立ち上げる',
          logics: [
            { key: 'throttle-response', name: '電子スロットルで開度応答を作る', path: PARTS.throttleBody },
            { key: 'vvt-charge-control', name: '動弁タイミングで残留ガスと充填を調整する', path: PARTS.vvtActuator }
          ]
        },
        {
          key: 'fuel-delivery-response',
          name: '燃料を必要量だけ高速供給する',
          logics: [
            { key: 'high-pressure-build', name: '高圧ポンプで噴射圧を構築する', ref: 'boschGdi', path: PARTS.highPressureFuelPump },
            { key: 'fast-injection-split', name: '噴射時期と量を分解して出力を立ち上げる', ref: 'boschGdi', path: PARTS.injector }
          ]
        },
        {
          key: 'combustion-phase',
          name: '点火・燃焼位相を最適化する',
          logics: [
            { key: 'high-energy-ignition', name: '高エネルギ点火で失火余裕を増やす', ref: 'boschEngineEcu', path: PARTS.ignitionCoil },
            { key: 'spark-advance-knock-limit', name: 'ノック限界まで進角してIMEPを稼ぐ', ref: 'toyotaDirectInjection', path: PARTS.knockSensor }
          ]
        },
        {
          key: 'diesel-response',
          name: 'ディーゼル燃焼を応答良く制御する',
          ref: 'toyotaDieselScr',
          logics: [
            { key: 'rail-pressure-timing', name: 'レール圧と噴射時期を独立制御する', path: PARTS.commonRail },
            { key: 'piezo-split-injection', name: '分割噴射で圧力上昇とトルク応答を両立する', path: PARTS.piezoInjector }
          ]
        },
        {
          key: 'boost-heat-management',
          name: '過給熱を管理して持続出力を確保する',
          logics: [
            { key: 'charge-air-cooling', name: '中間冷却で吸気密度低下を抑える', path: PARTS.intercooler },
            { key: 'boost-monitoring', name: '過給圧温を監視して保護補正する', ref: 'boschMapBoost', path: PARTS.mapBoostSensor }
          ]
        },
        {
          key: 'ratio-selection',
          name: '変速比を登坂条件へ合わせる',
          ref: 'boschTransmissionSensors',
          logics: [
            { key: 'gear-switching', name: 'ギヤ段を切り替えて車輪トルクを増幅する', path: PARTS.gearSet },
            { key: 'speed-sensing', name: '入力/出力回転を測って最適段を選ぶ', path: PARTS.transmissionSpeedSensor }
          ]
        },
        {
          key: 'slip-suppression',
          name: '発進・変速時の滑りを抑える',
          logics: [
            { key: 'torque-based-clutch-control', name: 'クラッチ圧をトルクベースで制御する', ref: 'boschLinearSolenoid', path: PARTS.linearSolenoid },
            { key: 'pilot-pressure-adjust', name: 'パイロット圧で滑りを微調整する', ref: 'boschTransmissionSensors', path: PARTS.variableForceSolenoid }
          ]
        },
        {
          key: 'traction-contact',
          name: '駆動輪の接地を維持する',
          ref: 'kybDamperReport',
          logics: [
            { key: 'damping-load-variation', name: '減衰力で荷重変動を抑える', path: PARTS.damper },
            { key: 'tread-longitudinal-force', name: 'トレッドで縦力を路面へ伝える', path: PARTS.tireTread }
          ]
        },
        {
          key: 'thermal-protection',
          name: '熱保護で継続登坂性能を守る',
          logics: [
            { key: 'radiator-heat-balance', name: '冷却器で熱収支を保つ', path: PARTS.radiator },
            { key: 'fan-airflow', name: '送風量を増やして放熱を支える', path: PARTS.coolingFan }
          ]
        }
      ]
    },
    {
      key: 'brake',
      requirements: ['制動性能'],
      ref: 'boschAbs',
      functions: [
        {
          key: 'pedal-to-hydraulic',
          name: '踏力を液圧へ変換する',
          logics: [
            { key: 'booster-amplification', name: '倍力でペダル入力を増幅する', path: PARTS.brakeBooster },
            { key: 'master-cylinder-pressure', name: '液圧を発生して系へ分配する', path: PARTS.masterCylinder }
          ]
        },
        {
          key: 'wheel-friction',
          name: '各輪で摩擦制動力を発生する',
          logics: [
            { key: 'caliper-clamp-force', name: '油圧をクランプ力へ変換する', path: PARTS.caliper },
            { key: 'rotor-heat-conversion', name: '摩擦で運動エネルギーを熱へ変える', path: PARTS.discRotor }
          ]
        },
        {
          key: 'brake-force-distribution',
          name: '制動力配分を最適化する',
          logics: [
            { key: 'ideal-distribution', name: '前後輪の理想配分へ近づける', path: PARTS.absModulator },
            { key: 'distribution-logic', name: '制動要求を配分ロジックへ変換する', ref: 'boschEsp', path: PARTS.absEscEcu }
          ]
        },
        {
          key: 'anti-lock',
          name: '車輪ロックを防ぐ',
          logics: [
            { key: 'slip-estimation', name: '各輪回転を監視して滑り率を推定する', ref: 'boschEsp', path: PARTS.wheelSpeedSensor },
            { key: 'pressure-release', name: 'ロック兆候輪の圧力を逃がす', path: PARTS.absModulator }
          ]
        },
        {
          key: 'yaw-stabilization',
          name: '車両姿勢を安定化する',
          ref: 'boschEsp',
          logics: [
            { key: 'yaw-comparison', name: 'ヨー応答を目標軌跡と比較する', path: PARTS.yawRateSensor },
            { key: 'driver-intent', name: '運転者意図を操舵角で把握する', path: PARTS.steeringAngleSensor }
          ]
        },
        {
          key: 'low-mu-steerability',
          name: '低μ路でも操舵性を残す',
          logics: [
            { key: 'independent-pressure-control', name: '単輪ごとに液圧を独立減圧する', path: PARTS.absModulator },
            { key: 'friction-utilization', name: 'ロック限界に合わせて摩擦利用率を合わせる', ref: 'unR13H', path: PARTS.tireTread }
          ]
        },
        {
          key: 'fade-resistance',
          name: 'フェードを抑える',
          logics: [
            { key: 'rotor-radiation', name: '放熱面積で温度上昇を抑える', path: PARTS.discRotor },
            { key: 'pad-temperature-stability', name: '摩擦材で高温時の摩擦低下を抑える', path: PARTS.brakePad }
          ]
        },
        {
          key: 'pedal-feel',
          name: 'ペダルフィールを整える',
          logics: [
            { key: 'boost-pressure-shaping', name: '倍力と圧力立ち上がりを一体制御する', path: PARTS.brakeBooster },
            { key: 'rigid-hydraulic-response', name: '液圧応答を剛体的に作る', path: PARTS.masterCylinder }
          ]
        },
        {
          key: 'failsafe-diagnostics',
          name: 'フェイルセーフと診断を行う',
          ref: 'boschEsp',
          logics: [
            { key: 'sensor-cross-check', name: 'センサ故障を相互監視する', path: PARTS.wheelSpeedSensor },
            { key: 'safe-state-limitation', name: '安全要求に従って故障時機能を制限する', path: PARTS.absEscEcu }
          ]
        },
        {
          key: 'hold-control',
          name: '駐車保持と坂道保持を行う',
          ref: 'boschEsp',
          logics: [
            { key: 'holding-force', name: '保持圧または機械保持力を発生する', path: PARTS.brakeBooster },
            { key: 'stop-posture-stability', name: '前後配分を保って停止姿勢を安定させる', path: PARTS.absEscEcu }
          ]
        }
      ]
    },
    {
      key: 'handling',
      requirements: ['操縦安定性'],
      ref: 'saeJ670',
      functions: [
        {
          key: 'understeer-target',
          name: '目標アンダーステアを設定する',
          logics: [
            { key: 'lateral-force-balance', name: '前後輪横力差で定常旋回特性を作る', path: PARTS.tireTread },
            { key: 'compliance-steer', name: 'コンプライアンスで実舵角変化を調整する', ref: 'zfChassis', path: PARTS.suspensionBushing }
          ]
        },
        {
          key: 'steering-transmission',
          name: '操舵入力を正確に伝える',
          ref: 'boschEps',
          logics: [
            { key: 'shaft-transmission', name: '操舵トルクを機械系へ伝える', path: PARTS.steeringShaft },
            { key: 'rack-conversion', name: '回転運動をラック変位へ変換する', path: PARTS.rackAndPinion }
          ]
        },
        {
          key: 'eps-assist',
          name: 'EPSアシスト量を最適化する',
          ref: 'boschEps',
          logics: [
            { key: 'torque-measurement', name: '入力トルクを計測して支援量を決める', path: PARTS.torqueSensor },
            { key: 'assist-generation', name: '電動アシストを発生して操舵負荷を整える', path: PARTS.epsMotor }
          ]
        },
        {
          key: 'alignment-management',
          name: 'アライメント変化を管理する',
          ref: 'zfChassis',
          logics: [
            { key: 'toe-change-control', name: 'タイロッド長と軌跡でトー変化を制御する', path: PARTS.tieRod },
            { key: 'kingpin-scrub', name: 'ナックル形状でキングピン/スクラブを決める', path: PARTS.knuckle }
          ]
        },
        {
          key: 'roll-stiffness',
          name: 'ロール剛性配分を最適化する',
          logics: [
            { key: 'anti-roll-coupling', name: '左右輪を連成してロールを抑える', ref: 'zfChassis', path: PARTS.stabilizer },
            { key: 'spring-rate-balance', name: 'ばね定数で荷重移動配分を作る', ref: 'kybDamperReport', path: PARTS.coilSpring }
          ]
        },
        {
          key: 'transient-damping',
          name: '減衰で過渡応答を整える',
          ref: 'kybDamperReport',
          logics: [
            { key: 'yaw-convergence', name: '伸び/縮み減衰でヨー収束を整える', path: PARTS.damper },
            { key: 'band-tuning', name: '路面入力帯ごとに減衰をチューニングする', path: PARTS.variableDamper }
          ]
        },
        {
          key: 'straight-line-stability',
          name: '直進安定性を確保する',
          ref: 'saeJ670',
          logics: [
            { key: 'caster-trail', name: 'キャスタとトレールで復元性を持たせる', path: PARTS.knuckle },
            { key: 'speed-dependent-assist', name: '速度依存の操舵アシストを与える', ref: 'boschEps', path: PARTS.epsEcu }
          ]
        },
        {
          key: 'contact-patch',
          name: '接地性を維持する',
          logics: [
            { key: 'camber-control', name: 'リンク配置でキャンバ変化を制御する', ref: 'zfChassis', path: PARTS.lowerArm },
            { key: 'pressure-distribution', name: 'タイヤ接地圧分布を保持する', path: PARTS.tireTread }
          ]
        },
        {
          key: 'body-stiffness-response',
          name: '車体剛性で応答遅れを抑える',
          ref: 'mazdaBody2020',
          logics: [
            { key: 'load-path-stiffness', name: 'サイドメンバ剛性で荷重経路変形を抑える', path: PARTS.bodySideMember },
            { key: 'support-point-shift', name: 'サスペンション支持点の相対変位を減らす', path: PARTS.suspensionTower }
          ]
        },
        {
          key: 'esc-assist',
          name: '限界域をESCで補助する',
          ref: 'boschEsp',
          logics: [
            { key: 'yaw-deviation-detection', name: 'ヨー偏差を検出して単輪制動介入する', path: PARTS.yawRateSensor },
            { key: 'brake-steer-coordination', name: 'アシスト操舵とブレーキを協調する', path: PARTS.absEscEcu }
          ]
        }
      ]
    },
    {
      key: 'ride',
      requirements: ['乗り心地'],
      ref: 'jsaeRideComfort',
      functions: [
        {
          key: 'sprung-accel-reduction',
          name: 'ばね上加速度を低減する',
          logics: [
            { key: 'spring-isolation', name: 'ばねで低周波入力を遮断する', path: PARTS.coilSpring },
            { key: 'damping-resonance', name: '減衰で共振振幅を抑える', path: PARTS.damper }
          ]
        },
        {
          key: 'frequency-separation',
          name: '入力周波数帯を分離する',
          logics: [
            { key: 'hydraulic-mount-isolation', name: '液封部で周波数依存の絶縁を作る', ref: 'zfChassis', path: PARTS.hydroMount },
            { key: 'engine-mount-band-balance', name: 'エンジンマウントでアイドル帯と走行帯を両立する', ref: 'mazdaNvh2022', path: PARTS.liquidEngineMount }
          ]
        },
        {
          key: 'pitch-bounce-control',
          name: 'ピッチ・バウンスを抑える',
          ref: 'kybDamperReport',
          logics: [
            { key: 'front-rear-damping-balance', name: '前後減衰配分でピッチを制御する', path: PARTS.damper },
            { key: 'front-rear-spring-balance', name: '前後ばね配分で車体姿勢変化を抑える', path: PARTS.coilSpring }
          ]
        },
        {
          key: 'bump-softening',
          name: '突起入力を和らげる',
          logics: [
            { key: 'progressive-spring-force', name: '高ストローク入力で漸増反力を作る', ref: 'kybDamperReport', path: PARTS.coilSpring },
            { key: 'valve-shock-shaping', name: '減衰弁で衝撃入力の立上りを丸める', path: PARTS.damper }
          ]
        },
        {
          key: 'settling-speed',
          name: '段差後の収束を早める',
          ref: 'kybDamperReport',
          logics: [
            { key: 'rebound-control', name: 'リバウンド減衰で揺り返しを止める', path: PARTS.damper },
            { key: 'bushing-tail-shortening', name: 'ブッシュ減衰で高周波尾を短くする', ref: 'zfChassis', path: PARTS.suspensionBushing }
          ]
        },
        {
          key: 'seat-transmission-reduction',
          name: '着座面への伝達を減らす',
          ref: 'mazdaNvh2022',
          logics: [
            { key: 'cushion-distribution', name: 'クッションで座面加速度を分散する', path: PARTS.seatCushion },
            { key: 'frame-resonance-avoidance', name: 'フレーム剛性で局所共振を避ける', path: PARTS.seatFrame }
          ]
        },
        {
          key: 'body-load-distribution',
          name: '路面入力を車体に分散する',
          logics: [
            { key: 'subframe-isolation', name: 'サブフレーム絶縁で入力経路を分離する', ref: 'zfChassis', path: PARTS.subframeBushing },
            { key: 'skeleton-distribution', name: '骨格剛性で局所変形を広範囲へ分配する', ref: 'mazdaBody2020', path: PARTS.bodySideMember }
          ]
        },
        {
          key: 'body-flex-suppression',
          name: '車体たわみを抑える',
          ref: 'mazdaBody2020',
          logics: [
            { key: 'torsional-stiffness', name: 'ねじり剛性を上げて共振周波数を上げる', path: PARTS.bodySideMember },
            { key: 'support-rigidity', name: '支持点剛性でサスペンション入力を正確化する', path: PARTS.suspensionTower }
          ]
        },
        {
          key: 'adaptive-damping',
          name: '可変減衰で状況適応する',
          ref: 'jsaeRideComfort',
          logics: [
            { key: 'state-based-switching', name: '車体状態に応じて減衰力を切替える', path: PARTS.variableDamper },
            { key: 'body-motion-feedback', name: 'ばね上挙動を監視して減衰を補正する', path: PARTS.bodyAccelerationSensor }
          ]
        },
        {
          key: 'unsprung-mass',
          name: '非ばね質量の悪影響を抑える',
          ref: 'kybDamperReport',
          logics: [
            { key: 'wheel-mass-reduction', name: 'ホイール質量を抑えて追従性を上げる', path: PARTS.wheel },
            { key: 'link-mass-reduction', name: 'リンク質量を抑えて入力伝達を減らす', ref: 'zfChassis', path: PARTS.lowerArm }
          ]
        }
      ]
    },
    {
      key: 'emissions',
      requirements: ['排ガス性能'],
      ref: 'epaObd',
      functions: [
        {
          key: 'stoichiometric-control',
          name: '量論運転を維持して三元触媒を機能させる',
          ref: 'boschWidebandLambda',
          logics: [
            { key: 'af-closed-loop', name: '残留酸素を計測してA/Fを閉ループ制御する', path: PARTS.widebandO2 },
            { key: 'three-way-window', name: '量論近傍で三元反応を成立させる', path: PARTS.threeWayCatalyst }
          ]
        },
        {
          key: 'catalyst-temperature',
          name: '触媒温度窓を維持する',
          logics: [
            { key: 'close-coupled-warmup', name: '近接配置で暖機を早める', path: PARTS.threeWayCatalyst },
            { key: 'warmup-control-correction', name: '排気情報で暖機制御を補正する', ref: 'boschEngineEcu', path: PARTS.engineEcu }
          ]
        },
        {
          key: 'scr-nox-reduction',
          name: 'ディーゼルNOxをSCRで低減する',
          ref: 'toyotaDieselScr',
          logics: [
            { key: 'nox-measurement', name: 'NOx濃度を計測して尿素量を決める', path: PARTS.noxSensor },
            { key: 'urea-dosing', name: '尿素水を精密噴射して還元反応を起こす', path: PARTS.adblueModule }
          ]
        },
        {
          key: 'dpf-regeneration',
          name: 'DPF負荷を監視して再生する',
          ref: 'toyotaDieselScr',
          logics: [
            { key: 'delta-pressure-soot', name: '前後差圧から堆積量を推定する', path: PARTS.diffPressureSensor },
            { key: 'pm-filter-monitor', name: '粒子センサでフィルタ機能を監視する', path: PARTS.pmSensor }
          ]
        },
        {
          key: 'egr-control',
          name: 'EGR率を適正化する',
          ref: 'boschEngineEcu',
          logics: [
            { key: 'egr-flow-estimation', name: '差圧で循環流量を推定する', path: PARTS.diffPressureSensor },
            { key: 'egr-valve-control', name: 'バルブ開度で再循環量を調整する', path: PARTS.egrValve }
          ]
        },
        {
          key: 'misfire-protection',
          name: '失火を検知して触媒を保護する',
          ref: 'boschEngineEcu',
          logics: [
            { key: 'crank-fluctuation-detection', name: 'クランク速度変動から失火を検出する', path: PARTS.crankAngleSensor },
            { key: 'protective-transition', name: '失火時に燃焼制御を保護側へ遷移する', path: PARTS.engineEcu }
          ]
        },
        {
          key: 'sensor-self-check',
          name: 'センサ劣化を自己監視する',
          ref: 'epaObd',
          logics: [
            { key: 'o2-response-monitor', name: 'O2センサの応答低下を監視する', path: PARTS.switchingO2 },
            { key: 'nox-dtc', name: 'NOxセンサ異常を診断してDTC化する', path: PARTS.noxSensor }
          ]
        },
        {
          key: 'obd-communication',
          name: '故障コードを保存し外部通信する',
          ref: 'saeJ1979',
          logics: [
            { key: 'pid-mode-readout', name: '標準PID/モードで状態を読出す', path: PARTS.obdEcu },
            { key: 'service-tool-connection', name: '規格化通信で整備機と接続する', path: PARTS.diagnosticCommEcu }
          ]
        },
        {
          key: 'cold-start-emissions',
          name: '冷間始動時の排出を抑える',
          ref: 'toyotaDieselScr',
          logics: [
            { key: 'preheat-stability', name: '予熱で着火と燃焼安定を確保する', path: PARTS.glowPlug },
            { key: 'warmup-hc-co-control', name: '暖機制御でHC/CO増加を抑える', ref: 'boschEngineEcu', path: PARTS.engineEcu }
          ]
        },
        {
          key: 'aftertreatment-coordination',
          name: '後処理全体を協調制御する',
          ref: 'epaObd',
          logics: [
            { key: 'aftertreatment-actuation', name: '後処理アクチュエータを統合制御する', ref: 'boschEngineEcu', path: PARTS.engineEcu },
            { key: 'state-estimation-switching', name: 'センサ群から状態推定して再生/還元を切替える', path: PARTS.diffPressureSensor }
          ]
        }
      ]
    },
    {
      key: 'nvh',
      requirements: ['静粛性・振動'],
      ref: 'mazdaNvh2022',
      functions: [
        {
          key: 'combustion-noise',
          name: '燃焼騒音を低減する',
          logics: [
            { key: 'knock-retard', name: 'ノック周波数を検知して点火を遅角する', ref: 'toyotaDirectInjection', path: PARTS.knockSensor },
            { key: 'pressure-rise-control', name: '筒内圧上昇率を制御して耳障り音を下げる', ref: 'boschEngineEcu', path: PARTS.ignitionCoil }
          ]
        },
        {
          key: 'diesel-noise',
          name: 'ディーゼル燃焼の騒音を滑らかにする',
          ref: 'toyotaDieselScr',
          logics: [
            { key: 'split-injection-smoothing', name: '分割噴射で熱発生率を平滑化する', path: PARTS.piezoInjector },
            { key: 'cold-preheat-consistency', name: '予熱で冷間燃焼のばらつきを減らす', path: PARTS.glowPlug }
          ]
        },
        {
          key: 'engine-vibration-isolation',
          name: 'エンジン振動を車体へ伝えにくくする',
          ref: 'mazdaNvh2022',
          logics: [
            { key: 'liquid-mount-isolation', name: '液封マウントで低周波振動を絶縁する', path: PARTS.liquidEngineMount },
            { key: 'mount-resonance-shift', name: 'マウント固有値をずらして共振を避ける', path: PARTS.hydraulicEngineMount }
          ]
        },
        {
          key: 'torsional-vibration',
          name: 'ねじり振動を抑える',
          logics: [
            { key: 'dual-mass-absorption', name: '二重慣性系でトルク脈動を吸収する', path: PARTS.dualMassFlywheel },
            { key: 'launch-damping', name: '発進要素のダンピングで回転むらを減らす', path: PARTS.lockupClutch }
          ]
        },
        {
          key: 'intake-noise',
          name: '吸気騒音を低減する',
          logics: [
            { key: 'air-cleaner-pulsation', name: 'フィルタ容積で吸気脈動を減衰する', path: PARTS.airCleaner },
            { key: 'intake-resonator', name: 'レゾネータで特定周波数を打ち消す', path: PARTS.intakeResonator }
          ]
        },
        {
          key: 'exhaust-noise',
          name: '排気騒音を低減する',
          logics: [
            { key: 'muffler-expansion', name: '膨張室で圧力脈動を減衰する', path: PARTS.muffler },
            { key: 'exhaust-resonator', name: '副共鳴器で卓越音を打ち消す', path: PARTS.exhaustResonator }
          ]
        },
        {
          key: 'road-noise',
          name: '路面騒音を低減する',
          ref: 'kybDamperReport',
          logics: [
            { key: 'tire-input-transmission', name: '減衰力でタイヤ入力の車体伝達を弱める', path: PARTS.damper },
            { key: 'high-frequency-isolation', name: 'ハイドロマウントで高周波を遮断する', ref: 'zfChassis', path: PARTS.hydroMount }
          ]
        },
        {
          key: 'body-resonance',
          name: 'ボディ共振を抑える',
          ref: 'mazdaBody2020',
          logics: [
            { key: 'skeleton-stiffness', name: '骨格剛性で共振周波数を上げる', path: PARTS.bodySideMember },
            { key: 'body-damper', name: '制振ダンパで応答ピークを削る', path: PARTS.bodyDampingDamper }
          ]
        },
        {
          key: 'low-speed-vibration',
          name: '気筒休止や低回転時の振動を抑える',
          ref: 'mazdaNvh2022',
          logics: [
            { key: 'pendulum-absorber', name: '遠心振り子で励振次数を打ち消す', path: PARTS.pendulumAbsorber },
            { key: 'half-order-isolation', name: 'マウント系で半次振動の伝達を減らす', path: PARTS.liquidEngineMount }
          ]
        },
        {
          key: 'start-stop-shock',
          name: '始動・停止ショックを抑える',
          logics: [
            { key: 'inertia-damper', name: '慣性ダンパで切離し時の衝撃を緩和する', path: PARTS.dualMassFlywheel },
            { key: 'clutch-engagement-control', name: '発進要素の締結制御でショックを抑える', path: PARTS.clutchPack }
          ]
        }
      ]
    },
    {
      key: 'durability',
      requirements: ['耐久性・信頼性'],
      ref: 'hondaDurability',
      functions: [
        {
          key: 'load-path-distribution',
          name: '荷重経路を分散して局所応力を下げる',
          ref: 'mazdaBody2020',
          logics: [
            { key: 'multiple-load-paths', name: '骨格部材で入力を複数経路へ逃がす', path: PARTS.bodySideMember },
            { key: 'support-point-stiffness', name: '支持点剛性で応力集中を避ける', path: PARTS.suspensionTower }
          ]
        },
        {
          key: 'spot-weld-fatigue',
          name: 'スポット溶接継手の疲労寿命を確保する',
          ref: 'jsaeSpotWeld',
          logics: [
            { key: 'nugget-dimension', name: 'ナゲット寸法と位置で公称構造応力を下げる', path: PARTS.spotWeldJoint },
            { key: 'overload-history', name: '過大荷重履歴を考慮して限度を見積もる', path: PARTS.spotWeldJoint }
          ]
        },
        {
          key: 'adhesive-fastener-durability',
          name: '接着・締結の耐久性を確保する',
          ref: 'mazdaBody2020',
          logics: [
            { key: 'adhesive-load-distribution', name: '荷重分散でせん断集中を下げる', path: PARTS.structuralAdhesiveJoint },
            { key: 'fastener-variation-control', name: '締結ばらつきを吸収してガタ進展を防ぐ', path: PARTS.boltJoint }
          ]
        },
        {
          key: 'suspension-load-definition',
          name: 'サスペンション部材の耐久荷重を正しく設定する',
          ref: 'iso8608',
          logics: [
            { key: 'road-psd-representation', name: '路面PSD/デジタル路面で入力を代表化する', path: PARTS.lowerArm },
            { key: 'combined-load-reproduction', name: 'ABS制動やポットホール複合負荷を再現する', path: PARTS.knuckle }
          ]
        },
        {
          key: 'rough-road-fatigue',
          name: '悪路入力に対する車体疲労を予測する',
          ref: 'hondaDurability',
          logics: [
            { key: 'full-vehicle-analysis', name: 'フルビークル解析で支持点入力を求める', path: PARTS.suspensionTower },
            { key: 'input-path-contribution', name: '寄与の高い入力経路を抽出して対策する', ref: 'mazdaBody2020', path: PARTS.bodySideMember }
          ]
        },
        {
          key: 'thermal-aging',
          name: '熱負荷による劣化を抑える',
          ref: 'toyotaDieselScr',
          logics: [
            { key: 'dpf-overheat-avoidance', name: 'DPF負荷監視で過熱再生を避ける', path: PARTS.diffPressureSensor },
            { key: 'continuous-load-cooling', name: '冷却系で連続高負荷の温度上昇を制限する', path: PARTS.radiator }
          ]
        },
        {
          key: 'lubrication-wear',
          name: '潤滑枯渇と摩耗を防ぐ',
          ref: 'toyotaPowertrain',
          logics: [
            { key: 'oil-pressure-monitor', name: '油圧を監視して供給不足を防ぐ', path: PARTS.oilPump },
            { key: 'contamination-removal', name: '汚染物を除去して摩耗進展を抑える', path: PARTS.oilFilter }
          ]
        },
        {
          key: 'bush-mount-life',
          name: 'ブッシュ・マウント寿命を確保する',
          ref: 'mazdaNvh2022',
          logics: [
            { key: 'frequency-dependent-deformation', name: '周波数依存減衰で過大変形を避ける', ref: 'zfChassis', path: PARTS.hydroMount },
            { key: 'support-resonance-avoidance', name: 'エンジン支持系の共振を外して亀裂を防ぐ', path: PARTS.liquidEngineMount }
          ]
        },
        {
          key: 'damper-spring-life',
          name: 'ダンパ・ばねの寿命余裕を確保する',
          ref: 'kybDamperReport',
          logics: [
            { key: 'real-road-load-management', name: '実走相当入力でシール/バルブ負荷を管理する', path: PARTS.damper },
            { key: 'spring-settling', name: '設計荷重範囲でへたりを抑える', path: PARTS.coilSpring }
          ]
        },
        {
          key: 'early-detection',
          name: '診断で損傷進展を早期把握する',
          ref: 'saeJ1979',
          logics: [
            { key: 'dtc-maintenance-link', name: '故障コードで閾値超過を保全へつなぐ', path: PARTS.obdEcu },
            { key: 'lifecycle-fault-management', name: '安全関連故障をライフサイクルで管理する', path: PARTS.diagnosticCommEcu }
          ]
        }
      ]
    }
  ];

  const extraRequirementLinks = [
    {
      requirement: '最高速',
      strength: 'mid',
      functionKeys: ['accel:air-charge-response', 'accel:combustion-phase', 'accel:boost-heat-management']
    },
    {
      requirement: '整備性',
      strength: 'strong',
      functionKeys: ['emissions:sensor-self-check', 'emissions:obd-communication', 'durability:early-detection']
    }
  ];

  const nodes = [];
  const links = [];
  const nodeIds = new Set();
  const linkIds = new Set();
  const componentPathToId = new Map();
  const requirementNameToId = new Map();
  const functionKeyToId = new Map();

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[・/]/g, '-')
      .replace(/&/g, 'and')
      .replace(/[^\p{Letter}\p{Number}\-_]+/gu, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function makeNodeOptions(description, refKey) {
    const options = {};
    if (description) options.description = description;
    const ref = refKey ? SOURCES[refKey] : null;
    if (ref) {
      options.refUrl = ref.url;
      options.refLabel = ref.label || 'src';
    }
    return options;
  }

  function addNode(id, name, colKey, options) {
    if (nodeIds.has(id)) return id;
    const node = { id: id, name: name, colKey: colKey };
    if (options && options.description) node.description = options.description;
    if (options && options.refUrl) {
      node.refUrl = options.refUrl;
      node.refLabel = options.refLabel || 'src';
    }
    nodes.push(node);
    nodeIds.add(id);
    return id;
  }

  function addLink(fromId, toId, strength) {
    if (!fromId || !toId || fromId === toId) return;
    const key = fromId + '>' + toId;
    if (linkIds.has(key)) return;
    links.push({
      fromId: fromId,
      toId: toId,
      strength: strength || 'strong'
    });
    linkIds.add(key);
  }

  function buildElementTree() {
    const carId = addNode(
      'car-ice',
      'ICE車',
      'car',
      makeNodeOptions('一般的な乗用ICE車を前提にした要素側の基本構成。', 'toyotaPowertrain')
    );

    Object.keys(elementTree).forEach(function (systemName) {
      const systemId = addNode(
        'sys-' + slugify(systemName),
        systemName,
        'system',
        makeNodeOptions(systemName + 'を構成する主要システム。')
      );
      addLink(carId, systemId, 'strong');

      const subsystems = elementTree[systemName];
      Object.keys(subsystems).forEach(function (subsystemName) {
        const subsystemId = addNode(
          'sub-' + slugify(systemName + '-' + subsystemName),
          subsystemName,
          'subsystem',
          makeNodeOptions(systemName + '配下のサブシステム。')
        );
        addLink(systemId, subsystemId, 'strong');

        const units = subsystems[subsystemName];
        Object.keys(units).forEach(function (unitName) {
          const unitId = addNode(
            'unit-' + slugify(systemName + '-' + subsystemName + '-' + unitName),
            unitName,
            'unit',
            makeNodeOptions(subsystemName + 'を分解したユニット。')
          );
          addLink(subsystemId, unitId, 'strong');

          units[unitName].forEach(function (componentName, componentIndex) {
            const componentId = addNode(
              'comp-' + slugify(systemName + '-' + subsystemName + '-' + unitName + '-' + componentName + '-' + componentIndex),
              componentName,
              'component',
              makeNodeOptions(unitName + 'に属するコンポ。')
            );
            addLink(unitId, componentId, 'strong');
            componentPathToId.set([systemName, subsystemName, unitName, componentName].join(' > '), componentId);
          });
        });
      });
    });
  }

  function buildRequirements() {
    requirements.forEach(function (req) {
      const reqId = addNode(
        'req-' + req.key,
        req.name,
        'requirement',
        makeNodeOptions(req.description, req.ref)
      );
      requirementNameToId.set(req.name, reqId);
    });
  }

  function buildRequirementGroups() {
    groupDefinitions.forEach(function (group) {
      group.functions.forEach(function (fn) {
        const fnId = addNode(
          'fn-' + group.key + '-' + fn.key,
          fn.name,
          'function',
          makeNodeOptions(
            fn.description || (group.requirements.join(' / ') + 'を支える機能。'),
            fn.ref || group.ref
          )
        );

        functionKeyToId.set(group.key + ':' + fn.key, fnId);

        group.requirements.forEach(function (reqName) {
          addLink(requirementNameToId.get(reqName), fnId, 'strong');
        });

        fn.logics.forEach(function (logic) {
          const componentKey = logic.path.join(' > ');
          const componentId = componentPathToId.get(componentKey);
          if (!componentId) {
            throw new Error('Missing component path: ' + componentKey);
          }

          const logicId = addNode(
            'logic-' + group.key + '-' + fn.key + '-' + logic.key,
            logic.name,
            'logic',
            makeNodeOptions(
              logic.description || ('接続先: ' + componentKey),
              logic.ref || fn.ref || group.ref
            )
          );

          addLink(fnId, logicId, 'strong');
          addLink(logicId, componentId, logic.strength || 'strong');
        });
      });
    });
  }

  function buildExtraRequirementLinks() {
    extraRequirementLinks.forEach(function (entry) {
      const reqId = requirementNameToId.get(entry.requirement);
      if (!reqId) return;
      entry.functionKeys.forEach(function (functionKey) {
        addLink(reqId, functionKeyToId.get(functionKey), entry.strength || 'mid');
      });
    });
  }

  buildElementTree();
  buildRequirements();
  buildRequirementGroups();
  buildExtraRequirementLinks();

  window.BARASHI_DATA_PAYLOAD = {
    cols: cols,
    nodes: nodes,
    links: links
  };
})();
