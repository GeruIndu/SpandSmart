"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const getCurrentBudget = async (accountId) => {
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

        const budgets = await db.budget.findFirst({
            where: {
                userId: user.id
            }
        });

        const currentDate = new Date();
        const startOfTheMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
        );

        const endOfTheMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        );

        const expense = await db.transaction.aggregate({
            where: {
                userId: user.id,
                type: 'EXPENSE',
                date: {
                    gte: startOfTheMonth,
                    lte: endOfTheMonth
                },
                accountId
            },
            _sum: {
                amount: true
            }
        })

        const retu = {
            budget: budgets ? { ...budgets, amount: budgets.amount.toNumber() } : null,
            currentExpenses: expense._sum.amount ? expense._sum.amount.toNumber() : 0
        }

        return retu;

    } catch (error) {
        console.log("Fetching Budget : ", error);
        throw error;
    }
}


export const updateBudget = async (amount) => {
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

        const budget = await db.budget.upsert({
            where: {
                userId: user.id,
            },
            update: {
                amount,
            },
            create: {
                userId: user.id,
                amount
            }
        })

        revalidatePath('/dashboard');

        return {
            success: true,
            data: {
                ...budget, amount: budget.amount.toNumber()
            }
        }
    } catch (error) {
        console.log("Error Updating budget : ", error);
        return { success: false, error: error.message };
    }
}