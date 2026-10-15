import { NextResponse } from 'next/server';
import { payBillAction } from '@/app/dashboard/shared/actions/paymentBilling';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received Midtrans Notification:', body);

    const orderId = body.order_id || '';
    const transactionStatus = body.transaction_status || '';
    const fraudStatus = body.fraud_status || '';
    const grossAmount = parseInt(body.gross_amount) || 0;
    const paymentType = body.payment_type || 'midtrans';

    // Check if transaction is successful
    const isPaid =
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept');

    if (isPaid && orderId) {
      // Extract bill code or ID from order_id (e.g. UMROH-REG-00009-DP-123456)
      const parts = orderId.split('-');
      let billIdentifier = '';
      if (parts.length >= 3) {
        billIdentifier = `${parts[1]}-${parts[2]}-${parts[3]}`;
      } else {
        billIdentifier = parts[1] || orderId;
      }

      await payBillAction('', billIdentifier, grossAmount, paymentType);
    }

    return NextResponse.json({ status: 'OK' });
  } catch (err: any) {
    console.error('Midtrans notification error:', err);
    return NextResponse.json({
      error: err?.message || 'Notification error',
      stack: err?.stack,
    }, { status: 500 });
  }
}
