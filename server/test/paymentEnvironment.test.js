import test from "node:test";
import assert from "node:assert/strict";
import { runPaymentEnvironmentCheck, createSandboxSignature, verifySandboxSignature } from "./paymentSandbox.js";

test("payment environment check reports configured or missing Razorpay values", () => {
  const status = runPaymentEnvironmentCheck({
    RAZORPAY_KEY_ID: "rzp_test_123",
    RAZORPAY_KEY_SECRET: "abc123",
    VITE_RAZORPAY_KEY_ID: "rzp_test_frontend",
  });

  assert.equal(status.ok, true);
  assert.equal(status.mode, "production-ready");
  assert.equal(status.configured.keyId, true);
  assert.equal(status.configured.keySecret, true);
  assert.equal(status.sandbox.isSignatureValid, true);
});

test("payment environment check flags missing Razorpay environment values", () => {
  const status = runPaymentEnvironmentCheck({});

  assert.equal(status.ok, false);
  assert.equal(status.mode, "sandbox-only");
  assert.ok(status.missing.includes("RAZORPAY_KEY_ID"));
  assert.ok(status.missing.includes("RAZORPAY_KEY_SECRET"));
});

test("sandbox signature verification fails on wrong secret and passes on correct secret", () => {
  const orderId = "order_sandbox_123";
  const paymentId = "pay_sandbox_123";
  const secret = "sandbox_test_secret";

  const good = createSandboxSignature(orderId, paymentId, secret);
  const bad = createSandboxSignature(orderId, paymentId, "wrong-secret");

  assert.equal(verifySandboxSignature(orderId, paymentId, good, secret), true);
  assert.equal(verifySandboxSignature(orderId, paymentId, bad, secret), false);
});
