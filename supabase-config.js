// Supabase Configuration for SiamCraft Hub
const SUPABASE_URL = "https://mrxjjooprbjolzafyghl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bqiEPxXLtL2qlosFakbvuQ_bbWMck8P";

window.supabaseClient = null;

(function initSupabase() {
    if (SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
        console.warn("Supabase credentials are not configured. Using local fallback data from data.js.");
        return;
    }

    try {
        let createClientFn = null;

        if (typeof createClient === 'function') {
            createClientFn = createClient;
        } else if (window.supabase && typeof window.supabase.createClient === 'function') {
            createClientFn = window.supabase.createClient;
        }

        if (!createClientFn) {
            console.error("Supabase SDK is not loaded. Check your internet connection or script order.");
            return;
        }

        const client = createClientFn(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = client;
        window.supabase = client;
        console.log("⚡ Supabase client initialized successfully!");
    } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
    }
})();
