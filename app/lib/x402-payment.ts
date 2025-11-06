/**
 * x402 Payment Utilities for Solana
 *
 * Note: For Solana on x402, the recommended approach is to navigate directly
 * to protected pages and let the x402-next middleware handle the payment UI automatically.
 *
 * The middleware will:
 * 1. Detect the payment requirement
 * 2. Show CDP payment UI (if CDP client key is configured)
 * 3. Handle wallet connection and payment
 * 4. Redirect to content after successful payment
 *
 * This works better than programmatic fetch for Solana because:
 * - x402-fetch is designed for EVM chains (viem accounts)
 * - The built-in UI provides better UX
 * - No need to handle wallet signing manually
 */

/**
 * Get payment response details from response headers
 */
export function getPaymentResponse(headers: Headers): any {
  const paymentResponse = headers.get('x-payment-response')
  if (paymentResponse) {
    try {
      return JSON.parse(paymentResponse)
    } catch (e) {
      return null
    }
  }
  return null
}

/**
 * Check if a response requires payment
 */
export function isPaymentRequired(response: Response): boolean {
  return response.status === 402
}

/**
 * For x402 payments on Solana, simply navigate to the protected page:
 *
 * @example
 * ```tsx
 * <Link href="/content/basic">Access Basic Content ($0.01)</Link>
 * ```
 *
 * The x402-next middleware will handle the payment UI automatically.
 */
