import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const error = err as Error;
    console.log("Webhook signature verification failed.", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle Checkout & Payment events
  switch (event.type) {
    // Checkout & Payment events
    case "checkout.session.completed":
      console.log("Checkout session completed:", event.data.object);
      break;
    case "payment_intent.succeeded":
      console.log("Payment intent succeeded:", event.data.object);
      break;
    case "payment_intent.payment_failed":
      console.log("Payment intent failed:", event.data.object);
      break;
    case "charge.succeeded":
      console.log("Charge succeeded:", event.data.object);
      break;
    case "charge.failed":
      console.log("Charge failed:", event.data.object);
      break;
    // Subscription & Billing events
    case "customer.subscription.created":
      console.log("Subscription created:", event.data.object);
      break;
    case "customer.subscription.updated":
      console.log("Subscription updated:", event.data.object);
      break;
    case "customer.subscription.deleted":
      console.log("Subscription deleted:", event.data.object);
      break;
    case "invoice.paid":
      console.log("Invoice paid:", event.data.object);
      break;
    case "invoice.payment_failed":
      console.log("Invoice payment failed:", event.data.object);
      break;
    case "invoice.upcoming":
      console.log("Invoice upcoming:", event.data.object);
      break;
    default:
      // Log unhandled events for debugging
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
