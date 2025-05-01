"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };

    if (serialized.balance)
        serialized.balance = obj.balance.toNumber();

    if (serialized.amount)
        serialized.amount = obj.balance.toNumber();

    return serialized;
}

export default async function CreateAccount(data) {
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

        const balanceFloat = parseFloat(data.balance);
        if (isNaN(balanceFloat))
            throw new Error("Invalid Account Balanace");

        const exixtingAccounts = await db.account.findMany({
            where: { userId: user.id }
        });

        const shouldBeDefault = exixtingAccounts.length == 0 ? true : data.isDefault;

        if (shouldBeDefault) {
            await db.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false },
            })
        }

        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault
            }
        })

        const serializeAccount = serializeTransaction(account);

        revalidatePath('/dashboard');

        return { success: true, data: serializeAccount };

    } catch (error) {
        throw new Error(error.message);
    }
}

export const getAccounts = async () => {
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

        const accounts = await db.account.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        transactions: true
                    },
                },
            },
        })

        const serializeAccount = accounts.map(serializeTransaction);

        return serializeAccount;

    } catch (error) {
        console.log(error);
    }
}