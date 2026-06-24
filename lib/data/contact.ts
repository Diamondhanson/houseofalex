// Single source of truth for the business contact details, used by the contact
// page and the global footer.
export const CONTACT = {
  /** Human-readable phone (call + text + WhatsApp). */
  phoneDisplay: "+44 7463 565914",
  /** E.164 form for tel: links. */
  phoneE164: "+447463565914",
  /** Digits-only form for wa.me WhatsApp links. */
  whatsappNumber: "447463565914",
  email: "houseofalex0@gmail.com",
} as const;

export const telLink = `tel:${CONTACT.phoneE164}`;
export const mailtoLink = `mailto:${CONTACT.email}`;
export const whatsappLink = (text?: string) =>
  `https://wa.me/${CONTACT.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// Social / messaging profiles.
export const SOCIAL = {
  whatsapp: whatsappLink(),
  tiktok: "https://www.tiktok.com/@houseof_alex",
  facebook: "https://www.facebook.com/profile.php?id=61568193323400",
} as const;
