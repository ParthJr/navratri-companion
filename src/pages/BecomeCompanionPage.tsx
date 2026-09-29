import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useSuperAdmin } from '../super-admin/context/SuperAdminContext';
import { PhotoUpload } from '../components/PhotoUpload';
import { submitApplicationToDb } from '../services/dbService';
import { generateWhatsAppUrl, trackWhatsAppClick } from '../utils/whatsapp';
import { WhatsAppIcon } from '../components/FloatingWhatsAppButton';

interface BecomeCompanionPageProps {
  onApplicationSubmitted: () => void;
}

export const BecomeCompanionPage: React.FC<BecomeCompanionPageProps> = ({
  onApplicationSubmitted,
}) => {
  const { createApplication } = useSuperAdmin();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    age: '',
    city: 'Ahmedabad',
    area: '',
    phone: '',
    email: '',
    experienceYears: '2',
    garbaStyle: 'Traditional 2-Taali & 3-Taali',
    bio: '',
    aadhaarNumber: '',
    hourlyRate: '1200',
    languages: 'Gujarati, Hindi, English',
  });

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const handleDobChange = (dob: string) => {
    setFormData((prev) => ({ ...prev, dob }));
    setError(null);
    if (!dob) return;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return;
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setFormData((prev) => ({ ...prev, age: String(calculatedAge) }));
    if (calculatedAge < 18) {
      setError('You must be at least 18 years old to register.');
    }
  };

  const handleStep1Next = () => {
    setError(null);
    if (!formData.name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      setError('You must be at least 18 years old to register.');
      return;
    }
    if (!profilePhoto) {
      setError('Please upload your profile photo to continue.');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    setError(null);
    if (!formData.bio.trim() || formData.bio.trim().length < 10) {
      setError('Bio must be at least 10 characters long.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      setError('You must be at least 18 years old to register.');
      return;
    }

    if (!profilePhoto) {
      setError('Please upload your profile photo to continue.');
      return;
    }

    if (!aadhaarImage) {
      setError('Government ID / Age Verification document upload is required.');
      return;
    }

    if (!selfieImage) {
      setError('Live selfie with ID is required for face verification.');
      return;
    }

    setIsSubmitting(true);

    const appData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      age: ageNum,
      dateOfBirth: formData.dob || undefined,
      city: formData.city,
      area: formData.area || 'Bodakdev',
      localityArea: formData.area || 'Bodakdev',
      garbaStyle: formData.garbaStyle,
      bio: formData.bio.trim(),
      idDocument: formData.aadhaarNumber || 'Govt ID Proof',
      profilePhoto,
      aadhaarImage,
      selfieImage,
      experienceYears: formData.experienceYears,
      languages: formData.languages,
      hourlyRate: Number(formData.hourlyRate) || 1200,
    };

    try {
      const res = await submitApplicationToDb(appData);
      setIsSubmitting(false);

      if (res.success) {
        setIsSuccess(true);
        // Also update admin context
        if (res.application) {
          createApplication(res.application);
        }
        setTimeout(() => {
          onApplicationSubmitted();
        }, 2500);
      } else {
        setError(res.errorMessage || 'Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Network error submitting application.');
    }
  };

  return (
    <div className="w-full bg-[#f8f9ff]">
      <section className="bg-[#12001f] text-white py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-[#ffdbca] text-xs font-bold uppercase tracking-wider">
            Host Community Onboarding
          </span>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl sm:text-4xl text-white">
            Become a Verified Navratri Companion
          </h1>
          <p className="text-xs sm:text-sm text-[#e6eeff]">
            Share your love for authentic Gujarati Garba, meet respectful visitors, and earn up to ₹25,000+ during the 9 festive nights of Navratri.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#cec3ce]/30 shadow-sm">
          {isSuccess ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-[#12001f]">
                Application Submitted!
              </h3>
              <p className="text-xs sm:text-sm text-[#596579] max-w-md mx-auto">
                Thank you for applying to join the Navratri Companion host network. Your profile and documents have been sent to the Platform Verification Desk for review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between border-b border-[#cec3ce]/30 pb-4 text-xs font-semibold">
                <span className={step >= 1 ? 'text-[#9b4500]' : 'text-[#596579]'}>1. Basic Details &amp; Photo</span>
                <span className={step >= 2 ? 'text-[#9b4500]' : 'text-[#596579]'}>2. Garba Skills &amp; Rate</span>
                <span className={step >= 3 ? 'text-[#9b4500]' : 'text-[#596579]'}>3. ID &amp; Selfie Verification</span>
              </div>

              {/* WhatsApp Support Assistance */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs">
                <div>
                  <span className="font-semibold text-emerald-950 block">Need help with registration?</span>
                  <span className="text-[11px] text-emerald-700">Chat directly with the support team on WhatsApp</span>
                </div>
                <a
                  href={generateWhatsAppUrl({ context: 'become_companion' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackWhatsAppClick({
                      page: 'become_companion_page',
                      context: 'become_companion',
                      role: 'companion',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                  aria-label="Chat on WhatsApp for Companion Registration"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: Basic Details & Profile Photo */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#12001f]">Personal Information</h4>

                  {/* Profile Photo */}
                  <PhotoUpload
                    label="Personal Profile Photo"
                    required
                    value={profilePhoto}
                    onChange={(url) => {
                      setProfilePhoto(url);
                      setError(null);
                    }}
                    helperText="Required: Upload clear personal photo"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Diya Patel"
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">
                        Mobile Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => handleDobChange(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">
                        Age (Minimum 18) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="18"
                        required
                        value={formData.age}
                        onChange={(e) => {
                          const a = e.target.value;
                          setFormData({ ...formData, age: a });
                          if (a && parseInt(a, 10) < 18) {
                            setError('You must be at least 18 years old to register.');
                          } else {
                            setError(null);
                          }
                        }}
                        placeholder="e.g. 23"
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="diya@example.com"
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">City &amp; Area</label>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="Bodakdev / SG Highway"
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleStep1Next}
                      className="bg-[#311042] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#9b4500] transition-colors flex items-center gap-1.5"
                    >
                      <span>Next: Skills &amp; Bio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Skills, Bio, Rate */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#12001f]">Garba Experience &amp; Pricing</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">Dance Style Specialty</label>
                      <select
                        value={formData.garbaStyle}
                        onChange={(e) => setFormData({ ...formData, garbaStyle: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                      >
                        <option>Traditional 2-Taali &amp; 3-Taali</option>
                        <option>Dodhiyo &amp; Teen Taal Expert</option>
                        <option>High Speed Sanedo &amp; Folk Steps</option>
                        <option>Beginner Friendly &amp; Patient Guide</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#596579] block mb-1">
                        Base Rate per Session (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="500"
                        step="100"
                        required
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        placeholder="e.g. 1200"
                        className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#596579] block mb-1">Languages Known</label>
                    <input
                      type="text"
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      placeholder="Gujarati, Hindi, English"
                      className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#596579] block mb-1">
                      Host Bio / About Me <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Introduce yourself to guests and describe what makes a Garba night with you special..."
                      className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#596579] hover:underline"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="bg-[#311042] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#9b4500] transition-colors flex items-center gap-1.5"
                    >
                      <span>Next: ID Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ID Verification */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#12001f]">Identity &amp; Safety Verification</h4>

                  <div>
                    <label className="text-xs font-semibold text-[#596579] block mb-1">
                      Aadhaar / Passport / Voter ID Document Number
                    </label>
                    <input
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="e.g. 5432 1098 7654"
                      className="w-full text-sm bg-slate-50 border border-[#cec3ce]/60 p-2.5 rounded-lg focus:outline-none"
                    />
                  </div>

                  {/* ID Document Upload */}
                  <PhotoUpload
                    label="Government ID / Age Verification Document (Aadhaar / Passport / Voter ID)"
                    required
                    aspectRatio="rect"
                    value={aadhaarImage}
                    onChange={(url) => {
                      setAadhaarImage(url);
                      setError(null);
                    }}
                    helperText="Upload official Government ID document"
                  />

                  {/* Live Selfie Upload */}
                  <PhotoUpload
                    label="Live Selfie with ID (for Verification Desk review)"
                    required
                    aspectRatio="square"
                    value={selfieImage}
                    onChange={(url) => {
                      setSelfieImage(url);
                      setError(null);
                    }}
                    helperText="Clear photo holding your ID"
                  />

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      By applying, I agree to the Platonic Companion Guarantee and pledge to adhere to festival safety and public ground guidelines.
                    </span>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-[#596579] hover:underline"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#9b4500] hover:bg-[#763300] disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-1.5"
                    >
                      <span>{isSubmitting ? 'Submitting Application...' : 'Submit Verification Application'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
