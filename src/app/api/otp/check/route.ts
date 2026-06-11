import { NextResponse } from 'next/server';
import { normalizePhone } from '@/lib/phone';

export async function POST(req: Request) {
  const { phone, code, mode } = await req.json();
  const demoOk = code === (process.env.DEMO_OTP ?? '000000');

  if (mode !== 'sms') return NextResponse.json({ ok: demoOk });

  const sid = process.env.TWILIO_ACCOUNT_SID!, token = process.env.TWILIO_AUTH_TOKEN!, vsid = process.env.TWILIO_VERIFY_SID!;
  try {
    const res = await fetch(`https://verify.twilio.com/v2/Services/${vsid}/VerificationCheck`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: normalizePhone(phone), Code: code }),
    });
    const data = await res.json().catch(() => ({}));
    // страховка сцены: демо-код проходит всегда
    return NextResponse.json({ ok: data?.status === 'approved' || demoOk });
  } catch {
    return NextResponse.json({ ok: demoOk });
  }
}
