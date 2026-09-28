import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Download,
  AlertTriangle,
  Shield,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Database,
  QrCode,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useSuperAdmin } from '../context/SuperAdminContext';

export const SettingsTab: React.FC = () => {
  const { systemSettings, updateSystemSettings, bookings, companions, payouts, customers } = useSuperAdmin();

  const [platformName, setPlatformName] = useState(systemSettings.platformName);
  const [supportEmail, setSupportEmail] = useState(systemSettings.supportEmail);
  const [emergencyHotline, setEmergencyHotline] = useState(systemSettings.emergencyHotline);
  const [policeControlNumber, setPoliceControlNumber] = useState(systemSettings.policeControlNumber);
  const [maintenanceMode, setMaintenanceMode] = useState(systemSettings.maintenanceMode);
  const [checkInWindowMinutes, setCheckInWindowMinutes] = useState(systemSettings.checkInWindowMinutes || 60);
  const [autoEscrowReleaseHours, setAutoEscrowReleaseHours] = useState(systemSettings.autoEscrowReleaseHours);

  // Platform UPI Configuration (UPI is only payment method across platform)
  const [platformUpiId, setPlatformUpiId] = useState(systemSettings.platformUpiId || '987654321012@upi');
  const [platformPayeeName, setPlatformPayeeName] = useState(systemSettings.platformPayeeName || 'Navratri Companion Platform Owner');
  const [platformUpiQrUrl, setPlatformUpiQrUrl] = useState(
    systemSettings.platformUpiQrUrl ||
      'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D987654321012%40upi%26pn%3DNavratri%2520Companion%2520Platform%26cu%3DINR'
  );

  const [copiedPreview, setCopiedPreview] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 12-char validation check for UPI identifier (exact 12 numbers/chars required)
  const upiPrefix = platformUpiId.includes('@') ? platformUpiId.split('@')[0] : platformUpiId;
  const isExact12 = upiPrefix.length === 12;

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPlatformUpiQrUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDefaultQr = () => {
    const generated = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(
      platformUpiId
    )}%26pn%3D${encodeURIComponent(platformPayeeName)}%26cu%3DINR`;
    setPlatformUpiQrUrl(generated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExact12) {
      setValidationError('UPI ID identifier prefix must be exactly 12 characters/numbers (e.g. 987654321012).');
      return;
    }
    setValidationError(null);

    updateSystemSettings({
      platformName,
      supportEmail,
      emergencyHotline,
      policeControlNumber,
      maintenanceMode,
      checkInWindowMinutes: Number(checkInWindowMinutes),
      autoEscrowReleaseHours: Number(autoEscrowReleaseHours),
      platformUpiId,
      platformPayeeName,
      platformUpiQrUrl,
    });

    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  };

  const handleCopyPreview = () => {
    navigator.clipboard?.writeText(platformUpiId);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2500);
  };

  const handleExportBackup = () => {
    const fullBackup = {
      exportTimestamp: new Date().toISOString(),
      platformName,
      systemSettings: {
        ...systemSettings,
        platformUpiId,
        platformPayeeName,
        platformUpiQrUrl,
      },
      customersCount: customers.length,
      companionsCount: companions.length,
      bookingsCount: bookings.length,
      payoutsCount: payouts.length,
      data: {
        customers,
        bookings,
        payouts,
      },
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navratri-companion-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Platform settings &amp; UPI configuration saved successfully!</span>
        </div>
      )}

      {validationError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="font-semibold">{validationError}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: PLATFORM UPI PAYMENT GATEWAY (SUPER ADMIN ONLY) */}
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-6">
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#fd8a42]" />
                <h2 className="text-base font-bold text-white">Platform Official UPI Gateway Configuration</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                UPI is the only payment method across the platform. Only Super Admin can configure or update UPI details.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold bg-[#fd8a42]/10 text-[#fd8a42] border border-[#fd8a42]/30 px-2.5 py-1 rounded-full">
              UPI Only Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-semibold">
                    Official Platform UPI ID (Exactly 12 Characters/Numbers)
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${isExact12 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Identifier: {upiPrefix.length}/12 chars {isExact12 ? '✓' : '(Required: 12)'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={platformUpiId}
                  onChange={(e) => setPlatformUpiId(e.target.value)}
                  placeholder="e.g. 987654321012@upi"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#fd8a42]"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Prefix must be exactly 12 characters/numbers (e.g. <code>987654321012</code> or <code>987654321012@upi</code>).
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Official Payee Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={platformPayeeName}
                  onChange={(e) => setPlatformPayeeName(e.target.value)}
                  placeholder="e.g. Navratri Companion Platform Owner"
                  className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#fd8a42]"
                />
              </div>

              {/* QR Upload & URL */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">
                  Platform UPI QR Code (Upload Image or URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={platformUpiQrUrl.startsWith('data:') ? '[Uploaded Image Attached]' : platformUpiQrUrl}
                    onChange={(e) => setPlatformUpiQrUrl(e.target.value)}
                    placeholder="Enter QR image URL or upload image"
                    className="flex-1 bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#fd8a42]"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateDefaultQr}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold whitespace-nowrap"
                    title="Generate QR code automatically for configured UPI ID"
                  >
                    Auto Generate
                  </button>
                </div>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#fd8a42]" />
                  <span>Upload QR Code Image (PNG / JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Right Live Preview Box */}
            <div className="p-4 rounded-2xl bg-[#201033] border border-white/10 space-y-3 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Customer View Preview (Checkout &amp; Registration)
              </span>

              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-300">
                <img
                  src={platformUpiQrUrl}
                  alt="Official Platform UPI QR Code"
                  className="w-40 h-40 object-contain"
                />
              </div>

              <div className="w-full space-y-1">
                <span className="text-[10px] text-slate-400 block">Verified Platform Escrow UPI:</span>
                <div className="flex items-center justify-between p-2 bg-[#160b24] rounded-xl border border-white/10 text-xs">
                  <span className="font-mono font-bold text-[#fd8a42] truncate max-w-[180px]">
                    {platformUpiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPreview}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-[11px] flex items-center gap-1"
                  >
                    {copiedPreview ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Payee: <strong className="text-white">{platformPayeeName}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: GENERAL PLATFORM & SYSTEM CONFIGURATION */}
        <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">General Platform Operations</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Contact helplines, check-in arrival window buffers, escrow release, and maintenance toggle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Platform Brand Title</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Central Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">24x7 Emergency SOS Hotline</label>
              <input
                type="text"
                value={emergencyHotline}
                onChange={(e) => setEmergencyHotline(e.target.value)}
                className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Police Navratri Cell Number</label>
              <input
                type="text"
                value={policeControlNumber}
                onChange={(e) => setPoliceControlNumber(e.target.value)}
                className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Check-In Arrival Window Buffer (Minutes)
              </label>
              <input
                type="number"
                value={checkInWindowMinutes}
                onChange={(e) => setCheckInWindowMinutes(Number(e.target.value))}
                className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Auto-Release Escrow if Uncontested (Hours)
              </label>
              <input
                type="number"
                value={autoEscrowReleaseHours}
                onChange={(e) => setAutoEscrowReleaseHours(Number(e.target.value))}
                className="w-full bg-[#201033] border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Maintenance Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">Platform Maintenance Mode</span>
              <span className="text-[11px] text-slate-400">
                When active, customer booking flow displays a scheduled festival maintenance notice.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                maintenanceMode ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {maintenanceMode ? 'Active (Restricted)' : 'Normal Operations'}
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#fd8a42] to-[#c9184a] text-white text-xs font-bold shadow-lg hover:opacity-95 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System &amp; UPI Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* Database Backup & Export Card */}
      <div className="p-6 rounded-2xl bg-[#160b24] border border-white/10 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#fd8a42]" />
            <span>Platform State Backup &amp; Export</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Download complete snapshot of bookings, companion payouts, and customer registry as JSON.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Current Dataset: {bookings.length} Bookings • {companions.length} Companions • {payouts.length} Payouts
          </span>
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#fd8a42]" />
            <span>Download Backup (.JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
