"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };

    if (serialized.balance)
        serialized.balance = obj.balance.toNumber();

    if (serialized.amount)
        serialized.amount = obj.amount.toNumber();

    return serialized;
}

export const updateDefaultAccount = async (accountId) => {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new Error("Unauthorized!!");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            }
        });

        if (!user)
            throw new Error("User Not found!!");

        await db.account.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
        })

        const updatedData = await db.account.updateMany({
            where: { userId: user.id, id: accountId },
            data: {
                isDefault: true
            }
        })
        revalidatePath('/dashboard');
        return { success: true, data: serializeTransaction(updatedData) };

    } catch (error) {
        return { success: false, error: error.message }
    }
}

export const fetchAllTransaction = async (accountId) => {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new Error("Unauthorized!!");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            }
        });

        if (!user)
            throw new Error("User Not found!!");

        const accounts = await db.account.findUnique({
            where: { id: accountId, userId: user.id },
            include: {
                transactions: {
                    orderBy: { date: "desc" }
                },
                _count: {
                    select: {
                        transactions: true
                    }
                }
            }
        })
        if (!accounts)
            return null;

        return {
            ...serializeTransaction(accounts),
            transactions: accounts.transactions.map(serializeTransaction)
        }

    } catch (error) {
        console.log(error.message);

    }
}

export const bulkDeleteTransactions = async (transactionIds) => {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new Error("Unauthorized!!");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            }
        });

        if (!user)
            throw new Error("User Not found!!");

        const transactions = await db.transaction.findMany({
            where: {
                id: { in: transactionIds },
                userId: user.id
            }
        });

        const accountBalanceChanges = transactions.reduce((acc, transaction) => {
            const amount = parseFloat(transaction.amount);
            if (isNaN(amount)) return acc;

            const change = transaction.type === "EXPENSE"
                ? amount
                : -amount;

            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;
        }, {});


        await db.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: {
                    id: { in: transactionIds },
                    userId: user.id
                }
            });

            for (const [accountId, balanceChanges] of Object.entries(accountBalanceChanges)) {
                await tx.account.update({
                    where: { id: accountId },
                    data: {
                        balance: {
                            increment: balanceChanges
                        },
                    },
                });
            }
        })

        revalidatePath('/dashboard');
        revalidatePath(`/account/${accountId}`, 'page');

        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, error: error.message };
    }
}