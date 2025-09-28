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

      // Save planning details
      const { error: planningError } = await supabase
        .from('photoshoot_plans')
        .insert([{
          lead_id: leadData[0].id,
          shoot_type: formData.shootType,
          date: formData.date,
          location: formData.location,
          budget: formData.budget,
          details: formData.details
        }]);

      if (planningError) throw planningError;

      if (onComplete) {
        onComplete(formData);
      }
    } catch (error) {
      console.error('Error submitting photoshoot plan:', error);
      alert('There was an error submitting your plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#262626] rounded-lg">
      <h2 className="text-2xl font-vintage text-[#F3E3C3] mb-6">
        Plan Your Photoshoot
      </h2>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg text-[#F3E3C3]">Contact Information</h3>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded text-[#F3E3C3]"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded text-[#F3E3C3]"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Your Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded text-[#F3E3C3]"
          />
          <button
            onClick={handleNext}
            className="bg-[#F3E3C3] text-[#1a1a1a] px-6 py-2 rounded hover:bg-[#E6D5B8] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg text-[#F3E3C3]">Photoshoot Details</h3>
          <select
            name="shootType"
            value={formData.shootType}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded text-[#F3E3C3]"
          >
            <option value="">Select Shoot Type</option>
            <option value="portrait">Portrait</option>
            <option value="wedding">Wedding</option>
            <option value="event">Event</option>
            <option value="commercial">Commercial</option>
          </select>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded text-[#F3E3C3]"
          />
          <input
            type="text"
            name="location"
            placeholder="Preferred Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded text-[#F3E3C3]"
          />
          <input
            type="text"
            name="budget"
            placeholder="Budget Range"
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded text-[#F3E3C3]"
          />
          <textarea
            name="details"
            placeholder="Additional Details"
            value={formData.details}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded text-[#F3E3C3]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#F3E3C3] text-[#1a1a1a] px-6 py-2 rounded hover:bg-[#E6D5B8] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Plan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoshootPlanner;
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

