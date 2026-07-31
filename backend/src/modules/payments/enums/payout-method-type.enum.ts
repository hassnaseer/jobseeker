/**
 * Spec §19.25 lists STRIPE_CONNECT/BANK; WALLET is added here since the
 * locked decision in §13 ("Stripe Connect + Direct Bank + Platform
 * Wallet") makes wallet a third selectable payout method, not just an
 * intermediate balance.
 */
export enum PayoutMethodType {
  STRIPE_CONNECT = 'STRIPE_CONNECT',
  BANK = 'BANK',
  WALLET = 'WALLET',
}
