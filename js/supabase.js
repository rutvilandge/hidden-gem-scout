window.HGS_SUPABASE_URL = "https://edtphwunwkgkuptjrhre.supabase.co";
window.HGS_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdHBod3Vud2tna3VwdGpyaHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTc5NTgsImV4cCI6MjA4NzE3Mzk1OH0.GgQMygRiq5sU0pHZudsuXX3XknvNWM2VXEo2pJbuFyc";

window.getSupabaseClient = () => {
  if (!window.supabase) {
    throw new Error('Supabase SDK not loaded. Include the CDN script first.');
  }
  if (!window.HGS_SUPABASE_URL || !window.HGS_SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials are missing.');
  }
  return window.supabase.createClient(window.HGS_SUPABASE_URL, window.HGS_SUPABASE_ANON_KEY);
};
