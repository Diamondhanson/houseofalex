"use client";

import { useState, type FormEvent } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Headset,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EMPTY: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "General enquiry",
  message: "",
};

const SUBJECTS = [
  "General enquiry",
  "New trade account",
  "Stock availability",
  "Bulk pricing request",
  "Logistics & dispatch",
  "Existing order",
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(EMPTY);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO(resend): forward this enquiry to the trade desk via Resend.
    console.log("[contact] enquiry submitted:", form);
    setSent(true);
    setForm(EMPTY);
  }

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            Contact & assistance
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Talk to the trade desk
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Trade-only support for accounts, stock availability, pricing and logistics.
            We typically respond within one business day.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        {/* Form */}
        <section className="border border-slate-200 bg-white p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </span>
              <h2 className="mt-6 text-xl font-bold text-slate-900">Message sent</h2>
              <p className="mt-2 max-w-sm text-slate-600">
                Thanks — your enquiry has been logged. A member of the trade desk will be in
                touch shortly.
              </p>
              <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" required>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    placeholder="Jane Doe"
                  />
                </Field>
                <Field label="Business email" required>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputCls}
                    placeholder="orders@company.com"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputCls}
                    placeholder="+44 20 1234 5678"
                  />
                </Field>
                <Field label="Inquiry subject" required>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={inputCls}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Message" required>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputCls} resize-none`}
                  placeholder="Tell us about the volumes, categories and timelines you're working with…"
                />
              </Field>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Send className="h-4 w-4" />
                Send message
              </Button>
            </form>
          )}
        </section>

        {/* Secondary info columns */}
        <aside className="space-y-4">
          <InfoCard
            icon={Clock}
            title="Corporate hours"
            rows={[
              "Trade desk: Mon–Fri, 08:00–18:00 CET",
              "Logistics: Mon–Sat, 07:00–20:00 CET",
              "Closed on public holidays",
            ]}
          />
          <InfoCard
            icon={MapPin}
            title="Dispatch locations"
            rows={[
              "Primary hub — Rotterdam, NL",
              "UK hub — Felixstowe, GB",
              "Bonded warehousing available",
            ]}
          />
          <InfoCard
            icon={Headset}
            title="Direct support lines"
            rows={[
              "Trade desk — +31 10 123 4567",
              "Logistics — +44 1394 123 456",
              "trade@houseofalex.example",
            ]}
          />
          <div className="border border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 className="h-4 w-4 text-red-600" />
              Opening a trade account?
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Select &ldquo;New trade account&rdquo; as your subject and include your VAT/EORI
              number for faster onboarding.
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-700">
              <Mail className="h-4 w-4" />
              accounts@houseofalex.example
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-red-700">
              <Phone className="h-4 w-4" />
              +31 10 123 4500
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

function InfoCard({
  icon: Icon,
  title,
  rows,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  rows: string[];
}) {
  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center bg-red-50 text-red-600">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
        {rows.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
