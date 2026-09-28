import React, { useState } from 'react';
import {
  Bell,
  Megaphone,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';

export const NotificationsTab: React.FC<{ mode?: 'notifications' | 'announcements' }> = ({ mode = 'notifications' }) => {
  const { systemSettings, updateSystemSettings } = useSuperAdmin();

  const [activeSubTab, setActiveSubTab] = useState<'notifications' | 'announcements'>(mode);
  const [broadcastText, setBroadcastText] = useState(systemSettings.activeAnnouncement || '');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'alert'>(systemSettings.announcementType || 'info');
  const [sentBanner, setSentBanner] = useState(false);

  const [notificationLogs] = useState([
    { id: 'notif-1', title: 'Session Check-in Successful', target: 'Guest & Companion', body: 'Riya and Rahul Sharma mutual arrival check-in confirmed for GMDC Ground.', time: '12 mins ago', type: 'booking' },
    { id: 'notif-2', title: 'Instant Payout Disbursed', target: 'Companion Riya', body: '₹49,963 transferred to HDFC Bank •• 4912.', time: '28 mins ago', type: 'payout' },
    { id: 'notif-3', title: 'Venue High Density Advisory', target: 'All Companions in Ahmedabad', body: 'Rajpath Club parking full. Advise guests to use Gate 2 pickup point.', time: '1 hour ago', type: 'safety' },
    { id: 'notif-4', title: 'Host Application Approved', target: 'Jhanvi Mehta', body: 'Welcome to Navratri Companion! Your profile is now live.', time: '2 hours ago', type: 'application' },
  ]);

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      activeAnnouncement: broadcastText,
      announcementType: broadcastType,
    });
    setSentBanner(true);
    setTimeout(() => setSentBanner(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Sub Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-[#160b24] border border-white/10 w-fit">
        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'notifications'
              ? 'bg-[#fd8a42] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>System Notification Logs</span>
        </button>
        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'announcements'
              ? 'bg-[#fd8a42] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast Announcements</span>
        </button>
      </div>

      {sentBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Broadcast banner published across customer app & companion dashboards!</span>
        </div>
      )}

      {activeSubTab === 'notifications' ? (
        <div className="bg-[#160b24] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Automated Push & SMS Dispatches</h3>
            <p className="text-xs text-slate-400">All outbound alerts, booking confirmations, and emergency notifications.</p>
          </div>

          <div className="divide-y divide-white/5">
            {notificationLogs.map((item) => (
              <div key={item.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="text-[10px] bg-white/5 text-[#fd8a42] px-2 py-0.5 rounded-full font-medium">
                      {item.target}
                    </span>
                  </div>
                  <p className="text-slate-300">{item.body}</p>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Broadcast Public Festival Announcement</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Display a top emergency or advisory banner to all guests and companions in real-time.
            </p>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Announcement Type</label>
              <div className="grid grid-cols-3 gap-3">
                {(['info', 'warning', 'alert'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBroadcastType(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                      broadcastType === t
                        ? t === 'alert'
                          ? 'bg-red-500/20 text-red-300 border-red-500'
                          : t === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Announcement Message</label>
              <textarea
                rows={3}
                required
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="e.g. Navratri Day 5 High-Demand Alert: GMDC & Rajpath Club passes booking out rapidly."
                className="w-full bg-[#201033] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fd8a42]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setBroadcastText('');
                  updateSystemSettings({ activeAnnouncement: '' });
                }}
                className="text-xs text-slate-400 hover:text-red-400"
              >
                Clear Active Announcement
              </button>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish Banner</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
