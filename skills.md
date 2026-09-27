# 🛠️ CADZUMEN: スキル仕様書 (skills.md)

本仕様書は、CADZUMEN が提供する CAD 幾何合成、DXF エンコード、Gemini 2.5 Pro 推論エンジンの専門スキル群を定義します。
詳細な関数・API定義は [src/docs/AgentSKILL.md](src/docs/AgentSKILL.md) と連動します。

---

## 1. 専門スキル一覧 (Specialized Skills)

### 1.1 `dxf-synthesizer` (DXF合成スキル)
- **モジュール**: `src/cad/shrineDxfGenerator.ts`, `src/cad/dxfGenerator.ts`
- **機能**:
  - JIS A2図枠 (594×420mm) の精密ミリメートル幾何配置
  - AutoCAD Color Index (ACI 1〜7) レイヤー色分け
  - エンティティ自動生成 (`LINE`, `CIRCLE`, `ARC`, `TEXT`, `POLYLINE`)
  - 縮尺スケールバーおよび北向方位記号のパラメトリック描画

### 1.2 `architectural-dna-analyzer` (社寺建築DNA解析スキル)
- **モジュール**: `src/cad/shrineArchitectures.ts`, `src/cad/itsukushimaData.ts`
- **機能**:
  - 自然言語の社寺名称から建築様式（大社造、神明造、流造、権現造、寝殿造）の推論
  - 嚴島神社 廻廊108間、大鳥居（高さ16.6m）、客神社、本殿、高舞台・平舞台の実測データバインディング
  - 潮汐水位（満潮位・干潮位）と海中床面標高の幾何マッピング

### 1.3 `cad-vector-renderer` (Canvasレンダリングスキル)
- **モジュール**: `src/components/CadViewer.tsx`
- **機能**:
  - マウスホイール無段階拡大・縮小 & ドラッグパン移動
  - レイヤー別表示トグルフィルター
  - リアルタイム世界座標HUD (ミリメートル単位)

### 1.4 `batch-dxf-packager` (一括エクスポートスキル)
- **モジュール**: `src/App.tsx` (JSZip 連携)
- **機能**:
  - 全3シートのDXFファイルおよび仕様サマリーテキストの一括ZIP圧縮
  - ブラウザクライアント上での完全ローカル完結ダウンロード

---

## 2. 実行コマンド体系

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# 型定義・Lintチェック
npm run lint

# AI Studio ZIP からの最新取り込み (Vaultルートより)
npm run import:zip
```
