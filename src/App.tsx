import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import {
  PRESET_SHRINES,
  analyzeShrinePrompt,
  ShrineProfile,
} from './cad/shrineArchitectures';
import {
  buildDxfForShrineSheet,
  getSheetConfigsForShrine,
  SheetConfig,
} from './cad/shrineDxfGenerator';
import { CadViewer } from './components/CadViewer';
import { DxfCodeInspector } from './components/DxfCodeInspector';
import {
  Download,
  FileSpreadsheet,
  Layers,
  MapPin,
  Compass,
  Building,
  Info,
  ExternalLink,
  Archive,
  CheckCircle2,
  Sparkles,
  Search,
  Landmark,
} from 'lucide-react';

export default function App() {
  const [shrineInput, setShrineInput] = useState<string>('嚴島神社');
  const [currentShrine, setCurrentShrine] = useState<ShrineProfile>(PRESET_SHRINES.itsukushima);
  const [activeTab, setActiveTab] = useState<'sheet1' | 'sheet2' | 'sheet3' | 'all'>('sheet1');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [generateNotification, setGenerateNotification] = useState<{
    shrineName: string;
    styleName: string;
    timestamp: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Export space mode: 'paper' (A2 594x420mm with 2.5-5.0mm text) vs 'model' (1:1 mm with scaled text)
  const [exportSpace, setExportSpace] = useState<'paper' | 'model'>('paper');

  // Handle prompt submit / generation
  const handleGenerateShrine = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetName = shrineInput.trim() || '嚴島神社';
    setIsGenerating(true);

    setTimeout(() => {
      const profile = {
        ...analyzeShrinePrompt(targetName),
        generatedAt: Date.now(),
      };
      setCurrentShrine(profile);
      setIsGenerating(false);
      setGenerateNotification({
        shrineName: profile.name,
        styleName: profile.styleName,
        timestamp: new Date().toLocaleTimeString(),
      });
      setTimeout(() => {
        setGenerateNotification(null);
      }, 7000);
    }, 200);
  };

  const handleSelectPreset = (profile: ShrineProfile) => {
    setShrineInput(profile.name);
    setIsGenerating(true);
    setTimeout(() => {
      const newProfile = {
        ...profile,
        generatedAt: Date.now(),
      };
      setCurrentShrine(newProfile);
      setIsGenerating(false);
      setGenerateNotification({
        shrineName: newProfile.name,
        styleName: newProfile.styleName,
        timestamp: new Date().toLocaleTimeString(),
      });
      setTimeout(() => {
        setGenerateNotification(null);
      }, 7000);
    }, 200);
  };

  // Generate current document (memoized for instantaneous response)
  const currentDoc = useMemo(() => {
    return buildDxfForShrineSheet(currentShrine, activeTab, exportSpace);
  }, [currentShrine, activeTab, exportSpace]);

  const currentSheetInfo = useMemo(() => {
    const configs = getSheetConfigsForShrine(currentShrine);
    if (activeTab === 'all') {
      return {
        id: 'all',
        sheetNumber: 'A2-ALL (01~03)',
        title: `${currentShrine.name} 建築群CAD統合配置図 (3枚パノラマ)`,
        subTitle: `配置図(1:600) + 社殿群平面図(1:300) + 立面図(1:200) のA2×3連レイアウト`,
        scaleStr: 'MULTI',
        scaleValue: 1,
      } as SheetConfig;
    }
    return configs[activeTab];
  }, [currentShrine, activeTab]);

  // Download individual DXF
  const downloadDxf = (sheetId: 'sheet1' | 'sheet2' | 'sheet3' | 'all') => {
    const doc = buildDxfForShrineSheet(currentShrine, sheetId, exportSpace);
    const dxfContent = doc.toDxfString();
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);

    const spaceSuffix = exportSpace === 'paper' ? 'A2_PAPER' : '1-1_MODEL';
    const link = document.createElement('a');
    link.href = url;
    const safeName = currentShrine.name.replace(/[\/\s]/g, '_');
    const filename =
      sheetId === 'all'
        ? `${safeName}_ALL_SHEETS_${spaceSuffix}.dxf`
        : `${safeName}_${sheetId.toUpperCase()}_${spaceSuffix}.dxf`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Download all 3 sheets + summary in a single ZIP (contains both Paper Space & Model Space editions)
  const downloadAllZip = async () => {
    const zip = new JSZip();
    const safeName = currentShrine.name.replace(/[\/\s]/g, '_');

    // 1. Paper Space Folder (A2 594mm x 420mm - JIS standard text 2.5mm ~ 5.0mm)
    const paperFolder = zip.folder(`01_A2用紙基準_ペーパースケール_594x420mm`)!;
    paperFolder.file(`01_${safeName}_配置図_1-600_A2.dxf`, buildDxfForShrineSheet(currentShrine, 'sheet1', 'paper').toDxfString());
    paperFolder.file(`02_${safeName}_社殿群平面図_1-300_A2.dxf`, buildDxfForShrineSheet(currentShrine, 'sheet2', 'paper').toDxfString());
    paperFolder.file(`03_${safeName}_本社南面・鳥居立面図_1-200_A2.dxf`, buildDxfForShrineSheet(currentShrine, 'sheet3', 'paper').toDxfString());
    paperFolder.file(`00_${safeName}_全3図面統合_A2連作.dxf`, buildDxfForShrineSheet(currentShrine, 'all', 'paper').toDxfString());

    // 2. Model Space Folder (1:1 real world millimeters with dynamically scaled annotations)
    const modelFolder = zip.folder(`02_実寸1-1_モデル空間_縮尺テキストスケーリング済`)!;
    modelFolder.file(`01_${safeName}_配置図_1-1実寸_1-600スケーリング.dxf`, buildDxfForShrineSheet(currentShrine, 'sheet1', 'model').toDxfString());
    modelFolder.file(`02_${safeName}_社殿群平面図_1-1実寸_1-300スケーリング.dxf`, buildDxfForShrineSheet(currentShrine, 'sheet2', 'model').toDxfString());
    modelFolder.file(`03_${safeName}_本社南面・鳥居立面図_1-1実寸_1-200スケーリング.dxf`, buildDxfForShrineSheet(currentShrine, 'sheet3', 'model').toDxfString());

    // 3. Readme / Specifications
    const readme = `========================================================
${currentShrine.name} CAD図面データセット (A2 3枚組)
========================================================
■ 神社プロファイル
- 神社名: ${currentShrine.name} (${currentShrine.kana})
- 所在地: ${currentShrine.location}
- 建築様式: ${currentShrine.styleName}
- 様式詳細: ${currentShrine.styleDescription}
- 敷地地形: ${currentShrine.topologyName}
- 鳥居形式: ${currentShrine.toriiName}

■ CAD図面仕様
- 規格: JIS A2 横 (594mm × 420mm)
- 単位: mm
- 形式: AutoCAD R12 / 2000 互換 ASCII DXF
- 作成日: 2026-09-27
- 設計: GOD-MODE CAD ARCHITECT

■ 文字サイズ規格 (JIS Z 8313 準拠)
- 図面主タイトル: 4.8mm〜5.0mm
- 社殿名・大見出し: 3.5mm〜4.0mm
- 通り芯記号 (X/Y軸): 3.0mm (φ8.4mm円枠内配置)
- 寸法値・主要寸法線: 2.8mm
- 一般注記・地形注記: 2.5mm (JIS A2 最小推奨値)

■ フォルダ構成
1. 01_A2用紙基準_ペーパースケール_594x420mm/
   そのままA2印刷やPDF化で1:600 / 1:300 / 1:200で出力できる標準シート。
   文字高は用紙上で 2.5mm〜5.0mm に統一。
2. 02_実寸1-1_モデル空間_縮尺テキストスケーリング済/
   CAD実務用。実寸mmで作図され、各縮尺（1:600, 1:300, 1:200）に応じて
   文字高がモデル空間スケール（1500mm, 900mm, 560mm等）に完全スケーリング。

■ レイヤー構成
- FRAME: A2外枠、内枠、JIS表題欄、図面グリッド
- CENTER: 通り芯・神社主軸線
- STRUCTURE: 柱、基礎杭、舞台架構、大鳥居
- ROOF_WALL: 檜皮葺屋根、破風、高欄、壁面
- COAST_SEA: 汀線(H.W.L/L.W.L)、海面、等高線
- DIM_TEXT: 寸法線、文字注記、方位記号
- HATCH: 板敷目地、千本杭ハッチング
========================================================`;
    zip.file('README_図面仕様書.txt', readme);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}_SHRINE_CAD_A2_SET.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`${safeName}_SHRINE_CAD_A2_SET.zip`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Cyber Navigation Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center font-mono font-black text-cyan-400 text-sm">
                CAD
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  神社建築 CAD設計システム
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  DXF R12/2000
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                  A2 × 3枚組
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                配置図 1:600 ／ 社殿群平面図 1:300 ／ 本社・鳥居立面図 1:200 (単位: mm / 表題欄つき)
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Export Mode Toggle */}
            <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 p-0.5 rounded-lg text-xs font-mono">
              <button
                onClick={() => setExportSpace('paper')}
                title="A2用紙基準: 594x420mm (文字高 2.5mm〜5.0mm JIS規格)"
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  exportSpace === 'paper'
                    ? 'bg-neutral-800 text-cyan-400 font-bold border border-neutral-700 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                A2用紙 (2.5~5mm)
              </button>
              <button
                onClick={() => setExportSpace('model')}
                title="1:1実寸モデル空間 (縮尺スケーリング済み文字)"
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  exportSpace === 'model'
                    ? 'bg-neutral-800 text-amber-400 font-bold border border-neutral-700 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                1:1実寸モデル
              </button>
            </div>

            <button
              onClick={(e) => handleGenerateShrine(e)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-cyan-400 border border-neutral-700 hover:border-cyan-500/50 transition-all cursor-pointer font-mono shadow-sm active:scale-95"
              title="入力中の神社名でA2 CAD図面を再作成"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
              <span>{isGenerating ? '作図中...' : 'CAD図面作成'}</span>
            </button>

            <button
              onClick={downloadAllZip}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer font-mono"
            >
              <Archive className="w-4 h-4" />
              <span>全3図面一括ZIP</span>
            </button>
            <button
              onClick={() => downloadDxf(activeTab)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer font-mono"
            >
              <Download className="w-4 h-4" />
              <span>DXF保存 ({exportSpace === 'paper' ? 'A2用紙' : '1:1実寸'})</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner for Downloads */}
        {downloadSuccess && (
          <div className="bg-emerald-500/10 border-t border-b border-emerald-500/30 px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-emerald-400 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-mono font-semibold">【ダウンロード完了】 {downloadSuccess}</span>
            <span>- AutoCAD、Jw_cad、Vectorworksですぐに開けます</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-5 flex-1 flex flex-col gap-5 w-full">
        {/* Parametric Shrine Input Bar */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-xl flex flex-col gap-3">
          <form onSubmit={handleGenerateShrine} className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={shrineInput}
                onChange={(e) => setShrineInput(e.target.value)}
                placeholder="作成したい神社名を入力 (例: 出雲大社、伊勢神宮、伏見稲荷大社、日光東照宮、明治神宮...)"
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              onClick={(e) => handleGenerateShrine(e)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs tracking-wider cursor-pointer shadow-lg transition-all font-mono ${
                isGenerating
                  ? 'bg-neutral-800 text-cyan-400 border border-cyan-500/50 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 shadow-cyan-500/25 active:scale-95'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isGenerating ? 'CAD図面作図中...' : 'CAD図面作成'}</span>
            </button>
          </form>

          {/* Creation Success Banner */}
          {generateNotification && (
            <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-neutral-950 border border-cyan-500/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs shadow-xl animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm font-mono">
                      【{generateNotification.shrineName}】のCAD図面を作成しました！
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      {generateNotification.styleName}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                    第1図(配置図 1:600)・第2図(平面図 1:300)・第3図(立面図 1:200) の幾何形状・柱間グリッド・JIS文字を生成完了 ({generateNotification.timestamp})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => downloadDxf(activeTab)}
                  className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DXF保存</span>
                </button>
                <button
                  onClick={downloadAllZip}
                  className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>全3図面一括ZIP</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Preset Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-neutral-400 font-mono text-[11px]">クイック選択:</span>
            {Object.values(PRESET_SHRINES).map((p) => {
              const isSelected = currentShrine.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold shadow-sm'
                      : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  ⛩️ {p.name}
                </button>
              );
            })}
          </div>

          {/* Active Shrine Architecture DNA Badge */}
          <div className="bg-neutral-950/80 rounded-lg border border-neutral-800/80 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="flex flex-col gap-0.5">
              <span className="text-neutral-500 text-[10px]">現在の対象神社</span>
              <span className="text-white font-bold text-sm flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                {currentShrine.name}
              </span>
              <span className="text-[10px] text-neutral-400">{currentShrine.location}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-neutral-500 text-[10px]">建築様式 (STYLE)</span>
              <span className="text-amber-400 font-semibold">{currentShrine.styleName}</span>
              <span className="text-[10px] text-neutral-400 line-clamp-1">{currentShrine.styleDescription}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-neutral-500 text-[10px]">敷地トポロジー</span>
              <span className="text-emerald-400 font-semibold">{currentShrine.topologyName}</span>
              <span className="text-[10px] text-neutral-400">{currentShrine.toriiName}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-neutral-500 text-[10px]">柱間グリッド設定</span>
              <span className="text-cyan-400 font-semibold">
                {currentShrine.hondenSpan.xBays}間 × {currentShrine.hondenSpan.yBays}間 (1間={currentShrine.hondenSpan.bayMeter}m)
              </span>
              <span className="text-[10px] text-neutral-400">JIS文字規格 2.5mm〜5.0mm 適合</span>
            </div>
          </div>
        </section>

        {/* Sheet Selector Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => setActiveTab('sheet1')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'sheet1'
                  ? 'bg-neutral-800 text-cyan-400 shadow-sm font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>第1図：境配置図 (1:600)</span>
            </button>

            <button
              onClick={() => setActiveTab('sheet2')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'sheet2'
                  ? 'bg-neutral-800 text-cyan-400 shadow-sm font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>第2図：社殿群平面図 (1:300)</span>
            </button>

            <button
              onClick={() => setActiveTab('sheet3')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'sheet3'
                  ? 'bg-neutral-800 text-cyan-400 shadow-sm font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>第3図：立面図 (1:200)</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>A2 3枚連続パノラマ表示</span>
            </button>
          </div>

          {/* Quick Sheet Specs Badge */}
          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              作図単位: ミリメートル (mm)
            </span>
            <span>|</span>
            <span>用紙規格: JIS A2 (594 × 420 mm)</span>
            <span>|</span>
            <span className="text-amber-400 font-semibold">JIS表題欄・通り芯完備</span>
          </div>
        </div>

        {/* CAD Vector Interactive Viewport */}
        <CadViewer
          doc={currentDoc}
          title={currentSheetInfo.title}
          subTitle={currentSheetInfo.subTitle}
          sheetNumber={currentSheetInfo.sheetNumber}
          scaleStr={currentSheetInfo.scaleStr}
        />

        {/* Architectural Explanations & Specs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <MapPin className="w-4 h-4" />
              <span>第1図：境配置図 (縮尺 1:600)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {currentShrine.name}の境内敷地計画。{currentShrine.topologyName}に応じた自然境界、主参道、{currentShrine.toriiName}、社殿群の幾何配置を1:600で統括。
            </p>
            <div className="mt-auto pt-2 flex items-center justify-between text-[11px] font-mono text-neutral-500 border-t border-neutral-800/60">
              <span>実寸領域: 356m × 252m</span>
              <button
                onClick={() => downloadDxf('sheet1')}
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                DXF保存
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Building className="w-4 h-4" />
              <span>第2図：社殿群平面図 (縮尺 1:300)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {currentShrine.styleName}による柱間グリッド（通り芯X/Y）。
              本殿（{currentShrine.hondenSpan.xBays}間×{currentShrine.hondenSpan.yBays}間）、拝殿、御垣、独立柱列を高精度ミリ単位配置。
            </p>
            <div className="mt-auto pt-2 flex items-center justify-between text-[11px] font-mono text-neutral-500 border-t border-neutral-800/60">
              <span>実寸領域: 178m × 126m</span>
              <button
                onClick={() => downloadDxf('sheet2')}
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                DXF保存
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Compass className="w-4 h-4" />
              <span>第3図：立面図 (縮尺 1:200)</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              上段：{currentShrine.name}本社正面立面図（大屋根・破風・千木・勝男木・柱高架構）。
              下段：{currentShrine.toriiName}の正面立面図（木造規矩術・主要寸法線完備）。
            </p>
            <div className="mt-auto pt-2 flex items-center justify-between text-[11px] font-mono text-neutral-500 border-t border-neutral-800/60">
              <span>実寸領域: 118m × 84m</span>
              <button
                onClick={() => downloadDxf('sheet3')}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                DXF保存
              </button>
            </div>
          </div>
        </div>

        {/* DXF Source Inspector */}
        <DxfCodeInspector
          doc={currentDoc}
          filename={`${currentShrine.name}_${activeTab.toUpperCase()}_A2.dxf`}
        />
      </main>

      {/* Cyberpunk Footer & Virtual Interactive Buttons */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-6 px-4 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">GOD-MODE CAD ARCHITECT</span>
            <span>|</span>
            <span>JIS A2 (594x420mm)</span>
            <span>|</span>
            <span>AutoCAD R12/2000 ASCII DXF</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={downloadAllZip}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>全3図面一括ZIPをローカル保存</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
