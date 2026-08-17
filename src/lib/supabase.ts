import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ycdbkqsonglphemxtvzd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZGJrcXNvbmdscGhlbXh0dnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Nzc2ODIsImV4cCI6MjA5ODM1MzY4Mn0.ZY5Hg0ZZydGuQ55GocP6gjSJq8Ei4GhkQsaChWEPdr4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
