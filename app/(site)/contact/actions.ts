"use server";

import { getServiceSupabase } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL, ORDER_INBOX_EMAIL } from "@/lib/resend";

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactResult {
  ok: boolean;
  error?: string;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

// Emails the owner via Resend and persists the enquiry (best-effort).
export async function sendContactMessage(form: ContactInput): Promise<ContactResult> {
  if (!form?.name?.trim() || !form?.email?.trim() || !form?.message?.trim()) {
    return { ok: false, error: "Please complete the required fields." };
  }

  // --- Email the owner (primary requirement) ---
  try {
    if (!ORDER_INBOX_EMAIL) throw new Error("ORDER_INBOX_EMAIL is not configured.");
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ORDER_INBOX_EMAIL,
      replyTo: form.email,
      subject: `New enquiry: ${form.subject || "General"} - ${form.name}`,
      html: contactEmailHtml(form),
    });
    if (error) throw error;
  } catch (e) {
    console.error("[sendContactMessage] email failed:", e);
    return { ok: false, error: "We couldn't send your message right now. Please try again." };
  }

  // --- Persist (best-effort) ---
  try {
    const supabase = getServiceSupabase();
    await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject || null,
      message: form.message,
    });
  } catch (e) {
    console.error("[sendContactMessage] persistence failed (message was emailed):", e);
  }

  return { ok: true };
}

function contactEmailHtml(f: ContactInput): string {
  const row = (label: string, value?: string) =>
    value
      ? `<tr><td style="padding:4px 0;color:#64748b;width:90px;vertical-align:top;">${label}</td><td style="padding:4px 0;color:#0f172a;">${escapeHtml(value)}</td></tr>`
      : "";
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;font-family:Helvetica,Arial,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;">
        <tr><td style="background:#dc2626;padding:16px 24px;color:#ffffff;font-size:16px;font-weight:bold;">House of Alex - New enquiry</td></tr>
        <tr><td style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;width:100%;">
            ${row("Name", f.name)}
            ${row("Email", f.email)}
            ${row("Phone", f.phone)}
            ${row("Subject", f.subject)}
          </table>
          <p style="margin:18px 0 6px 0;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Message</p>
          <p style="margin:0;font-size:14px;line-height:22px;color:#0f172a;white-space:pre-wrap;">${escapeHtml(f.message)}</p>
        </td></tr>
        <tr><td style="padding:14px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:11px;color:#94a3b8;">Reply directly to reach ${escapeHtml(f.name)}.</td></tr>
      </table>
    </td></tr>
  </table>`;
}
