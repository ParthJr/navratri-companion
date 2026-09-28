import dotenv from 'dotenv';
dotenv.config();
import healthHandler from '../api/health.ts';

async function run() {
  let statusCode = 200;
  let headers: Record<string, string> = {};
  let body = '';
  const req = { method: 'GET', url: '/api/health' };
  const res = {
    setHeader: (k: string, v: string) => { headers[k] = v; },
    set statusCode(code: number) { statusCode = code; },
    get statusCode() { return statusCode; },
    end: (data: string) => {
      body = data;
      console.log('HTTP STATUS:', statusCode);
      console.log('RESPONSE BODY:', body);
    }
  };
  await healthHandler(req, res);
}

run();
