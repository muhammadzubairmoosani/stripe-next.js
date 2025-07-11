import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  UpdateSubscriptionRequest,
  UpdateSubscriptionResponse,
  ErrorResponse,
} from "@/types/stripe";

export async function POST(
  request: NextRequest
): Promise<NextResponse<UpdateSubscriptionResponse | ErrorResponse>> {
  try {
    const body: UpdateSubscriptionRequest = await request.json();
    const { subscription_id, new_price_id } = body;

    if (!subscription_id || !new_price_id) {
      return NextResponse.json(
        { error: "subscription_id and new_price_id are required" },
        { status: 400 }
      );
    }

    // Get the subscription to find the current item
    const subscription = await stripe.subscriptions.retrieve(subscription_id);
    const currentItemId = subscription.items.data[0].id;

    // Update the subscription with the new price
    const updated = await stripe.subscriptions.update(subscription_id, {
      items: [
        {
          id: currentItemId,
          price: new_price_id,
        },
      ],
      // Prorate by default (Stripe will handle extra/less payment automatically)
      // To disable proration, add: proration_behavior: 'none'
    });

    return NextResponse.json({
      message: "Subscription updated",
      subscription: updated,
    });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
