import { NextResponse } from 'next/server';
import { normalizePhone } from '@/lib/phone';

export async function POST(req: Request) {
  const { phone } = await req.json();
  const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, vsid = process.env.TWILIO_VERIFY_SID;
  if (!sid || !token || !vsid) return NextResponse.json({ mode: 'demo' });

  try {
    const res = await fetch(`https://verify.twilio.com/v2/Services/${vsid}/Verifications`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: normalizePhone(phone), Channel: 'sms' }),
    });
    if (res.ok) return NextResponse.json({ mode: 'sms' });
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ mode: 'demo', note: err?.message ?? `twilio ${res.status}` });
  } catch (e: any) {
    return NextResponse.json({ mode: 'demo', note: e.message });
  }
}
