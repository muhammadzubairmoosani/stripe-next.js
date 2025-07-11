# Stripe Payment Integration with Next.js

Yeh ek complete Stripe payment integration hai jo Next.js 14 App Router ke sath banaya gaya hai. Is project mein subscription-based payments, tax calculation, aur customer management shamil hai.

## 🚀 Features

- ✅ **Stripe Checkout Sessions** - Secure payment processing
- ✅ **Subscription Management** - Create, update, cancel subscriptions
- ✅ **Tax Calculation** - Automatic aur manual tax rates
- ✅ **Webhook Handling** - Real-time payment events
- ✅ **Customer Management** - Email-based customer tracking
- ✅ **Product Management** - Products aur prices fetching
- ✅ **Transaction History** - User payment records
- ✅ **TypeScript Support** - Full type safety
- ✅ **Tailwind CSS** - Modern UI design

## 📁 Project Structure

```
stripe-nextjs/
├── src/
│   ├── app/
│   │   ├── api/stripe/
│   │   │   ├── create-checkout-session/
│   │   │   ├── products/
│   │   │   ├── user-transactions/
│   │   │   ├── cancel-subscription/
│   │   │   ├── update-subscription/
│   │   │   └── webhook/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   └── stripe.ts
│   └── types/
│       └── stripe.ts
├── .env.local
└── package.json
```

## 🛠️ Installation

1. **Clone aur install dependencies:**

```bash
cd stripe-nextjs
npm install
```

2. **Environment variables setup:**

```bash
# .env.local file mein yeh add karein
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Development server start:**

```bash
npm run dev
```

## 🔌 API Endpoints

### 1. Create Checkout Session

```http
POST /api/stripe/create-checkout-session
Content-Type: application/json

{
  "price_id": "price_1234567890",
  "email": "user@example.com",
  "country": "US"
}
```

### 2. Get Products

```http
GET /api/stripe/products
```

### 3. Get User Transactions

```http
GET /api/stripe/user-transactions?customer_id=cus_1234567890
```

### 4. Cancel Subscription

```http
POST /api/stripe/cancel-subscription
Content-Type: application/json

{
  "subscription_id": "sub_1234567890"
}
```

### 5. Update Subscription

```http
POST /api/stripe/update-subscription
Content-Type: application/json

{
  "subscription_id": "sub_1234567890",
  "new_price_id": "price_0987654321"
}
```

### 6. Webhook (Stripe Events)

```http
POST /api/stripe/webhook
```

## 🌍 Supported Countries

### Automatic Tax Countries

- US, GB, DE, FR, IT, ES, NL, CA, AU, NO, CH, NZ, SG, JP

### Manual Tax Countries

- Pakistan (PK), India (IN), Bangladesh (BD), UAE (AE)

## 🔧 Configuration

### Stripe Setup

1. Stripe dashboard mein account banayein
2. API keys generate karein
3. Products aur prices create karein
4. Webhook endpoint configure karein

### Environment Variables

```env
# Required
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Usage Examples

### Frontend Integration

```typescript
// Checkout session create karna
const response = await fetch("/api/stripe/create-checkout-session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    price_id: "price_1234567890",
    email: "user@example.com",
    country: "US",
  }),
});

const { checkout_url } = await response.json();
window.location.href = checkout_url;
```

### Products Fetch

```typescript
const response = await fetch("/api/stripe/products");
const products = await response.json();
```

## 🔒 Security Features

- ✅ Webhook signature verification
- ✅ Environment variable protection
- ✅ TypeScript type safety
- ✅ Input validation
- ✅ Error handling

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Other Platforms

- Environment variables configure karein
- Build command: `npm run build`
- Start command: `npm start`

## 📝 Notes

1. **Development mein:** In-memory customer mapping use hota hai
2. **Production mein:** Database use karein customer storage ke liye
3. **Webhook testing:** Stripe CLI use karein local development ke liye
4. **Tax rates:** Manual tax rates Stripe dashboard se update karein

## 🤝 Contributing

1. Fork karein
2. Feature branch banayein
3. Changes commit karein
4. Pull request submit karein

## 📄 License

MIT License - free to use for personal and commercial projects.

---

**Happy Coding! 🎉**
