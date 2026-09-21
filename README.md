💸 AI Finance SaaS Platform

 📖 Overview

This project is a production-style SaaS application for personal finance management. Users can track their income and expenses, visualize spending trends through an analytics dashboard, import transactions in bulk via CSV, and receive AI-generated insights about their financial habits — all behind a subscription paywall powered by Stripe.

---

✨ Features

- 🔐 **Secure Authentication** — JWT-based auth with protected routes
- 💳 **Subscription Billing** — Stripe integration with webhook handling, idempotency safeguards, and free-trial logic
- 📊 **Analytics Dashboard** — Visual charts and summaries of income/expense trends over time
- 📁 **CSV Import** — Bulk-upload transactions for fast onboarding
- 🤖 **AI-Powered Insights** — Natural-language analysis of spending patterns and financial suggestions
- 📱 **Responsive UI** — Clean, mobile-friendly interface built with React and Tailwind CSS

---

 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React, TypeScript, Tailwind CSS      |
| Backend        | Node.js, Express.js                  |
| Database       | MongoDB, Mongoose                    |
| Authentication | JWT                                  |
| Payments       | Stripe (Billing + Webhooks)          |
| AI             | LLM-based insights engine            |
