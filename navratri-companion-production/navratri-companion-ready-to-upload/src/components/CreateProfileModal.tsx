import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfileToDb } from '../services/dbService';
import { PhotoUpload } from './PhotoUpload';

interface CreateProfileModalProps {
  currentProfile: UserProfile;
  onClose: () => void;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  currentProfile,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentProfile.name || '');
  const [age, setAge] = useState(currentProfile.age ? String(currentProfile.age) : '23');
  const [city, setCity] = useState(() => {
    if (currentProfile.city && currentProfile.city.includes(',')) {
      return currentProfile.city.split(',')[0].trim();
    }
    return currentProfile.city || 'Ahmedabad';
  });
  const [area, setArea] = useState(() => {
    if (currentProfile.area) return currentProfile.area;
    if (currentProfile.city && currentProfile.city.includes(',')) {
      return currentProfile.city.split(',')[1].trim();
    }
    return 'Sindhu Bhavan Road';
  });
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [interests, setInterests] = useState(currentProfile.interests || 'Garba, Photography, Folk Dance, Food');
  const [garbaStyle, setGarbaStyle] = useState(currentProfile.garbaStyle || 'Traditional Dodhiyo & Teen Taal');
  const [languages, setLanguages] = useState(currentProfile.languages || 'Gujarati, Hindi, English');
  const [availability, setAvailability] = useState(currentProfile.availability || 'All 9 Navratri Nights');
  const [price2h, setPrice2h] = useState(currentProfile.price2h ? String(currentProfile.price2h) : '1499');
  const [price4h, setPrice4h] = useState(currentProfile.price4h ? String(currentProfile.price4h) : '2799');
  const [photoUrl, setPhotoUrl] = useState(currentProfile.selfieImage || '');

  const [step, setStep] = useState<'form' | 'submitted'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitted');

    const updated: UserProfile = {
      ...currentProfile,
      name,
      age,
      city: `${city}, ${area}`,
      area,
      bio,
      interests,
      garbaStyle,
      languages,
      availability,
      price2h,
      price4h,
      selfieImage: photoUrl,
      hasCompletedProfile: true,
      verificationStatus: currentProfile.verificationStatus || 'Verified',
    };

    // Save to Central Persistent Database
    if (currentProfile.userId) {
      saveUserProfileToDb({
        userId: currentProfile.userId,
        name,
        email: currentProfile.email,
        phone: currentProfile.phone,
        city: `${city}, ${area}`,
        age: parseInt(age, 10) || 23,
        bio,
        preferredGarbaStyle: garbaStyle,
        avatarUrl: photoUrl,
      }).catch((err) => console.warn('DB profile save error:', err));
    }

    setTimeout(() => {
      onSaveProfile(updated);
      onClose();
    }, 1000);
  };

  const isEditing = Boolean(currentProfile.hasCompletedProfile);

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-[#cec3ce]/40 flex flex-col my-auto text-[#12001f] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#cec3ce]/30 flex items-center justify-between bg-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#311042] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Sparkles className="w-4 h-4 text-[#fd8a42]" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#12001f]">
                {isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
              </h3>
              <p className="text-xs text-[#596579]">
                {isEditing
                  ? 'Update your profile information, photos, and preferences'
                  : 'Complete your profile details to unlock full platform access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#dee9fc] flex items-center justify-center text-[#12001f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Photo Preview & Upload */}
              <PhotoUpload
                label="Profile Photo"
                required
                value={photoUrl || null}
                onChange={(url) => setPhotoUrl(url || '')}
                helperText="Upload real profile photo for identity verification"
              />

              {/* Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#12001f] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-[#cec3ce]/60 px-3 py-2 rounded-xl text-xs text-[#12001f]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#12001f] block mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="23"
                    className="w-full bg-slate-50 border border-[#cec3ce]/60 px-3 py-2 rounded-xl text-xs text-[#12001f]"
                  />
                </div>
              </div>

              {/* City & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#12001f] block mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-[#cec3ce]/60 px-3 py-2 rounded-xl text-xs text-[#12001f]"
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#12001f] block mb-1">Area / Suburb</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Sindhu Bhavan Road"
                    className="w-full bg-slate-50 border border-[#cec3ce]/60 px-3 py-2 rounded-xl text-xs text-[#12001f]"
                  />
                </div>
              </div>

              {/* Bio & Garba Style */}
              <div>
                <label className="font-semibold text-[#12001f] block mb-1">Bio / About Yourself</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your Garba experience, passion, and what makes you a great companion..."
                  className="w-full bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-xl text-xs text-[#12001f]"
                />
              </div>

              {/* Garba Style & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#12001f] block mb-1">Garba Dance Style</label>
                  <input
                    type="text"
                    value={garbaStyle}
                    onChange={(e) => setGarbaStyle(e.target.value)}
                    placeholder="e.g. Dodhiyo, Popat, Teen Taal"
                    className="w-full bg-slate-50 border border-[#cec3ce]/60 px-3 py-2 rounded-xl text-xs text-[#12001f]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#12001f] block mb-1">Languages Spoken</label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="e.g. Gujarati, Hindi, English"
                    className="w-full bg-slate-50 border border-[#cec3ce]/60 px-3 py-2 rounded-xl text-xs text-[#12001f]"
                  />
                </div>
              </div>

              {/* Package Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#eff4ff] p-3 rounded-2xl border border-[#cec3ce]/30">
                <div>
                  <label className="font-semibold text-[#12001f] block mb-1">2-Hour Package Price (₹)</label>
                  <input
                    type="number"
                    value={price2h}
                    onChange={(e) => setPrice2h(e.target.value)}
                    className="w-full bg-white border border-[#cec3ce]/60 px-3 py-2 rounded-xl text-xs font-bold text-[#9b4500]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#12001f] block mb-1">4-Hour Package Price (₹)</label>
                  <input
                    type="number"
                    value={price4h}
                    onChange={(e) => setPrice4h(e.target.value)}
                    className="w-full bg-white border border-[#cec3ce]/60 px-3 py-2 rounded-xl text-xs font-bold text-[#9b4500]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#311042] hover:bg-[#9b4500] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4 text-[#fd8a42]" />
                <span>{isEditing ? 'Save & Update Profile' : 'Create Profile → Submit for Verification'}</span>
              </button>
            </form>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-xl text-[#12001f]">Profile Submitted for Verification</h4>
              <p className="text-xs text-[#596579] max-w-sm">
                Your profile is now under review by Platform Operations Admin. Status: <strong className="text-amber-700">Pending Verification</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
