import { getSupabaseClient } from './_db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, errorMessage: 'Method Not Allowed' }));
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    res.statusCode = 503;
    return res.end(
      JSON.stringify({
        ok: false,
        database: 'disconnected',
        message: 'Supabase client is not configured. Missing SUPABASE_URL or API key.',
      })
    );
  }

  try {
    // 1. Verify live Supabase database connectivity by testing the users table
    const { error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (usersError) {
      console.error('Database health check failed for users table:', usersError.message);
      res.statusCode = 503;
      return res.end(
        JSON.stringify({
          ok: false,
          database: 'disconnected',
          message: 'Failed to connect to central database.',
        })
      );
    }

    // 2. Audit required core tables in the database
    const requiredTables = ['users', 'registration_payments', 'user_profiles', 'host_applications', 'bookings', 'complaints'];
    const tableStatus: Record<string, boolean> = {};

    await Promise.all(
      requiredTables.map(async (table) => {
        try {
          const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
          tableStatus[table] = !error;
        } catch {
          tableStatus[table] = false;
        }
      })
    );

    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        ok: true,
        database: 'connected',
        tables: tableStatus,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (err: any) {
    console.error('Health endpoint caught fatal error:', err);
    res.statusCode = 503;
    return res.end(
      JSON.stringify({
        ok: false,
        database: 'disconnected',
        message: 'Database check failed due to unexpected server exception.',
      })
    );
  }
}
