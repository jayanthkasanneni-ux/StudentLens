const SUPABASE_URL = "https://wfebzsyndggdnnojujvs.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_KTL-oxTkqOTciDcMewaAUQ_T8dyB8Yr";

console.log("Supabase library:", typeof window.supabase);

if (typeof window.supabase !== "undefined") {
    window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    console.log("Supabase client created successfully");
} else {
    console.error("Supabase library is not loaded");
}