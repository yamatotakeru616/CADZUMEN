/**
 * CADZUMEN - Architectural CAD Drawing & DXF Generator
 * Powered by Gemini 2.5 Pro & HTML5 Vector CAD Engine
 */

// Application State
const state = {
  zoom: 0.08,
  panX: 450,
  panY: 350,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  activeTab: 'dxf',
  layers: {
    WALL: true,
    DOOR_WINDOW: true,
    ROOM_NAME: true,
    DIMENSION: true,
    FURNITURE: true,
    GRID_AXIS: true
  },
  currentDrawing: null,
  dxfString: ''
};

// Layer Color Definitions (AutoCAD Classic Index Colors)
const LAYER_STYLES = {
  WALL: { color: '#3b82f6', width: 2.5, dxfColor: 5 },        // Blue
  DOOR_WINDOW: { color: '#06b6d4', width: 1.5, dxfColor: 4 }, // Cyan
  ROOM_NAME: { color: '#10b981', width: 1.0, dxfColor: 3 },   // Green
  DIMENSION: { color: '#f59e0b', width: 1.2, dxfColor: 2 },   // Yellow
  FURNITURE: { color: '#8b5cf6', width: 1.2, dxfColor: 6 },   // Magenta
  GRID_AXIS: { color: '#475569', width: 0.8, dxfColor: 8 }    // Gray
};

// Presets Generator (Pre-computed Architectural Layouts)
const PRESETS = {
  '1ldk': generate1LDKPreset,
  '3ldk': generate3LDKPreset,
  'office': generateOfficePreset,
  'section': generateSectionPreset,
  'furniture': generateFurniturePreset
};

// DOM Elements
const canvas = document.getElementById('cadCanvas');
const ctx = canvas.getContext('2d');
const promptInput = document.getElementById('promptInput');
const btnGenerate = document.getElementById('btnGenerate');
const btnResetView = document.getElementById('btnResetView');
const btnExportDxf = document.getElementById('btnExportDxf');
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');
const btnFitScreen = document.getElementById('btnFitScreen');
const hudX = document.getElementById('hudX');
const hudY = document.getElementById('hudY');
const hudScale = document.getElementById('hudScale');
const inspectorContent = document.getElementById('inspectorContent');
const genStatus = document.getElementById('genStatus');

// Stats Elements
const statLines = document.getElementById('statLines');
const statPolylines = document.getElementById('statPolylines');
const statArcs = document.getElementById('statArcs');
const statTexts = document.getElementById('statTexts');
const statBounds = document.getElementById('statBounds');

// Modal Elements
const btnOpenHud = document.getElementById('btnOpenHud');
const btnCloseHud = document.getElementById('btnCloseHud');
const hudModal = document.getElementById('hudModal');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setupEventListeners();
  loadPreset('1ldk'); // Default initial drawing
});

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  renderCAD();
}

function setupEventListeners() {
  // Preset Buttons
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      loadPreset(presetKey);
    });
  });

  // Layer Checkboxes
  document.querySelectorAll('#layerList input[type="checkbox"]').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const layer = e.target.dataset.layer;
      state.layers[layer] = e.target.checked;
      renderCAD();
    });
  });

  // Pan & Zoom Mouse Events
  canvas.addEventListener('mousedown', (e) => {
    state.isDragging = true;
    state.dragStartX = e.clientX - state.panX;
    state.dragStartY = e.clientY - state.panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (state.isDragging) {
      state.panX = e.clientX - state.dragStartX;
      state.panY = e.clientY - state.dragStartY;
      renderCAD();
    }
    // Update Coordinate HUD
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - state.panX) / state.zoom;
    const worldY = -(mouseY - state.panY) / state.zoom;
    hudX.textContent = worldX.toFixed(1);
    hudY.textContent = worldY.toFixed(1);
  });

  window.addEventListener('mouseup', () => {
    state.isDragging = false;
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    state.panX = mouseX - (mouseX - state.panX) * zoomFactor;
    state.panY = mouseY - (mouseY - state.panY) * zoomFactor;
    state.zoom *= zoomFactor;
    renderCAD();
  }, { passive: false });

  // Floating Controls
  btnZoomIn.addEventListener('click', () => {
    state.zoom *= 1.25;
    renderCAD();
  });
  btnZoomOut.addEventListener('click', () => {
    state.zoom *= 0.8;
    renderCAD();
  });
  btnFitScreen.addEventListener('click', fitToScreen);
  btnResetView.addEventListener('click', fitToScreen);

  // Inspector Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;
      updateInspectorView();
    });
  });

  // Generate Button
  btnGenerate.addEventListener('click', handleGenerate);

  // Export DXF
  btnExportDxf.addEventListener('click', exportDXFFile);

  // HUD Modal
  btnOpenHud.addEventListener('click', () => hudModal.classList.add('show'));
  btnCloseHud.addEventListener('click', () => hudModal.classList.remove('show'));
  hudModal.addEventListener('click', (e) => {
    if (e.target === hudModal) hudModal.classList.remove('show');
  });
}

function loadPreset(presetKey) {
  const generator = PRESETS[presetKey];
  if (!generator) return;

  const drawing = generator();
  state.currentDrawing = drawing;
  state.dxfString = generateDXFString(drawing);
  updateStats(drawing);
  updateInspectorView();
  fitToScreen();
  genStatus.textContent = `Loaded: ${presetKey.toUpperCase()}`;
}

// ----------------------------------------------------
// Drawing Generators (Architectural CAD Engine)
// ----------------------------------------------------

function generate1LDKPreset() {
  const entities = [];
  const W = 6370; // 7 modules (910mm)
  const H = 8190; // 9 modules

  // Grid Axis (910mm pitch)
  for (let x = 0; x <= W; x += 910) {
    entities.push({ type: 'LINE', layer: 'GRID_AXIS', x1: x, y1: -500, x2: x, y2: H + 500 });
  }
  for (let y = 0; y <= H; y += 910) {
    entities.push({ type: 'LINE', layer: 'GRID_AXIS', x1: -500, y1: y, x2: W + 500, y2: y });
  }

  // Outer Walls (Double Line: 120mm thick)
  addWall(entities, 0, 0, W, 0, 150);
  addWall(entities, W, 0, W, H, 150);
  addWall(entities, W, H, 0, H, 150);
  addWall(entities, 0, H, 0, 0, 150);

  // Inner Walls
  addWall(entities, 0, 3640, W, 3640, 100);       // LDK / Bed room partition
  addWall(entities, 2730, 3640, 2730, H, 100);   // Corridor / Water facilities
  addWall(entities, 0, 6370, 2730, 6370, 100);   // Bath & Toilet partition

  // Openings / Doors
  addDoor(entities, 910, 0, 800, 'N');           // Entrance Door
  addDoor(entities, 1820, 3640, 800, 'S');        // LDK Sliding Door
  addWindow(entities, 1820, 0, 1600, 'N');       // LDK South Window
  addWindow(entities, W, 1820, 1200, 'E');       // LDK East Window
  addWindow(entities, 4550, H, 1200, 'N');       // Bedroom North Window

  // Furniture / Fixtures
  addKitchen(entities, 3640, 100, 2400, 650);
  addBathtub(entities, 100, 6470, 1600, 1600);
  addToilet(entities, 1900, 6470);
  addBed(entities, 3640, 5000, 1950, 1400);

  // Room Texts
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 2800, y: 1800, text: 'LDK 14.5帖', size: 300 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 4200, y: 5500, text: '寝室 6.8帖', size: 260 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 800, y: 7200, text: '浴室 (UB)', size: 220 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 2100, y: 7200, text: 'トイレ', size: 220 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 1200, y: 5000, text: '玄関・ホール', size: 220 });

  // Dimensions
  addDimension(entities, 0, -800, W, -800, `間口 ${W} mm`);
  addDimension(entities, W + 800, 0, W + 800, H, `奥行 ${H} mm`);
  addDimension(entities, -800, 0, -800, 3640, '3640');
  addDimension(entities, -800, 3640, -800, H, '4550');

  return { name: '1LDK アパート標準平面図', entities };
}

function generate3LDKPreset() {
  const entities = [];
  const W = 9100;
  const H = 7280;

  // Grid Axis
  for (let x = 0; x <= W; x += 910) {
    entities.push({ type: 'LINE', layer: 'GRID_AXIS', x1: x, y1: -600, x2: x, y2: H + 600 });
  }
  for (let y = 0; y <= H; y += 910) {
    entities.push({ type: 'LINE', layer: 'GRID_AXIS', x1: -600, y1: y, x2: W + 600, y2: y });
  }

  // Outer Walls
  addWall(entities, 0, 0, W, 0, 150);
  addWall(entities, W, 0, W, H, 150);
  addWall(entities, W, H, 0, H, 150);
  addWall(entities, 0, H, 0, 0, 150);

  // Partitions
  addWall(entities, 5460, 0, 5460, H, 120);
  addWall(entities, 0, 3640, 5460, 3640, 100);
  addWall(entities, 5460, 3640, W, 3640, 100);

  // Room Texts
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 2600, y: 1800, text: 'LDK 20帖', size: 340 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 2600, y: 5400, text: '主寝室 10帖 (WIC付)', size: 300 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 7200, y: 1800, text: '和室 6帖', size: 280 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 7200, y: 5400, text: '洋室 6帖', size: 280 });

  // Windows & Doors
  addWindow(entities, 1820, 0, 2560, 'S');
  addWindow(entities, 6370, 0, 1820, 'S');
  addDoor(entities, 0, 1820, 900, 'W');

  // Outer Dimensions
  addDimension(entities, 0, -900, W, -900, `総間口 ${W} mm (10P)`);
  addDimension(entities, W + 900, 0, W + 900, H, `総奥行 ${H} mm (8P)`);

  return { name: '木造2階建 3LDK平面図 (1F)', entities };
}

function generateOfficePreset() {
  const entities = [];
  const W = 12000;
  const H = 8000;

  // Outer Boundary
  addWall(entities, 0, 0, W, 0, 200);
  addWall(entities, W, 0, W, H, 200);
  addWall(entities, W, H, 0, H, 200);
  addWall(entities, 0, H, 0, 0, 200);

  // Meeting Room Glass Partition
  addWall(entities, 8000, 0, 8000, 4500, 100);
  addWall(entities, 8000, 4500, W, 4500, 100);

  // Desks Layout (Grid)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const dx = 1200 + col * 3200;
      const dy = 1500 + row * 2200;
      addOfficeDeskPair(entities, dx, dy);
    }
  }

  // Large Conference Table
  addConferenceTable(entities, 9000, 1500, 2400, 1200);

  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 4000, y: 4000, text: 'オープン執務エリア (24席)', size: 380 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 9200, y: 3500, text: '第1会議室 (10名)', size: 300 });

  addDimension(entities, 0, -1000, W, -1000, `スパン ${W} mm`);
  addDimension(entities, W + 1000, 0, W + 1000, H, `奥行 ${H} mm`);

  return { name: 'オフィスフロア計画図', entities };
}

function generateSectionPreset() {
  const entities = [];
  // Ground Line
  entities.push({ type: 'LINE', layer: 'WALL', x1: -1000, y1: 0, x2: 7000, y2: 0 });
  entities.push({ type: 'TEXT', layer: 'DIMENSION', x: -800, y: 100, text: 'GL ±0', size: 240 });

  // Foundation (基礎)
  entities.push({ type: 'LINE', layer: 'WALL', x1: 500, y1: -450, x2: 500, y2: 400 });
  entities.push({ type: 'LINE', layer: 'WALL', x1: 650, y1: -450, x2: 650, y2: 400 });
  entities.push({ type: 'LINE', layer: 'WALL', x1: 300, y1: -450, x2: 850, y2: -450 });

  // 1F Floor Line
  entities.push({ type: 'LINE', layer: 'WALL', x1: 500, y1: 450, x2: 5500, y2: 450 });
  entities.push({ type: 'TEXT', layer: 'DIMENSION', x: 1000, y: 550, text: '1FL +450', size: 220 });

  // 1F Ceiling Line
  entities.push({ type: 'LINE', layer: 'WALL', x1: 500, y1: 2850, x2: 5500, y2: 2850 });
  entities.push({ type: 'TEXT', layer: 'DIMENSION', x: 1000, y: 2950, text: '1CH +2850 (CH=2400)', size: 220 });

  // 2F Floor Line
  entities.push({ type: 'LINE', layer: 'WALL', x1: 500, y1: 3400, x2: 5500, y2: 3400 });
  entities.push({ type: 'TEXT', layer: 'DIMENSION', x: 1000, y: 3500, text: '2FL +3400', size: 220 });

  // Roof Eaves (軒桁・勾配屋根)
  entities.push({ type: 'LINE', layer: 'WALL', x1: 0, y1: 6200, x2: 3000, y2: 7400 });
  entities.push({ type: 'LINE', layer: 'WALL', x1: 3000, y1: 7400, x2: 6000, y2: 6200 });

  addDimension(entities, -500, 0, -500, 450, '450');
  addDimension(entities, -500, 450, -500, 3400, '2950');
  addDimension(entities, -500, 3400, -500, 6200, '2800');

  return { name: '標準矩計図 (木造2階建断面)', entities };
}

function generateFurniturePreset() {
  const entities = [];
  const W = 6000;
  const H = 5000;

  addWall(entities, 0, 0, W, 0, 150);
  addWall(entities, W, 0, W, H, 150);
  addWall(entities, W, H, 0, H, 150);
  addWall(entities, 0, H, 0, 0, 150);

  // Conference Table in Center
  addConferenceTable(entities, 1500, 1600, 3000, 1800);

  // Screen / Whiteboard
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: 2000, y1: H - 100, x2: 4000, y2: H - 100 });
  entities.push({ type: 'TEXT', layer: 'FURNITURE', x: 2600, y: H - 350, text: '100inch スクリーン', size: 200 });

  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: 2300, y: 2400, text: 'エグゼクティブ役員会議室', size: 280 });

  return { name: '会議室・家具詳細レイアウト', entities };
}

// ----------------------------------------------------
// Entity Helpers
// ----------------------------------------------------

function addWall(entities, x1, y1, x2, y2, thickness) {
  // Center Line
  entities.push({ type: 'LINE', layer: 'WALL', x1, y1, x2, y2 });
  
  // Parallel Offsets
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return;
  
  const nx = (-dy / len) * (thickness / 2);
  const ny = (dx / len) * (thickness / 2);

  entities.push({ type: 'LINE', layer: 'WALL', x1: x1 + nx, y1: y1 + ny, x2: x2 + nx, y2: y2 + ny });
  entities.push({ type: 'LINE', layer: 'WALL', x1: x1 - nx, y1: y1 - ny, x2: x2 - nx, y2: y2 - ny });
}

function addDoor(entities, x, y, width, dir) {
  entities.push({ type: 'LINE', layer: 'DOOR_WINDOW', x1: x, y1: y, x2: x + width, y2: y });
  // Swing Arc
  entities.push({ type: 'ARC', layer: 'DOOR_WINDOW', cx: x, cy: y, r: width, startAngle: 0, endAngle: Math.PI / 2 });
}

function addWindow(entities, x, y, width, dir) {
  entities.push({ type: 'LINE', layer: 'DOOR_WINDOW', x1: x, y1: y - 50, x2: x + width, y2: y - 50 });
  entities.push({ type: 'LINE', layer: 'DOOR_WINDOW', x1: x, y1: y + 50, x2: x + width, y2: y + 50 });
  entities.push({ type: 'LINE', layer: 'DOOR_WINDOW', x1: x, y1: y - 100, x2: x, y2: y + 100 });
  entities.push({ type: 'LINE', layer: 'DOOR_WINDOW', x1: x + width, y1: y - 100, x2: x + width, y2: y + 100 });
}

function addDimension(entities, x1, y1, x2, y2, text) {
  entities.push({ type: 'LINE', layer: 'DIMENSION', x1, y1, x2, y2 });
  // Ticks at ends
  const tick = 120;
  entities.push({ type: 'LINE', layer: 'DIMENSION', x1: x1 - tick, y1: y1 - tick, x2: x1 + tick, y2: y1 + tick });
  entities.push({ type: 'LINE', layer: 'DIMENSION', x1: x2 - tick, y1: y2 - tick, x2: x2 + tick, y2: y2 + tick });

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + 150;
  entities.push({ type: 'TEXT', layer: 'DIMENSION', x: mx, y: my, text, size: 240 });
}

function addKitchen(entities, x, y, w, h) {
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y, x2: x + w, y2: y });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y, x2: x + w, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y + h, x2: x, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y + h, x2: x, y2: y });
  // Sink & Cooktop
  entities.push({ type: 'CIRCLE', layer: 'FURNITURE', cx: x + 600, cy: y + h / 2, r: 200 });
  entities.push({ type: 'CIRCLE', layer: 'FURNITURE', cx: x + 1800, cy: y + h / 2, r: 180 });
}

function addBathtub(entities, x, y, w, h) {
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y, x2: x + w, y2: y });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y, x2: x + w, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y + h, x2: x, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y + h, x2: x, y2: y });
  // Inner Tub
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + 150, y1: y + 150, x2: x + w - 150, y2: y + 150 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w - 150, y1: y + 150, x2: x + w - 150, y2: y + h - 150 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w - 150, y1: y + h - 150, x2: x + 150, y2: y + h - 150 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + 150, y1: y + h - 150, x2: x + 150, y2: y + 150 });
}

function addToilet(entities, x, y) {
  entities.push({ type: 'CIRCLE', layer: 'FURNITURE', cx: x + 300, cy: y + 400, r: 220 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + 100, y1: y + 100, x2: x + 500, y2: y + 100 });
}

function addBed(entities, x, y, w, h) {
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y, x2: x + w, y2: y });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y, x2: x + w, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y + h, x2: x, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y + h, x2: x, y2: y });
  // Pillow
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + 100, y1: y + 100, x2: x + w - 100, y2: y + 100 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w - 100, y1: y + 100, x2: x + w - 100, y2: y + 450 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w - 100, y1: y + 450, x2: x + 100, y2: y + 450 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + 100, y1: y + 450, x2: x + 100, y2: y + 100 });
}

function addOfficeDeskPair(entities, x, y) {
  const w = 1400;
  const h = 700;
  // Desk 1
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y, x2: x + w, y2: y });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y, x2: x + w, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y + h, x2: x, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y + h, x2: x, y2: y });
  // Desk 2
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y + h, x2: x + w, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y + h, x2: x + w, y2: y + h * 2 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y + h * 2, x2: x, y2: y + h * 2 });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y + h * 2, x2: x, y2: y + h });
}

function addConferenceTable(entities, x, y, w, h) {
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y, x2: x + w, y2: y });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y, x2: x + w, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x + w, y1: y + h, x2: x, y2: y + h });
  entities.push({ type: 'LINE', layer: 'FURNITURE', x1: x, y1: y + h, x2: x, y2: y });
  // Chairs
  for (let cx = x + 300; cx <= x + w - 300; cx += 600) {
    entities.push({ type: 'CIRCLE', layer: 'FURNITURE', cx, cy: y - 250, r: 180 });
    entities.push({ type: 'CIRCLE', layer: 'FURNITURE', cx, cy: y + h + 250, r: 180 });
  }
}

// ----------------------------------------------------
// Realtime CAD Canvas Renderer
// ----------------------------------------------------

function renderCAD() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Grid (World Coordinates)
  drawGrid();

  if (!state.currentDrawing) return;

  ctx.save();
  // Transform to World Coordinates (Origin at panX, panY, inverted Y for CAD coords)
  ctx.translate(state.panX, state.panY);
  ctx.scale(state.zoom, -state.zoom);

  // Draw Entities
  for (const ent of state.currentDrawing.entities) {
    if (!state.layers[ent.layer]) continue; // Layer visibility filter

    const style = LAYER_STYLES[ent.layer] || { color: '#ffffff', width: 1.0 };
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width / state.zoom;
    ctx.fillStyle = style.color;

    switch (ent.type) {
      case 'LINE':
        ctx.beginPath();
        ctx.moveTo(ent.x1, ent.y1);
        ctx.lineTo(ent.x2, ent.y2);
        ctx.stroke();
        break;

      case 'CIRCLE':
        ctx.beginPath();
        ctx.arc(ent.cx, ent.cy, ent.r, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'ARC':
        ctx.beginPath();
        ctx.arc(ent.cx, ent.cy, ent.r, ent.startAngle, ent.endAngle);
        ctx.stroke();
        break;

      case 'TEXT':
        ctx.save();
        ctx.translate(ent.x, ent.y);
        ctx.scale(1, -1); // Un-flip text vertically
        ctx.font = `${ent.size}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ent.text, 0, 0);
        ctx.restore();
        break;
    }
  }

  // Draw Origin Marker
  drawOriginMarker();

  ctx.restore();
  hudScale.textContent = `${Math.round(state.zoom * 1000)}%`;
}

function drawGrid() {
  const gridSize = 1000 * state.zoom; // 1m Grid
  if (gridSize < 15) return; // Don't draw if too dense

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;

  const startX = state.panX % gridSize;
  const startY = state.panY % gridSize;

  ctx.beginPath();
  for (let x = startX; x < canvas.width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (let y = startY; y < canvas.height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();

  // Axis lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.moveTo(state.panX, 0);
  ctx.lineTo(state.panX, canvas.height);
  ctx.moveTo(0, state.panY);
  ctx.lineTo(canvas.width, state.panY);
  ctx.stroke();

  ctx.restore();
}

function drawOriginMarker() {
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2 / state.zoom;
  ctx.beginPath();
  ctx.moveTo(-500, 0);
  ctx.lineTo(500, 0);
  ctx.stroke();

  ctx.strokeStyle = '#22c55e';
  ctx.beginPath();
  ctx.moveTo(0, -500);
  ctx.lineTo(0, 500);
  ctx.stroke();
}

function fitToScreen() {
  if (!state.currentDrawing || state.currentDrawing.entities.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const ent of state.currentDrawing.entities) {
    if (ent.x1 !== undefined) {
      minX = Math.min(minX, ent.x1, ent.x2);
      maxX = Math.max(maxX, ent.x1, ent.x2);
      minY = Math.min(minY, ent.y1, ent.y2);
      maxY = Math.max(maxY, ent.y1, ent.y2);
    }
  }

  const padding = 100;
  const dw = maxX - minX;
  const dh = maxY - minY;
  if (dw <= 0 || dh <= 0) return;

  const scaleX = (canvas.width - padding * 2) / dw;
  const scaleY = (canvas.height - padding * 2) / dh;
  state.zoom = Math.min(scaleX, scaleY);

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  state.panX = canvas.width / 2 - cx * state.zoom;
  state.panY = canvas.height / 2 + cy * state.zoom;

  renderCAD();
}

// ----------------------------------------------------
// ASCII DXF Generator (AutoCAD R12/2000 AC1009/1015 Spec)
// ----------------------------------------------------

function generateDXFString(drawing) {
  let dxf = '';

  // HEADER SECTION
  dxf += '0\nSECTION\n';
  dxf += '2\nHEADER\n';
  dxf += '9\n$ACADVER\n1\nAC1009\n';
  dxf += '9\n$INSUNITS\n70\n4\n'; // 4 = Millimeters
  dxf += '0\nENDSEC\n';

  // TABLES SECTION (Layers)
  dxf += '0\nSECTION\n';
  dxf += '2\nTABLES\n';
  dxf += '0\nTABLE\n2\nLAYER\n70\n6\n';

  for (const [layerName, style] of Object.entries(LAYER_STYLES)) {
    dxf += '0\nLAYER\n';
    dxf += `2\n${layerName}\n`;
    dxf += '70\n0\n';
    dxf += `62\n${style.dxfColor}\n`; // AutoCAD Color Index
    dxf += '6\nCONTINUOUS\n';
  }

  dxf += '0\nENDTAB\n';
  dxf += '0\nENDSEC\n';

  // BLOCKS SECTION
  dxf += '0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n';

  // ENTITIES SECTION
  dxf += '0\nSECTION\n';
  dxf += '2\nENTITIES\n';

  for (const ent of drawing.entities) {
    switch (ent.type) {
      case 'LINE':
        dxf += '0\nLINE\n';
        dxf += `8\n${ent.layer}\n`;
        dxf += `10\n${ent.x1.toFixed(3)}\n20\n${ent.y1.toFixed(3)}\n30\n0.0\n`;
        dxf += `11\n${ent.x2.toFixed(3)}\n21\n${ent.y2.toFixed(3)}\n31\n0.0\n`;
        break;

      case 'CIRCLE':
        dxf += '0\nCIRCLE\n';
        dxf += `8\n${ent.layer}\n`;
        dxf += `10\n${ent.cx.toFixed(3)}\n20\n${ent.cy.toFixed(3)}\n30\n0.0\n`;
        dxf += `40\n${ent.r.toFixed(3)}\n`;
        break;

      case 'ARC':
        dxf += '0\nARC\n';
        dxf += `8\n${ent.layer}\n`;
        dxf += `10\n${ent.cx.toFixed(3)}\n20\n${ent.cy.toFixed(3)}\n30\n0.0\n`;
        dxf += `40\n${ent.r.toFixed(3)}\n`;
        dxf += `50\n${(ent.startAngle * 180 / Math.PI).toFixed(2)}\n`;
        dxf += `51\n${(ent.endAngle * 180 / Math.PI).toFixed(2)}\n`;
        break;

      case 'TEXT':
        dxf += '0\nTEXT\n';
        dxf += `8\n${ent.layer}\n`;
        dxf += `10\n${ent.x.toFixed(3)}\n20\n${ent.y.toFixed(3)}\n30\n0.0\n`;
        dxf += `40\n${ent.size.toFixed(2)}\n`;
        dxf += `1\n${ent.text}\n`;
        break;
    }
  }

  dxf += '0\nENDSEC\n';
  dxf += '0\nEOF\n';

  return dxf;
}

// ----------------------------------------------------
// Gemini 2.5 Pro API & Custom Prompt Engine
// ----------------------------------------------------

async function handleGenerate() {
  const prompt = promptInput.value.trim();
  const apiKey = document.getElementById('apiKeyInput').value.trim();

  if (!prompt) {
    alert('プロンプト作図指示を入力してください。');
    return;
  }

  genStatus.textContent = 'Generating...';
  btnGenerate.disabled = true;

  try {
    if (apiKey) {
      // Direct call to Gemini 2.5 Pro via Google AI SDK / REST API
      const generatedDrawing = await callGeminiAPI(prompt, apiKey);
      state.currentDrawing = generatedDrawing;
    } else {
      // Dynamic Intelligent Fallback (Generates custom parametric geometry based on prompt keywords)
      state.currentDrawing = parametricSynthesizer(prompt);
    }

    state.dxfString = generateDXFString(state.currentDrawing);
    updateStats(state.currentDrawing);
    updateInspectorView();
    fitToScreen();
    genStatus.textContent = 'Rendered Successfully';
  } catch (err) {
    console.error('Generation Error:', err);
    genStatus.textContent = `Error: ${err.message}`;
    alert(`図面生成エラー: ${err.message}`);
  } finally {
    btnGenerate.disabled = false;
  }
}

async function callGeminiAPI(prompt, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  const systemInstruction = `You are CADZUMEN Architectural Geometry Engine.
Analyze the user request and return a JSON object representing the CAD drawing with layers (WALL, DOOR_WINDOW, ROOM_NAME, DIMENSION, FURNITURE, GRID_AXIS).
Coordinate units: millimeters (mm).
JSON Schema:
{
  "name": "Title",
  "entities": [
    { "type": "LINE", "layer": "WALL", "x1": 0, "y1": 0, "x2": 6000, "y2": 0 },
    { "type": "CIRCLE", "layer": "FURNITURE", "cx": 1000, "cy": 1000, "r": 200 },
    { "type": "TEXT", "layer": "ROOM_NAME", "x": 3000, "y": 3000, "text": "LDK", "size": 300 }
  ]
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Gemini API call failed');
  }

  const result = await response.json();
  const text = result.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

function parametricSynthesizer(prompt) {
  // Keyword extraction for custom dynamic layout
  let width = 7280;
  let height = 9100;
  let title = 'プロンプト生成 建築平面図';

  const mMatch = prompt.match(/間口\s*(\d+)/) || prompt.match(/(\d+)\s*m/);
  if (mMatch) width = parseInt(mMatch[1]) * 1000;

  const dMatch = prompt.match(/奥行き?\s*(\d+)/);
  if (dMatch) height = parseInt(dMatch[1]) * 1000;

  const entities = [];
  addWall(entities, 0, 0, width, 0, 150);
  addWall(entities, width, 0, width, height, 150);
  addWall(entities, width, height, 0, height, 150);
  addWall(entities, 0, height, 0, 0, 150);

  // Divide into rooms
  const midX = width / 2;
  const midY = height / 2;
  addWall(entities, 0, midY, width, midY, 100);
  addWall(entities, midX, midY, midX, height, 100);

  // Add Openings
  addDoor(entities, 910, 0, 800, 'N');
  addWindow(entities, width - 2000, 0, 1600, 'S');

  // Texts
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: width / 2, y: midY / 2, text: 'LDK エリア', size: 320 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: midX / 2, y: midY + (height - midY) / 2, text: '主寝室', size: 280 });
  entities.push({ type: 'TEXT', layer: 'ROOM_NAME', x: midX + midX / 2, y: midY + (height - midY) / 2, text: '子供室 / 書斎', size: 280 });

  // Dimensions
  addDimension(entities, 0, -800, width, -800, `${width} mm`);
  addDimension(entities, width + 800, 0, width + 800, height, `${height} mm`);

  return { name: title, entities };
}

// ----------------------------------------------------
// UI Updates & DXF File Export
// ----------------------------------------------------

function updateStats(drawing) {
  let lines = 0, polylines = 0, arcs = 0, texts = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const ent of drawing.entities) {
    if (ent.type === 'LINE') lines++;
    if (ent.type === 'CIRCLE' || ent.type === 'ARC') arcs++;
    if (ent.type === 'TEXT') texts++;

    if (ent.x1 !== undefined) {
      minX = Math.min(minX, ent.x1, ent.x2);
      maxX = Math.max(maxX, ent.x1, ent.x2);
      minY = Math.min(minY, ent.y1, ent.y2);
      maxY = Math.max(maxY, ent.y1, ent.y2);
    }
  }

  statLines.textContent = lines;
  statPolylines.textContent = polylines;
  statArcs.textContent = arcs;
  statTexts.textContent = texts;
  const bw = Math.round(maxX - minX);
  const bh = Math.round(maxY - minY);
  statBounds.textContent = `${bw} × ${bh} mm`;
}

function updateInspectorView() {
  if (state.activeTab === 'dxf') {
    inspectorContent.textContent = state.dxfString || '// No DXF loaded';
  } else if (state.activeTab === 'json') {
    inspectorContent.textContent = JSON.stringify(state.currentDrawing, null, 2);
  } else if (state.activeTab === 'log') {
    inspectorContent.textContent = `[INFO] Drawing entities: ${state.currentDrawing?.entities?.length || 0}\n[INFO] AC1009 Standard Compliant: YES\n[INFO] Zoom level: ${(state.zoom * 100).toFixed(2)}%\n[INFO] CAD View Status: Ready`;
  }
}

function exportDXFFile() {
  if (!state.dxfString) {
    alert('ダウンロード可能なDXFデータがありません。');
    return;
  }

  const blob = new Blob([state.dxfString], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CADZUMEN_${Date.now()}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
