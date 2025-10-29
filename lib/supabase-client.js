"use client";

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// async function sendMagicLink() {
//     const email = 'filanmaula10@gmail.com';
//     const { data, error } = await supabase.auth.signInWithOtp({
//       email,
//       emailRedirectTo: 'http://localhost:3000/sign-in/email-sent'
//     });
  
//     console.log('Data:', data);
//     console.log('Error:', error);
//   }
  
//   sendMagicLink();