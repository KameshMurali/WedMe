import "server-only";

// Server-side entry point for webhook signature verification.
//
// The implementation moved to @/lib/billing/paddle-signature so it can be
// imported by a Playwright spec — `server-only` is not a real dependency here
// (Next aliases it at build time), so any module importing it is unloadable
// outside a Next build, which left the most security-critical function in the
// billing path untestable.
//
// This file keeps the server-only marker, so importing it from a client
// component is still a build error. Behaviour is unchanged.
export { verifyPaddleSignature, type SignatureResult } from "@/lib/billing/paddle-signature";
