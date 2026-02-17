-- Automatically created by Supabase
-- We'll extend it with a profile table

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE TABLE saved_palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL, -- Array of HEX colors
  palette_type TEXT, -- 'harmony', 'brand', 'custom'
  metadata JSONB, -- Additional data like brand vibe, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_saved_palettes_user_id ON saved_palettes(user_id);

-- Enable RLS
ALTER TABLE saved_palettes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own palettes"
  ON saved_palettes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own palettes"
  ON saved_palettes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own palettes"
  ON saved_palettes FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE saved_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  board_type TEXT, -- 'logo', 'feed', 'moodboard'
  images JSONB NOT NULL, -- Array of image objects
  colors JSONB, -- Associated colors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_boards_user_id ON saved_boards(user_id);

ALTER TABLE saved_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boards"
  ON saved_boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own boards"
  ON saved_boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own boards"
  ON saved_boards FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'search', 'export', 'generate'
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  UNIQUE(user_id, action_type, date)
);

CREATE INDEX idx_usage_tracking_user_date ON usage_tracking(user_id, date);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);
