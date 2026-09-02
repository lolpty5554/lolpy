// Supabase Configuration for SiamCraft Hub
const SUPABASE_URL = "https://mrxjjooprbjolzafyghl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bqiEPxXLtL2qlosFakbvuQ_bbWMck8P";

var supabase = null;
window.supabaseClient = null;

if (SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY") {
    try {
        const createClientFn = (window.supabase && typeof window.supabase.createClient === 'function') 
            ? window.supabase.createClient 
            : (typeof createClient === 'function' ? createClient : null);

        if (createClientFn) {
            const client = createClientFn(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabaseClient = client;
            window.supabase = client;
            supabase = client;
            console.log("⚡ Supabase client initialized successfully:", client);
        } else {
            console.error("Supabase SDK is not loaded from CDN.");
        }
    } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
    }
} else {
    console.warn("Supabase credentials are not configured. Using local fallback data from data.js.");
}
