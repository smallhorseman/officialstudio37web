import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // <-- create this shared file

const questions = [
  { key: 'date', prompt: 'What date are you considering for your photoshoot?' },
  { key: 'location', prompt: 'Do you have a preferred location or type of setting?' },
  { key: 'style', prompt: 'What style or vibe are you hoping for? (e.g. vintage, modern, candid)' },
  { key: 'inspiration', prompt: 'Any inspiration, Pinterest links, or ideas you want to share?' },
  { key: 'notes', prompt: 'Any other notes or special requests?' }
];

export default function ConversationalPlanner({ email, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ email: email || '' });
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [aiPlan, setAiPlan] = useState('');
  const [saving, setSaving] = useState(false);

  const handleNext = async (e) => {
    e.preventDefault();
    const key = questions[step].key;
    setAnswers(a => ({ ...a, [key]: input }));
    setInput('');
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      setSaving(true);
      // Save to Supabase
      await supabase.from('photoshoot_plans').insert([{ ...answers, [key]: input }]);
      setSaving(false);
      setSubmitted(true);
      // Simulate AI plan
      setTimeout(() => {
        setAiPlan(
          `Here's your custom plan!\n\n- Date: ${answers.date || input}\n- Location: ${answers.location}\n- Style: ${answers.style}\n- Inspiration: ${answers.inspiration}\n- Notes: ${answers.notes}\n\nWe'll reach out soon to finalize details and offer creative suggestions!`
        );
      }, 1200);
      if (onComplete) onComplete();
    }
  };

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-display mb-4">Thank you!</h2>
        <div className="bg-[#181818] rounded p-4 text-left whitespace-pre-line text-[#E6D5B8] mt-2">{aiPlan || 'Generating your plan...'}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 text-[#E6D5B8]/80">{step === 0 && (
        <>
          <div className="mb-2">Let’s plan your perfect photoshoot! I’ll ask a few quick questions.</div>
          <div className="mb-2">(You can skip any question if you’re not sure.)</div>
        </>
      )}</div>
      <form onSubmit={handleNext} className="flex flex-col gap-4">
        <label className="font-bold text-[#E6D5B8]">{questions[step].prompt}</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
          autoFocus
        />
        <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md" disabled={saving || !input}>{step < questions.length - 1 ? 'Next' : 'Finish'}</button>
      </form>
    </div>
  );
}
