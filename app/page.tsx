'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Heart, Send, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Confirmation from './components/confirmation';

export default function Home() {
  const [formData, setFormData] = useState({
    wardName: '',
    wardClass: '',
    numberOfParticipants: 1,
    email: '',
    phone: '',
    participants: [
      { name: '', relationToStudent: '' }
    ]
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isCurrentSlot, setIsCurrentSlot] = useState<boolean | null>(null);
  const [slotNumber, setSlotNumber] = useState<number | null>(null);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParticipantChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.map((participant, i) => 
        i === index ? { ...participant, [field]: value } : participant
      )
    }));
  };

  const handleNumberOfParticipantsChange = (e: any) => {
    const count = parseInt(e.target.value);
    setFormData(prev => {
      const newParticipants = [...prev.participants];
      
      if (count > prev.participants.length) {
        for (let i = prev.participants.length; i < count; i++) {
          newParticipants.push({ name: '', relationToStudent: '' });
        }
      } else {
        newParticipants.splice(count);
      }
      
      return {
        ...prev,
        numberOfParticipants: count,
        participants: newParticipants
      };
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submit-rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json()
        setIsSubmitted(true);
        setIsCurrentSlot(data.currentSlot);
        setSlotNumber(data.sheet);

      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit RSVP');
      }
    } catch (error: any) {
      console.error('Error submitting RSVP:', error);
      alert(error.message || 'Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Confirmation isCurrentSlot={isCurrentSlot} formData={formData} currentSlot={slotNumber} setIsSubmitted={setIsSubmitted} setFormData={setFormData}/>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-w-screen min-h-screen bg-[#262626] text-white">
      <div className="flex flex-col items-center justify-center w-full">
        <h1 className="text-9xl pt-10 amita md:text-8xl font-bold mb-2 bg-gradient-to-r from-[#F28705] to-[#F29F05] bg-clip-text text-transparent">
          सयपत्री 
        </h1>
        <p className="text-sm md:text-lg text-gray-400 mb-4 leading-relaxed">
          A Trikala Theater Production
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#F29F05]" />
            <span>Aasadh 3, 2082</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#F29F05]" />
            <span>4:30 PM</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#F29F05]" />
            <span>Triyog High School, Auditorium</span>
          </div>
        </div>
      </div>

      {/* RSVP Form */}
      <div className="flex flex-col justify-center items-center mt-5">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#F29F05]">Reserve Your Seat</h2>
            <p className="text-center text-gray-300 mb-8">
              Join us for this unforgettable theatrical experience. Limited seating available.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ward Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Child's Name *</label>
                  <input
                    type="text"
                    name="wardName"
                    value={formData.wardName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F29F05] focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter Child's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Child's Class *</label>
                  <input
                    type="text"
                    name="wardClass"
                    value={formData.wardClass}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F29F05] focus:border-transparent text-white placeholder-gray-400"
                    placeholder="e.g., Grade 10A"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F29F05] focus:border-transparent text-white placeholder-gray-400"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    pattern="^(\+977)?9\d{9}$"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F29F05] focus:border-transparent text-white placeholder-gray-400"
                    placeholder="+977 98XXXXXXXX"
                  />
                </div>
              </div>

              {/* Number of Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Guests *</label>
                <select
                  name="numberOfParticipants"
                  value={formData.numberOfParticipants}
                  onChange={handleNumberOfParticipantsChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F29F05] focus:border-transparent text-white"
                >
                  <option value={1}>1 Participant</option>
                  <option value={2}>2 Participants</option>
                </select>
              </div>

              {/* Participants Information */}
              <div className="space-y-6">
                {formData.participants.map((participant, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-xl space-l-2">
                    <h4 className="text-sm font-medium text-gray-200 mb-3">
                      Guest {index + 1}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={participant.name}
                          onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F29F05] focus:border-transparent text-white placeholder-gray-400"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Relation to Student *</label>
                        <select
                          value={participant.relationToStudent}
                          onChange={(e) => handleParticipantChange(index, 'relationToStudent', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F29F05] focus:border-transparent text-white"
                        >
                          <option value="">Select relation</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Uncle">Uncle</option>
                          <option value="Aunt">Aunt</option>
                          <option value="Family Friend">Family Friend</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer py-4 bg-gradient-to-r from-[#F28705] to-[#F29F05] text-white font-semibold rounded-xl hover:from-[#F29F05] hover:to-[#F28705] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Confirm RSVP
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Image
        src={'/final.jpg'}
        width={720}
        height={1000}
        alt={'poster'}
        className='p-4'
      />

      {/* Footer */}
      <footer className="w-full bg-gray-900/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Triyog High School, Trikala Club © 2025. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            For inquiries, contact us at trikala@triyog.edu.np
          </p>
          <p className='text-[#F28705]'>
            Designed by the minds at Triyog STEAM Club, <Link href={"https://np.linkedin.com/in/sitanshu-shrestha-62403a215"}>Sitanshu Shrestha</Link>; <Link href={"https://np.linkedin.com/in/pranja7l"}>Pranjal Panthi</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
