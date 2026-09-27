# 『AgentSKILL.md』: CADエンジニアリング・スキル仕様書

## 1. スキル概要
厳密な幾何学計算と建築基準に基づき、AutoCAD DXF R12/2000準拠のベクターデータをプログラマティックに合成・抽出・操作するエージェントスキル群。

---

## 2. スキル定義 (Tool & Function Definitions)

### 2.1 `generateDxfSheet(sheetId, options)`
*   **説明**: 指定された嚴島神社の図面ID（Sheet 1, 2, 3 または ALL）に基づいてDXFドキュメントをインスタンス化し、A2図枠・表題欄・建築形状をプロットする。
*   **引数**:
    *   `sheetId`: `'sheet1' | 'sheet2' | 'sheet3' | 'all'`
    *   `options`: `{ includeDimensions: boolean; includeHatching: boolean; scaleOverride?: number }`
*   **返り値**: `DxfDocument` インスタンス（エンティティ配列、レイヤー構成）。

### 2.2 `exportDxfFile(doc, filename)`
*   **説明**: `DxfDocument` を完全なASCII DXF仕様（R12/AC1009）テキスト文字列へエンコードし、Blobからダウンロードリンクを生成してブラウザ経由でローカルへ直接保存する。
*   **仕様**:
    *   ヘッダー変数 `$INSUNITS = 4` (Millimeters)
    *   `$MEASUREMENT = 1` (Metric)
    *   改行コード: `\r\n` (CRLF)

### 2.3 `batchExportZip(sheets)`
*   **説明**: 全3シートのDXFファイルおよび図面一覧テキストをZIP形式（`jszip`利用）でアーカイブし、単一ファイルとして一括保存する。

### 2.4 `scaleDxfTextAnnotations(doc, scaleRatio, spaceMode)`
*   **説明**: JIS Z 8313に準拠し、文字高さをペーパースケール（2.5mm〜5.0mm）またはモデル空間スケール（2.5×scaleRatio〜5.0×scaleRatio）に数学的スケーリング・正規化する。
*   **引数**:
    *   `scaleRatio`: `600 | 300 | 200`
    *   `spaceMode`: `'paper' | 'model'`
*   **返り値**: 縮尺スケーリング済み `DxfDocument`。

### 2.5 `analyzeShrinePrompt(promptText)`
*   **説明**: ユーザーが入力した自然言語の神社名から、建築DNA（大社造、神明造、流造、権現造、寝殿造）、鳥居形式、敷地トポロジー、柱間グリッドを自動決定する。
*   **引数**:
    *   `promptText`: 任意の神社名文字列
*   **返り値**: `ShrineProfile` オブジェクト。

---

## 3. プロンプトテンプレート (Prompt Templates)

```text
[CAD_GENERATION_PROMPT]
ROLE: God-Mode CAD Systems Architect
TARGET: Traditional Japanese Shinto Architecture (Itsukushima Shrine)
STANDARDS:
  - Metric System (mm)
  - JIS A2 Sheet Standard (594 x 420mm)
  - Accuracy: Sub-millimeter floating point calculation
  - AutoCAD Color Index (ACI 1 to 7)
TASK:
  Synthesize DXF entities for {sheet_name} at scale {scale_ratio}.
  Include title block, north arrow, scale bar, and historical annotations.
```
