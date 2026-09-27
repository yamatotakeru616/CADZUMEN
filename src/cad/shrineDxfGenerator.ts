/**
 * Parametric Shinto Shrine CAD Generator for arbitrary shrines.
 * Conforms to JIS A2 (594mm x 420mm) standard, unit mm.
 *
 * Sheet 1: 境内配置図 (Site Plan) Scale 1:600
 * Sheet 2: 社殿群平面図 (Shrine Plan) Scale 1:300
 * Sheet 3: 本社立面図 及び 大鳥居立面図 (Elevations) Scale 1:200
 */

import { DxfDocument } from './dxfGenerator';
import { ShrineProfile, PRESET_SHRINES } from './shrineArchitectures';

export interface SheetConfig {
  id: 'sheet1' | 'sheet2' | 'sheet3' | 'all';
  sheetNumber: string;
  title: string;
  subTitle: string;
  scaleStr: string;
  scaleValue: number;
}

export function getSheetConfigsForShrine(profile: ShrineProfile): Record<string, SheetConfig> {
  return {
    sheet1: {
      id: 'sheet1',
      sheetNumber: 'A2-01/03',
      title: `${profile.name} 境内配置図`,
      subTitle: `${profile.topologyName}・大鳥居・参道・社殿配置計画`,
      scaleStr: '1:600',
      scaleValue: 600,
    },
    sheet2: {
      id: 'sheet2',
      sheetNumber: 'A2-02/03',
      title: `${profile.name} 社殿群平面図`,
      subTitle: `${profile.styleName}・本殿・拝殿・柱列格子グリッド`,
      scaleStr: '1:300',
      scaleValue: 300,
    },
    sheet3: {
      id: 'sheet3',
      sheetNumber: 'A2-03/03',
      title: `${profile.name} 本社 及び 大鳥居立面図`,
      subTitle: `本社正面立面図 / ${profile.toriiName}`,
      scaleStr: '1:200',
      scaleValue: 200,
    },
  };
}

/**
 * Standard A2 Title Block & Frame (JIS A2: 594mm x 420mm)
 */
export function addA2BorderAndTitleBlock(
  doc: DxfDocument,
  offsetX: number,
  offsetY: number,
  config: SheetConfig,
  profile: ShrineProfile
) {
  const W = 594;
  const H = 420;
  const margin = 10;
  const x0 = offsetX;
  const y0 = offsetY;

  // Outer paper edge
  doc.addRect('FRAME', x0, y0, W, H);

  // Inner drawing border
  const ix = x0 + margin;
  const iy = y0 + margin;
  const iw = W - margin * 2;
  const ih = H - margin * 2;
  doc.addRect('FRAME', ix, iy, iw, ih);

  // Grid markers (A B C D / 1 2 3 4)
  const cols = 6;
  const rows = 4;
  for (let i = 1; i < cols; i++) {
    const gx = ix + (iw / cols) * i;
    doc.addLine('FRAME', gx, iy, gx, iy + 3);
    doc.addLine('FRAME', gx, iy + ih - 3, gx, iy + ih);
    doc.addText('FRAME', gx, iy + ih - 6.5, 3.0, `${i}`, 'CENTER');
  }
  for (let j = 1; j < rows; j++) {
    const gy = iy + (ih / rows) * j;
    doc.addLine('FRAME', ix, gy, ix + 3, gy);
    doc.addLine('FRAME', ix + iw - 3, gy, ix + iw, gy);
    doc.addText('FRAME', ix + iw - 6.5, gy, 3.0, String.fromCharCode(64 + j), 'CENTER');
  }

  // Title Block (Bottom Right: 180mm x 50mm)
  const tbW = 180;
  const tbH = 50;
  const tbx = ix + iw - tbW;
  const tby = iy;

  doc.addRect('FRAME', tbx, tby, tbW, tbH);
  doc.addLine('FRAME', tbx, tby + 35, tbx + tbW, tby + 35);
  doc.addLine('FRAME', tbx, tby + 20, tbx + tbW, tby + 20);
  doc.addLine('FRAME', tbx, tby + 10, tbx + tbW, tby + 10);
  doc.addLine('FRAME', tbx + 110, tby, tbx + 110, tby + 35);
  doc.addLine('FRAME', tbx + 55, tby, tbx + 55, tby + 20);

  // Title block texts (JIS 2.5mm ~ 4.8mm)
  doc.addText('FRAME', tbx + 5, tby + 44, 3.2, `伝統建築CAD: ${profile.name} (${profile.styleName})`);
  doc.addText('FRAME', tbx + 5, tby + 38, 2.5, `LOCATION: ${profile.location.toUpperCase()}`);

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
  doc.addPolyline('DIM_TEXT', [
    { x: naX - 4, y: naY },
    { x: naX, y: naY + naR },
    { x: naX + 4, y: naY },
  ], true);
  doc.addText('DIM_TEXT', naX, naY + naR + 2, 4.5, 'N', 'CENTER');

  // Graphic Scale Bar (Bottom Left)
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
 * SHEET 1: 境配置図 (Site Plan) Scale 1:600
 */
export function generateParametricSitePlan(
  doc: DxfDocument,
  profile: ShrineProfile,
  offsetX = 0,
  offsetY = 0
): void {
  const configs = getSheetConfigsForShrine(profile);
  addA2BorderAndTitleBlock(doc, offsetX, offsetY, configs.sheet1, profile);

  const cx = offsetX + 290;
  const cy = offsetY + 220;
  const S = 1000 / 600; // 1.6667mm per meter

  // Shrine Main Sacred Axis
  doc.addLine('CENTER', cx, cy - 130, cx, cy + 120);
  doc.addText('DIM_TEXT', cx + 5, cy - 125, 2.8, `${profile.name} 主参道・神域主軸線`);

  // Environment / Topology
  if (profile.topology === 'OCEAN') {
    // Coastline & Sea (Itsukushima style)
    doc.addPolyline('COAST_SEA', [
      { x: cx - 220, y: cy + 100 },
      { x: cx - 140, y: cy + 50 },
      { x: cx - 40, y: cy + 15 },
      { x: cx + 40, y: cy + 15 },
      { x: cx + 140, y: cy + 50 },
      { x: cx + 220, y: cy + 100 },
    ]);
    doc.addText('COAST_SEA', cx - 170, cy + 85, 2.5, '満潮位 汀線 (H.W.L +3.4m)');
    doc.addText('COAST_SEA', cx + 70, cy - 118, 2.5, '干潮時 干潟露出汀線 (L.W.L)');
  } else if (profile.topology === 'MOUNTAIN') {
    // Mountain Contours (Izumo / Nikko style)
    for (let c = 0; c < 4; c++) {
      const yContour = cy + 60 + c * 20;
      doc.addPolyline('COAST_SEA', [
        { x: cx - 230, y: yContour - 10 },
        { x: cx - 120, y: yContour + 5 },
        { x: cx, y: yContour },
        { x: cx + 120, y: yContour + 8 },
        { x: cx + 230, y: yContour - 5 },
      ]);
    }
    doc.addText('COAST_SEA', cx, cy + 130, 2.8, '背後神体山 等高線地形 (禁足地深林)', 'CENTER');
  } else {
    // Forest Boundary & Stream (Ise / Meiji style)
    doc.addRect('COAST_SEA', cx - 210, cy - 120, 420, 240);
    doc.addText('COAST_SEA', cx - 180, cy + 105, 2.5, '神宮林・社叢境界 (巨木鬱蒼)');
    // River / Stream
    doc.addPolyline('COAST_SEA', [
      { x: cx - 220, y: cy - 90 },
      { x: cx - 100, y: cy - 70 },
      { x: cx + 50, y: cy - 90 },
      { x: cx + 220, y: cy - 80 },
    ]);
    doc.addText('COAST_SEA', cx + 100, cy - 85, 2.5, '御手洗川・清流');
  }

  // Torii at Entrance
  const toriiY = cy - 85;
  const toriiSpan = 18 * S;
  const toriiThick = 3.5 * S;
  doc.addRect('STRUCTURE', cx - toriiSpan / 2, toriiY - toriiThick / 2, toriiSpan, toriiThick);
  doc.addCircle('STRUCTURE', cx - toriiSpan / 2 + 2.5, toriiY, 1.8);
  doc.addCircle('STRUCTURE', cx + toriiSpan / 2 - 2.5, toriiY, 1.8);
  doc.addText('DIM_TEXT', cx, toriiY - 11, 3.8, `${profile.toriiName}`, 'CENTER');
  doc.addText('DIM_TEXT', cx, toriiY - 17, 2.5, '主鳥居 (一の鳥居・神域結界)', 'CENTER');

  // Sando (Approach Path)
  const stageY = cy + 15;
  const sandoW = 12 * S;
  doc.addLine('STRUCTURE', cx - sandoW / 2, toriiY + toriiThick / 2, cx - sandoW / 2, stageY - 15);
  doc.addLine('STRUCTURE', cx + sandoW / 2, toriiY + toriiThick / 2, cx + sandoW / 2, stageY - 15);
  doc.addText('DIM_TEXT', cx, (toriiY + stageY) / 2, 2.8, '表参道 (玉砂利敷)', 'CENTER');

  // Main Sanctuary Cluster
  const honW = 24 * S;
  const honH = 30 * S;
  doc.addRect('STRUCTURE', cx - honW / 2, stageY, honW, honH);
  doc.addText('DIM_TEXT', cx, stageY + honH / 2 + 3.5, 3.8, `${profile.name} 御社殿群`, 'CENTER');
  doc.addText('DIM_TEXT', cx, stageY + honH / 2 - 3.5, 2.5, `(${profile.styleName})`, 'CENTER');

  // Sub-shrines & Enclosures
  doc.addRect('ROOF_WALL', cx - honW / 2 - 10 * S, stageY - 5 * S, honW + 20 * S, honH + 15 * S);
  doc.addText('ROOF_WALL', cx + honW / 2 + 12 * S, stageY + honH / 2, 2.5, '御垣・玉垣囲壁');

  // Feature notes
  doc.addText('DIM_TEXT', offsetX + 25, offsetY + 60, 3.5, `【${profile.name} 境内構成要目】`);
  profile.features.forEach((feat, idx) => {
    doc.addText('DIM_TEXT', offsetX + 25, offsetY + 52 - idx * 6, 2.5, `・${feat}`);
  });
}

/**
 * SHEET 2: 社殿群平面図 (Shrine Plan) Scale 1:300
 */
export function generateParametricShrinePlan(
  doc: DxfDocument,
  profile: ShrineProfile,
  offsetX = 0,
  offsetY = 0
): void {
  const configs = getSheetConfigsForShrine(profile);
  addA2BorderAndTitleBlock(doc, offsetX, offsetY, configs.sheet2, profile);

  const cx = offsetX + 290;
  const cy = offsetY + 200;
  const S = 1000 / 300; // 3.3333mm per meter

  const bayM = profile.hondenSpan.bayMeter;
  const bay = bayM * S;
  const numX = profile.hondenSpan.xBays;
  const numY = profile.hondenSpan.yBays;

  const startX = cx - (numX / 2) * bay;
  const startY = cy - (numY / 2) * bay + 25;

  // Grid Axes (X & Y)
  for (let i = 0; i <= numX; i++) {
    const gx = startX + i * bay;
    doc.addLine('CENTER', gx, startY - 20, gx, startY + numY * bay + 20);
    doc.addCircle('DIM_TEXT', gx, startY - 26, 4.2);
    doc.addText('DIM_TEXT', gx, startY - 26, 3.0, `X${i + 1}`, 'CENTER');
  }

  for (let j = 0; j <= numY; j++) {
    const gy = startY + j * bay;
    doc.addLine('CENTER', startX - 25, gy, startX + numX * bay + 25, gy);
    doc.addCircle('DIM_TEXT', startX - 31, gy, 4.2);
    doc.addText('DIM_TEXT', startX - 31, gy, 3.0, `Y${j + 1}`, 'CENTER');
  }

  // Dimension line
  doc.addLine('DIM_TEXT', startX, startY - 14, startX + numX * bay, startY - 14);
  doc.addText('DIM_TEXT', cx, startY - 18, 2.8, `柱間グリッド: 1間 = ${(bayM * 1000).toFixed(0)}mm`, 'CENTER');

  // Main Sanctuary (本殿)
  const hondenW = numX * bay;
  const hondenH = numY * bay;
  doc.addRect('STRUCTURE', startX, startY, hondenW, hondenH);
  doc.addText('DIM_TEXT', cx, startY + hondenH / 2, 4.0, `本殿 (${profile.styleName})`, 'CENTER');

  // Architectural style-specific pillars and layouts
  if (profile.style === 'TAISHA') {
    // 2x2 Taisha-zukuri: 9 pillars including Central Shin-no-Mihashira (心御柱)
    for (let xi = 0; xi <= 2; xi++) {
      for (let yi = 0; yi <= 2; yi++) {
        const px = startX + xi * bay;
        const py = startY + yi * bay;
        const isCenter = xi === 1 && yi === 1;
        doc.addCircle('STRUCTURE', px, py, isCenter ? 2.0 : 1.4);
      }
    }
    doc.addText('DIM_TEXT', cx, startY + bay - 5, 2.8, '中心 心御柱 (巨大木柱φ1000mm)', 'CENTER');
  } else if (profile.style === 'SHINMEI') {
    // Shinmei-zukuri: side freestanding Munamochi-bashira (棟持柱)
    for (let xi = 0; xi <= numX; xi++) {
      for (let yi = 0; yi <= numY; yi++) {
        doc.addCircle('STRUCTURE', startX + xi * bay, startY + yi * bay, 1.2);
      }
    }
    // Independent ridge pillars (棟持柱)
    const mPillarOffset = 2.5 * S;
    doc.addCircle('STRUCTURE', startX - mPillarOffset, startY + hondenH / 2, 1.6);
    doc.addCircle('STRUCTURE', startX + hondenW + mPillarOffset, startY + hondenH / 2, 1.6);
    doc.addText('DIM_TEXT', startX - mPillarOffset - 5, startY + hondenH / 2, 2.8, '西 棟持柱', 'RIGHT');
    doc.addText('DIM_TEXT', startX + hondenW + mPillarOffset + 5, startY + hondenH / 2, 2.8, '東 棟持柱');
  } else if (profile.style === 'GONGEN') {
    // Gongen-zukuri: H-shaped interconnected Honden - Ishi-no-ma - Haiden
    const ishiH = 2 * bay;
    const ishiW = 2 * bay;
    doc.addRect('STRUCTURE', cx - ishiW / 2, startY - ishiH, ishiW, ishiH);
    doc.addText('DIM_TEXT', cx, startY - ishiH / 2, 2.8, '石の間 (相の間・一段低床)', 'CENTER');

    // Haiden (拝殿)
    const haidenH = 3 * bay;
    const haidenW = 5 * bay;
    doc.addRect('STRUCTURE', cx - haidenW / 2, startY - ishiH - haidenH, haidenW, haidenH);
    doc.addText('DIM_TEXT', cx, startY - ishiH - haidenH / 2, 3.5, '拝殿 (入母屋造・唐破風)', 'CENTER');
  } else {
    // General / Nagare / Shinden
    for (let xi = 0; xi <= numX; xi++) {
      for (let yi = 0; yi <= numY; yi++) {
        doc.addCircle('STRUCTURE', startX + xi * bay, startY + yi * bay, 1.0);
      }
    }
    // Front worship hall (拝殿)
    const haidenY = startY - 4 * bay;
    doc.addRect('STRUCTURE', startX, haidenY, hondenW, 2.5 * bay);
    doc.addText('DIM_TEXT', cx, haidenY + 1.25 * bay, 3.5, '拝殿・祝詞殿', 'CENTER');
  }

  // Specifications
  doc.addText('DIM_TEXT', offsetX + 25, offsetY + 65, 3.8, `【${profile.name} 建築構造特記事項】`);
  doc.addText('DIM_TEXT', offsetX + 25, offsetY + 57, 2.5, `1. 様式: ${profile.styleDescription}`);
  doc.addText('DIM_TEXT', offsetX + 25, offsetY + 50, 2.5, `2. 柱間寸法: 桁行${numX}間 × 梁間${numY}間 (1間=${(bayM * 1000).toFixed(0)}mm)`);
  doc.addText('DIM_TEXT', offsetX + 25, offsetY + 43, 2.5, `3. 基礎・架構: 伝統木造礎石建架構 / 貫・長押固め`);
}

/**
 * SHEET 3: 本社立面図 及び 大鳥居立面図 (Elevations) Scale 1:200
 */
export function generateParametricElevations(
  doc: DxfDocument,
  profile: ShrineProfile,
  offsetX = 0,
  offsetY = 0
): void {
  const configs = getSheetConfigsForShrine(profile);
  addA2BorderAndTitleBlock(doc, offsetX, offsetY, configs.sheet3, profile);

  const cx = offsetX + 290;
  const S = 1000 / 200; // 5.0mm per meter

  // ==========================================
  // SECTION A: 本社正面立面図 (Upper Half)
  // ==========================================
  const shY0 = offsetY + 265;
  doc.addText('DIM_TEXT', offsetX + 25, shY0 + 110, 4.5, `【${profile.name} 本社南面立面図】 縮尺 1:200`);
  doc.addText('DIM_TEXT', offsetX + 25, shY0 + 103, 2.8, `${profile.styleName}・大屋根立面構成`);

  // Ground datum line
  doc.addLine('COAST_SEA', offsetX + 20, shY0, offsetX + 560, shY0);
  doc.addText('COAST_SEA', offsetX + 25, shY0 + 2, 2.5, '基準地盤面 (G.L ±0.00m)');

  const floorY = shY0 + 3.0 * S; // Floor height ~3.0m
  doc.addLine('STRUCTURE', cx - 90, floorY, cx + 90, floorY);
  doc.addText('DIM_TEXT', cx + 95, floorY, 2.8, '床天端 (+3.00m)');

  // Main Roof
  const roofW = 34 * S; // 170mm
  const roofBaseY = floorY + 4.5 * S;
  const roofRidgeY = roofBaseY + 7.0 * S;

  if (profile.style === 'TAISHA') {
    // Taisha-zukuri: Steep Tsumairi gable roof + huge Chigi & Katsuogi
    doc.addPolyline('ROOF_WALL', [
      { x: cx - roofW / 2, y: roofBaseY - 5 },
      { x: cx, y: roofRidgeY + 5 },
      { x: cx + roofW / 2, y: roofBaseY - 5 },
    ]);
    // Chigi (外削ぎ - 男千木)
    doc.addLine('ROOF_WALL', cx - 12, roofRidgeY - 5, cx - 22, roofRidgeY + 25);
    doc.addLine('ROOF_WALL', cx - 8, roofRidgeY - 5, cx + 2, roofRidgeY + 25);
    doc.addLine('ROOF_WALL', cx + 8, roofRidgeY - 5, cx + 18, roofRidgeY + 25);
    doc.addLine('ROOF_WALL', cx + 12, roofRidgeY - 5, cx + 2, roofRidgeY + 25);
    doc.addText('DIM_TEXT', cx, roofRidgeY + 18, 3.5, '大社造 巨大千木(外削ぎ)・勝男木3本', 'CENTER');
  } else if (profile.style === 'SHINMEI') {
    // Shinmei-zukuri: Straight Hirairi roof + Munamochi pillars
    doc.addPolyline('ROOF_WALL', [
      { x: cx - roofW / 2 - 5, y: roofBaseY },
      { x: cx - roofW / 2, y: roofRidgeY },
      { x: cx + roofW / 2, y: roofRidgeY },
      { x: cx + roofW / 2 + 5, y: roofBaseY },
    ]);
    // Munamochi Pillars on sides
    doc.addLine('STRUCTURE', cx - roofW / 2, shY0, cx - roofW / 2, roofRidgeY);
    doc.addLine('STRUCTURE', cx + roofW / 2, shY0, cx + roofW / 2, roofRidgeY);
    doc.addText('DIM_TEXT', cx, roofRidgeY + 8, 3.5, '神明造 独立棟持柱・千木・勝男木10本', 'CENTER');
  } else {
    // Curved Irimoya / Nagare roof
    doc.addPolyline('ROOF_WALL', [
      { x: cx - roofW / 2, y: roofBaseY - 8 },
      { x: cx - roofW * 0.35, y: roofBaseY },
      { x: cx, y: roofRidgeY },
      { x: cx + roofW * 0.35, y: roofBaseY },
      { x: cx + roofW / 2, y: roofBaseY - 8 },
    ]);
    doc.addText('DIM_TEXT', cx, roofRidgeY + 5, 3.5, '檜皮葺屋根 (千鳥破風・唐破風付)', 'CENTER');
  }

  // ==========================================
  // SECTION B: 大鳥居立面図 (Lower Half)
  // ==========================================
  const torY0 = offsetY + 65;
  doc.addText('DIM_TEXT', offsetX + 25, torY0 + 135, 4.5, `【${profile.name} ${profile.toriiName}】 縮尺 1:200`);
  doc.addText('DIM_TEXT', offsetX + 25, torY0 + 128, 2.8, '鳥居正面立面図 (木造規矩術・主要部材寸法)');

  doc.addLine('COAST_SEA', offsetX + 20, torY0, offsetX + 560, torY0);
  doc.addText('COAST_SEA', offsetX + 25, torY0 + 2, 2.5, '地盤面 (G.L ±0.00m)');

  // Torii Geometry
  const tSpan = 11.0 * S; // 55mm
  const tTotalH = 15.0 * S; // 75mm
  const tNukiH = 9.0 * S;
  const tLeft = cx - tSpan / 2;
  const tRight = cx + tSpan / 2;

  // Pillars
  doc.addLine('STRUCTURE', tLeft - 2.5, torY0, tLeft - 2.0, torY0 + tTotalH - 5);
  doc.addLine('STRUCTURE', tLeft + 2.5, torY0, tLeft + 2.0, torY0 + tTotalH - 5);
  doc.addLine('STRUCTURE', tRight - 2.5, torY0, tRight - 2.0, torY0 + tTotalH - 5);
  doc.addLine('STRUCTURE', tRight + 2.5, torY0, tRight + 2.0, torY0 + tTotalH - 5);

  // Tie Beam (貫 Nuki)
  const nukiOver = profile.toriiType === 'SHINMEI' ? 0 : 7; // 神明鳥居は貫が突き抜けない
  doc.addRect('STRUCTURE', tLeft - nukiOver, torY0 + tNukiH, tSpan + nukiOver * 2, 4);

  // Lintel / Kasagi (笠木)
  const kasagiSpan = tSpan + 22;
  if (profile.toriiType === 'SHINMEI') {
    // Straight Kasagi
    doc.addRect('STRUCTURE', cx - kasagiSpan / 2, torY0 + tTotalH - 3, kasagiSpan, 5);
  } else {
    // Curved Kasagi & Shimagi with upturn (反り増し)
    doc.addPolyline('STRUCTURE', [
      { x: cx - kasagiSpan / 2, y: torY0 + tTotalH - 3 },
      { x: cx, y: torY0 + tTotalH - 5 },
      { x: cx + kasagiSpan / 2, y: torY0 + tTotalH - 3 },
      { x: cx + kasagiSpan / 2, y: torY0 + tTotalH + 3 },
      { x: cx, y: torY0 + tTotalH + 1 },
      { x: cx - kasagiSpan / 2, y: torY0 + tTotalH + 3 },
    ], true);
  }

  // Tablet (扁額)
  if (profile.toriiType !== 'SHINMEI') {
    doc.addRect('ROOF_WALL', cx - 5, torY0 + tNukiH + 4, 10, 14);
    doc.addText('DIM_TEXT', cx, torY0 + tNukiH + 11, 2.8, '神額', 'CENTER');
  }

  // Dimensions
  const dimXR = cx + kasagiSpan / 2 + 15;
  doc.addLine('DIM_TEXT', dimXR, torY0, dimXR, torY0 + tTotalH + 3);
  doc.addLine('DIM_TEXT', dimXR - 3, torY0, dimXR + 3, torY0);
  doc.addLine('DIM_TEXT', dimXR - 3, torY0 + tTotalH + 3, dimXR + 3, torY0 + tTotalH + 3);
  doc.addText('DIM_TEXT', dimXR + 5, torY0 + tTotalH / 2, 2.8, '鳥居全高 約15,000mm');

  doc.addText('DIM_TEXT', cx, torY0 + 8, 2.8, '柱芯間 11,000mm', 'CENTER');
}

/**
 * Builds DXF Document for any requested sheet and shrine.
 */
export function buildDxfForShrineSheet(
  profile: ShrineProfile,
  sheetId: 'sheet1' | 'sheet2' | 'sheet3' | 'all',
  spaceMode: 'paper' | 'model' = 'paper'
): DxfDocument {
  const doc = new DxfDocument();

  if (sheetId === 'sheet1') {
    generateParametricSitePlan(doc, profile, 0, 0);
  } else if (sheetId === 'sheet2') {
    generateParametricShrinePlan(doc, profile, 0, 0);
  } else if (sheetId === 'sheet3') {
    generateParametricElevations(doc, profile, 0, 0);
  } else if (sheetId === 'all') {
    generateParametricSitePlan(doc, profile, 0, 0);
    generateParametricShrinePlan(doc, profile, 650, 0);
    generateParametricElevations(doc, profile, 1300, 0);
  }

  if (spaceMode === 'model') {
    const scaleRatio =
      sheetId === 'sheet1' ? 600 : sheetId === 'sheet2' ? 300 : sheetId === 'sheet3' ? 200 : 1;
    return doc.cloneWithModelScale(scaleRatio);
  }

  return doc;
}
