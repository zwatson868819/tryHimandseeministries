// Stripe REST helpers — direct API calls (no SDK, no node deps)
// Compatible with Cloudflare Workers.

const STRIPE_API = "https://api.stripe.com/v1";

function formEncode(data: Record<string, string | number | undefined | null>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  return params.toString();
}

async function stripeRequest(
  apiKey: string,
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, string | number | undefined | null>
): Promise<any> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };
  const init: RequestInit = { method, headers };
  if (body) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = formEncode(body);
  }
  const res = await fetch(`${STRIPE_API}${path}`, init);
  const json = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(`Stripe error: ${json?.error?.message || res.statusText}`);
  }
  return json;
}

export interface CheckoutResult {
  id: string;
  url: string;
}

export async function createOneTimeCheckoutSession(
  apiKey: string,
  args: {
    amount: number; // dollars
    successUrl: string;
    cancelUrl: string;
    customerEmail: string;
    metadata: Record<string, string>;
  }
): Promise<CheckoutResult> {
  const body: Record<string, string | number> = {
    mode: "payment",
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "tryHimandsee Ministries — Donation",
    "line_items[0][price_data][unit_amount]": Math.round(args.amount * 100),
    "line_items[0][quantity]": 1,
    customer_email: args.customerEmail,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
  };
  for (const [k, v] of Object.entries(args.metadata)) {
    body[`metadata[${k}]`] = v;
  }
  const session = await stripeRequest(apiKey, "/checkout/sessions", "POST", body);
  return { id: session.id, url: session.url };
}

export async function createMonthlyCheckoutSession(
  apiKey: string,
  args: {
    amount: number; // dollars
    successUrl: string;
    cancelUrl: string;
    customerEmail: string;
    metadata: Record<string, string>;
  }
): Promise<CheckoutResult> {
  const body: Record<string, string | number> = {
    mode: "subscription",
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "tryHimandsee Ministries — Monthly Partnership",
    "line_items[0][price_data][unit_amount]": Math.round(args.amount * 100),
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][quantity]": 1,
    customer_email: args.customerEmail,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
  };
  for (const [k, v] of Object.entries(args.metadata)) {
    body[`metadata[${k}]`] = v;
    body[`subscription_data[metadata][${k}]`] = v;
  }
  const session = await stripeRequest(apiKey, "/checkout/sessions", "POST", body);
  return { id: session.id, url: session.url };
}

export interface CheckoutStatus {
  status: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  metadata: Record<string, string>;
}

export async function getCheckoutStatus(apiKey: string, sessionId: string): Promise<CheckoutStatus> {
  const session = await stripeRequest(apiKey, `/checkout/sessions/${sessionId}`);
  return {
    status: session.status,
    payment_status: session.payment_status,
    amount_total: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    metadata: session.metadata ?? {},
  };
}
