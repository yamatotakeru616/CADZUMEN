# ⛩️ CADZUMEN: エージェント定義・アーキテクチャ仕様書 (GEMINI.md)

## 1. エージェントの役割と責任 (Role & Mission)

- **エージェント名**: `CADZUMEN-Architect`
- **主要使命**:
  Google AI Studio の **Gemini 2.5 Pro** を活用し、自然言語プロンプトから日本伝統社寺建築（厳島神社・出雲大社・伊勢神宮等）の意匠DNAおよび柱割・桁行・梁間を自動推論。
  **JIS A2用紙規格 (594×420mm) の完全な ASCII DXF (AutoCAD R12/2000 AC1009/AC1015 互換) 3面図** を生成・レンダリングし、Web CAD上でリアルタイムに提供する。
- **管轄リポジトリ**: `yamatotakeru616/CADZUMEN`
- **原本アプリ**: [https://ai.studio/apps/053b7942-6942-4288-b95a-30bf9e867904](https://ai.studio/apps/053b7942-6942-4288-b95a-30bf9e867904)
- **Obsidian Vault ナレッジ**: `[[00_Knowledge/Projects/CADZUMEN|CADZUMEN 仕様ノート]]`

---

## 2. システム入出力仕様 (I/O Specification)

### 2.1 入力仕様 (Input)
- **自然言語プロンプト**: 社寺名（例:「嚴島神社」「出雲大社」）または意匠指定文字列。
- **表示モード設定**:
  - `sheet1`: 全体境内配置図 (1:600)
  - `sheet2`: 本社社殿平面詳細図 (1:300)
  - `sheet3`: 本社立面図 & 断面矩計図 (1:200)
  - `all`: 3面図一括エクスポート
- **文字空間モード**: `paper` (A2用紙基準 2.5mm〜5.0mm) / `model` (実寸実座標スケーリング)

### 2.2 出力仕様 (Output)
- **ASCII DXF ファイル**:
  - AutoCAD AC1009 / R12 規格準拠（`$INSUNITS = 4` [mm], `$MEASUREMENT = 1` [Metric]）
  - レイヤー構造: `FRAME`, `TITLE_BLOCK`, `WALL`, `COLUMN`, `ROOF`, `TORII`, `CORRIDOR`, `WATER`, `TEXT`, `DIMENSION`
- **ZIP アーカイブ**: JSZip による全シート DXF + 建築仕様テキストの一括出力
- **ベクター Canvas 描画**: React 19 + HTML5 Canvas によるインタラクティブ 2D CAD 表示

---

## 3. ドキュメント相互参照リンク
- スキル定義: [skills.md](skills.md) / [src/docs/AgentSKILL.md](src/docs/AgentSKILL.md)
- テストハーネス: [ハーネス.md](ハーネス.md) / [src/docs/HarnessAgent.md](src/docs/HarnessAgent.md)
- 自律ループ: [ループAgent.md](ループAgent.md) / [src/docs/LoopAgent.md](src/docs/LoopAgent.md)
- 詳細設計: [src/docs/DetailedDesign.md](src/docs/DetailedDesign.md)
- イベントフック: [フック.md](フック.md)
- タスク進捗: [task-list.md](task-list.md)
- 機能一覧: [機能一覧.md](機能一覧.md)
