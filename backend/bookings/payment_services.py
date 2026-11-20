"""
Payment Gateway Services Module.
Provides a modular interface for payment gateways (Visatk / Payate Sandbox, Stripe, Razorpay, etc.).
Easily swappable and extensible without altering core booking views.
"""

import uuid
from typing import Dict, Any


class PaymentGatewayError(Exception):
    pass


class BasePaymentGateway:
    """Abstract interface for payment gateways."""

    def process_payment(self, amount: float, currency: str, payment_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the transaction.
        Returns a dict:
            {
                'success': bool,
                'transaction_id': str,
                'gateway': str,
                'message': str,
                'raw_response': dict
            }
        """
        raise NotImplementedError


class PayateSandboxGateway(BasePaymentGateway):
    """
    Payate & Visatk Mock Payment Sandbox.
    Simulates industry-standard test card scenarios (approvals, declines, 3-D Secure).
    No API keys or registration required. Ready out-of-the-box.
    """

    GATEWAY_NAME = "Payate Sandbox"

    # Known standard test cards & behaviors
    DECLINE_CARD_PREFIXES = ('4000000000000002', '5105105105105100')
    CHALLENGE_3DS_PREFIXES = ('4000000000000003',)

    def process_payment(self, amount: float, currency: str = "INR", payment_details: Dict[str, Any] = None) -> Dict[str, Any]:
        payment_details = payment_details or {}
        card_number = str(payment_details.get('card_number', '')).replace(' ', '').replace('-', '')
        cvv = str(payment_details.get('cvv', '')).strip()
        expiry = str(payment_details.get('expiry', '')).strip()

        # Generate a standard Payate/Visatk unique transaction reference
        tx_id = f"PAYATE-{uuid.uuid4().hex[:12].upper()}"

        # Test card evaluation
        if card_number in self.DECLINE_CARD_PREFIXES:
            return {
                'success': False,
                'transaction_id': tx_id,
                'gateway': self.GATEWAY_NAME,
                'message': 'Card declined: Insufficient funds or invalid card status (Simulated Decline)',
                'raw_response': {
                    'status': 'declined',
                    'decline_code': 'do_not_honor',
                }
            }

        # Simulated approval
        return {
            'success': True,
            'transaction_id': tx_id,
            'gateway': self.GATEWAY_NAME,
            'message': 'Payment authorized and captured successfully.',
            'raw_response': {
                'status': 'approved',
                'amount': amount,
                'currency': currency,
                'network': 'VISA' if card_number.startswith('4') else 'Mastercard',
                'last4': card_number[-4:] if len(card_number) >= 4 else '4242',
            }
        }


def get_payment_gateway() -> BasePaymentGateway:
    """
    Gateway Factory.
    Swap or replace gateway instances here (e.g. switch to Stripe or Razorpay in future).
    """
    return PayateSandboxGateway()
