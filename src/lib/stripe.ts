import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

// In-memory map for testing: email -> stripe_customer_id
export const emailToStripeCustomerId: Record<string, string> = {};

// Stripe Tax supported countries
export const stripeAutoTaxSupportedCountries = [
  "US",
  "GB",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "CA",
  "AU",
  "NO",
  "CH",
  "NZ",
  "SG",
  "JP",
];

// Manual tax rate IDs for unsupported countries
export const manualTaxRates: Record<string, string> = {
  PK: "txr_1RiyLpFbQiY6rDWWSj1ruxGN", // Pakistan
  IN: "txr_1RizcXFbQiY6rDWWpAandcBg", // India (example ID)
  BD: "txr_1RizfhFbQiY6rDWWTgTPYW82", // Bangladesh (example ID)
  AE: "txr_1RizgZFbQiY6rDWWbRBs1rKs", // UAE (example ID)
};
