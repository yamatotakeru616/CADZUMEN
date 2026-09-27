import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DxfDocument, DxfEntity } from '../cad/dxfGenerator';
import { ZoomIn, ZoomOut, Maximize2, Layers, Download, Check, Eye, EyeOff } from 'lucide-react';

interface CadViewerProps {
  doc: DxfDocument;
  title: string;
  subTitle: string;
  sheetNumber: string;
  scaleStr: string;
}

// AutoCAD ACI color mapping to display CSS colors
const ACI_COLORS: Record<number, string> = {
  1: '#EF4444', // Red
  2: '#EAB308', // Yellow
  3: '#22C55E', // Green
  4: '#06B6D4', // Cyan
  5: '#3B82F6', // Blue
  6: '#D946EF', // Magenta
  7: '#F3F4F6', // White / Light Grey
};

export const CadViewer: React.FC<CadViewerProps> = ({
  doc,
  title,
  subTitle,
  sheetNumber,
  scaleStr,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Transform state: pan & zoom
  const [transform, setTransform] = useState({ x: 40, y: 30, scale: 1.2 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0 });
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    FRAME: true,
    CENTER: true,
    STRUCTURE: true,
    ROOF_WALL: true,
    COAST_SEA: true,
    DIM_TEXT: true,
    HATCH: true,
  });
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [textScale, setTextScale] = useState(1.0); // 1.0 = standard CAD proportional size

  // Toggle layer visibility
  const toggleLayer = (layerName: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  // Fit drawing to viewport
  const handleFit = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;

    // A2 bounding dimensions: 594mm x 420mm (or wider if multi-sheet)
    let minX = 0;
    let maxX = 594;
    let minY = 0;
    let maxY = 420;

    for (const ent of doc.entities) {
      if (ent.type === 'LINE') {
        minX = Math.min(minX, ent.x1, ent.x2);
        maxX = Math.max(maxX, ent.x1, ent.x2);
        minY = Math.min(minY, ent.y1, ent.y2);
        maxY = Math.max(maxY, ent.y1, ent.y2);
      }
    }

    const dw = maxX - minX || 594;
    const dh = maxY - minY || 420;

    const scaleX = (cw - 60) / dw;
    const scaleY = (ch - 60) / dh;
    const s = Math.min(scaleX, scaleY);

    setTransform({
      scale: s,
      x: (cw - dw * s) / 2 - minX * s,
      y: ch - (ch - dh * s) / 2 + minY * s, // invert Y for CAD coordinate system
    });
  }, [doc]);

  useEffect(() => {
    handleFit();
  }, [handleFit]);

  // Handle Zoom
  const handleZoom = (delta: number, clientX?: number, clientY?: number) => {
    setTransform((prev) => {
      const zoomFactor = delta > 0 ? 1.25 : 0.8;
      const nextScale = Math.max(0.1, Math.min(prev.scale * zoomFactor, 20));

      if (clientX !== undefined && clientY !== undefined && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        const nextX = mx - (mx - prev.x) * (nextScale / prev.scale);
        const nextY = my - (my - prev.y) * (nextScale / prev.scale);
        return { x: nextX, y: nextY, scale: nextScale };
      }

      return { ...prev, scale: nextScale };
    });
  };

  // Mouse wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY);
  };

  // Drag Pan
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert screen coordinates to CAD World coordinates (mm)
    const cadX = (mx - transform.x) / transform.scale;
    const cadY = (transform.y - my) / transform.scale;
    setMouseCoord({ x: cadX, y: cadY });

    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = isDarkTheme ? '#0d1117' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw Subtle CAD Grid
    const gridSize = 10 * transform.scale; // 10mm CAD grid
    if (gridSize > 8) {
      ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      const startX = transform.x % gridSize;
      const startY = transform.y % gridSize;

      ctx.beginPath();
      for (let x = startX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = startY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }

    // World to Screen Matrix Transform
    // Note: In CAD, Y is UP (+Y = up), in Screen Canvas, Y is DOWN (+Y = down).
    const worldToScreen = (wx: number, wy: number) => {
      const sx = transform.x + wx * transform.scale;
      const sy = transform.y - wy * transform.scale;
      return { sx, sy };
    };

    // Helper for layer color
    const getColor = (layerName: string) => {
      const layer = doc.layers.get(layerName);
      const colorNum = layer ? layer.colorNumber : 7;
      let col = ACI_COLORS[colorNum] || '#F3F4F6';
      if (!isDarkTheme && (colorNum === 7 || col === '#F3F4F6')) {
        col = '#1E293B'; // Use dark slate in light theme for white CAD lines
      }
      return col;
    };

    // Render Entities
    for (const ent of doc.entities) {
      if (activeLayers[ent.layer] === false) continue;

      ctx.strokeStyle = getColor(ent.layer);
      ctx.fillStyle = getColor(ent.layer);

      // Lineweight & Linetype styling
      if (ent.layer === 'FRAME') {
        ctx.lineWidth = Math.max(1, 1.4 * Math.min(transform.scale, 2));
        ctx.setLineDash([]);
      } else if (ent.layer === 'STRUCTURE') {
        ctx.lineWidth = Math.max(1, 1.2 * Math.min(transform.scale, 2));
        ctx.setLineDash([]);
      } else if (ent.layer === 'CENTER') {
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 3, 2, 3]); // Center line dash
      } else if (ent.layer === 'HATCH') {
        ctx.lineWidth = 0.8;
        ctx.setLineDash([]);
      } else {
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
      }

      if (ent.type === 'LINE') {
        const p1 = worldToScreen(ent.x1, ent.y1);
        const p2 = worldToScreen(ent.x2, ent.y2);
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      } else if (ent.type === 'CIRCLE') {
        const center = worldToScreen(ent.cx, ent.cy);
        const r = ent.radius * transform.scale;
        ctx.beginPath();
        ctx.arc(center.sx, center.sy, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.stroke();
      } else if (ent.type === 'ARC') {
        const center = worldToScreen(ent.cx, ent.cy);
        const r = ent.radius * transform.scale;
        // Invert angles due to flipped Y
        const startRad = (-ent.endAngle * Math.PI) / 180;
        const endRad = (-ent.startAngle * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(center.sx, center.sy, Math.max(0.5, r), startRad, endRad);
        ctx.stroke();
      } else if (ent.type === 'POLYLINE') {
        if (ent.points.length > 1) {
          ctx.beginPath();
          const first = worldToScreen(ent.points[0].x, ent.points[0].y);
          ctx.moveTo(first.sx, first.sy);
          for (let i = 1; i < ent.points.length; i++) {
            const pt = worldToScreen(ent.points[i].x, ent.points[i].y);
            ctx.lineTo(pt.sx, pt.sy);
          }
          if (ent.closed) {
            ctx.closePath();
          }
          ctx.stroke();
        }
      } else if (ent.type === 'TEXT') {
        const p = worldToScreen(ent.x, ent.y);
        // Accurate real-world proportional font sizing with adjustable multiplier
        const actualFontSize = ent.height * transform.scale * textScale;

        // Render if text is within visible range
        if (actualFontSize >= 2 && actualFontSize <= 120) {
          ctx.font = `${Math.max(6, Math.round(actualFontSize))}px "Noto Sans JP", "JetBrains Mono", sans-serif`;
          ctx.textAlign = ent.align === 'CENTER' ? 'center' : ent.align === 'RIGHT' ? 'right' : 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(ent.text, p.sx, p.sy);
        }
      }
    }

    ctx.restore();
  }, [doc, transform, activeLayers, isDarkTheme, textScale]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[620px] rounded-xl overflow-hidden select-none border ${
        isDarkTheme ? 'bg-[#0d1117] border-neutral-800' : 'bg-[#f8fafc] border-neutral-200'
      }`}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* CAD Canvas Engine */}
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair block" />

      {/* Floating Header Overlay: Drawing Metadata */}
      <div className="absolute top-3 left-4 pointer-events-none flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {sheetNumber}
          </span>
          <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            SCALE {scaleStr}
          </span>
          <span className="px-2 py-0.5 text-xs font-mono rounded bg-neutral-800/80 text-neutral-300 border border-neutral-700">
            JIS A2 (594 × 420 mm)
          </span>
        </div>
        <h2 className={`text-base font-bold tracking-wide mt-1 ${isDarkTheme ? 'text-white' : 'text-neutral-900'}`}>
          {title}
        </h2>
        <p className={`text-xs ${isDarkTheme ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {subTitle}
        </p>
      </div>

      {/* Floating Coordinate HUD (Bottom Left) */}
      <div className="absolute bottom-3 left-4 bg-neutral-900/90 backdrop-blur border border-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500">X:</span>
          <span className="text-cyan-400">{mouseCoord.x.toFixed(2)} mm</span>
        </div>
        <div className="w-px h-3 bg-neutral-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500">Y:</span>
          <span className="text-emerald-400">{mouseCoord.y.toFixed(2)} mm</span>
        </div>
        <div className="w-px h-3 bg-neutral-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500">ZOOM:</span>
          <span className="text-amber-400">{Math.round(transform.scale * 100)}%</span>
        </div>
      </div>

      {/* Controls Bar (Top Right) */}
      <div className="absolute top-3 right-4 flex items-center gap-2">
        {/* Layer Visibility Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-md transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>レイヤー ({Object.values(activeLayers).filter(Boolean).length})</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-700 p-2 shadow-2xl z-50 flex flex-col gap-1">
              <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                CAD レイヤー一覧 (ACI)
              </div>
              {Array.from(doc.layers.values()).map((l) => {
                const isVis = activeLayers[l.name] !== false;
                const col = ACI_COLORS[l.colorNumber] || '#fff';
                return (
                  <button
                    key={l.name}
                    onClick={() => toggleLayer(l.name)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-neutral-800/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col }} />
                      <span className="text-neutral-200 font-mono text-[11px]">{l.name}</span>
                    </div>
                    {isVis ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme Toggle (Dark CAD vs White Print) */}
        <button
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-md transition-colors"
        >
          {isDarkTheme ? '黒板CAD' : '白紙印刷'}
        </button>

        {/* Text Size Scale Toggle */}
        <div className="flex items-center rounded-lg bg-neutral-900/90 border border-neutral-700 p-0.5 text-xs font-mono">
          <span className="px-2 text-[10px] text-neutral-400">文字:</span>
          {[0.7, 1.0, 1.4].map((sz) => (
            <button
              key={sz}
              onClick={() => setTextScale(sz)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                textScale === sz
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {sz === 0.7 ? '小' : sz === 1.0 ? '標準' : '大'}
            </button>
          ))}
        </div>

        {/* Zoom In */}
        <button
          onClick={() => handleZoom(1)}
          className="p-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-md transition-colors"
          title="拡大 (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => handleZoom(-1)}
          className="p-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-md transition-colors"
          title="縮小 (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Fit to View */}
        <button
          onClick={handleFit}
          className="p-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-cyan-400 border border-neutral-700 shadow-md transition-colors"
          title="図面全体を表示 (Fit to Window)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
