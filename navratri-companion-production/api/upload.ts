import crypto from 'crypto';
import { parseRequestBody } from './auth/_authUtils.ts';
import { getSupabaseClient } from './_db.ts';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
          errorMessage: 'File size exceeds 5MB limit. Please upload an image under 5MB.',
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

    const supabase = getSupabaseClient();
    if (!supabase) {
      res.statusCode = 503;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Storage service unavailable: Supabase client is not configured.',
        })
      );
    }

    const isKyc =
      fileName.toLowerCase().includes('aadhaar') ||
      fileName.toLowerCase().includes('id_') ||
      fileName.toLowerCase().includes('kyc') ||
      category === 'kyc' ||
      category === 'document';

    const bucket = isKyc ? 'kyc-documents' : 'profile-photos';

    // Upload file directly to Supabase Storage
    const { data: uploadRes, error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(targetFilename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadErr) {
      console.error('Supabase storage upload error:', uploadErr.message);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: `Failed to upload image to persistent cloud storage: ${uploadErr.message}`,
        })
      );
    }

    let finalUrl = '';
    if (isKyc) {
      // Private storage for KYC / Aadhaar: generate 1-year signed URL for secure authorized access
      const { data: signedData, error: signErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(targetFilename, 60 * 60 * 24 * 365);

      if (signErr || !signedData?.signedUrl) {
        console.error('Failed to create signed URL for private KYC document:', signErr);
        res.statusCode = 500;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'Failed to generate secure URL for verified document.',
          })
        );
      }
      finalUrl = signedData.signedUrl;
    } else {
      // Public storage for profile photos
      const { data: pubData } = supabase.storage
        .from(bucket)
        .getPublicUrl(targetFilename);

      finalUrl = pubData.publicUrl;
    }

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        url: finalUrl,
        fileName: targetFilename,
        size: buffer.length,
        mimeType: mimeType,
        storage: 'supabase',
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

