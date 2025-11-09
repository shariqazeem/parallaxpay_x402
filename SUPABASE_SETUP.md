# Supabase Setup for ParallaxPay

## ✅ Completed Steps

1. ✅ Installed `@supabase/supabase-js` package
2. ✅ Created `.env.local` with your Supabase credentials
3. ✅ Created `lib/supabase.ts` with Supabase client
4. ✅ Integrated Supabase persistence into `app/agents/page.tsx`

## 🚀 Next Steps - Run in Supabase SQL Editor

1. **Go to Supabase SQL Editor:**
   - Open: https://supabase.com/dashboard/project/qgfniejzlzesflgdgcwe/sql

2. **Run the SQL Schema:**
   - Copy the contents of `supabase-schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to create the `agents` table

3. **Verify Table Created:**
   - Go to Table Editor: https://supabase.com/dashboard/project/qgfniejzlzesflgdgcwe/editor
   - You should see the `agents` table

## 📋 How It Works

### Load Agents (on page mount):
1. First tries to load from Supabase database
2. If Supabase fails/empty, falls back to localStorage
3. Always syncs to localStorage as backup

### Save Agents (on any change):
1. Saves to Supabase using upsert (insert or update)
2. If Supabase fails, falls back to localStorage
3. Always syncs to localStorage as backup

### Benefits:
- ✅ Survives server restarts
- ✅ Survives browser refresh
- ✅ Shared across devices (same wallet)
- ✅ Automatic localStorage fallback
- ✅ Production-ready persistence

## 🧪 Testing

1. **Deploy an agent** - should auto-save to Supabase
2. **Check Supabase Table Editor** - verify agent appears
3. **Refresh page** - agents should persist
4. **Restart dev server** - agents should persist

## 🔍 Debug Logs

Check browser console for:
- `📥 Loading deployed agents from Supabase...`
- `✅ Loaded X deployed agents from Supabase`
- `💾 Saving X deployed agents to Supabase...`
- `✅ Saved X deployed agents to Supabase`

If you see localStorage fallback messages, check:
1. Supabase URL/Key in `.env.local`
2. Table exists in Supabase
3. RLS policies allow operations
4. Network connectivity to Supabase

## 🎯 Schema Summary

```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,           -- Unique agent ID
  name TEXT NOT NULL,            -- Agent name
  type TEXT NOT NULL,            -- Agent type (custom, composite, etc.)
  prompt TEXT NOT NULL,          -- Agent prompt or workflow description
  deployed BIGINT NOT NULL,      -- Deployment timestamp (ms)
  total_runs INT DEFAULT 0,      -- Number of times executed
  status TEXT DEFAULT 'idle',    -- Current status (idle/running)
  identity_id TEXT,              -- Link to agent identity
  last_run BIGINT,               -- Last execution timestamp
  last_result TEXT,              -- Last execution result
  provider TEXT,                 -- Parallax provider used
  wallet_address TEXT,           -- Wallet that owns this agent
  workflow JSONB,                -- Workflow definition for composite agents
  created_at TIMESTAMPTZ,        -- Auto-generated creation time
  updated_at TIMESTAMPTZ         -- Auto-generated update time
);
```

## 🎉 Ready for Demo!

Once the table is created, your agents will persist across:
- Page refreshes
- Server restarts
- Browser sessions
- Device switches (if using same wallet)

Perfect for your hackathon demo presentation!
