import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const PhotoshootPlanner = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shootType: '',
    date: '',
    location: '',
    budget: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.shootType,
          status: 'New'
        }])
        .select();

      if (leadError) throw leadError;

      // Save detailed planning info
      const planningDetails = `
Photoshoot Planning Details:
Type: ${formData.shootType}
Preferred Date: ${formData.date}
Location: ${formData.location}
Budget: ${formData.budget}
Additional Details: ${formData.details}
      `.trim();

      if (leadData && leadData[0]) {
        await supabase.from('lead_notes').insert([{
          lead_id: leadData[0].id,
          note: planningDetails,
          note_type: 'planning_session',
          priority: 'medium',
          status: 'Planning Complete'
        }]);
      }

      onComplete && onComplete(formData);
    } catch (error) {
      console.error('Error submitting planning form:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#F3E3C3]">Let's start with your contact information</h3>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] focus-ring"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] focus-ring"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] focus-ring"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#F3E3C3]">What type of shoot are you planning?</h3>
            <select
              name="shootType"
              value={formData.shootType}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] focus-ring"
              required
            >
              <option value="">Select shoot type</option>
              <option value="Portrait">Portrait Session</option>
              <option value="Wedding">Wedding</option>
              <option value="Event">Event Photography</option>
              <option value="Commercial">Commercial/Branding</option>
              <option value="Family">Family Session</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] focus-ring"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#F3E3C3]">Location and budget preferences</h3>
            <input
              type="text"
              name="location"
              placeholder="Preferred location or 'flexible'"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] focus-ring"
            />
            <select
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] focus-ring"
            >
              <option value="">Select budget range</option>
              <option value="$75-150">$75-150 (Mini Session)</option>
              <option value="$300-500">$300-500 (Standard)</option>
              <option value="$750-1200">$750-1200 (Premium)</option>
              <option value="$1200+">$1200+ (Luxury)</option>
              <option value="Custom">Let's discuss</option>
            </select>
            <textarea
              name="details"
              placeholder="Any additional details or special requests..."
              value={formData.details}
              onChange={handleChange}
              rows="4"
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] focus-ring"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#232323] p-6 rounded-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#F3E3C3]/70">Step {step} of 3</span>
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i <= step ? 'bg-[#F3E3C3]' : 'bg-[#F3E3C3]/20'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="w-full bg-[#1a1a1a] rounded-full h-2">
          <div
            className="bg-[#F3E3C3] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {renderStep()}
        
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-[#1a1a1a] text-[#F3E3C3] rounded hover:bg-[#333] transition-colors focus-ring"
            >
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!formData.name || !formData.email || (step === 2 && !formData.shootType)}
              className="px-4 py-2 bg-[#F3E3C3] text-[#1a1a1a] rounded font-semibold hover:bg-[#E6D5B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto focus-ring"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#F3E3C3] text-[#1a1a1a] rounded font-semibold hover:bg-[#E6D5B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto focus-ring"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Planning'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PhotoshootPlanner;

