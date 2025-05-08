import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://twgdcehwpbtpyevqgkek.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z2RjZWh3cGJ0cHlldnFna2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyNzcsImV4cCI6MjA1MzY0NjI3N30.TlwShmwGFKT9ic-RgslL9QjbZohT6jwRaKmEtQ6WuGU";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
