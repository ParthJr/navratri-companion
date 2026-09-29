import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { uploadImageToStorage } from '../services/dbService';

interface PhotoUploadProps {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  required?: boolean;
  aspectRatio?: 'square' | 'rect';
  helperText?: string;
  error?: string | null;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  label,
  value,
  onChange,
  required = false,
  aspectRatio = 'square',
  helperText = 'JPG, PNG or WebP (Max 5MB)',
  error: externalError,
}) => {
  const [uploading, setUploading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Edit/Replace Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [confirmingReplace, setConfirmingReplace] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const error = externalError || internalError;

  // Process selected file
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected if needed
    e.target.value = '';
    setInternalError(null);

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setInternalError('Invalid file type. Please upload a JPG, PNG, or WebP photo.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setInternalError('Photo size exceeds 5MB limit. Please upload an image under 5MB.');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadImageToStorage(file);
      setUploading(false);

      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setInternalError(res.errorMessage || 'Upload failed. Please try again.');
      }
    } catch (err: any) {
      setUploading(false);
      setInternalError(err.message || 'Error uploading file.');
    }
  };

  // Replacement selection
  const handleReplacementSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setInternalError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setInternalError('Invalid file type. Please upload a JPG, PNG, or WebP photo.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setInternalError('Photo size exceeds 5MB limit. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReplacementPreview(reader.result as string);
      setReplacementFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Confirm replacement
  const handleConfirmReplacement = async () => {
    if (!replacementFile) return;
    setConfirmingReplace(true);
    setInternalError(null);

    try {
      const res = await uploadImageToStorage(replacementFile);
      setConfirmingReplace(false);

      if (res.success && res.url) {
        onChange(res.url);
        setIsEditing(false);
        setReplacementPreview(null);
        setReplacementFile(null);
      } else {
        setInternalError(res.errorMessage || 'Failed to upload replacement image.');
      }
    } catch (err: any) {
      setConfirmingReplace(false);
      setInternalError(err.message || 'Error replacing photo.');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setReplacementPreview(null);
    setReplacementFile(null);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    onChange(null);
    setIsEditing(false);
    setReplacementPreview(null);
    setReplacementFile(null);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-400 font-bold">*</span>}
        </label>
        {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleReplacementSelect}
      />

      {/* STATE 1: No Photo Uploaded -> Upload Trigger */}
      {!value && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`p-4 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            error
              ? 'border-rose-500/60 bg-rose-500/5 hover:bg-rose-500/10'
              : 'border-white/20 hover:border-[#fd8a42] bg-white/[0.02] hover:bg-white/[0.05]'
          }`}
        >
          {uploading ? (
            <div className="py-2 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-[#fd8a42] animate-spin" />
              <span className="text-xs font-medium text-slate-300">Uploading to secure storage...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-[#fd8a42]/10 flex items-center justify-center text-[#fd8a42]">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block hover:text-[#fd8a42] transition-colors">
                  Upload Profile Photo
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Click to select a photo from your device
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* STATE 2: Photo Uploaded -> Show Photo + [Edit Photo] button */}
      {value && (
        <div className="p-3 bg-[#1e1030] rounded-2xl border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`overflow-hidden border border-white/20 bg-slate-950 flex-shrink-0 ${
                aspectRatio === 'square' ? 'w-14 h-14 rounded-2xl' : 'w-20 h-14 rounded-xl'
              }`}
            >
              <img
                src={value}
                alt="Uploaded"
                className="w-full h-full object-cover"
                onError={() => setInternalError('Image could not be rendered')}
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Photo Attached
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Stored in central storage</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* EDIT PHOTO MODAL / DIALOG */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b0f2a] border border-white/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-[#fd8a42]" />
                Edit Profile Photo
              </h3>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current vs Replacement preview */}
            <div className="space-y-3">
              {replacementPreview ? (
                <div className="text-center space-y-2">
                  <span className="text-[11px] font-semibold text-amber-400 block">
                    New Photo Preview:
                  </span>
                  <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                    <img
                      src={replacementPreview}
                      alt="New Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Click "Confirm Replacement" to update your photo.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Current Photo:
                  </span>
                  <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border border-white/20">
                    {value ? (
                      <img src={value} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {replacementPreview ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={confirmingReplace}
                    onClick={handleConfirmReplacement}
                    className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {confirmingReplace ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm Replacement
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplacementPreview(null);
                      setReplacementFile(null);
                    }}
                    className="py-2 px-3 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => replaceFileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 bg-[#fd8a42] hover:bg-[#e07530] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Upload Another Image / Replace
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Current Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
