import Stripe from "stripe";
import { config } from "./config.js";

let stripeClient = null;

export function getStripeClient() {
  if (!config.stripeSecretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(config.stripeSecretKey);
  }

  return stripeClient;
}

export function isStripeEnabled() {
  return Boolean(getStripeClient());
}

export async function createCheckoutSession({ application, payment, plan, statusUrl }) {
  const stripe = getStripeClient();
  if (!stripe) {
    return null;
  }

  const currency = (payment.currency ?? application.currency).toLowerCase();
  const amount = Math.round(payment.amount * 100);
  const expiresAt = payment.dueAt ? Math.floor(new Date(payment.dueAt).getTime() / 1000) : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: application.email,
    client_reference_id: application.submissionCode,
    success_url: `${statusUrl}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${statusUrl}&checkout=cancel`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: `Everwin Prop ${plan?.name ?? application.planId}`,
            description: `Prop evaluation application ${application.submissionCode}`,
          },
        },
      },
    ],
    metadata: {
      applicationId: application.id,
      paymentId: payment.id,
      submissionCode: application.submissionCode,
      planId: application.planId,
    },
    payment_intent_data: {
      metadata: {
        applicationId: application.id,
        paymentId: payment.id,
        submissionCode: application.submissionCode,
      },
      receipt_email: application.email,
    },
    expires_at: expiresAt,
  });

  return session;
}

export function verifyStripeWebhook(payload, signature) {
  const stripe = getStripeClient();
  if (!stripe || !config.stripeWebhookSecret) {
    return null;
  }

  return stripe.webhooks.constructEvent(payload, signature, config.stripeWebhookSecret);
}
