// Supabase Configuration for SiamCraft Hub
const SUPABASE_URL = "https://mrxjjooprbjolzafyghl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bqiEPxXLtL2qlosFakbvuQ_bbWMck8P";

var supabase = null;
window.supabaseClient = null;

(function initSupabase() {
    if (SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
        console.warn("Supabase credentials are not configured. Using local fallback data from data.js.");
        return;
    }

    try {
        // unpkg UMD build exposes the namespace at window.supabase
        // which has createClient as a method inside it
        let createClientFn = null;

        if (typeof createClient === 'function') {
            // Some CDN builds expose createClient directly on window
            createClientFn = createClient;
        } else if (window.supabase && typeof window.supabase.createClient === 'function') {
            // UMD build exposes window.supabase.createClient
            createClientFn = window.supabase.createClient;
        }

        if (!createClientFn) {
            console.error("Supabase SDK is not loaded from CDN. Check your internet connection.");
            return;
        }

        const client = createClientFn(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = client;
        window.supabase = client;
        supabase = client;
        console.log("⚡ Supabase client initialized successfully!");
    } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
    }
})();
