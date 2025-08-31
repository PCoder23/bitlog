# 🍎 BiteLog – GenAI-powered Calorie Tracker MVP

BiteLog is a simplified Healthify-style calorie tracker built in **1 day** using:

- ⚡ Next.js 14 (frontend)
- 🗄️ Supabase (database for foods)
- 🤖 OpenAI GPT-4o (auto-generates nutrition info for missing foods)
- 🎨 Vercel v0 (UI)

## ✨ Features

- Search for any food — if not in DB, AI generates nutrition per 100g.
- Add foods to meals (morning, lunch, evening, dinner).
- Auto-calculates **calories, protein, carbs, fat**.
- Stores daily totals in **localStorage** (per date).
- Simple, clean UI powered by Vercel's v0.

## 🚀 Demo

Live site: [bitelog.vercel.app](https://bitelog.vercel.app)

## 📦 Getting Started

1. **Clone repo:**

   ```bash
   git clone https://github.com/yourusername/bitelog.git
   cd bitelog
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Supabase + OpenAI API Key in `.env.local`:**

   ```ini
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   OPENAI_API_KEY=...
   ```

4. **Run dev server:**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

PRs welcome!
