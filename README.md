# Hidden Gem Scout

Hidden Gem Scout is a static frontend web app for discovering underrated places, browsing by vibe, exploring a map, using AI Scout suggestions, and submitting new gems.

## Pages

- `index.html` - landing page
- `signin.html` - sign in and sign up flow
- `explore.html` - explore hidden gems by category
- `map.html` - map-based browsing
- `ai-scout.html` - AI Scout search experience
- `submit-gem.html` - submit a new gem
- `gem.html` - gem detail page

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Supabase Auth
- Supabase Database

## Project Structure

```text
.
|-- index.html
|-- explore.html
|-- map.html
|-- signin.html
|-- submit-gem.html
|-- ai-scout.html
|-- gem.html
|-- css/
|-- js/
`-- assets/
```

## Main Frontend Scripts

- `js/app.js` - landing page interactions
- `js/login.js` - sign in and sign up logic
- `js/explore.js` - explore page filtering, saving, and rendering
- `js/map.js` - map explorer logic
- `js/ai-scout.js` - AI Scout UI behavior
- `js/submit-gem.js` - gem submission flow
- `js/data-service.js` - Supabase reads and writes
- `js/auth-guard.js` - redirect unauthenticated users to sign in
- `js/admin.js` - admin email checks for approval actions

## Running Locally

Because this is a static site, you can open `index.html` directly in a browser. A local server is still recommended so navigation and external integrations behave more consistently.

Examples:

```powershell
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## Supabase Setup

This project currently loads Supabase credentials from:

- `js/supabase.js`

The app expects:

- a Supabase project
- Auth enabled for email/password
- a `gems` table used by `js/data-service.js`

Current app capabilities using Supabase:

- sign in
- sign up
- fetch approved gems
- submit new gems
- approve gems for admin users

## Important Before Pushing To GitHub

`js/supabase.js` currently contains a live Supabase URL and anon key.

An anon key is not a secret in the same way as a service-role key, but you should still review your Supabase RLS policies before publishing the repo. Make sure:

- the service-role key is never exposed in frontend code
- row level security is enabled
- write operations are restricted correctly
- only intended users can approve gems

## Deployment Options

This app is well suited for static hosting:

- Netlify
- Vercel
- GitHub Pages

Recommended path:

1. Push the repo to GitHub.
2. Connect the repo to Netlify or Vercel.
3. Set the publish directory to the project root.
4. Verify Supabase auth redirect URLs in the Supabase dashboard.

## GitHub Prep Checklist

- Add a proper `.gitignore`
- Commit the project
- Review `js/supabase.js`
- Remove unnecessary backup files if you do not want them in the repo
- Confirm your Supabase project settings and auth redirect URLs

## Notes

- Explore navigation is currently routed through sign-in first.
- Submitted gems are inserted as unapproved by default.
- Admin approval is controlled by `js/admin.js`.
