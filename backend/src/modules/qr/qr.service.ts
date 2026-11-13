import QRCode from 'qrcode';
import { prisma } from '../../config/database';
import { NotFoundError, ValidationError } from '../../middleware/error.middleware';
import { paiseToRupees } from '../../utils/amount.util';
import type { CreateQrDto } from './qr.schema';

export async function generateQr(userId: string, dto: CreateQrDto) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, virtualPaymentId: true, displayName: true },
  });
  if (!user) throw new NotFoundError('User');

  // UPI specification URI: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
  const params = new URLSearchParams();
  params.set('pa', user.virtualPaymentId);
  params.set('pn', user.displayName);
  params.set('cu', 'INR');

  if (dto.type === 'DYNAMIC' && dto.amountPaise) {
    params.set('am', paiseToRupees(dto.amountPaise));
  }
  if (dto.description) {
    params.set('tn', dto.description);
  }

  const payload = `upi://pay?${params.toString()}`;
  const qrImageBase64 = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 8,
  });

  const record = await prisma.qrCode.create({
    data: {
      userId,
      type: dto.type,
      payload,
      amountPaise: dto.amountPaise,
      description: dto.description,
      expiresAt:
        dto.type === 'DYNAMIC'
          ? new Date(Date.now() + 15 * 60 * 1000) // 15 mins expiry for dynamic
          : null,
    },
  });

  return {
    id: record.id,
    type: record.type,
    payload,
    qrImageBase64,
    vpa: user.virtualPaymentId,
    displayName: user.displayName,
    amountPaise: dto.amountPaise ? dto.amountPaise.toString() : null,
    description: dto.description,
    expiresAt: record.expiresAt,
  };
}

export async function decodeQr(payload: string) {
  if (!payload.startsWith('upi://pay?')) {
    throw new ValidationError('Invalid UPI QR code format');
  }

  const queryPart = payload.substring('upi://pay?'.length);
  const params = new URLSearchParams(queryPart);

  const pa = params.get('pa');
  const pn = params.get('pn');
  const am = params.get('am');
  const tn = params.get('tn');

  if (!pa) throw new ValidationError('QR code missing payee virtual address (pa)');

  // Validate payee in system
  const payee = await prisma.user.findUnique({
    where: { virtualPaymentId: pa.toLowerCase(), status: 'ACTIVE' },
    select: {
      id: true,
      displayName: true,
      username: true,
      virtualPaymentId: true,
      avatarUrl: true,
    },
  });

  return {
    isValid: !!payee,
    payee: payee || { virtualPaymentId: pa, displayName: pn || 'Unknown Payee' },
    amountRupees: am || null,
    amountPaise: am ? (BigInt(Math.round(parseFloat(am) * 100))).toString() : null,
    note: tn || null,
    rawPayload: payload,
  };
}
