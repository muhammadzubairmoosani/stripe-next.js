"use client";

import { useState, useEffect } from "react";
import { useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring?: { interval: string };
}

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  prices: StripePrice[];
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState("");
  const emailRef = useRef("");
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  // Remove useCallback, useSearchParams, sessionChecked, fetchSessionAndTransactions, and all session_id logic
  // Only keep email/customerId based logic for fetching transactions

  useEffect(() => {
    fetchProducts();
  }, []);

  // Remove useEffect that auto-fetches on email change
  // Add handler for button click
  const isValidEmail = (email: string) => /.+@.+\..+/.test(email);
  const handleGetTransaction = () => {
    if (email && isValidEmail(email)) {
      fetchCustomerId(email);
    } else {
      setCustomerId(null);
      setTransactions([]);
    }
  };

  // Fetch transactions when customerId changes
  useEffect(() => {
    if (customerId) {
      fetchTransactions(customerId);
    } else {
      setTransactions([]);
    }
  }, [customerId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/products");
      const data = await response.json();
      if (!data.error) {
        setProducts(data);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage("An error occurred while fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckout = async (priceId: string) => {
    if (!email || !country) {
      setMessage("Please enter your email and select country");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          country,
          price_id: priceId,
        }),
      });
      const data = await response.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
      setEmail("");
    }
  };

  // Helper: fetch customerId from backend using new API
  const fetchCustomerId = async (email: string) => {
    setTxError("");
    setTxLoading(true);
    try {
      const res = await fetch(
        `/api/stripe/customer-id?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (data.error) {
        setTxError(data.error);
        setCustomerId(null);
        setTransactions([]);
      } else {
        setCustomerId(data.customer_id);
        fetchTransactions(data.customer_id);
      }
    } catch (e) {
      setTxError("Could not fetch customer ID");
      setCustomerId(null);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  // Helper: fetch transactions
  const fetchTransactions = async (customerId: string) => {
    setTxLoading(true);
    setTxError("");
    try {
      const res = await fetch(
        `/api/stripe/user-transactions?customer_id=${customerId}`
      );
      const data = await res.json();
      if (data.error) {
        setTxError(data.error);
        setTransactions([]);
      } else {
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      setTxError("Could not fetch transactions");
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  // Sort products by their lowest price (ascending)
  const sortedProducts = [...products].sort((a, b) => {
    const aPrice = a.prices[0]?.unit_amount || 0;
    const bPrice = b.prices[0]?.unit_amount || 0;
    return aPrice - bPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row items-start justify-center py-8 px-2">
      {/* Left Sidebar: Stripe Webhook/Transaction Details */}
      {/* <aside className="w-full md:w-80 mb-8 md:mb-0 md:mr-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Latest Stripe Transaction
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            placeholder="user@example.com"
          />
          <button
            onClick={handleGetTransaction}
            disabled={!email || !isValidEmail(email) || txLoading}
            className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
          >
            {txLoading ? "Loading..." : "Get Transaction"}
          </button>
        </div>
        {txLoading ? (
          <div className="text-gray-700 dark:text-gray-200 text-sm">
            Loading...
          </div>
        ) : txError ? (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {txError}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-700 dark:text-gray-200 text-sm">
            No transactions found.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 1).map((tx) => (
              <div
                key={tx.id}
                className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3"
              >
                <div>
                  <span className="font-semibold">Status:</span> {tx.status}
                </div>
                <div>
                  <span className="font-semibold">Amount:</span>{" "}
                  {tx.amount / 100} {tx.currency?.toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold">ID:</span> {tx.id}
                </div>
                <div>
                  <span className="font-semibold">Created:</span>{" "}
                  {tx.created
                    ? new Date(tx.created * 1000).toLocaleString()
                    : "-"}
                </div>
                <div>
                  <span className="font-semibold">Description:</span>{" "}
                  {tx.description || "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside> */}
      {/* Main Content */}
      <div className="w-full max-w-3xl flex flex-col gap-8 md:mr-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Stripe Payment Demo
          </h1>
        </div>
        {/* Remove email input from here */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 mx-auto w-full max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            >
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="PK">Pakistan</option>
              <option value="IN">India</option>
              <option value="BD">Bangladesh</option>
              <option value="AE">UAE</option>
            </select>
          </div>
        </div>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center md:text-left">
            Available Plans
          </h2>
          {loading && (
            <div className="text-gray-700 dark:text-gray-200 text-center">
              Loading products...
            </div>
          )}
          {!loading && products.length === 0 && (
            <div className="text-gray-700 dark:text-gray-200 text-center">
              No products found.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 flex flex-col items-center justify-between h-full transition-transform duration-200 hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-500"
              >
                {product.images && product.images[0] && (
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4 shadow-md">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-contain rounded-full"
                    />
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 text-center">
                    {product.description}
                  </p>
                )}
                <div className="w-full flex flex-col gap-3 mt-auto">
                  {product.prices.map((price) => (
                    <div
                      key={price.id}
                      className="flex flex-col gap-2 items-center w-full"
                    >
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {price.unit_amount / 100} {price.currency.toUpperCase()}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-300 ml-1">
                          / {price.recurring?.interval || "one-time"}
                        </span>
                      </span>
                      <button
                        onClick={() => handleCreateCheckout(price.id)}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
                      >
                        Subscribe
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {message && (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {message}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 w-full max-w-xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center md:text-left">
            API Endpoints
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <strong>POST</strong> /api/stripe/create-checkout-session
            </p>
            <p>
              <strong>GET</strong> /api/stripe/products
            </p>
            <p>
              <strong>GET</strong> /api/stripe/user-transactions
            </p>
            <p>
              <strong>POST</strong> /api/stripe/cancel-subscription
            </p>
            <p>
              <strong>POST</strong> /api/stripe/update-subscription
            </p>
            <p>
              <strong>POST</strong> /api/stripe/webhook
            </p>
          </div>
        </div>
      </div>
      {/* Sidebar: Stripe Test Cards */}
      <aside className="w-full md:w-80 mt-8 md:mt-0 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Stripe Test Cards
        </h2>
        <div className="text-sm text-gray-700 dark:text-gray-200">
          <div className="mb-3">
            <span className="font-semibold">Card Number:</span>{" "}
            <span className="font-mono">4242 4242 4242 4242</span>
          </div>
          <div className="mb-3">
            <span className="font-semibold">Expiry:</span>{" "}
            <span className="font-mono">04/24</span>
          </div>
          <div className="mb-3">
            <span className="font-semibold">CVC:</span>{" "}
            <span className="font-mono">242</span>
          </div>
          <div className="mb-3">
            <span className="font-semibold">Name:</span> Any name
          </div>
          <div className="mb-3">
            <span className="font-semibold">ZIP:</span> Any 5 digits
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            For more test cards, see{" "}
            <a
              href="https://stripe.com/docs/testing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 dark:text-blue-400"
            >
              Stripe Docs
            </a>
            .
          </div>
          {/* Error Scenarios Section */}
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
              Test Cards for Error Scenarios
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left pb-1 font-medium">Card Number</th>
                  <th className="text-left pb-1 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono pr-2">4000 0000 0000 9995</td>
                  <td>Card declined</td>
                </tr>
                <tr>
                  <td className="font-mono pr-2">4000 0000 0000 5126</td>
                  <td>Insufficient funds</td>
                </tr>
                <tr>
                  <td className="font-mono pr-2">4000 0000 0000 0341</td>
                  <td>Incorrect CVC</td>
                </tr>
                <tr>
                  <td className="font-mono pr-2">4000 0000 0000 0069</td>
                  <td>Expired card</td>
                </tr>
                <tr>
                  <td className="font-mono pr-2">4000 0000 0000 0119</td>
                  <td>Processing error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>
  );
}
