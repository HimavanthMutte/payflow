import { prisma } from '../../config/database';
import { NotFoundError } from '../../middleware/error.middleware';
import { paiseToRupees, formatPaise } from '../../utils/amount.util';

export async function getWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  if (!wallet) throw new NotFoundError('Wallet');

  return {
    id: wallet.id,
    userId: wallet.userId,
    balancePaise: wallet.balance.toString(),
    balanceRupees: paiseToRupees(wallet.balance),
    formattedBalance: formatPaise(wallet.balance),
    currency: wallet.currency,
    dailyLimitPaise: wallet.dailyLimit.toString(),
    dailyLimitRupees: paiseToRupees(wallet.dailyLimit),
    monthlyLimitPaise: wallet.monthlyLimit.toString(),
    monthlyLimitRupees: paiseToRupees(wallet.monthlyLimit),
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}

export async function getBalance(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { balance: true, currency: true },
  });
  if (!wallet) throw new NotFoundError('Wallet');

  return {
    balancePaise: wallet.balance.toString(),
    balanceRupees: paiseToRupees(wallet.balance),
    formattedBalance: formatPaise(wallet.balance),
    currency: wallet.currency,
  };
}
