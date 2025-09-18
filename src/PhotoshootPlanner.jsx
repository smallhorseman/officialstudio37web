import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqfqlnodwjubacmaduzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function PhotoshootPlanner() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  const [form, setForm] = useState({
    email,
    date: '',
    location: '',
    style: '',
    inspiration: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('photoshoot_plans').insert([{ ...form }]);
    setSaving(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-20 md:py-32 flex items-center justify-center">
        <div className="bg-[#262626] rounded-lg shadow-xl p-8 md:p-12 max-w-md w-full border border-white/10 text-center">
          <h2 className="text-3xl font-display text-white mb-4">Thank You!</h2>
          <p className="text-[#E6D5B8]/80 mb-2">Your photoshoot plan has been submitted. We'll be in touch soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 md:py-32 flex items-center justify-center">
      <div className="bg-[#262626] rounded-lg shadow-xl p-8 md:p-12 max-w-md w-full border border-white/10">
        <h2 className="text-3xl font-display text-center text-white mb-8">Photoshoot Planner</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your Email" required className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4" />
          <input type="date" name="date" value={form.date} onChange={handleChange} placeholder="Preferred Date" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4" />
          <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Preferred Location" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4" />
          <input type="text" name="style" value={form.style} onChange={handleChange} placeholder="Style (e.g. vintage, modern, candid)" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4" />
          <textarea name="inspiration" value={form.inspiration} onChange={handleChange} placeholder="Inspiration (Pinterest links, ideas, etc.)" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4" />
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional Notes" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4" />
          <button type="submit" className="w-full bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg" disabled={saving}>{saving ? 'Saving...' : 'Submit Plan'}</button>
        </form>
      </div>
    </div>
  );
}
