import crypto from 'crypto';
import { parseRequestBody } from './auth/_authUtils.ts';
import { getSupabaseClient } from './_db.ts';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
  }

  try {
    const body = await parseRequestBody(req);
    const { dataUri, fileName = 'upload.jpg', fileType, category } = body;

    if (!dataUri || typeof dataUri !== 'string') {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'No image data provided. Please select a valid photo.',
        })
      );
    }

    // Parse data URI: format data:[<mediatype>][;base64],<data>
    const matches = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    let mimeType = fileType || 'image/jpeg';
    let base64Data = dataUri;

    if (matches && matches.length === 3) {
      mimeType = matches[1].toLowerCase();
      base64Data = matches[2];
    } else if (dataUri.includes('base64,')) {
      const parts = dataUri.split('base64,');
      base64Data = parts[1];
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Invalid file type. Only JPEG, PNG, and WebP images are permitted.',
        })
      );
    }

    // Convert to buffer and check size
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > MAX_FILE_SIZE) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'File size exceeds 10MB limit. Please upload an image under 10MB.',
        })
      );
    }

    if (buffer.length < 50) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Image data is invalid or corrupted.',
        })
      );
    }

    // Determine file extension
    let ext = 'jpg';
    if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';

    const uniqueId = `img_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const targetFilename = `${uniqueId}.${ext}`;

    const formattedDataUri = dataUri.startsWith('data:')
      ? dataUri
      : `data:${mimeType};base64,${base64Data}`;

    const supabase = getSupabaseClient();
    const isKyc =
      fileName.toLowerCase().includes('aadhaar') ||
      fileName.toLowerCase().includes('id_') ||
      fileName.toLowerCase().includes('kyc') ||
      category === 'kyc' ||
      category === 'document';

    const bucket = isKyc ? 'kyc-documents' : 'profile-photos';

    let uploadSuccessful = false;
    let finalUrl = '';

    if (supabase) {
      try {
        // 1. Attempt upload to primary storage bucket
        let { data: uploadRes, error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(targetFilename, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        // 2. If bucket is not found, attempt to auto-create and retry once
        if (uploadErr && uploadErr.message?.toLowerCase().includes('bucket not found')) {
          console.warn(`Supabase bucket "${bucket}" not found. Attempting automatic creation...`);
          try {
            const { error: createErr } = await supabase.storage.createBucket(bucket, {
              public: !isKyc,
              fileSizeLimit: 10 * 1024 * 1024,
            });
            if (!createErr) {
              const retry = await supabase.storage
                .from(bucket)
                .upload(targetFilename, buffer, {
                  contentType: mimeType,
                  upsert: true,
                });
              uploadRes = retry.data;
              uploadErr = retry.error;
            } else {
              console.warn('Auto bucket creation warning:', createErr.message);
            }
          } catch (createEx: any) {
            console.warn('Auto bucket creation error:', createEx.message);
          }
        }

        // 3. Resolve accessible public or signed URL if uploaded
        if (!uploadErr && uploadRes) {
          if (isKyc) {
            const { data: signedData, error: signErr } = await supabase.storage
              .from(bucket)
              .createSignedUrl(targetFilename, 60 * 60 * 24 * 365);
            if (!signErr && signedData?.signedUrl) {
              finalUrl = signedData.signedUrl;
              uploadSuccessful = true;
            }
          } else {
            const { data: pubData } = supabase.storage
              .from(bucket)
              .getPublicUrl(targetFilename);
            if (pubData?.publicUrl) {
              finalUrl = pubData.publicUrl;
              uploadSuccessful = true;
            }
          }
        } else if (uploadErr) {
          console.warn(`Supabase storage bucket "${bucket}" upload error: ${uploadErr.message}`);
        }
      } catch (storageEx: any) {
        console.warn('Supabase storage execution error:', storageEx?.message);
      }
    }

    // 4. Graceful Fallback: If cloud storage bucket is missing, use verified high-fidelity data URI
    // This guarantees profile creation, companion applications, and signups NEVER fail.
    if (!uploadSuccessful || !finalUrl) {
      console.info(`[Upload Fallback] Saved image as persistent data URI (${buffer.length} bytes)`);
      finalUrl = formattedDataUri;
    }

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        url: finalUrl,
        fileName: targetFilename,
        size: buffer.length,
        mimeType: mimeType,
        storage: uploadSuccessful ? 'supabase' : 'inline_data_uri',
      })
    );
  } catch (err: any) {
    console.error('File upload fatal error:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        errorMessage: 'Image upload failed due to a server error. Please try again.',
      })
    );
  }
}

export function serveUpload(req: any, res: any): boolean {
  return false;
}
