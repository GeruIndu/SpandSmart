import { sendEmail } from "@/actions/resend-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/templates";
import { Description } from "@radix-ui/react-dialog";

export const checkBudgetAlert = inngest.createFunction(
    { name: "check-budget-alert" },
    { cron: "0 */6 * * *" },
    async ({ step }) => {
        const budgets = await step.run("fetch-budget", async () => {
            return await db.budget.findMany({
                include: {
                    user: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true,
                                },
                            },
                        }
                    },
                },
            })
        });

        for (const budget of budgets) {
            const defaultAccount = budget.user.accounts[0];
            if (!defaultAccount)
                continue;

            await step.run(`check-budget-${budget.id}`, async () => {
                // const startDate = new Date();
                // startDate.setDate(1);

                const currentDate = new Date();
                const startDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                );

                const endOfTheMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    0
                );

                const expenses = await db.transaction.aggregate({
                    where: {
                        userId: budget.userId,
                        accountId: defaultAccount.id,
                        type: 'EXPENSE',
                        date: {
                            gte: startDate,
                            lte: endOfTheMonth
                        },
                    },
                    _sum: {
                        amount: true
                    }
                });

                const totalExpenses = expenses._sum.amount?.toNumber() || 0;
                const budgetAmount = budget.amount;
                const percentageUsed = (totalExpenses / budgetAmount) * 100;

                if (percentageUsed >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))) {
                    // send Email
                    const data = await sendEmail({
                        to: budget.user.email,
                        subject: defaultAccount?.name,
                        react: EmailTemplate({
                            username: budget.user.name,
                            type: 'budget-alert',
                            data: {
                                percentageUsed,
                                totalExpenses: parseInt(totalExpenses).toFixed(1),
                                budgetAmount: parseInt(budgetAmount).toFixed(1),
                                accountName: defaultAccount?.name
                            }
                        })
                    })

                    console.log(data);

                    // update the lastAlertSent
                    await db.budget.update({
                        where: { id: budget.id },
                        data: {
                            lastAlertSent: new Date()
                        }
                    })
                }
            })
        }
    },
);


const isNewMonth = (lastAlertDate, currentDate) => {
    return (lastAlertDate.getMonth() !== currentDate.getMonth()) || (lastAlertDate.getYear() !== currentDate.getYear())
}

export const triggerRecurringTransaction = inngest.createFunction(
    {
        id: 'trigger-recurring-transaction',
        name: 'Trigger Recurring Transaction'
    },
    { cron: '0 0 * * *' },
    async ({ step }) => {
        // 1. Fetch all due recurring transaction
        const recurringTransaction = await step.run(
            'fetch-recurring-transaction',
            async () => {
                return await db.transaction.findMany({
                    where: {
                        isReccuring: true,
                        status: "COMPLETED",
                        OR: [
                            { lastProcessed: null }, // never processed
                            { nextRecurringDate: { lte: new Date() } } // due date passed
                        ]
                    }
                })
            }
        );

        // 2. Create event for each transaction
        if (recurringTransaction?.length > 0) {
            const events = recurringTransaction.map((transaction) => ({
                name: 'transaction.recurring.process',
                data: { transactionId: transaction.id, userId: transaction.userId },
            }));

            // 3. Send events to be processed
            await inngest.send(events)
        }
        return { triggered: recurringTransaction.length };
    }
)

export const processRecurringTransaction = inngest.createFunction(
    {
        id: 'process-recurring-transaction',
        throttle: {
            limit: 10,      // Only processed 10 transactions
            period: '1m',   // per minute
            key: 'event.data.userId', // per user
        },
    },
    { event: 'transaction.recurring.process' },
    async ({ event, step }) => {

        // validate the events
        if (!event?.data?.transactionId || !event?.data?.userId) {
            console.error("Invalid event data ", event);
            return { error: 'Missing required event data!' };
        }

        await step.run('process-transaction', async () => {
            const transaction = await db.transaction.findUnique({
                where: {
                    id: event.data.transactionId,
                    userId: event.data.userId
                },
                include: {
                    account: true,
                },
            });

            if (!transaction || !isTransactionDue(transaction))
                return;

            await db.$transaction(async (tx) => {

                // Create a transaction
                await tx.transaction.create({
                    data: {
                        type: transaction.type,
                        amount: transaction.amount,
                        description: `${transaction.description} Recurring`,
                        date: new Date(),
                        category: transaction.category,
                        userId: transaction.userId,
                        accountId: transaction.accountId,
                        isReccuring: false,
                    },
                });

                // Updated amount balance
                const balanceChange = transaction.type === 'EXPENSE' ? -transaction.amount : transaction.amount;

                await tx.account.update({
                    where: { id: transaction.accountId },
                    data: { balance: { increment: balanceChange } },
                });

                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        lastProcessed: new Date(),
                        nextRecurringDate: calculateNextRecurringDate(new Date(), transaction.reccuringInterval),
                    }
                })
            })
        });
    }
)

const isTransactionDue = (transaction) => {
    if (!transaction.lastProcessed)
        return true;


    const today = new Date();
    const newDue = new Date(transaction.nextRecurringDate);

    return newDue <= today;
}

const calculateNextRecurringDate = (startDate, reccuringInterval) => {
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