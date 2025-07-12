import { NextRequest, NextResponse } from "next/server";
import {
  stripe,
  emailToStripeCustomerId,
  stripeAutoTaxSupportedCountries,
  manualTaxRates,
} from "@/lib/stripe";
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  ErrorResponse,
} from "@/types/stripe";
import Stripe from "stripe";

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateCheckoutSessionResponse | ErrorResponse>> {
  try {
    const body: CreateCheckoutSessionRequest = await request.json();
    const { price_id, email, country } = body;

    if (!price_id || !email || !country) {
      return NextResponse.json(
        { error: "price_id, email, and country are required" },
        { status: 400 }
      );
    }

    let customerId = emailToStripeCustomerId[email];

    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      emailToStripeCustomerId[email] = customerId;
    }

    // Build session config dynamically
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price: price_id,
      quantity: 1,
    };

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      line_items: [lineItem],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    };

    if (stripeAutoTaxSupportedCountries.includes(country)) {
      // Use Stripe automatic tax
      sessionConfig.automatic_tax = { enabled: true };
      sessionConfig.customer_update = {
        address: "auto",
        shipping: "auto",
        name: "auto",
      };
      sessionConfig.tax_id_collection = { enabled: true };
    } else {
      // Use manual tax rate for unsupported country if available
      if (manualTaxRates[country]) {
        (lineItem as Stripe.Checkout.SessionCreateParams.LineItem).tax_rates = [
          manualTaxRates[country],
        ];
      } else {
        (lineItem as Stripe.Checkout.SessionCreateParams.LineItem).tax_rates =
          [];
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return NextResponse.json({ checkout_url: session.url });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error creating checkout session:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
