// Email notifications via EmailJS — sends entirely from the browser, no server
// required (same approach as the existing 1ATFOperation site).
import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

export function emailConfigured(): boolean {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

export interface NotificationParams {
  to_email: string;
  to_name?: string;
  subject: string;
  message: string;
}

export async function sendNotification(params: NotificationParams): Promise<void> {
  if (!emailConfigured()) {
    console.warn('[email] EmailJS not configured — skipping notification.');
    return;
  }
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { ...params },
    { publicKey: PUBLIC_KEY },
  );
}
