import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Phone,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Radio,
  Building2,
  Users,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { SafetyIncidentItem } from '../types';

export const SafetyTab: React.FC = () => {
  const { safetyIncidents, resolveSafetyIncident } = useSuperAdmin();

  const [selectedIncident, setSelectedIncident] = useState<SafetyIncidentItem | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [simulatedSosNotice, setSimulatedSosNotice] = useState<string | null>(null);

  const activeIncidents = safetyIncidents.filter((s) => s.status === 'active');
  const pastIncidents = safetyIncidents.filter((s) => s.status !== 'active');

  const handleResolve = () => {
    if (!selectedIncident) return;
    resolveSafetyIncident(selectedIncident.id, resolutionText || 'On-site police team debriefed parties. 100% safe resolution.');
    setSelectedIncident(null);
    setResolutionText('');
  };

  const handleSimulateSafetyDrill = () => {
    setSimulatedSosNotice('Broadcasted 1-second Geofence Ping across 17 companion sessions. All GPS signatures located within authorized Garba plot perimeters.');
    setTimeout(() => setSimulatedSosNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {simulatedSosNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{simulatedSosNotice}</span>
          </div>
          <button onClick={() => setSimulatedSosNotice(null)} className="text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Emergency Desk Hotline */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#180e26] to-[#180e26] border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Navratri Women & Guest Safety Control Room</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE PATROL CONNECTED
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Direct telemetry tie-in with Gujarat Police Navratri Cell (112 / 100) & SHE Team fast-response units.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateSafetyDrill}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 flex items-center gap-2 shrink-0 transition-colors"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Run Geofence Ping Scan</span>
        </button>
      </div>

      {/* Emergency Incidents Table */}
      <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase tracking-wider">
            Logged Safety Alerts & Emergency SOS History
          </span>
          <span className="text-xs text-slate-400">Total: {safetyIncidents.length} recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#1f1035] text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Alert ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Involved Parties</th>
                <th className="py-3.5 px-4">Venue & City</th>
                <th className="py-3.5 px-4">Responding Officer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {safetyIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500 font-medium">
                    No incidents
                  </td>
                </tr>
              ) : (
                safetyIncidents.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-white whitespace-nowrap">
                    {s.id}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap capitalize text-slate-200 font-medium">
                    {s.incidentType.replace('_', ' ')}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.severity === 'critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {s.severity}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-white font-semibold">Guest: {s.guestName}</div>
                    <div className="text-[10px] text-slate-400">Host: {s.companionName}</div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-white truncate">{s.venue}</div>
                    <div className="text-[10px] text-slate-400">{s.city}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                    {s.emergencyOfficer}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        s.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : s.status === 'false_alarm'
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    {s.timestamp}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedIncident(s);
                        setResolutionText('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INCIDENT DETAILS MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#180e26] border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#201333] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                  Emergency Incident Investigation
                </span>
                <h3 className="text-lg font-bold text-white">Alert #{selectedIncident.id}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Venue Location:</span>
                  <span className="font-bold text-white">{selectedIncident.venue} ({selectedIncident.city})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Patrol Unit:</span>
                  <span className="font-bold text-emerald-400">{selectedIncident.emergencyOfficer}</span>
                </div>
                {selectedIncident.policeStationNotified && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Police Station Stationed:</span>
                    <span className="font-semibold text-white">{selectedIncident.policeStationNotified}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Incident Report:</span>
                <p className="text-slate-200 p-3 rounded-xl bg-white/5 border border-white/5 leading-relaxed">
                  {selectedIncident.notes}
                </p>
              </div>

              {selectedIncident.status === 'active' && (
                <div>
                  <label className="text-slate-400 font-semibold block mb-1.5">
                    Officer Resolution Debrief:
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Enter on-site patrol verification summary..."
                    className="w-full bg-[#201033] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Close
                </button>
                {selectedIncident.status === 'active' && (
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  >
                    Mark Incident Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
