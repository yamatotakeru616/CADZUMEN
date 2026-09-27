/**
 * Pure TypeScript DXF Generator (AutoCAD R12 / 2000 ASCII Standard)
 * Zero external CAD library dependency, ultra-lightweight, 100% compliant with CAD tools (AutoCAD, Jw_cad, LibreCAD).
 */

export interface DxfLayer {
  name: string;
  colorNumber: number; // AutoCAD Color Index (1=Red, 2=Yellow, 3=Green, 4=Cyan, 5=Blue, 6=Magenta, 7=White)
  lineType?: string;   // 'CONTINUOUS', 'CENTER', 'DASHED', etc.
}

export interface DxfLine {
  type: 'LINE';
  layer: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DxfCircle {
  type: 'CIRCLE';
  layer: string;
  cx: number;
  cy: number;
  radius: number;
}

export interface DxfArc {
  type: 'ARC';
  layer: string;
  cx: number;
  cy: number;
  radius: number;
  startAngle: number; // degrees
  endAngle: number;   // degrees
}

export interface DxfText {
  type: 'TEXT';
  layer: string;
  x: number;
  y: number;
  height: number;
  text: string;
  rotation?: number;  // degrees
  align?: 'LEFT' | 'CENTER' | 'RIGHT';
}

/**
 * JIS Z 8313 / Architectural Standard Text Height Presets (Unit: mm on Paper)
 * Strictly conforms to 2.5mm ~ 5.0mm range for A2 architectural drawings.
 */
export const CAD_TEXT_PRESETS = {
  TITLE: 5.0,           // 大見出し・図面主タイトル (5.0mm)
  SUBTITLE: 3.5,        // 副題・図面区分 (3.5mm)
  SECTION_HEADER: 3.8,  // 社殿名・主要建物名・大見出し (3.8mm)
  GRID_LABEL: 3.0,      // 通り芯ラベル (X1, Y1等) - φ8.4mm丸枠内に配置 (3.0mm)
  DIMENSION: 2.8,       // 寸法値・主要寸法表記 (2.8mm)
  NOTE_LARGE: 2.8,      // 主要注記 (2.8mm)
  NOTE: 2.5,            // 一般注記・汀線注記・補足説明 (2.5mm: JIS A2 最小推奨値)
} as const;

export type CadTextRole = keyof typeof CAD_TEXT_PRESETS;

export interface DxfPolyline {
  type: 'POLYLINE';
  layer: string;
  points: { x: number; y: number }[];
  closed?: boolean;
}

export type DxfEntity = DxfLine | DxfCircle | DxfArc | DxfText | DxfPolyline;

export class DxfDocument {
  public layers: Map<string, DxfLayer> = new Map();
  public entities: DxfEntity[] = [];

  constructor() {
    // Default layers
    this.addLayer('0', 7);
    this.addLayer('FRAME', 7);          // 図枠・表題欄 (白)
    this.addLayer('CENTER', 1, 'CENTER'); // 通り芯・中心線 (赤)
    this.addLayer('STRUCTURE', 2);       // 柱・基礎・構造体 (黄)
    this.addLayer('ROOF_WALL', 4);       // 屋根・壁・高欄 (シアン)
    this.addLayer('COAST_SEA', 5);       // 海岸線・汀線・干潟 (青)
    this.addLayer('DIM_TEXT', 3);        // 寸法線・注記・文字 (緑)
    this.addLayer('HATCH', 6);           // 板敷・目地 (マゼンタ)
  }

  addLayer(name: string, colorNumber: number, lineType: string = 'CONTINUOUS'): void {
    this.layers.set(name, { name, colorNumber, lineType });
  }

  addLine(layer: string, x1: number, y1: number, x2: number, y2: number): void {
    this.entities.push({ type: 'LINE', layer, x1, y1, x2, y2 });
  }

  addRect(layer: string, x: number, y: number, w: number, h: number): void {
    this.addLine(layer, x, y, x + w, y);
    this.addLine(layer, x + w, y, x + w, y + h);
    this.addLine(layer, x + w, y + h, x, y + h);
    this.addLine(layer, x, y + h, x, y);
  }

  addCircle(layer: string, cx: number, cy: number, radius: number): void {
    this.entities.push({ type: 'CIRCLE', layer, cx, cy, radius });
  }

  addArc(layer: string, cx: number, cy: number, radius: number, startAngle: number, endAngle: number): void {
    this.entities.push({ type: 'ARC', layer, cx, cy, radius, startAngle, endAngle });
  }

  addText(layer: string, x: number, y: number, height: number, text: string, align: 'LEFT' | 'CENTER' | 'RIGHT' = 'LEFT', rotation: number = 0): void {
    this.entities.push({ type: 'TEXT', layer, x, y, height, text, align, rotation });
  }

  addSemanticText(layer: string, x: number, y: number, role: CadTextRole, text: string, align: 'LEFT' | 'CENTER' | 'RIGHT' = 'LEFT', rotation: number = 0): void {
    const height = CAD_TEXT_PRESETS[role];
    this.addText(layer, x, y, height, text, align, rotation);
  }

  addPolyline(layer: string, points: { x: number; y: number }[], closed: boolean = false): void {
    this.entities.push({ type: 'POLYLINE', layer, points, closed });
  }

  /**
   * Clones this document scaling all entities to real-world model coordinates (1:1 mm),
   * scaling text heights proportionally by the scaleRatio (e.g. 600, 300, 200).
   */
  cloneWithModelScale(scaleRatio: number): DxfDocument {
    const cloned = new DxfDocument();
    this.layers.forEach((layer, name) => cloned.layers.set(name, { ...layer }));

    for (const ent of this.entities) {
      if (ent.type === 'LINE') {
        cloned.addLine(ent.layer, ent.x1 * scaleRatio, ent.y1 * scaleRatio, ent.x2 * scaleRatio, ent.y2 * scaleRatio);
      } else if (ent.type === 'CIRCLE') {
        cloned.addCircle(ent.layer, ent.cx * scaleRatio, ent.cy * scaleRatio, ent.radius * scaleRatio);
      } else if (ent.type === 'ARC') {
        cloned.addArc(ent.layer, ent.cx * scaleRatio, ent.cy * scaleRatio, ent.radius * scaleRatio, ent.startAngle, ent.endAngle);
      } else if (ent.type === 'TEXT') {
        cloned.addText(ent.layer, ent.x * scaleRatio, ent.y * scaleRatio, ent.height * scaleRatio, ent.text, ent.align, ent.rotation);
      } else if (ent.type === 'POLYLINE') {
        cloned.addPolyline(ent.layer, ent.points.map(p => ({ x: p.x * scaleRatio, y: p.y * scaleRatio })), ent.closed);
      }
    }
    return cloned;
  }

  /**
   * Export to standard ASCII DXF format (R12 / AC1009 compatible)
   */
  toDxfString(): string {
    const lines: string[] = [];

    const push = (code: number, value: string | number) => {
      lines.push(`${code}`);
      if (typeof value === 'number') {
        // Keep clean decimal format without scientific notation where possible
        lines.push(Number.isInteger(value) ? `${value}` : Number(value.toFixed(4)).toString());
      } else {
        lines.push(`${value}`);
      }
    };

    // 1. SECTION HEADER
    push(0, 'SECTION');
    push(2, 'HEADER');
    push(9, '$ACADVER');
    push(1, 'AC1009'); // AutoCAD R12 format (Highest compatibility across AutoCAD, Jw_cad, Blender, LibreCAD)
    push(9, '$INSUNITS');
    push(70, 4); // 4 = Millimeters
    push(9, '$MEASUREMENT');
    push(70, 1); // 1 = Metric
    push(0, 'ENDSEC');

    // 2. SECTION TABLES
    push(0, 'SECTION');
    push(2, 'TABLES');

    // Linetype table
    push(0, 'TABLE');
    push(2, 'LTYPE');
    push(70, 2);

    push(0, 'LTYPE');
    push(2, 'CONTINUOUS');
    push(70, 64);
    push(3, 'Solid line');
    push(72, 65);
    push(73, 0);
    push(40, 0.0);

    push(0, 'LTYPE');
    push(2, 'CENTER');
    push(70, 64);
    push(3, 'Center ____ _ ____ _ ____');
    push(72, 65);
    push(73, 4);
    push(40, 31.75);
    push(49, 19.05);
    push(49, -3.175);
    push(49, 3.175);
    push(49, -3.175);

    push(0, 'ENDTAB');

    // Layer table
    push(0, 'TABLE');
    push(2, 'LAYER');
    push(70, this.layers.size);
    for (const layer of this.layers.values()) {
      push(0, 'LAYER');
      push(2, layer.name);
      push(70, 64);
      push(62, layer.colorNumber);
      push(6, layer.lineType || 'CONTINUOUS');
    }
    push(0, 'ENDTAB');

    // Style table
    push(0, 'TABLE');
    push(2, 'STYLE');
    push(70, 1);
    push(0, 'STYLE');
    push(2, 'STANDARD');
    push(70, 0);
    push(40, 0.0);
    push(41, 1.0);
    push(50, 0.0);
    push(71, 0);
    push(42, 2.5);
    push(3, 'txt');
    push(4, '');
    push(0, 'ENDTAB');

    push(0, 'ENDSEC');

    // 3. SECTION ENTITIES
    push(0, 'SECTION');
    push(2, 'ENTITIES');

    for (const ent of this.entities) {
      if (ent.type === 'LINE') {
        push(0, 'LINE');
        push(8, ent.layer);
        push(10, ent.x1);
        push(20, ent.y1);
        push(30, 0);
        push(11, ent.x2);
        push(21, ent.y2);
        push(31, 0);
      } else if (ent.type === 'CIRCLE') {
        push(0, 'CIRCLE');
        push(8, ent.layer);
        push(10, ent.cx);
        push(20, ent.cy);
        push(30, 0);
        push(40, ent.radius);
      } else if (ent.type === 'ARC') {
        push(0, 'ARC');
        push(8, ent.layer);
        push(10, ent.cx);
        push(20, ent.cy);
        push(30, 0);
        push(40, ent.radius);
        push(50, ent.startAngle);
        push(51, ent.endAngle);
      } else if (ent.type === 'TEXT') {
        push(0, 'TEXT');
        push(8, ent.layer);
        push(10, ent.x);
        push(20, ent.y);
        push(30, 0);
        push(40, ent.height);
        push(1, ent.text);
        if (ent.rotation) {
          push(50, ent.rotation);
        }
        if (ent.align === 'CENTER') {
          push(72, 1); // Center horizontal alignment
          push(73, 2); // Middle vertical alignment
          push(11, ent.x);
          push(21, ent.y);
          push(31, 0);
        } else if (ent.align === 'RIGHT') {
          push(72, 2); // Right horizontal alignment
          push(73, 2); // Middle vertical alignment
          push(11, ent.x);
          push(21, ent.y);
          push(31, 0);
        }
      } else if (ent.type === 'POLYLINE') {
        push(0, 'POLYLINE');
        push(8, ent.layer);
        push(66, 1);
        push(10, 0);
        push(20, 0);
        push(30, 0);
        if (ent.closed) {
          push(70, 1);
        }
        for (const pt of ent.points) {
          push(0, 'VERTEX');
          push(8, ent.layer);
          push(10, pt.x);
          push(20, pt.y);
          push(30, 0);
        }
        push(0, 'SEQEND');
      }
    }

    push(0, 'ENDSEC');
    push(0, 'EOF');

    return lines.join('\r\n') + '\r\n';
  }
}
