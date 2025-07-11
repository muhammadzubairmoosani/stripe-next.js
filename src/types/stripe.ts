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
  transactions: any[];
}

export interface CancelSubscriptionRequest {
  subscription_id: string;
}

export interface CancelSubscriptionResponse {
  message: string;
  subscription: any;
}

export interface UpdateSubscriptionRequest {
  subscription_id: string;
  new_price_id: string;
}

export interface UpdateSubscriptionResponse {
  message: string;
  subscription: any;
}

export interface ProductsResponse {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  prices: any[];
}

export interface ErrorResponse {
  error: string;
}
