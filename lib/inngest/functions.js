import { sendEmail } from "@/actions/resend-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/templates";

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