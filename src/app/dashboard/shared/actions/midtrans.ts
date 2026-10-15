'use server';

import { payBillAction } from './paymentBilling';
import { revalidatePath } from 'next/cache';

export async function getSnapToken(params: {
  billId: string;
  billCode: string;
  amount: number;
  customerName?: string;
}): Promise<{ token?: string; redirect_url?: string; orderId?: string; error?: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

  if (!serverKey || serverKey.includes('YOUR_SERVER_KEY')) {
    return {
      error:
        'MIDTRANS_SERVER_KEY belum diisi di file .env.local! Silakan masukkan Server Key dari dashboard Midtrans Sandbox Anda.',
    };
  }

  const authHeader = 'Basic ' + Buffer.from(serverKey.trim() + ':').toString('base64');
  const orderId = `BILL-${params.billCode}-${Date.now().toString().slice(-5)}`;

  try {
    const res = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: Math.round(params.amount),
        },
        customer_details: {
          first_name: params.customerName || 'Ahmad Fauzi',
          email: 'ahmad.fauzi@example.com',
          phone: '081200000001',
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Midtrans Snap Error:', data);
      return {
        error:
          data.error_messages?.join(', ') ||
          data.message ||
          'Midtrans mengembalikan error. Pastikan Server Key Anda benar.',
      };
    }

    return {
      token: data.token,
      redirect_url: data.redirect_url,
      orderId,
    };
  } catch (err: any) {
    console.error('Midtrans fetch error:', err);
    return { error: 'Gagal menghubungi server Midtrans: ' + err.message };
  }
}

export async function completePaymentFromSnap(params: {
  billId: string;
  amount: number;
  paymentMethod: string;
}): Promise<{ success: boolean; error?: string }> {
  const res = await payBillAction('', params.billId, params.amount, params.paymentMethod);
  if (res.error) {
    return { success: false, error: res.error };
  }

  revalidatePath('/dashboard/jamaah/payment');
  revalidatePath('/payments');
  return { success: true };
}

export const simulatePaymentSuccessAction = completePaymentFromSnap;

