import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vzkfkuzvumwdhfantyja.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6a2ZrdXp2dW13ZGhmYW50eWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTYyNDEsImV4cCI6MjA3ODE3MjI0MX0.SE4XtjHD1LcUU-x1C7wSwCjHrvka8rIEvPBHlPB6_-Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);