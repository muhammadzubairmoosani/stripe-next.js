import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  ErrorResponse,
} from "@/types/stripe";

export async function POST(
  request: NextRequest
): Promise<NextResponse<CancelSubscriptionResponse | ErrorResponse>> {
  try {
    const body: CancelSubscriptionRequest = await request.json();
    const { subscription_id } = body;

    if (!subscription_id) {
      return NextResponse.json(
        { error: "subscription_id is required" },
        { status: 400 }
      );
    }

    // Cancel the subscription at the end of the period
    const deleted = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      message: "Subscription cancelled",
      subscription: deleted,
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
