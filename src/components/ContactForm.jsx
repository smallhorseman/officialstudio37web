import React, { useState } from 'react';
import { HubSpotForm, trackHubSpotEvent, identifyHubSpotVisitor } from './HubSpotIntegration';

const ContactForm = ({ useHubSpotForm = false, hubSpotFormId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Track form submission
      trackHubSpotEvent('contact_form_submitted', {
        service: formData.service,
        form_type: 'contact'
      });

      // Identify visitor
      identifyHubSpotVisitor(formData.email, {
        firstname: formData.name.split(' ')[0],
        lastname: formData.name.split(' ').slice(1).join(' '),
        phone: formData.phone,
        service_interest: formData.service,
        lead_source: 'contact_form'
      });

      // Your existing form submission logic here
      console.log('Contact form submitted:', formData);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
      
      alert('Thank you! We\'ll be in touch soon.');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Sorry, there was an error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHubSpotFormSubmit = (form) => {
    // Handle HubSpot form submission
    console.log('HubSpot form submitted:', form);
    trackHubSpotEvent('hubspot_form_completed', {
      form_id: hubSpotFormId,
      form_type: 'contact'
    });
  };

  if (useHubSpotForm && hubSpotFormId) {
    return (
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-display mb-6 text-center">Get In Touch</h3>
        <HubSpotForm
          formId={hubSpotFormId}
          target="hubspot-contact-form"
          onFormSubmit={handleHubSpotFormSubmit}
          className="hubspot-form-wrapper bg-[#262626] rounded-lg p-6"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <h3 className="text-2xl font-display mb-6 text-center">Get In Touch</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Your Name *"
          required
          className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
        />
        
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Your Email *"
          required
          className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="Phone Number"
          className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
        />
        
        <select
          value={formData.service}
          onChange={(e) => setFormData({...formData, service: e.target.value})}
          className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
        >
          <option value="">Select Service</option>
          <option value="portraits">Portrait Photography</option>
          <option value="events">Event Photography</option>
          <option value="weddings">Wedding Photography</option>
          <option value="commercial">Commercial Photography</option>
          <option value="content">Content Strategy</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        placeholder="Tell us about your project..."
        rows="6"
        className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
      />
      
      <button
        type="submit"
        disabled={submitting || !formData.name || !formData.email}
        className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-3 px-6 font-semibold transition-all hover:bg-[#E6D5B8] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
