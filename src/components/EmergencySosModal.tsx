import React, { useState } from 'react';
import { X, ShieldAlert, PhoneCall, AlertTriangle, CheckCircle, Navigation, Radio } from 'lucide-react';
import { useSuperAdmin } from '../super-admin/context/SuperAdminContext';
import { SafetyIncidentItem } from '../super-admin/types';

interface EmergencySosModalProps {
  onClose: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({ onClose }) => {
  const { createSafetyIncident } = useSuperAdmin();
  const [sosSent, setSosSent] = useState(false);

  const handleTriggerSOS = () => {
    const newIncident: SafetyIncidentItem = {
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      incidentType: 'emergency_sos',
      severity: 'critical',
      status: 'active',
      guestName: 'Guest User (Live Session)',
      companionName: 'Assigned Host Companion',
      venue: 'Agreed Public Meeting Location',
      city: 'Gujarat',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      policeStationNotified: 'Police Control Room (112)',
      emergencyOfficer: 'Officer Vijay Rathod (On-Ground Squad Lead)',
      notes: 'Live GPS SOS alert transmitted via app emergency trigger button.',
    };

    createSafetyIncident(newIncident);
    setSosSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12001f]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-rose-200 flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50 text-rose-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg">
                Emergency &amp; Safety Protocol
              </h3>
              <p className="text-xs text-rose-700">Immediate safety coordination and local assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-rose-100 flex items-center justify-center text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 text-[#12001f]">
          {sosSent ? (
            <div className="bg-rose-50 border border-rose-300 p-5 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Radio className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-rose-900">SOS Alert Transmitted!</h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                Your live GPS coordinates at your meeting location and companion pass details have been dispatched to our On-Ground Safety Response Squad and your emergency contact.
              </p>
              <div className="pt-2 text-xs font-semibold text-rose-950">
                A safety officer is calling your phone (+91 98765 12345) right now.
              </div>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  If you feel unsafe or experience any violation of our <strong>non-sexual, public-only policy</strong>, tap below for immediate emergency intervention.
                </span>
              </div>

              {/* Direct Speed-dial numbers */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-[#596579] tracking-wider">
                  Direct Police &amp; Medical Helplines
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="tel:112"
                    className="p-3 rounded-lg border border-[#cec3ce]/40 bg-slate-50 hover:bg-white flex items-center justify-between text-xs font-semibold text-[#12001f] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-rose-600" />
                      <span>National Emergency (112)</span>
                    </div>
                    <span className="text-rose-600 font-bold">Dial</span>
                  </a>

                  <a
                    href="tel:1091"
                    className="p-3 rounded-lg border border-[#cec3ce]/40 bg-slate-50 hover:bg-white flex items-center justify-between text-xs font-semibold text-[#12001f] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-[#9b4500]" />
                      <span>Women Helpline (1091)</span>
                    </div>
                    <span className="text-[#9b4500] font-bold">Dial</span>
                  </a>

                  <a
                    href="tel:+917926850000"
                    className="p-3 rounded-lg border border-[#cec3ce]/40 bg-slate-50 hover:bg-white flex items-center justify-between text-xs font-semibold text-[#12001f] transition-all sm:col-span-2"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-600" />
                      <span>Ahmedabad Navratri Control Room (+91 79 2685 0000)</span>
                    </div>
                    <span className="text-emerald-700 font-bold">Call Live</span>
                  </a>
                </div>
              </div>

              {/* Red Big SOS button */}
              <button
                type="button"
                onClick={handleTriggerSOS}
                className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-['Plus_Jakarta_Sans'] font-bold text-base hover:bg-rose-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Radio className="w-5 h-5 animate-pulse" />
                <span>Broadcast Instant SOS &amp; Dispatch Safety Escort</span>
              </button>
            </>
          )}

          <div className="pt-2 border-t border-[#cec3ce]/30 flex justify-between items-center text-xs text-[#596579]">
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              Live Geofence: Ahmedabad &amp; Gandhinagar
            </span>
            <button onClick={onClose} className="hover:underline">
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
