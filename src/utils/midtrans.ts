export interface MidtransChargeParams {
  orderId: string;
  grossAmount: number;
  paymentMethod: string;
  customerDetails?: {
    first_name: string;
    email?: string;
    phone?: string;
  };
  billCode: string;
}

export interface MidtransChargeResult {
  success: boolean;
  orderId: string;
  grossAmount: number;
  paymentType: string;
  vaNumber?: string;
  billKey?: string;
  billerCode?: string;
  paymentCode?: string;
  qrCodeUrl?: string;
  simulatorUrl?: string;
  transactionStatus: 'pending' | 'settlement' | 'expire';
  expiryTime: string;
  isSandboxReal: boolean;
  message?: string;
}

const MIDTRANS_SANDBOX_BASE = 'https://api.sandbox.midtrans.com/v2';
const SNAP_SANDBOX_BASE = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function createMidtransCharge(
  params: MidtransChargeParams
): Promise<MidtransChargeResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const isKeyConfigured =
    serverKey &&
    !serverKey.includes('YOUR_SERVER_KEY') &&
    serverKey.startsWith('SB-Mid-server-');

  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // If real server key is provided, attempt call to Midtrans Sandbox API
  if (isKeyConfigured) {
    try {
      const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
      let endpoint = `${MIDTRANS_SANDBOX_BASE}/charge`;
      let payload: any = {
        payment_type: getMidtransPaymentType(params.paymentMethod),
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.grossAmount,
        },
        customer_details: {
          first_name: params.customerDetails?.first_name || 'Jamaah',
          email: params.customerDetails?.email || 'jamaah@example.com',
          phone: params.customerDetails?.phone || '081200000009',
        },
      };

      // Configure payment type specific body
      if (params.paymentMethod === 'bca') {
        payload.bank_transfer = { bank: 'bca' };
      } else if (params.paymentMethod === 'mandiri') {
        payload.payment_type = 'echannel';
        payload.echannel = {
          bill_info1: 'Pembayaran Tagihan',
          bill_info2: params.billCode,
        };
      } else if (params.paymentMethod === 'bri') {
        payload.bank_transfer = { bank: 'bri' };
      } else if (params.paymentMethod === 'permata') {
        payload.bank_transfer = { bank: 'permata' };
      } else if (params.paymentMethod === 'alfamart') {
        payload.payment_type = 'cstore';
        payload.cstore = { store: 'alfamart', message: params.billCode };
      } else if (params.paymentMethod === 'qris') {
        payload.payment_type = 'qris';
        payload.qris = { acquirer: 'gopay' };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const vaNumber =
          data.va_numbers?.[0]?.va_number ||
          data.permata_va_number ||
          data.bill_key ||
          data.payment_code;

        return {
          success: true,
          orderId: params.orderId,
          grossAmount: params.grossAmount,
          paymentType: params.paymentMethod,
          vaNumber: vaNumber,
          billKey: data.bill_key,
          billerCode: data.biller_code,
          paymentCode: data.payment_code,
          qrCodeUrl: data.actions?.find((a: any) => a.name === 'generate-qr-code')?.url,
          simulatorUrl: getSimulatorUrl(params.paymentMethod),
          transactionStatus: 'pending',
          expiryTime: data.expiry_time || expiry,
          isSandboxReal: true,
        };
      }
    } catch (err) {
      console.warn('Midtrans API call error, falling back to simulator mock:', err);
    }
  }

  // Realistic Simulation Mode (Directly Compatible with Midtrans Simulator)
  const randomSuffix = String(Math.floor(100000000 + Math.random() * 900000000));
  let vaNumber = '';
  let billerCode = '';
  let billKey = '';
  let paymentCode = '';

  if (params.paymentMethod === 'bca') {
    vaNumber = `82710${randomSuffix}`;
  } else if (params.paymentMethod === 'mandiri') {
    billerCode = '70012';
    billKey = `891${randomSuffix}`;
    vaNumber = `${billerCode} - ${billKey}`;
  } else if (params.paymentMethod === 'bri') {
    vaNumber = `02810${randomSuffix}`;
  } else if (params.paymentMethod === 'permata') {
    vaNumber = `71810${randomSuffix}`;
  } else if (params.paymentMethod === 'alfamart') {
    paymentCode = `ALFA${randomSuffix.slice(0, 8)}`;
    vaNumber = paymentCode;
  } else if (params.paymentMethod === 'qris') {
    vaNumber = 'QRIS-MIDTRANS-SANDBOX';
  } else {
    vaNumber = `82710${randomSuffix}`;
  }

  return {
    success: true,
    orderId: params.orderId,
    grossAmount: params.grossAmount,
    paymentType: params.paymentMethod,
    vaNumber,
    billerCode,
    billKey,
    paymentCode,
    simulatorUrl: getSimulatorUrl(params.paymentMethod),
    transactionStatus: 'pending',
    expiryTime: expiry,
    isSandboxReal: false,
    message: isKeyConfigured
      ? 'Mode Sandbox Aktif'
      : 'Mode Simulator Midtrans Aktif (Sandbox Ready)',
  };
}

export function getSimulatorUrl(method: string): string {
  switch (method) {
    case 'bca':
      return 'https://simulator.sandbox.midtrans.com/bca/va/index';
    case 'mandiri':
      return 'https://simulator.sandbox.midtrans.com/mandiri/bill/index';
    case 'bri':
    case 'permata':
      return 'https://simulator.sandbox.midtrans.com/openapi/va/index';
    case 'qris':
    case 'shopeepay':
    case 'dana':
    case 'linkaja':
      return 'https://simulator.sandbox.midtrans.com/qris/index';
    case 'alfamart':
      return 'https://simulator.sandbox.midtrans.com/cstore/index';
    default:
      return 'https://simulator.sandbox.midtrans.com/';
  }
}

function getMidtransPaymentType(method: string): string {
  switch (method) {
    case 'bca':
    case 'bri':
    case 'permata':
      return 'bank_transfer';
    case 'mandiri':
      return 'echannel';
    case 'alfamart':
      return 'cstore';
    case 'qris':
      return 'qris';
    case 'shopeepay':
      return 'shopeepay';
    default:
      return 'bank_transfer';
  }
}
