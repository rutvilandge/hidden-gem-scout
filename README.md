💎Hidden Gem Scout is a modern discovery platform dedicated to uncovering off-the-beaten-path locations and authentic local experiences. By combining community-driven data with AI-powered recommendations, it provides a unique way to explore destinations beyond the typical tourist guides.

✨ Features
Curated Discovery: Explore a hand-picked collection of unique venues, attractions, and "secret" spots.
Interactive Exploration: Seamlessly browse locations with a focus on visual storytelling and atmosphere.
User-Centric Design: A clean, responsive interface optimized for both desktop planning and on-the-go mobile scouting.
Authentic Insights: Prioritizes "places with a soul" and supports local creators and small businesses.

🛠️ Comprehensive Tech Stack
Frontend Infrastructure
Core: Vanilla JavaScript (ES6+ Modules) — Zero framework overhead.
UI Framework: Tailwind CSS — Utility-first styling for rapid, responsive design.
Icons: Lucide-React / Radix UI — Modern, accessible iconography.
Mapping: Leaflet.js / Google Maps API — Interactive geographic visualization.
Backend-as-a-Service (BaaS)
Database: Supabase (PostgreSQL) — Handles complex relational queries for gems and users.
Authentication: Supabase Auth (JWT) — Secure, managed user sessions.
Storage: Supabase Bucket — Hosting high-resolution imagery for gem submissions.
AI & Logic
Intelligence: OpenAI / Gemini API — Powers the "AI Scout" for natural language discovery.
Service Layer: data-service.js — A unified abstraction layer for all API interactions.

🚀 Development & Deployment
Clone & Configure:
bash
git clone https://github.com
cd hidden-gem-scout
Use code with caution.

Local Environment:
Initialize a .env file with your SUPABASE_URL and SUPABASE_ANON_KEY.
Use Live Server (VS Code) to serve the static files with consistent module loading.
CI/CD:
Hosted on Vercel for global edge distribution and automatic branch deployments.
