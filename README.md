# Reading Practice App

言語学習のためのデスクトップアプリケーション。ドキュメント管理、翻訳練習、語彙構築機能を搭載。

## 機能

### ドキュメント管理
- ドキュメントの作成、編集、削除
- デュアルペインエディタ（原文と翻訳）
- リアルタイム編集と変更検知
- ドキュメントの検索とフィルター
- 学習時間の記録

### 語彙システム
- テキスト選択から直接単語を追加
- 単語ごとに複数の意味と例文を管理
- コンテキスト対応の語彙保存
- 言語別フィルタリング

### エディタ機能
- 行番号表示
- 折り返し切り替え（Alt+Z）
- リサイズ可能なペイン
- 単語数・文字数カウント

### ユーザーインターフェース
- ライト/ダークモードテーマ
- レスポンシブレイアウト
- トースト通知
- 確認ダイアログ

## キーボードショートカット

| ショートカット | 動作 |
|----------|--------|
| `Alt + Z` | エディタの折り返し切り替え |
| `Ctrl + S` / `Cmd + S` | 現在のドキュメントを保存 |

## 技術スタック

- **フレームワーク**: Tauri 2.0
- **フロントエンド**: React + TypeScript
- **データベース**: SQLite
- **ビルドツール**: Vite

## 推奨IDE設定

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## はじめに

### 前提条件
- Node.js (v18以上)
- Rust (最新の安定版)

### インストール

```bash
# 依存関係のインストール
npm install

# 開発モードで実行
npm run tauri dev

# 本番用ビルド
npm run tauri build
```

## プロジェクト構造

```
reading-practice-app/
├── src/                    # フロントエンドソースコード
│   ├── components/         # Reactコンポーネント
│   │   ├── common/        # 共通コンポーネント
│   │   ├── editor/        # テキストエディタコンポーネント
│   │   ├── iconbar/       # アイコンナビゲーションバー
│   │   ├── layout/        # レイアウトコンポーネント
│   │   ├── modals/        # モーダルダイアログ
│   │   ├── sidebar/       # サイドバーコンポーネント
│   │   └── vocabulary/    # 語彙コンポーネント
│   ├── hooks/             # カスタムReactフック
│   ├── styles/            # グローバルスタイル
│   ├── types/             # TypeScript型定義
│   └── utils/             # ユーティリティ関数
├── src-tauri/             # Rustバックエンド
│   ├── migrations/        # データベースマイグレーション
│   └── src/               # Rustソースコード
├── docs/                  # ドキュメント
└── README.md
```

## 機能詳細

### ドキュメントエディタ
- 原文と翻訳用の分割ペインビュー
- 変更インジケーター付き自動保存検知
- カスタマイズ可能なワークスペース用リサイズ可能カラム
- 行番号表示による行単位編集

### 学習タイマー
- ドキュメントごとの学習時間記録
- 開始/一時停止/停止機能
- 累積時間統計
- ビジュアルタイマー表示

### 語彙管理
- クイック追加用コンテキストメニュー
- 複数の意味をサポート
- ドキュメントとリンクした例文
- 言語別整理
- 検索機能

### 統計ダッシュボード
- 総ドキュメント数
- 語彙単語数
- 総学習時間
- ドキュメント別統計

## データベーススキーマ

アプリケーションは以下の主要テーブルでSQLiteを使用しています：
- `documents` - ドキュメントのメタデータと設定
- `document_contents` - ドキュメントのテキストコンテンツ
- `vocabulary` - 語彙用語
- `vocabulary_meanings` - 単語の意味
- `vocabulary_examples` - 例文
- `study_sessions` - 学習時間記録

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は[LICENSE](LICENSE)ファイルを参照してください。
