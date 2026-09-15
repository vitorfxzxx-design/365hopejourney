-- Health365 Supabase Schema & Initial Data

-- 1. Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    date TEXT,
    products JSONB DEFAULT '["all"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products / eBooks Table
CREATE TABLE IF NOT EXISTS public.ebooks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover TEXT,
    category TEXT DEFAULT 'Content',
    release_mode TEXT DEFAULT 'Immediate',
    chapters JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Feed Articles Table
CREATE TABLE IF NOT EXISTS public.feed (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    image TEXT,
    category TEXT,
    author TEXT,
    read_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    avatar TEXT,
    date TEXT,
    text TEXT,
    image TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Specialist Questions Table
CREATE TABLE IF NOT EXISTS public.specialist_questions (
    id TEXT PRIMARY KEY,
    author_email TEXT NOT NULL,
    author_name TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT,
    status TEXT DEFAULT 'pending',
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Audios Table
CREATE TABLE IF NOT EXISTS public.audios (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    cover TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'current_settings',
    name TEXT DEFAULT 'Health365',
    slug TEXT DEFAULT '/health365',
    status TEXT DEFAULT 'Active',
    icon_emoji TEXT DEFAULT '🍏',
    admin_email TEXT DEFAULT 'admin@health365.com',
    admin_password TEXT DEFAULT 'admin',
    custom_domain TEXT DEFAULT 'app.health365.com',
    webhook_url TEXT DEFAULT 'https://api.kiwify.com.br/v1/webhooks/health365',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) for seamless public REST access
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
