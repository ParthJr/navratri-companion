import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Shield, Upload, FileText, Camera, User, Phone, Tag } from 'lucide-react';
import { Booking, UserProfile } from '../types';
import { useSuperAdmin } from '../super-admin/context/SuperAdminContext';
import { ComplaintItem } from '../super-admin/types';

interface ReportProblemModalProps {
  booking?: Booking | null;
  profile?: UserProfile | null;
  initialCategory?: string;
  initialTargetName?: string;
  onClose: () => void;
  onSubmitSuccess?: (complaintId: string) => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  booking,
  profile,
  initialCategory = 'safety_concern',
  initialTargetName = '',
  onClose,
  onSubmitSuccess,
}) => {
  const { createComplaint } = useSuperAdmin();

  const [category, setCategory] = useState<
    | 'safety_concern'
    | 'misconduct'
    | 'fake_profile'
    | 'harassment'
    | 'payment_issue'
    | 'booking_issue'
    | 'no_show'
    | 'other'
  >((initialCategory as any) || (booking ? 'no_show' : 'safety_concern'));

  const [reporterName, setReporterName] = useState(profile?.name || booking?.guestName || '');
  const [reporterPhone, setReporterPhone] = useState(profile?.phone || booking?.guestPhone || '');
  const [targetName, setTargetName] = useState(initialTargetName || booking?.companionName || '');
  const [description, setDescription] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFileName(e.target.files[0].name);
    }
  };

  const mapCategoryToComplaintType = (cat: string): ComplaintItem['category'] => {
    switch (cat) {
      case 'no_show':
        return 'no_show';
      case 'safety_concern':
        return 'safety_concern';
      case 'misconduct':
        return 'unprofessional_behavior';
      case 'fake_profile':
        return 'fake_profile';
      case 'harassment':
        return 'harassment';
      case 'payment_issue':
        return 'payment_dispute';
      case 'booking_issue':
        return 'venue_issue';
      default:
        return 'other';
    }
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'no_show':
        return 'No-Show / Companion did not arrive';
      case 'safety_concern':
        return 'Safety Concern';
      case 'misconduct':
        return 'Misconduct / Inappropriate Behavior';
      case 'fake_profile':
        return 'Fake Profile / Impersonation';
      case 'harassment':
        return 'Harassment / Threats';
      case 'payment_issue':
        return 'Payment / Refund Problem';
      case 'booking_issue':
        return 'Booking / Meeting Spot Problem';
      default:
        return 'Other Violation';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `CMP-${Math.floor(10000 + Math.random() * 90000)}`;

      const newComplaint: ComplaintItem = {
        id: generatedId,
        bookingId: booking?.id || undefined,
        reporterType: 'guest',
        reporterName: reporterName.trim() || profile?.name || 'Concerned User',
        reporterPhone: reporterPhone.trim() || profile?.phone || '+91 98765 43210',
        targetName: targetName.trim() || booking?.companionName || 'Reported Party',
        category: mapCategoryToComplaintType(category),
        severity:
          category === 'safety_concern' || category === 'harassment' || category === 'misconduct'
            ? 'urgent'
            : 'medium',
        status: 'open',
        subject: `[${getCategoryTitle(category)}] ${booking ? `Issue with Booking #${booking.id}` : `Report regarding ${targetName || 'User'}`}`,
        description: `${description.trim()}${evidenceFileName ? ` | Attachment: ${evidenceFileName}` : ''}`,
        createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      };

      createComplaint(newComplaint);
      setIsSubmitting(false);
      setSubmittedComplaintId(generatedId);

      if (onSubmitSuccess) {
        onSubmitSuccess(generatedId);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#cec3ce]/40 flex flex-col my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#cec3ce]/30 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5 text-rose-950">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#12001f]">
                {booking ? 'Report Booking Problem' : 'Report User or Safety Problem'}
              </h3>
              <p className="text-xs text-[#596579]">
                {booking ? `Pass #${booking.id} • ${booking.companionName}` : 'Confidential report directly routed to Trust & Safety Team'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-rose-100 flex items-center justify-center text-rose-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-[#12001f]">
          {submittedComplaintId ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Ticket Generated
                </span>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#12001f] pt-1">
                  Report Logged Successfully
                </h4>
                <p className="text-sm font-mono font-bold text-[#311042]">
                  Your Unique Complaint ID is <span className="bg-[#311042] text-white px-2 py-0.5 rounded">{submittedComplaintId}</span>
                </p>
              </div>

              <p className="text-xs text-[#596579] max-w-sm leading-relaxed">
                Your report has been received and routed directly to the <strong>Platform Operations Dashboard → Complaints</strong> queue. Our Grievance &amp; Safety Officers will investigate and respond within statutory timelines.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-[#311042] hover:bg-[#12001f] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="text-xs font-bold uppercase text-[#596579] block mb-1">
                  Problem Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-[#cec3ce]/60 rounded-xl p-3 focus:outline-none focus:border-[#311042] cursor-pointer"
                >
                  <option value="safety_concern">Safety concern / Threat</option>
                  <option value="misconduct">Misconduct / Non-platonic behavior</option>
                  <option value="harassment">Harassment / Intimidation</option>
                  <option value="fake_profile">Fake profile / Impersonation</option>
                  <option value="no_show">No-Show / Companion did not arrive</option>
                  <option value="payment_issue">Payment or refund problem</option>
                  <option value="booking_issue">Booking or meeting problem</option>
                  <option value="other">Other policy violation</option>
                </select>
              </div>

              {!booking && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-[#596579] block mb-1">
                      Reported User / Companion Name
                    </label>
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      placeholder="e.g. Diya Patel or User ID"
                      className="w-full text-xs bg-slate-50 border border-[#cec3ce]/60 rounded-xl p-2.5 focus:outline-none focus:border-[#311042]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-[#596579] block mb-1">
                      Your Contact Phone
                    </label>
                    <input
                      type="text"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs bg-slate-50 border border-[#cec3ce]/60 rounded-xl p-2.5 focus:outline-none focus:border-[#311042]"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs font-bold uppercase text-[#596579] block mb-1">
                  Description of Incident or Problem *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details including what occurred, timestamps, and specific conduct..."
                  className="w-full text-xs bg-slate-50 border border-[#cec3ce]/60 rounded-xl p-3 focus:outline-none focus:border-[#311042] leading-relaxed"
                />
              </div>

              {/* Optional Evidence / File Upload */}
              <div>
                <label className="text-xs font-bold uppercase text-[#596579] block mb-1">
                  Optional Screenshot / Photo Evidence
                </label>
                <div className="relative border-2 border-dashed border-[#cec3ce]/60 hover:border-[#311042] bg-slate-50/50 rounded-xl p-3.5 text-center transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-[#596579]">
                    <Upload className="w-4 h-4 text-[#9b4500]" />
                    <span>
                      {evidenceFileName ? (
                        <strong className="text-emerald-700 font-mono">{evidenceFileName}</strong>
                      ) : (
                        'Click or drag photo / screenshot evidence (Optional)'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Escrow / Safety Notice */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety First:</strong> For urgent physical danger or crime, dial <strong>112</strong> (Police) or <strong>181</strong> (Women Helpline) immediately.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-[#cec3ce]/60 rounded-2xl text-xs font-bold text-[#596579] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Report...' : 'Submit Report & Generate ID'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
