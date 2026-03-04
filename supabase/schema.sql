-- Fumuly: profiles テーブル（auth.usersの拡張）
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  display_name       TEXT,
  income_type        TEXT,
  monthly_income     INTEGER,
  debt_total         INTEGER,
  debt_creditors     TEXT[],
  has_adhd           BOOLEAN DEFAULT FALSE,
  phone_difficulty   BOOLEAN DEFAULT FALSE,
  characteristics_other TEXT,
  current_situation  TEXT,
  onboarding_done    BOOLEAN DEFAULT FALSE,
  plan               TEXT DEFAULT 'free' CHECK (plan IN ('free', 'paid')),
  is_vip             BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ユーザーは自分のプロフィールを更新できるが、
-- plan, is_vip, stripe_* カラムは直接変更不可（Webhookがservice roleで更新する）
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan = (SELECT plan FROM profiles WHERE id = auth.uid())
    AND is_vip = (SELECT is_vip FROM profiles WHERE id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM profiles WHERE id = auth.uid())
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM profiles WHERE id = auth.uid())
  );

-- サインアップ時に自動でprofileを作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================

-- Fumuly: documents テーブル
CREATE TABLE IF NOT EXISTS documents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender             TEXT,
  type               TEXT,
  amount             INTEGER,
  deadline           DATE,
  action_required    BOOLEAN,
  priority           TEXT CHECK (priority IN ('high', 'medium', 'low', 'ignore')),
  category           TEXT CHECK (category IN ('urgent', 'action', 'keep', 'ignore')),
  summary            TEXT,
  recommended_action TEXT,
  detailed_summary   TEXT,
  is_done            BOOLEAN DEFAULT FALSE,
  done_at            TIMESTAMP WITH TIME ZONE,
  is_archived        BOOLEAN DEFAULT FALSE,
  archived_at        TIMESTAMP WITH TIME ZONE,
  local_image_id     TEXT
);

-- Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can select own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_priority ON documents(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_documents_deadline ON documents(user_id, deadline);
CREATE INDEX IF NOT EXISTS idx_documents_active ON documents(user_id, is_done, is_archived);

-- =============================================

-- Fumuly: conversations テーブル（チャット履歴）
-- 書類に紐づく会話も、書類なしの相談もどちらも保存できる
CREATE TABLE IF NOT EXISTS conversations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id        UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role               TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content            TEXT NOT NULL,
  has_image          BOOLEAN DEFAULT FALSE,
  local_image_id     TEXT
);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_document_id ON conversations(document_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(user_id, created_at);

-- =============================================

-- Fumuly: reminders テーブル（リマインダー）
CREATE TABLE IF NOT EXISTS reminders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id        UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  remind_at          TIMESTAMPTZ NOT NULL,
  type               TEXT NOT NULL DEFAULT 'in_app',  -- 'in_app' | 'push' | 'calendar'
  is_sent            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- NOTE: UPDATEポリシーは意図的に省略。リマインダーの更新はservice_role（API経由）のみ許可する設計。

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(user_id, remind_at) WHERE is_sent = FALSE;

-- =============================================

-- Fumuly: push_subscriptions テーブル（Web Push通知）
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint           TEXT NOT NULL,
  keys_p256dh        TEXT NOT NULL,
  keys_auth          TEXT NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- NOTE: UPDATEポリシーは意図的に省略。Subscriptionの更新はservice_role（API経由）のみ。

-- インデックス
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
