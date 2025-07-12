import { NextRequest, NextResponse } from "next/server";
import { emailToStripeCustomerId } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  const customer_id = emailToStripeCustomerId[email];
  if (!customer_id) {
    return NextResponse.json(
      { error: "No customer_id found for this email" },
      { status: 404 }
    );
  }
  return NextResponse.json({ customer_id });
}
