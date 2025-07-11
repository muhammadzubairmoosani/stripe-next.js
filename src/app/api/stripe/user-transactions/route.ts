import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { UserTransactionsResponse, ErrorResponse } from "@/types/stripe";

export async function GET(
  request: NextRequest
): Promise<NextResponse<UserTransactionsResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get("customer_id");

    if (!customer_id) {
      return NextResponse.json(
        { error: "customer_id is required" },
        { status: 400 }
      );
    }

    // Fetch all charges for the customer
    const charges = await stripe.charges.list({
      customer: customer_id,
      limit: 100, // max allowed by Stripe in one call
    });

    return NextResponse.json({ transactions: charges.data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching user transactions:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
