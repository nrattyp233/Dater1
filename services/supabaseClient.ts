import { createClient } from '@supabase/supabase-js';

// Hardcode for production since Vite env may not be available
const url = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'https://xclhndjglcnkcvibqqgv.supabase.co';
const key = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGhuZGpnbGNua2N2aWJxcWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzOTM2MDEsImV4cCI6MjA0OTk2OTYwMX0.b3D6KBTsQyM6pvZDhN0wkjH3eKaYWBOPFcqNAA0mOLI';

export const supabase = createClient(url, key);
