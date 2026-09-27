/**
 * Mathematical models & geometric layouts for Itsukushima Shrine CAD drawings.
 * Standard A2 sheet dimensions: 594mm x 420mm (Unit: mm on paper or model scale).
 *
 * Sheet 1: 境配置図 (Layout Plan) Scale 1:600
 * Sheet 2: 社殿群平面図 (Shrine Complex Plan) Scale 1:300
 * Sheet 3: 本社南面立面図 及び 大鳥居立面図 (South Elevation & Grand Torii Elevation) Scale 1:200
 */

import { DxfDocument } from './dxfGenerator';

export interface SheetConfig {
  id: 'sheet1' | 'sheet2' | 'sheet3' | 'all';
  sheetNumber: string;
  title: string;
  subTitle: string;
  scaleStr: string;
  scaleValue: number;
}

export const SHEETS_INFO: Record<string, SheetConfig> = {
  sheet1: {
    id: 'sheet1',
    sheetNumber: 'A2-01/03',
    title: '嚴島神社 境配置図',
    subTitle: '有浦湾・大鳥居・海中社殿群・東西回廊・海岸汀線',
    scaleStr: '1:600',
    scaleValue: 600,
  },
  sheet2: {
    id: 'sheet2',
    sheetNumber: 'A2-02/03',
    title: '嚴島神社 社殿群平面図',
    subTitle: '本社(本殿・幣殿・拝殿・祓殿)・平舞台・高舞台・能舞台・東西回廊柱列',
    scaleStr: '1:300',
    scaleValue: 300,
  },
  sheet3: {
    id: 'sheet3',
    sheetNumber: 'A2-03/03',
    title: '嚴島神社 本社南面 及び 大鳥居立面図',
    subTitle: '大鳥居立面図(四脚鳥居・千本杭) / 本社南面立面図(祓殿・拝殿・高舞台)',
    scaleStr: '1:200',
    scaleValue: 200,
  },
};

/**
 * Adds an architectural standard A2 Title Block & Frame (JIS A2: 594mm x 420mm)
 * Origin (0,0) is bottom-left of sheet.
 */
export function addA2BorderAndTitleBlock(
  doc: DxfDocument,
  offsetX: number,
  offsetY: number,
  config: SheetConfig
) {
  const W = 594;
  const H = 420;
  const margin = 10; // 10mm inner margin
  const x0 = offsetX;
  const y0 = offsetY;

  // Outer paper edge
  doc.addRect('FRAME', x0, y0, W, H);

  // Inner drawing border (thicker boundary in CAD)
  const ix = x0 + margin;
  const iy = y0 + margin;
  const iw = W - margin * 2; // 574mm
  const ih = H - margin * 2; // 400mm
  doc.addRect('FRAME', ix, iy, iw, ih);

  // Drawing grid markers (A B C D / 1 2 3 4)
  const cols = 6;
  const rows = 4;
  for (let i = 1; i < cols; i++) {
    const gx = ix + (iw / cols) * i;
    doc.addLine('FRAME', gx, iy, gx, iy + 3);
    doc.addLine('FRAME', gx, iy + ih - 3, gx, iy + ih);
    doc.addText('FRAME', gx - 1.5, iy + ih - 7, 3, `${i}`, 'CENTER');
  }
  for (let j = 1; j < rows; j++) {
    const gy = iy + (ih / rows) * j;
    doc.addLine('FRAME', ix, gy, ix + 3, gy);
    doc.addLine('FRAME', ix + iw - 3, gy, ix + iw, gy);
    doc.addText('FRAME', ix + iw - 7, gy - 1.5, 3, String.fromCharCode(64 + j), 'CENTER');
  }

  // --- Title Block (Bottom Right: 180mm x 50mm) ---
  const tbW = 180;
  const tbH = 50;
  const tbx = ix + iw - tbW;
  const tby = iy;

  doc.addRect('FRAME', tbx, tby, tbW, tbH);

  // Dividers
  doc.addLine('FRAME', tbx, tby + 35, tbx + tbW, tby + 35);
  doc.addLine('FRAME', tbx, tby + 20, tbx + tbW, tby + 20);
  doc.addLine('FRAME', tbx, tby + 10, tbx + tbW, tby + 10);
  doc.addLine('FRAME', tbx + 110, tby, tbx + 110, tby + 35);
  doc.addLine('FRAME', tbx + 55, tby, tbx + 55, tby + 20);

  // Texts (Y positions vertically centered within rows: 0~10, 10~20, 20~35, 35~50)
  doc.addText('FRAME', tbx + 5, tby + 44, 3.2, '世界遺産 嚴島神社 建築群CADデータ作成');
  doc.addText('FRAME', tbx + 5, tby + 38, 2.5, 'ITSUKUSHIMA SHINTO SHRINE HISTORIC MONUMENTS SURVEY');

  doc.addText('FRAME', tbx + 5, tby + 28, 4.8, config.title);
  doc.addText('FRAME', tbx + 5, tby + 22.5, 2.6, config.subTitle);

  doc.addText('FRAME', tbx + 115, tby + 29, 2.5, '縮尺 (SCALE)');
  doc.addText('FRAME', tbx + 115, tby + 23, 3.5, config.scaleStr);

  doc.addText('FRAME', tbx + 5, tby + 16, 2.5, '図面番号 (DWG NO.)');
  doc.addText('FRAME', tbx + 5, tby + 4.5, 3.5, config.sheetNumber);

  doc.addText('FRAME', tbx + 60, tby + 16, 2.5, '作成日 / 単位');
  doc.addText('FRAME', tbx + 60, tby + 4.5, 2.8, '2026-09-27 / mm');

  doc.addText('FRAME', tbx + 115, tby + 16, 2.5, '設計・製図 (ENGINEER)');
  doc.addText('FRAME', tbx + 115, tby + 4.5, 2.8, 'GOD-MODE CAD ARCHITECT');

  // North Arrow (Top Right)
  const naX = ix + iw - 30;
  const naY = iy + ih - 35;
  const naR = 14;
  doc.addCircle('DIM_TEXT', naX, naY, naR);
  doc.addLine('DIM_TEXT', naX, naY - naR, naX, naY + naR);
  doc.addLine('DIM_TEXT', naX - naR, naY, naX + naR, naY);
  // Arrowhead pointing North (top)
  doc.addPolyline('DIM_TEXT', [
    { x: naX - 4, y: naY },
    { x: naX, y: naY + naR },
    { x: naX + 4, y: naY }
  ], true);
  doc.addText('DIM_TEXT', naX, naY + naR + 2, 4.5, 'N', 'CENTER');

  // Scale Bar (Bottom Left)
  const sbX = ix + 15;
  const sbY = iy + 15;
  doc.addText('DIM_TEXT', sbX, sbY + 12, 3.0, `GRAPHIC SCALE (${config.scaleStr})`);
  doc.addLine('DIM_TEXT', sbX, sbY + 5, sbX + 100, sbY + 5);
  doc.addLine('DIM_TEXT', sbX, sbY + 3, sbX, sbY + 7);
  doc.addLine('DIM_TEXT', sbX + 25, sbY + 4, sbX + 25, sbY + 6);
  doc.addLine('DIM_TEXT', sbX + 50, sbY + 3, sbX + 50, sbY + 7);
  doc.addLine('DIM_TEXT', sbX + 75, sbY + 4, sbX + 75, sbY + 6);
  doc.addLine('DIM_TEXT', sbX + 100, sbY + 3, sbX + 100, sbY + 7);

  const realMeters = (100 * config.scaleValue) / 1000;
  doc.addText('DIM_TEXT', sbX, sbY, 2.5, '0m', 'CENTER');
  doc.addText('DIM_TEXT', sbX + 50, sbY, 2.5, `${realMeters / 2}m`, 'CENTER');
  doc.addText('DIM_TEXT', sbX + 100, sbY, 2.5, `${realMeters}m`, 'CENTER');
}

/**
 * SHEET 1: 配置図 (Site Plan) Scale 1:600
 * Area covers ~300m x 200m in real world = 500mm x 333mm on A2 sheet.
 */
export function generateSheet1SitePlan(doc: DxfDocument, offsetX = 0, offsetY = 0): void {
  addA2BorderAndTitleBlock(doc, offsetX, offsetY, SHEETS_INFO.sheet1);

  // Center coordinate on paper
  const cx = offsetX + 290;
  const cy = offsetY + 220;

  // Scale factor: 1m in real life = (1000mm / 600) = 1.6667mm on paper
  const S = 1000 / 600;

  // Axis of Shrine (approximated northward / northwestward azimuth ~340 deg)
  // Let the main shrine axis align vertically with slight artistic balance
  doc.addLine('CENTER', cx, cy - 130, cx, cy + 120); // Main Sea-Sanctuary Axis
  doc.addText('DIM_TEXT', cx + 5, cy - 125, 2.8, '社殿主軸線 (神社主方位軸)');

  // 1. Coastlines & Bay (有浦湾・御笠浜)
  // High Tide Line (満潮汀線 H.W.L +3.4m)
  doc.addPolyline('COAST_SEA', [
    { x: cx - 220, y: cy + 100 },
    { x: cx - 180, y: cy + 70 },
    { x: cx - 140, y: cy + 50 },
    { x: cx - 100, y: cy + 30 },
    { x: cx - 40, y: cy + 15 },
    { x: cx + 40, y: cy + 15 },
    { x: cx + 110, y: cy + 35 },
    { x: cx + 160, y: cy + 60 },
    { x: cx + 210, y: cy + 95 }
  ]);
  doc.addText('COAST_SEA', cx - 170, cy + 85, 2.5, '満潮位 汀線 (H.W.L +3.4m)');

  // Low Tide Line (干潮位汀線 L.W.L 0.0m)
  doc.addPolyline('COAST_SEA', [
    { x: cx - 220, y: cy - 70 },
    { x: cx - 150, y: cy - 90 },
    { x: cx - 80, y: cy - 110 },
    { x: cx, y: cy - 120 },
    { x: cx + 80, y: cy - 110 },
    { x: cx + 150, y: cy - 90 },
    { x: cx + 220, y: cy - 70 }
  ]);
  doc.addText('COAST_SEA', cx + 70, cy - 118, 2.5, '干潮時 干潟露出汀線 (L.W.L)');

  // Sea boundary hatching / water ripples
  for (let r = 1; r <= 4; r++) {
    const yRipple = cy - 40 - r * 15;
    doc.addLine('COAST_SEA', cx - 120, yRipple, cx - 70, yRipple);
    doc.addLine('COAST_SEA', cx - 20, yRipple, cx + 30, yRipple);
    doc.addLine('COAST_SEA', cx + 80, yRipple, cx + 130, yRipple);
  }

  // 2. 大鳥居 (Grand Torii) in Sea
  // Located ~160m offshore from the main stage: 160 * 1.6667 = ~266.6mm (adjusted to fit paper: 95mm south)
  const toriiY = cy - 85;
  const toriiSpan = 18 * S; // 24m real width ~ 30mm
  const toriiThick = 4 * S;
  doc.addRect('STRUCTURE', cx - toriiSpan / 2, toriiY - toriiThick / 2, toriiSpan, toriiThick);
  doc.addCircle('STRUCTURE', cx - toriiSpan / 2 + 3, toriiY, 1.8);
  doc.addCircle('STRUCTURE', cx + toriiSpan / 2 - 3, toriiY, 1.8);
  doc.addText('DIM_TEXT', cx, toriiY - 11, 3.8, '大鳥居 (重要文化財)', 'CENTER');
  doc.addText('DIM_TEXT', cx, toriiY - 17, 2.5, '主柱芯間 10.9m / 総高 16.6m', 'CENTER');

  // Dimension from Torii to Shrine Stage
  const stageY = cy + 10;
  doc.addLine('DIM_TEXT', cx + 45, toriiY, cx + 45, stageY);
  doc.addLine('DIM_TEXT', cx + 42, toriiY, cx + 48, toriiY);
  doc.addLine('DIM_TEXT', cx + 42, stageY, cx + 48, stageY);
  doc.addText('DIM_TEXT', cx + 50, (toriiY + stageY) / 2, 2.8, '約160m (離岸距離)');

  // 3. 社殿群全体のアウトライン (Shrine Complex Footprint)
  // 本社 (Main Shrine: Honden, Heiden, Haiden, Haraedono)
  const honW = 20 * S; // 33mm
  const honH = 35 * S; // 58mm
  doc.addRect('STRUCTURE', cx - honW / 2, stageY, honW, honH);
  doc.addText('DIM_TEXT', cx, stageY + honH / 2 + 3.5, 3.8, '本社社殿群', 'CENTER');
  doc.addText('DIM_TEXT', cx, stageY + honH / 2 - 3.5, 2.5, '(本殿・幣殿・拝殿・祓殿)', 'CENTER');

  // 平舞台 & 高舞台 (Front Stage)
  const stageW = 16 * S;
  const stageH = 14 * S;
  doc.addRect('STRUCTURE', cx - stageW / 2, stageY - stageH, stageW, stageH);
  doc.addRect('ROOF_WALL', cx - 5 * S, stageY - 10 * S, 10 * S, 6 * S); // 高舞台
  doc.addText('DIM_TEXT', cx, stageY - stageH / 2, 2.8, '平舞台・高舞台', 'CENTER');

  // 火立岩 (Left/Right sea lanterns)
  doc.addCircle('STRUCTURE', cx - 18 * S, stageY - 10 * S, 2);
  doc.addCircle('STRUCTURE', cx + 18 * S, stageY - 10 * S, 2);
  doc.addText('DIM_TEXT', cx - 18 * S, stageY - 14 * S, 2.5, '火立岩(左)', 'CENTER');
  doc.addText('DIM_TEXT', cx + 18 * S, stageY - 14 * S, 2.5, '火立岩(右)', 'CENTER');

  // 東回廊 (East Corridor)
  const eCorW = 4 * S;
  doc.addPolyline('STRUCTURE', [
    { x: cx + stageW / 2, y: stageY - 2 * S },
    { x: cx + 45 * S, y: stageY - 2 * S },
    { x: cx + 45 * S, y: stageY + 45 * S },
    { x: cx + 65 * S, y: stageY + 65 * S }
  ]);
  doc.addPolyline('STRUCTURE', [
    { x: cx + stageW / 2, y: stageY - 2 * S - eCorW },
    { x: cx + 45 * S + eCorW, y: stageY - 2 * S - eCorW },
    { x: cx + 45 * S + eCorW, y: stageY + 45 * S + eCorW },
    { x: cx + 65 * S, y: stageY + 65 * S + eCorW }
  ]);
  doc.addText('DIM_TEXT', cx + 48 * S, stageY + 20 * S, 2.8, '東回廊 (47間)');

  // 客神社 (Marodo Shrine) on East
  const marodoX = cx + 30 * S;
  const marodoY = stageY + 5 * S;
  doc.addRect('STRUCTURE', marodoX, marodoY, 14 * S, 22 * S);
  doc.addText('DIM_TEXT', marodoX + 7 * S, marodoY + 11 * S, 2.8, '客神社', 'CENTER');

  // 西回廊 (West Corridor)
  doc.addPolyline('STRUCTURE', [
    { x: cx - stageW / 2, y: stageY - 2 * S },
    { x: cx - 40 * S, y: stageY - 2 * S },
    { x: cx - 40 * S, y: stageY + 35 * S },
    { x: cx - 70 * S, y: stageY + 55 * S }
  ]);
  doc.addPolyline('STRUCTURE', [
    { x: cx - stageW / 2, y: stageY - 2 * S - eCorW },
    { x: cx - 40 * S - eCorW, y: stageY - 2 * S - eCorW },
    { x: cx - 40 * S - eCorW, y: stageY + 35 * S + eCorW },
    { x: cx - 70 * S, y: stageY + 55 * S + eCorW }
  ]);
  doc.addText('DIM_TEXT', cx - 45 * S, stageY + 18 * S, 2.8, '西回廊 (61間)', 'RIGHT');

  // 能舞台 (Noh Stage) on West Sea
  const nohX = cx - 55 * S;
  const nohY = stageY + 10 * S;
  doc.addRect('STRUCTURE', nohX - 8 * S, nohY, 12 * S, 12 * S);
  // Bridge connecting to West Corridor (橋掛かり)
  doc.addLine('STRUCTURE', nohX + 4 * S, nohY + 4 * S, cx - 40 * S, nohY + 4 * S);
  doc.addLine('STRUCTURE', nohX + 4 * S, nohY + 7 * S, cx - 40 * S, nohY + 7 * S);
  doc.addText('DIM_TEXT', nohX - 2 * S, nohY + 6 * S, 2.8, '能舞台 (海中)', 'CENTER');

  // 周辺ランドマーク (Landmarks & Surrounding context)
  // 豊国神社 (千畳閣) & 五重塔 (Hillside to the Northeast)
  const senX = cx + 80 * S;
  const senY = cy + 90;
  doc.addRect('ROOF_WALL', senX, senY, 30 * S, 18 * S);
  doc.addText('DIM_TEXT', senX + 15 * S, senY + 10 * S, 3.2, '千畳閣 (豊国神社)', 'CENTER');
  // 五重塔
  doc.addRect('ROOF_WALL', senX - 8 * S, senY + 5 * S, 6 * S, 6 * S);
  doc.addText('DIM_TEXT', senX - 5 * S, senY + 14 * S, 2.8, '五重塔', 'CENTER');

  // 山側境界・松原 (Pine groves & back mountain contours)
  doc.addPolyline('ROOF_WALL', [
    { x: cx - 220, y: cy + 130 },
    { x: cx - 120, y: cy + 120 },
    { x: cx, y: cy + 115 },
    { x: cx + 120, y: cy + 130 },
    { x: cx + 220, y: cy + 140 }
  ]);
  doc.addText('ROOF_WALL', cx, cy + 125, 2.8, '弥山山麓 樹林帯 (背景自然)', 'CENTER');
}

/**
 * SHEET 2: 社殿群平面図 (Shrine Complex Plan) Scale 1:300
 * Detailed columns, corridors, joints, planks, sanctum layout.
 * 1m real life = (1000 / 300) = 3.3333mm on paper.
 */
export function generateSheet2ShrinePlan(doc: DxfDocument, offsetX = 0, offsetY = 0): void {
  addA2BorderAndTitleBlock(doc, offsetX, offsetY, SHEETS_INFO.sheet2);

  const cx = offsetX + 290;
  const cy = offsetY + 200;
  const S = 1000 / 300; // 3.3333mm per real meter

  // 1. Grid Axes (通り芯: X1~X12, Y1~Y10)
  const bay = 2.4 * S; // 1間 = 約2.4m = 8mm on paper
  const numGridX = 14;
  const numGridY = 18;
  const startX = cx - (numGridX / 2) * bay;
  const startY = cy - (numGridY / 2) * bay + 20;

  for (let i = 0; i <= numGridX; i++) {
    const gx = startX + i * bay;
    doc.addLine('CENTER', gx, startY - 20, gx, startY + numGridY * bay + 15);
    doc.addCircle('DIM_TEXT', gx, startY - 26, 4.2);
    doc.addText('DIM_TEXT', gx, startY - 26, 3.0, `X${i + 1}`, 'CENTER');
  }

  for (let j = 0; j <= numGridY; j++) {
    const gy = startY + j * bay;
    doc.addLine('CENTER', startX - 20, gy, startX + numGridX * bay + 20, gy);
    doc.addCircle('DIM_TEXT', startX - 26, gy, 4.2);
    doc.addText('DIM_TEXT', startX - 26, gy, 3.0, `Y${j + 1}`, 'CENTER');
  }

  // Dimension lines between bays
  doc.addLine('DIM_TEXT', startX, startY - 12, startX + numGridX * bay, startY - 12);
  doc.addText('DIM_TEXT', cx, startY - 16, 2.8, '柱間寸法 1間 = 2,424mm (8尺格子)', 'CENTER');

  // 2. 本社社殿群 (Main Shrine Building Group)
  // 本殿 (Honden: 9 bays wide x 4 bays deep)
  const hondenX = cx - 4.5 * bay;
  const hondenY = startY + 11 * bay;
  const hondenW = 9 * bay;
  const hondenH = 4 * bay;
  doc.addRect('STRUCTURE', hondenX, hondenY, hondenW, hondenH);
  doc.addText('DIM_TEXT', cx, hondenY + hondenH / 2, 4.0, '本殿 (国宝 / 桁行9間・梁間4間・流造)', 'CENTER');

  // 内陣・外陣 仕切り (Inner & Outer Sanctuary divisions)
  doc.addLine('ROOF_WALL', hondenX + bay, hondenY + bay, hondenX + hondenW - bay, hondenY + bay);
  doc.addLine('ROOF_WALL', hondenX + bay, hondenY + hondenH - bay, hondenX + hondenW - bay, hondenY + hondenH - bay);

  // 幣殿 (Heiden: 3 bays x 2 bays)
  const heidenX = cx - 1.5 * bay;
  const heidenY = hondenY - 2 * bay;
  const heidenW = 3 * bay;
  const heidenH = 2 * bay;
  doc.addRect('STRUCTURE', heidenX, heidenY, heidenW, heidenH);
  doc.addText('DIM_TEXT', cx, heidenY + heidenH / 2, 2.8, '幣殿', 'CENTER');

  // 拝殿 (Haiden: 9 bays x 3 bays)
  const haidenX = cx - 4.5 * bay;
  const haidenY = heidenY - 3 * bay;
  const haidenW = 9 * bay;
  const haidenH = 3 * bay;
  doc.addRect('STRUCTURE', haidenX, haidenY, haidenW, haidenH);
  doc.addText('DIM_TEXT', cx, haidenY + haidenH / 2, 3.5, '拝殿 (国宝 / 梁間3間・入母屋造)', 'CENTER');

  // 祓殿 (Haraedono: 9 bays x 3 bays with open facade to sea)
  const haraeX = cx - 4.5 * bay;
  const haraeY = haidenY - 3 * bay;
  const haraeW = 9 * bay;
  const haraeH = 3 * bay;
  doc.addRect('STRUCTURE', haraeX, haraeY, haraeW, haraeH);
  doc.addText('DIM_TEXT', cx, haraeY + haraeH / 2, 3.5, '祓殿 (国宝 / 妻入・平舞台連動)', 'CENTER');

  // Columns for Main Sanctuary (Round wooden pillars 450mm dia ~ 1.5mm)
  for (let xi = 0; xi <= 9; xi++) {
    for (let yi = 0; yi <= 3; yi++) {
      doc.addCircle('STRUCTURE', haraeX + xi * bay, haraeY + yi * bay, 0.8);
      doc.addCircle('STRUCTURE', haidenX + xi * bay, haidenY + yi * bay, 0.8);
      doc.addCircle('STRUCTURE', hondenX + xi * bay, hondenY + yi * bay, 0.8);
    }
  }

  // 3. 舞台群 (Stage Complex)
  // 平舞台 (Flat Stage: Open wooden deck projecting to sea)
  const flatStageW = 7 * bay;
  const flatStageH = 6 * bay;
  const flatStageX = cx - flatStageW / 2;
  const flatStageY = haraeY - flatStageH;
  doc.addRect('STRUCTURE', flatStageX, flatStageY, flatStageW, flatStageH);
  doc.addText('DIM_TEXT', cx, flatStageY + 1.5 * bay, 3.2, '平舞台 (国宝 / 目透かし板敷)', 'CENTER');

  // 目透かし板敷の目地ハッチング (Gapped planks for tide flow)
  for (let p = 1; p < 12; p++) {
    const py = flatStageY + (flatStageH / 12) * p;
    doc.addLine('HATCH', flatStageX, py, flatStageX + flatStageW, py);
  }

  // 高舞台 (Elevated Bugaku Stage: Center 3 bays x 3 bays with red balustrade)
  const takabutaiW = 3 * bay;
  const takabutaiH = 3 * bay;
  const takabutaiX = cx - takabutaiW / 2;
  const takabutaiY = flatStageY + 2 * bay;
  doc.addRect('ROOF_WALL', takabutaiX, takabutaiY, takabutaiW, takabutaiH);
  // Red balustrade inner line
  doc.addRect('ROOF_WALL', takabutaiX + 1.5, takabutaiY + 1.5, takabutaiW - 3, takabutaiH - 3);
  doc.addText('DIM_TEXT', cx, takabutaiY + takabutaiH / 2, 3.0, '高舞台 (国宝・舞楽舞台)', 'CENTER');

  // 4. 東西回廊 (Corridors: 1 bay width = 2.4m, column spacing = 2.4m)
  const corSpan = 1 * bay;
  // East Corridor running from flat stage to East
  const eCorStart = cx + flatStageW / 2;
  doc.addLine('STRUCTURE', eCorStart, flatStageY + flatStageH, eCorStart + 6 * bay, flatStageY + flatStageH);
  doc.addLine('STRUCTURE', eCorStart, flatStageY + flatStageH - corSpan, eCorStart + 6 * bay, flatStageY + flatStageH - corSpan);
  doc.addLine('STRUCTURE', eCorStart + 6 * bay, flatStageY + flatStageH, eCorStart + 6 * bay, hondenY + 5 * bay);
  doc.addLine('STRUCTURE', eCorStart + 6 * bay + corSpan, flatStageY + flatStageH - corSpan, eCorStart + 6 * bay + corSpan, hondenY + 5 * bay);
  doc.addText('DIM_TEXT', eCorStart + 3 * bay, flatStageY + flatStageH + 4, 2.8, '東回廊 (国宝)');

  // East corridor column posts
  for (let k = 0; k <= 6; k++) {
    doc.addCircle('STRUCTURE', eCorStart + k * bay, flatStageY + flatStageH, 0.7);
    doc.addCircle('STRUCTURE', eCorStart + k * bay, flatStageY + flatStageH - corSpan, 0.7);
  }

  // West Corridor running to West
  const wCorStart = cx - flatStageW / 2;
  doc.addLine('STRUCTURE', wCorStart, flatStageY + flatStageH, wCorStart - 6 * bay, flatStageY + flatStageH);
  doc.addLine('STRUCTURE', wCorStart, flatStageY + flatStageH - corSpan, wCorStart - 6 * bay, flatStageY + flatStageH - corSpan);
  doc.addLine('STRUCTURE', wCorStart - 6 * bay, flatStageY + flatStageH, wCorStart - 6 * bay, hondenY + 5 * bay);
  doc.addLine('STRUCTURE', wCorStart - 6 * bay - corSpan, flatStageY + flatStageH - corSpan, wCorStart - 6 * bay - corSpan, hondenY + 5 * bay);
  doc.addText('DIM_TEXT', wCorStart - 4 * bay, flatStageY + flatStageH + 4, 2.8, '西回廊 (国宝)', 'CENTER');

  // West corridor column posts
  for (let k = 0; k <= 6; k++) {
    doc.addCircle('STRUCTURE', wCorStart - k * bay, flatStageY + flatStageH, 0.7);
    doc.addCircle('STRUCTURE', wCorStart - k * bay, flatStageY + flatStageH - corSpan, 0.7);
  }

  // 能舞台 (Noh Stage: West offshore)
  const nohX = wCorStart - 10 * bay;
  const nohY = flatStageY + 2 * bay;
  const nohW = 4 * bay;
  const nohH = 4 * bay;
  doc.addRect('STRUCTURE', nohX, nohY, nohW, nohH);
  doc.addText('DIM_TEXT', nohX + nohW / 2, nohY + nohH / 2, 3.0, '能舞台 (重文)', 'CENTER');
  // Hashigakari (Bridgeway)
  doc.addLine('STRUCTURE', nohX + nohW, nohY + 2.5 * bay, wCorStart - 6 * bay, flatStageY + 4.5 * bay);
  doc.addLine('STRUCTURE', nohX + nohW, nohY + 3.5 * bay, wCorStart - 6 * bay, flatStageY + 5.5 * bay);
  doc.addText('DIM_TEXT', nohX + nohW + 2 * bay, nohY + 3.5 * bay, 2.5, '橋掛かり');

  // 水位注記 (Tide level remarks on drawing)
  doc.addText('COAST_SEA', cx - 200, cy - 80, 3.2, '【潮位設計注記】');
  doc.addText('COAST_SEA', cx - 200, cy - 86, 2.5, '・満潮時(H.W.L +3.4m)：床下水没・海上に浮遊する伽藍');
  doc.addText('COAST_SEA', cx - 200, cy - 92, 2.5, '・干潮時(L.W.L 0.0m)：千本杭・玉石基礎・砂地露出');
  doc.addText('COAST_SEA', cx - 200, cy - 98, 2.5, '・回廊板敷：高潮時の揚圧力を逃す「目透かし張り構造」採用');
}

/**
 * SHEET 3: 立面図 (Elevations) Scale 1:200
 * Top: 本社南面立面図 (South Elevation of Main Shrine / Haraedono / Stages)
 * Bottom: 大鳥居立面図 (Grand Torii Elevation with 1000-pile foundation)
 * 1m in real life = (1000 / 200) = 5.0mm on paper.
 */
export function generateSheet3Elevations(doc: DxfDocument, offsetX = 0, offsetY = 0): void {
  addA2BorderAndTitleBlock(doc, offsetX, offsetY, SHEETS_INFO.sheet3);

  const cx = offsetX + 290;
  const S = 1000 / 200; // 5mm per real meter

  // ==========================================
  // SECTION A: 本社南面立面図 (Upper Half)
  // ==========================================
  const shY0 = offsetY + 270; // Sea Level datum (±0)
  const shAxisY = shY0;

  doc.addText('DIM_TEXT', offsetX + 25, shY0 + 105, 4.5, '【本社南面立面図 (海側正面立面)】 縮尺 1:200');
  doc.addText('DIM_TEXT', offsetX + 25, shY0 + 98, 2.8, '南面正面：祓殿妻入屋根・平舞台・高舞台・東西回廊翼部');

  // Sea level datum line & HWL / LWL lines
  doc.addLine('COAST_SEA', offsetX + 20, shY0, offsetX + 560, shY0);
  doc.addText('COAST_SEA', offsetX + 25, shY0 + 2, 2.5, '平均海水面 (M.S.L ±0.00m)');

  const hwlY = shY0 + 3.4 * S; // +17mm
  doc.addLine('COAST_SEA', offsetX + 20, hwlY, offsetX + 560, hwlY);
  doc.addText('COAST_SEA', offsetX + 25, hwlY + 2, 2.5, '設計満潮位 (H.W.L +3.40m)');

  const floorY = shY0 + 4.8 * S; // Floor height ~4.8m = +24mm
  doc.addLine('STRUCTURE', offsetX + 40, floorY, offsetX + 540, floorY);
  doc.addText('DIM_TEXT', offsetX + 545, floorY, 2.8, '廻廊・床高 (+4.80m)');

  // Sea Piles (海上木造柱列・基礎杭)
  const numPillars = 25;
  const pPitch = 18;
  const pStartX = cx - (numPillars / 2) * pPitch;
  for (let i = 0; i <= numPillars; i++) {
    const px = pStartX + i * pPitch;
    if (px > offsetX + 45 && px < offsetX + 535) {
      // Round wooden pile from seabed (-1.5m) up to floor
      doc.addLine('STRUCTURE', px - 1.2, shY0 - 1.5 * S, px - 1.2, floorY);
      doc.addLine('STRUCTURE', px + 1.2, shY0 - 1.5 * S, px + 1.2, floorY);
      // Stone base footing (礎石・千本杭頭)
      doc.addRect('STRUCTURE', px - 2.5, shY0 - 2.5 * S, 5, 2.5 * S);
      // Floor bracket / Nageshi (貫・足固め)
      doc.addLine('STRUCTURE', px - 4, floorY - 3, px + 4, floorY - 3);
    }
  }

  // 平舞台 & 高舞台立面 (Center Front)
  const tbW = 16 * S; // 80mm
  const tbX = cx - tbW / 2;
  const tbFloorY = floorY;
  // High Stage floor raised by 0.9m
  const hiStageY = floorY + 0.9 * S;
  const hiStageW = 10 * S;
  const hiStageX = cx - hiStageW / 2;
  doc.addRect('STRUCTURE', hiStageX, hiStageY, hiStageW, 1.2);
  // Red Vermilion Balustrade (朱塗高欄)
  doc.addLine('ROOF_WALL', hiStageX, hiStageY + 4, hiStageX + hiStageW, hiStageY + 4);
  doc.addLine('ROOF_WALL', hiStageX, hiStageY + 8, hiStageX + hiStageW, hiStageY + 8);
  for (let k = 0; k <= 10; k++) {
    const rx = hiStageX + k * (hiStageW / 10);
    doc.addLine('ROOF_WALL', rx, hiStageY, rx, hiStageY + 8);
    // Giboshi finials on top of balustrade posts
    doc.addCircle('ROOF_WALL', rx, hiStageY + 9, 0.8);
  }
  doc.addText('DIM_TEXT', cx, hiStageY + 12, 2.8, '高舞台 朱塗高欄・擬宝珠', 'CENTER');

  // 本社 祓殿・拝殿立面 (Gable Roof Facade)
  const roofBaseY = floorY + 6.0 * S; // Pillar height ~6m = 30mm
  const roofRidgeY = roofBaseY + 9.0 * S; // Ridge height ~9m = 45mm
  const roofW = 32 * S; // 160mm total roof span
  const eavesDropY = roofBaseY - 1.5 * S;

  // Irimoya Roof Curved Eaves (反り増し・檜皮葺屋根)
  doc.addPolyline('ROOF_WALL', [
    { x: cx - roofW / 2, y: eavesDropY },
    { x: cx - roofW * 0.35, y: roofBaseY },
    { x: cx, y: roofRidgeY },
    { x: cx + roofW * 0.35, y: roofBaseY },
    { x: cx + roofW / 2, y: eavesDropY }
  ]);
  // Double eaves line (重層・軒付)
  doc.addPolyline('ROOF_WALL', [
    { x: cx - roofW / 2, y: eavesDropY - 2 },
    { x: cx - roofW * 0.35, y: roofBaseY - 2 },
    { x: cx, y: roofRidgeY - 2 },
    { x: cx + roofW * 0.35, y: roofBaseY - 2 },
    { x: cx + roofW / 2, y: eavesDropY - 2 }
  ]);
  // Kara-hafu / Chidori-hafu gable ornament (唐破風・千鳥破風)
  doc.addPolyline('ROOF_WALL', [
    { x: cx - 18, y: roofBaseY + 8 },
    { x: cx - 10, y: roofBaseY + 16 },
    { x: cx, y: roofBaseY + 20 },
    { x: cx + 10, y: roofBaseY + 16 },
    { x: cx + 18, y: roofBaseY + 8 }
  ]);
  doc.addCircle('ROOF_WALL', cx, roofBaseY + 13, 2); // Gegyo ornament (懸魚)
  doc.addText('DIM_TEXT', cx, roofRidgeY + 4, 3.5, '祓殿大棟 (檜皮葺・千鳥破風付入母屋造)', 'CENTER');

  // 東西回廊の屋根連鎖 (Wing Corridor Roofs)
  doc.addLine('ROOF_WALL', cx - roofW / 2, eavesDropY, offsetX + 60, eavesDropY);
  doc.addLine('ROOF_WALL', cx + roofW / 2, eavesDropY, offsetX + 520, eavesDropY);
  doc.addLine('ROOF_WALL', cx - roofW / 2, eavesDropY + 6, offsetX + 60, eavesDropY + 6);
  doc.addLine('ROOF_WALL', cx + roofW / 2, eavesDropY + 6, offsetX + 520, eavesDropY + 6);
  doc.addText('DIM_TEXT', offsetX + 110, eavesDropY + 9, 2.5, '西回廊屋根');
  doc.addText('DIM_TEXT', offsetX + 440, eavesDropY + 9, 2.5, '東回廊屋根');


  // ==========================================
  // SECTION B: 大鳥居立面図 (Lower Half)
  // ==========================================
  const torY0 = offsetY + 65; // Seabed / Datum for Torii
  doc.addText('DIM_TEXT', offsetX + 25, torY0 + 135, 4.5, '【大鳥居立面図 (南面正面)】 縮尺 1:200');
  doc.addText('DIM_TEXT', offsetX + 25, torY0 + 128, 2.8, '木造四脚鳥居 (主柱・袖柱・笠木・島木・千本杭基礎)');

  // Datum & Tide lines for Torii
  doc.addLine('COAST_SEA', offsetX + 20, torY0, offsetX + 560, torY0);
  doc.addText('COAST_SEA', offsetX + 25, torY0 + 2, 2.5, '砂泥底面 (海底面 ±0.00m)');

  const torHWL = torY0 + 3.4 * S;
  doc.addLine('COAST_SEA', offsetX + 20, torHWL, offsetX + 560, torHWL);
  doc.addText('COAST_SEA', offsetX + 25, torHWL + 2, 2.5, '満潮位 (+3.40m)');

  // Torii Dimensions (1:200 scale)
  // Total Height = 16.6m -> 16.6 * 5 = 83.0mm
  // Main Pillar Center Span = 10.9m -> 10.9 * 5 = 54.5mm
  // Kasagi Total Length = 24.2m -> 24.2 * 5 = 121.0mm
  // Main Pillar Dia = 3.6m circumference -> dia ~ 1.15m -> ~5.8mm
  const tMainSpan = 10.9 * S; // 54.5mm
  const tMainR = 3.0; // dia ~6mm
  const tLeftP = cx - tMainSpan / 2;
  const tRightP = cx + tMainSpan / 2;
  const tTotalH = 16.6 * S; // 83mm
  const tNukiH = 9.8 * S;  // 49mm (貫天端)
  const tShimagiH = 15.2 * S; // 76mm (島木下端)

  // 1. 千本杭基礎 (Thousands Piles Foundation underneath sand)
  const pileBoxW = 75;
  const pileBoxH = 15;
  doc.addRect('STRUCTURE', cx - pileBoxW / 2, torY0 - pileBoxH, pileBoxW, pileBoxH);
  for (let p = 0; p < 24; p++) {
    const ppx = cx - pileBoxW / 2 + 3 + p * 3;
    doc.addLine('STRUCTURE', ppx, torY0, ppx, torY0 - pileBoxH);
  }
  doc.addText('DIM_TEXT', cx, torY0 - pileBoxH / 2, 2.8, '地中埋設 千本杭基礎 (松丸太杭・割石詰)', 'CENTER');

  // 根石・根固め (Root base stone)
  doc.addRect('STRUCTURE', tLeftP - 7, torY0, 14, 4);
  doc.addRect('STRUCTURE', tRightP - 7, torY0, 14, 4);

  // 2. 主柱 (Main Pillars:楠クスノキ巨木 円柱、下膨れのエントレシス)
  // Left Pillar
  doc.addLine('STRUCTURE', tLeftP - tMainR * 1.2, torY0 + 4, tLeftP - tMainR * 0.9, torY0 + tShimagiH);
  doc.addLine('STRUCTURE', tLeftP + tMainR * 1.2, torY0 + 4, tLeftP + tMainR * 0.9, torY0 + tShimagiH);
  // Right Pillar
  doc.addLine('STRUCTURE', tRightP - tMainR * 0.9, torY0 + tShimagiH, tRightP - tMainR * 1.2, torY0 + 4);
  doc.addLine('STRUCTURE', tRightP + tMainR * 0.9, torY0 + tShimagiH, tRightP + tMainR * 1.2, torY0 + 4);

  // 3. 袖柱 (Side Pillars: 四脚鳥居の控柱 4本)
  const sOffset = 7.0; // ~1.4m to sides in elevation projection
  // Left Side Pillars
  doc.addLine('STRUCTURE', tLeftP - sOffset - 1.8, torY0 + 4, tLeftP - sOffset - 1.2, torY0 + tNukiH * 0.85);
  doc.addLine('STRUCTURE', tLeftP - sOffset + 1.8, torY0 + 4, tLeftP - sOffset + 1.2, torY0 + tNukiH * 0.85);
  // Right Side Pillars
  doc.addLine('STRUCTURE', tRightP + sOffset - 1.2, torY0 + tNukiH * 0.85, tRightP + sOffset - 1.8, torY0 + 4);
  doc.addLine('STRUCTURE', tRightP + sOffset + 1.2, torY0 + tNukiH * 0.85, tRightP + sOffset + 1.8, torY0 + 4);
  // 袖柱の笠木屋根 (Mini roofs on side pillars)
  doc.addPolyline('ROOF_WALL', [
    { x: tLeftP - sOffset - 4, y: torY0 + tNukiH * 0.85 },
    { x: tLeftP - sOffset, y: torY0 + tNukiH * 0.85 + 2.5 },
    { x: tLeftP - sOffset + 4, y: torY0 + tNukiH * 0.85 }
  ]);
  doc.addPolyline('ROOF_WALL', [
    { x: tRightP + sOffset - 4, y: torY0 + tNukiH * 0.85 },
    { x: tRightP + sOffset, y: torY0 + tNukiH * 0.85 + 2.5 },
    { x: tRightP + sOffset + 4, y: torY0 + tNukiH * 0.85 }
  ]);

  // 4. 貫 (Tie Beam: Nuki) with Wedge (楔)
  const nukiW = tMainSpan + 28;
  const nukiH = 4.5;
  doc.addRect('STRUCTURE', cx - nukiW / 2, torY0 + tNukiH - nukiH, nukiW, nukiH);
  // Kusabi (Wedges)
  doc.addLine('STRUCTURE', tLeftP - tMainR - 1.5, torY0 + tNukiH + 1, tLeftP - tMainR - 1.5, torY0 + tNukiH - nukiH - 1);
  doc.addLine('STRUCTURE', tLeftP + tMainR + 1.5, torY0 + tNukiH + 1, tLeftP + tMainR + 1.5, torY0 + tNukiH - nukiH - 1);
  doc.addLine('STRUCTURE', tRightP - tMainR - 1.5, torY0 + tNukiH + 1, tRightP - tMainR - 1.5, torY0 + tNukiH - nukiH - 1);
  doc.addLine('STRUCTURE', tRightP + tMainR + 1.5, torY0 + tNukiH + 1, tRightP + tMainR + 1.5, torY0 + tNukiH - nukiH - 1);

  // 5. 額束 & 扁額 (Tablet: '伊都岐島神社' / '嚴嶋神社')
  const tabW = 9.0;
  const tabH = 14.0;
  const tabY = torY0 + tNukiH;
  doc.addRect('STRUCTURE', cx - tabW / 2, tabY, tabW, tabH);
  doc.addRect('ROOF_WALL', cx - tabW / 2 + 1, tabY + 1, tabW - 2, tabH - 2);
  doc.addText('DIM_TEXT', cx, tabY + tabH / 2, 2.8, '扁額', 'CENTER');

  // 6. 島木 & 笠木 (Curved Upper Lintels)
  const kasagiSpan = 24.2 * S; // 121mm
  const kasagiY = torY0 + tTotalH;
  // Shimagi
  doc.addPolyline('STRUCTURE', [
    { x: cx - kasagiSpan * 0.44, y: torY0 + tShimagiH },
    { x: cx, y: torY0 + tShimagiH + 1.5 },
    { x: cx + kasagiSpan * 0.44, y: torY0 + tShimagiH },
    { x: cx + kasagiSpan * 0.45, y: torY0 + tShimagiH + 5 },
    { x: cx, y: torY0 + tShimagiH + 6.5 },
    { x: cx - kasagiSpan * 0.45, y: torY0 + tShimagiH + 5 }
  ], true);

  // Kasagi (Top beam with dramatic upturn curve - 反り増し)
  doc.addPolyline('ROOF_WALL', [
    { x: cx - kasagiSpan / 2, y: kasagiY - 2 },
    { x: cx - kasagiSpan * 0.3, y: kasagiY - 4 },
    { x: cx, y: kasagiY - 4.5 },
    { x: cx + kasagiSpan * 0.3, y: kasagiY - 4 },
    { x: cx + kasagiSpan / 2, y: kasagiY - 2 },
    { x: cx + kasagiSpan / 2 + 1, y: kasagiY + 3 },
    { x: cx + kasagiSpan * 0.3, y: kasagiY + 1 },
    { x: cx, y: kasagiY + 0.5 },
    { x: cx - kasagiSpan * 0.3, y: kasagiY + 1 },
    { x: cx - kasagiSpan / 2 - 1, y: kasagiY + 3 }
  ], true);

  // Kasagi Copper Plating line & Box roof
  doc.addLine('ROOF_WALL', cx - kasagiSpan / 2 - 2, kasagiY + 3.5, cx + kasagiSpan / 2 + 2, kasagiY + 3.5);

  // Torii Dimension Lines
  // Total Height Dim (Right side)
  const dimXR = cx + kasagiSpan / 2 + 15;
  doc.addLine('DIM_TEXT', dimXR, torY0, dimXR, kasagiY + 3.5);
  doc.addLine('DIM_TEXT', dimXR - 3, torY0, dimXR + 3, torY0);
  doc.addLine('DIM_TEXT', dimXR - 3, kasagiY + 3.5, dimXR + 3, kasagiY + 3.5);
  doc.addText('DIM_TEXT', dimXR + 5, (torY0 + kasagiY) / 2, 2.8, '全高 16,600mm (55尺)');

  // Main Pillar Center Span Dim (Below Ground)
  const dimYB = torY0 + 8;
  doc.addLine('DIM_TEXT', tLeftP, dimYB, tRightP, dimYB);
  doc.addLine('DIM_TEXT', tLeftP, dimYB - 3, tLeftP, dimYB + 3);
  doc.addLine('DIM_TEXT', tRightP, dimYB - 3, tRightP, dimYB + 3);
  doc.addText('DIM_TEXT', cx, dimYB + 2, 2.8, '柱芯間 10,900mm (36尺)', 'CENTER');

  // Kasagi Width Dim (Top)
  const dimYT = kasagiY + 10;
  doc.addLine('DIM_TEXT', cx - kasagiSpan / 2, dimYT, cx + kasagiSpan / 2, dimYT);
  doc.addLine('DIM_TEXT', cx - kasagiSpan / 2, dimYT - 3, cx - kasagiSpan / 2, dimYT + 3);
  doc.addLine('DIM_TEXT', cx + kasagiSpan / 2, dimYT - 3, cx + kasagiSpan / 2, dimYT + 3);
  doc.addText('DIM_TEXT', cx, dimYT + 2, 2.8, '笠木総長 24,200mm (80尺)', 'CENTER');
}

/**
 * Builds a single DXF Document for any requested sheet or all sheets side-by-side.
 * Supports Paper Space (A2 594x420mm) or Model Space (1:1 real world millimeters with text scaled).
 */
export function buildDxfForSheet(
  sheetId: 'sheet1' | 'sheet2' | 'sheet3' | 'all',
  spaceMode: 'paper' | 'model' = 'paper'
): DxfDocument {
  const doc = new DxfDocument();

  if (sheetId === 'sheet1') {
    generateSheet1SitePlan(doc, 0, 0);
  } else if (sheetId === 'sheet2') {
    generateSheet2ShrinePlan(doc, 0, 0);
  } else if (sheetId === 'sheet3') {
    generateSheet3Elevations(doc, 0, 0);
  } else if (sheetId === 'all') {
    // Generate all 3 sheets side-by-side in one mega DXF file (spaced by 650mm)
    generateSheet1SitePlan(doc, 0, 0);
    generateSheet2ShrinePlan(doc, 650, 0);
    generateSheet3Elevations(doc, 1300, 0);
  }

  if (spaceMode === 'model') {
    const scaleRatio =
      sheetId === 'sheet1' ? 600 : sheetId === 'sheet2' ? 300 : sheetId === 'sheet3' ? 200 : 1;
    return doc.cloneWithModelScale(scaleRatio);
  }

  return doc;
}
