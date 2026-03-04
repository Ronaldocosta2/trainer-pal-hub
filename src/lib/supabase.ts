import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dslvdtwmjhoyjdvnregg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbHZkdHdtamhveWpkdm5yZWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NTc0ODYsImV4cCI6MjA4ODIzMzQ4Nn0.5yrY4fkm_Vod72bKLDTWFu6x98_X2J2PlC0Y4Mg1kkw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
