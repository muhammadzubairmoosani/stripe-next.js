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
  PK: "txr_1RkVAZJIOvP468UXlTO7lFOW", // Pakistan
  IN: "txr_1RkVCfJIOvP468UXtBROoRdf", // India (example ID)
  BD: "txr_1RkVEJJIOvP468UXjwIUOSbg", // Bangladesh (example ID)
  AE: "txr_1RkVEvJIOvP468UXaCa4mStl", // UAE (example ID)
};
