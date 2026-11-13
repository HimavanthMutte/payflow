import { prisma } from '../../config/database';
import { getPagination } from '../../types';
import { paiseToRupees, formatPaise } from '../../utils/amount.util';
import { NotFoundError } from '../../middleware/error.middleware';

export async function getTransactions(
  userId: string,
  query: {
    page?: string;
    limit?: string;
    type?: 'CREDIT' | 'DEBIT';
    startDate?: string;
    endDate?: string;
  },
) {
  const { page, limit, skip } = getPagination(query);

  const whereClause: {
    userId: string;
    type?: 'CREDIT' | 'DEBIT';
    createdAt?: { gte?: Date; lte?: Date };
  } = { userId };

  if (query.type) {
    whereClause.type = query.type;
  }

  if (query.startDate || query.endDate) {
    whereClause.createdAt = {};
    if (query.startDate) whereClause.createdAt.gte = new Date(query.startDate);
    if (query.endDate) whereClause.createdAt.lte = new Date(query.endDate);
  }

  const [entries, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        transaction: {
          include: {
            payment: {
              include: {
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
            },
          },
        },
      },
    }),
    prisma.ledgerEntry.count({ where: whereClause }),
  ]);

  const items = entries.map((e) => ({
    id: e.id,
    transactionId: e.transactionId,
    paymentId: e.transaction.payment.id,
    referenceNumber: e.transaction.payment.referenceNumber,
    type: e.type,
    amountPaise: e.amountPaise.toString(),
    amountRupees: paiseToRupees(e.amountPaise),
    formattedAmount: `${e.type === 'CREDIT' ? '+' : '-'}${formatPaise(e.amountPaise)}`,
    balanceBeforePaise: e.balanceBefore.toString(),
    balanceAfterPaise: e.balanceAfter.toString(),
    balanceAfterRupees: paiseToRupees(e.balanceAfter),
    description: e.description,
    status: e.transaction.status,
    counterparty:
      e.type === 'DEBIT'
        ? e.transaction.payment.recipient
        : e.transaction.payment.sender,
    createdAt: e.createdAt,
  }));

  return { items, total, page, limit };
}

export async function getTransactionById(id: string, userId: string) {
  const entry = await prisma.ledgerEntry.findFirst({
    where: { id, userId },
    include: {
      transaction: {
        include: {
          payment: {
            include: {
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
              receipt: true,
            },
          },
        },
      },
    },
  });

  if (!entry) throw new NotFoundError('Transaction');

  return {
    id: entry.id,
    transactionId: entry.transactionId,
    paymentId: entry.transaction.payment.id,
    referenceNumber: entry.transaction.payment.referenceNumber,
    type: entry.type,
    amountPaise: entry.amountPaise.toString(),
    amountRupees: paiseToRupees(entry.amountPaise),
    formattedAmount: `${entry.type === 'CREDIT' ? '+' : '-'}${formatPaise(entry.amountPaise)}`,
    balanceBefore: paiseToRupees(entry.balanceBefore),
    balanceAfter: paiseToRupees(entry.balanceAfter),
    description: entry.description,
    status: entry.transaction.status,
    counterparty:
      entry.type === 'DEBIT'
        ? entry.transaction.payment.recipient
        : entry.transaction.payment.sender,
    receipt: entry.transaction.payment.receipt?.data,
    createdAt: entry.createdAt,
  };
}
