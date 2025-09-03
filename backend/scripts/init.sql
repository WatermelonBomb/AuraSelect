-- AuraSelect データベース初期化スクリプト
-- PostgreSQL 15+ 用

-- 必要な拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 全文検索用

-- pgvectorは後でAI機能実装時に追加
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- データベース設定
SET timezone = 'Asia/Tokyo';
SET client_encoding = 'UTF8';

-- 基本的な設定確認
SELECT version();
SELECT current_database(), current_user, inet_server_addr(), inet_server_port();