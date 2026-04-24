💎Hidden Gem Scout:
It is a modern discovery platform dedicated to uncovering off-the-beaten-path locations and authentic local experiences.
By combining community-driven data with AI-powered recommendations, it provides a unique way to explore destinations beyond the typical tourist guides.
live link-https://hidden-gem-scout.vercel.app/


✨ Features

🗺️ Curated Discovery — Hand-picked unique venues and secret local spots
🤖 AI Scout — Natural language search powered by OpenAI / Gemini
📍 Interactive Maps — Leaflet.js / Google Maps integration
🔐 Auth & Profiles — Secure JWT sessions via Supabase
🧭 Community Submissions — Submit gems with photos and location pins
📱 Fully Responsive — Works on desktop and mobile


🛠️ Tech Stack
LayerTechnologiesFrontendVanilla JS (ES6+), Tailwind CSS, Lucide IconsMapsLeaflet.js / Google Maps APIBackendSupabase (PostgreSQL, Auth, Storage)AIOpenAI / Gemini API via data-service.jsHostingVercel (CI/CD + Edge)

🚀 Getting Started
1. Clone & install:
bashgit clone https://github.com/rutvilandge/hidden-gem-scout.git
cd hidden-gem-scout
npm install
2. Set up .env:
envSUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIza...
3. Run locally:
bash# VS Code Live Server (recommended) or:
npx serve .

🚢 Deployment
Hosted on Vercel — push to main to auto-deploy.
bashnpm i -g vercel && vercel --prod
Add all .env variables under Vercel → Project Settings → Environment Variables.

🤝 Contributing

Fork the repo
Create a branch: git checkout -b feature/your-feature
Commit & push, then open a Pull Request


📄 License
MIT — see LICENSE for details.
