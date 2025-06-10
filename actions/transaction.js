"use server"

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeAmount = (obj) => {
    return {
        ...obj,
        amount: obj.amount.toNumber(),
    }
}

export const createTransaction = async (data) => {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new Error("Unauthorized!!");

        // Arcjet to add rate limiting  
        // Get request data for arcjet
        const req = await request();

        // Check rate data
        const decision = await aj.protect(req, {
            userId,
            requested: 1,  // Specify how many process to consume
        })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason;

                console.error({
                    code: 'RATE_LIMIT_EXCEEDED',
                    details: {
                        remaining,
                        resetInSecond: reset
                    },
                });
                throw new Error('Transaction create limit exceeded!!');
            }
            throw new Error('Request Bloked!!');
        }

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            }
        });

        if (!user)
            throw new Error("User Not found!!");


        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id
            },
        });

        if (!account)
            throw new Error("Account not found!");

        const balanceChanged = data.type === 'EXPENSE' ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChanged;

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextRecurringDate: data.isReccuring && data.reccuringInterval ? calculateNextReccuringData(data.date, data.reccuringInterval) : null,

                }
            });

            await tx.account.update({
                where: {
                    id: account.id,
                },
                data: {
                    balance: newBalance
                }
            });

            return newTransaction;
        });

        revalidatePath('/dashboard');
        revalidatePath(`/account/${transaction.accountId}`);

        return { success: true, data: serializeAmount(transaction) };

    } catch (error) {
        console.log("Faild to create transaction : ", error);
        throw new Error(error.message);
    }
}

const calculateNextReccuringData = (startDate, reccuringInterval) => {
    const newDate = new Date(startDate);

    switch (reccuringInterval) {
        case 'DAILY':
            newDate.setDate(newDate.getDate() + 1);
            break;
        case 'WEEKLY':
            newDate.setDate(newDate.getDate() + 7);
            break;
        case 'MONTHLY':
            newDate.setMonth(newDate.getMonth() + 1);
            break;
        case 'YEARLY':
            newDate.setFullYear(newDate.getFullYear() + 1);
            break;
    }

    return newDate;
}