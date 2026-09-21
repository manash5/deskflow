export const SPECIALISTS = [
  {
    id: "sales",
    label: "Sales",
    summary: "Products, pricing, availability, and comparisons.",
  },
  {
    id: "support",
    label: "Support",
    summary: "How-to, troubleshooting, and product issues.",
  },
  {
    id: "account",
    label: "Account",
    summary: "Login, profile, and access questions.",
  },
  {
    id: "billing",
    label: "Billing",
    summary: "Charges, invoices, refunds, and payments.",
  },
  {
    id: "booking",
    label: "Booking",
    summary: "Appointments, reservations, and scheduling.",
  },
  {
    id: "default",
    label: "General",
    summary: "Company facts and anything that does not fit another specialist.",
  },
] as const;

export const SPECIALIST_IDS: string[] = SPECIALISTS.map((item) => item.id);

export const DEFAULT_PERSONA = `You are a customer support voice for this company. Be warm, calm, and easy to understand.

- Use plain language. Keep replies short.
- Never invent prices, policies, features, or personal data.
- Never ask for passwords, OTPs, full card numbers, or other secrets.
- Do not mention that you are an AI or how routing works.`;
