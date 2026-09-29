import { parseRequestBody } from '../auth/_authUtils.ts';
import { getFeeConfigurations, updateFeeConfigurationRecord, FeeConfiguration } from '../_db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'GET') {
    try {
      const fees = await getFeeConfigurations();
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          fees,
          companionRegistrationFee: fees.find((f) => f.feeCode === 'COMPANION_REGISTRATION')?.amount ?? 499,
          customerRegistrationFee: fees.find((f) => f.feeCode === 'CUSTOMER_REGISTRATION')?.amount ?? 0,
          customerPlatformFee: fees.find((f) => f.feeCode === 'CUSTOMER_PLATFORM_FEE')?.amount ?? 50,
          companionPlatformFee: fees.find((f) => f.feeCode === 'COMPANION_PLATFORM_FEE')?.amount ?? 0,
        })
      );
    } catch (err: any) {
      console.error('Error fetching fee configurations:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: 'Failed to load fee configuration',
        })
      );
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const feeCode = (body.feeCode || '').toString().trim();
      const adminId = (body.adminId || 'superadmin').toString().trim();

      if (!feeCode) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            success: false,
            errorMessage: 'feeCode is required',
          })
        );
      }

      const updates: Partial<FeeConfiguration> = {};
      if (body.amount !== undefined) updates.amount = Number(body.amount);
      if (body.feeName !== undefined) updates.feeName = body.feeName.toString().trim();
      if (body.gstEnabled !== undefined) updates.gstEnabled = Boolean(body.gstEnabled);
      if (body.gstPercentage !== undefined) updates.gstPercentage = Number(body.gstPercentage);
      if (body.status !== undefined) updates.status = body.status.toString().toUpperCase() as any;

      const updated = await updateFeeConfigurationRecord(feeCode, updates, adminId);

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: `Fee configuration for ${feeCode} updated successfully.`,
          fee: updated,
        })
      );
    } catch (err: any) {
      console.error('Error updating fee configuration:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          success: false,
          errorMessage: err.message || 'Failed to update fee configuration',
        })
      );
    }
  }

  res.statusCode = 405;
  return res.end(JSON.stringify({ success: false, errorMessage: 'Method Not Allowed' }));
}
