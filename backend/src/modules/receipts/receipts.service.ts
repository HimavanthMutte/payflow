import { prisma } from '../../config/database';
import { NotFoundError } from '../../middleware/error.middleware';

export async function getReceipt(paymentId: string, userId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      receipt: true,
      sender: {
        select: {
          id: true,
          displayName: true,
          virtualPaymentId: true,
        },
      },
      recipient: {
        select: {
          id: true,
          displayName: true,
          virtualPaymentId: true,
        },
      },
    },
  });

  if (
    !payment ||
    (payment.senderId !== userId && payment.recipientId !== userId)
  ) {
    throw new NotFoundError('Receipt for payment');
  }

  if (payment.receipt) {
    return payment.receipt.data;
  }

  // Fallback dynamically generated receipt snapshot
  return {
    referenceNumber: payment.referenceNumber,
    paymentId: payment.id,
    amountPaise: payment.amountPaise.toString(),
    status: payment.status,
    sender: payment.sender,
    recipient: payment.recipient,
    description: payment.description,
    timestamp: payment.createdAt.toISOString(),
  };
}
