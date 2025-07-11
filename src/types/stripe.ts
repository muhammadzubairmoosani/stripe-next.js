import Stripe from "stripe";

export interface CreateCheckoutSessionRequest {
  price_id: string;
  email: string;
  country: string;
}

export interface CreateCheckoutSessionResponse {
  checkout_url: string;
}

export interface UserTransactionsRequest {
  customer_id: string;
}

export interface UserTransactionsResponse {
  transactions: Stripe.Charge[];
}

export interface CancelSubscriptionRequest {
  subscription_id: string;
}

export interface CancelSubscriptionResponse {
  message: string;
  subscription: Stripe.Subscription;
}

export interface UpdateSubscriptionRequest {
  subscription_id: string;
  new_price_id: string;
}

export interface UpdateSubscriptionResponse {
  message: string;
  subscription: Stripe.Subscription;
}

export interface ProductsResponse {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  prices: Stripe.Price[];
}

export interface ErrorResponse {
  error: string;
}
