<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 📐 CADZUMEN

### AI-Powered Architectural CAD Drawing & DXF Generator with Real-time Web Preview
**自然言語プロンプトから建築CAD図面（ASCII DXF）を自動生成し、ブラウザ上でリアルタイム2D/3Dプレビュー＆ダウンロード**

[![Gemini 2.5 Pro](https://img.shields.io/badge/Model-Gemini%202.5%20Pro-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/app/apps/053b7942-6942-4288-b95a-30bf9e867904?showPreview=true&showAssistant=true)
[![Built with AI Studio](https://img.shields.io/badge/Built%20with-AI%20Studio-E37400?style=for-the-badge&logo=google)](https://aistudio.google.com/apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

</div>

---

## 📖 概要 (Overview)

**CADZUMEN** は、Google AI Studio の **Gemini 2.5 Pro** を活用し、自然言語による要望やテキスト指示（例:「間口8m×奥行き10m、南側にLDK20帖、東側に主寝室、水回りを北側に集約した木造住宅平面図」）から、業界標準の **ASCII DXF (AutoCAD R12 / 2000 AC1009/AC1015 互換)** コードを直接生成・レンダリングするWebベースの次世代CADプラットフォームです。

生成された図面は、ブラウザ上の高精度 Vector Canvas により、パン・ズーム・レイヤー表示切替（壁芯・建具・室名・寸法・家具・グリッド）・寸法線プレビューが可能で、ワンクリックで `.dxf` ファイルとしてエクスポートできます。AutoCAD、Jw_cad、Vectorworks、QGIS、Civil 3D 等の主要CADソフトにそのままインポートして本格作図のベースとして活用可能です。

---

## 🚀 主な機能 (Key Features)

1. **💬 自然言語からの建築図面生成 (Prompt-to-CAD)**:
   - Gemini 2.5 Pro の高度な幾何推論能力を用い、部屋の配置関係、モジュール寸法（910mmグリッド）、壁厚（120mm/150mm）、建具（片開きドア・引き戸・サッシ）、寸法線を論理的に算定して作図。
2. **📄 ASCII DXF 完全準拠エクスポート**:
   - `HEADER`、`TABLES (LAYER)`、`BLOCKS`、`ENTITIES (LINE, CIRCLE, ARC, TEXT)`、`EOF` の厳格な仕様に準拠。
   - AutoCAD、Jw_cad、Civil 3D で文字化け・エラーなく開けるフォーマット。
3. **🖥️ 高速 2D CAD Canvas プレビュー**:
   - マウスホイールによる滑らかな拡大・縮小、ドラッグによるパン移動。
   - リアルタイム世界座標HUD（ミリメートル単位）およびスケール表示。
   - レイヤーごとのカラー定義（AutoCAD Color Index準拠）と表示・非表示のトグル切替。
4. **🏛️ 建築図面プリセット内蔵**:
   - 1LDK アパート標準平面図
   - 木造2階建 3LDK 平面図
   - オープンオフィスフロア計画図
   - 標準矩計図（木造2階建断面）
   - エグゼクティブ会議室・家具配置図
5. **⚙️ 右上HUD・ナレッジ連携**:
   - 画面右上の「⚙️ / 📋 仕様・ナレッジHUD」から、いつでもアーキテクチャ仕様やプロンプト構文、Obsidian Vault 内のナレッジへアクセス可能。

---

## 🛠️ 技術スタック (Tech Stack)

| レイヤー | 採用技術 |
| :--- | :--- |
| **AI エンジン** | Google Gemini 2.5 Pro (Thinking / Geometry Optimization) |
| **プラットフォーム** | Google AI Studio ✕ Antigravity Autonomous Agent |
| **フロントエンド** | HTML5 Canvas, Vanilla Modern JavaScript (ES6+), Vanilla CSS |
| **データフォーマット** | ASCII DXF (AC1009 / R12 & 2000), JSON Geometry |
| **タイポグラフィ** | Outfit, Inter, JetBrains Mono |

---

## 💻 ローカル起動方法 (Quick Start)

Node.js 環境がインストールされていれば、以下のコマンドですぐにローカルサーバーを起動できます。

```bash
# 依存確認・開発サーバー起動 (ポート 3000)
npm run dev

# またはブラウザで直接開く
# index.html をダブルクリックして開くことも可能です
```

ブラウザで `http://localhost:3000` にアクセスしてください。

---

## 🔗 関連リンク (Related Links)

- [🤖 Google AI Studio 原本アプリ](https://aistudio.google.com/app/apps/053b7942-6942-4288-b95a-30bf9e867904?showPreview=true&showAssistant=true)
- [🐙 GitHub リポジトリ](https://github.com/yamatotakeru616/CADZUMEN)
- Obsidian Vault ナレッジ:
  - `[[00_Knowledge/Projects/CADZUMEN|CADZUMEN 仕様ノート]]`
  - `[[00_Knowledge/Projects/AIStudio/CADZUMEN|AI Studio CADZUMEN ノート]]`
  - `[[00_Knowledge/Projects/全アプリ統合一覧|全アプリ統合一覧マスター]]`

---

<div align="center">
  <sub>Built with ❤️ by yamatotakeru616 using Google AI Studio & Antigravity IDE</sub>
</div>
