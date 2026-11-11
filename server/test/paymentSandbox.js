import crypto from "node:crypto";

export function getPaymentEnvironmentStatus(env = process.env) {
  const keyId = env.RAZORPAY_KEY_ID || "";
  const keySecret = env.RAZORPAY_KEY_SECRET || "";
  const frontendKey = env.VITE_RAZORPAY_KEY_ID || "";

  const missing = [];
  if (!keyId) missing.push("RAZORPAY_KEY_ID");
  if (!keySecret) missing.push("RAZORPAY_KEY_SECRET");

  const warnings = [];
  if (!frontendKey) warnings.push("Frontend Razorpay key is not configured in VITE_RAZORPAY_KEY_ID");

  return {
    ok: missing.length === 0,
    mode: missing.length === 0 ? "production-ready" : "sandbox-only",
    configured: {
      keyId: Boolean(keyId),
      keySecret: Boolean(keySecret),
      frontendKey: Boolean(frontendKey),
    },
    missing,
    warnings,
    summary:
      missing.length === 0
        ? "Razorpay environment is configured; live payment verification can run."
        : "Razorpay is not fully configured; sandbox validation will only verify local environment logic.",
  };
}

export function buildSandboxOrder(amount = 1000, receipt = "sandbox_receipt") {
  return {
    amount: Number(amount) * 100,
    currency: "INR",
    receipt,
    notes: {
      mode: "sandbox",
      test: true,
    },
  };
}

export function createSandboxSignature(orderId, paymentId, secret) {
  if (!orderId || !paymentId || !secret) {
    throw new Error("orderId, paymentId, and secret are required for sandbox signature verification");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

export function verifySandboxSignature(orderId, paymentId, signature, secret) {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  try {
    const expected = createSandboxSignature(orderId, paymentId, secret);
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export function runPaymentEnvironmentCheck(env = process.env) {
  const status = getPaymentEnvironmentStatus(env);

  const sandboxOrder = buildSandboxOrder(1000, "sandbox_check");
  const fakeOrderId = "order_sandbox_123";
  const fakePaymentId = "pay_sandbox_123";
  const fakeSecret = "sandbox_test_secret";
  const signature = createSandboxSignature(fakeOrderId, fakePaymentId, fakeSecret);

  return {
    ...status,
    sandbox: {
      order: sandboxOrder,
      sampleIds: {
        orderId: fakeOrderId,
        paymentId: fakePaymentId,
      },
      signature,
      isSignatureValid: verifySandboxSignature(fakeOrderId, fakePaymentId, signature, fakeSecret),
    },
  };
}
