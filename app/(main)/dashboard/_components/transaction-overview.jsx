"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9FA8DA",
];

const DashboardOverView = ({ accounts, transactions }) => {

    const [selectedAccountId, setSelectedAccountId] = useState(
        accounts.find(a => a.isDefault)?.id || accounts[0]?.id
    )

    const selectedAccTransactions = transactions.filter(t => t.accountId === selectedAccountId);

    const recentTransactions = selectedAccTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    // Calculate expense breakdown for current month
    const currentDate = new Date();
    const currentMonthExpenses = selectedAccTransactions.filter((tr) => {
        const transactionDate = new Date(tr.date);

        return (tr.type === 'EXPENSE' && transactionDate.getMonth() === currentDate.getMonth() && transactionDate.getFullYear() === currentDate.getFullYear());
    })

    // Group expenses by category
    const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
        const category = transaction.category;

        if (!acc[category])
            acc[category] = 0;
        acc[category] += transaction.amount;

        return acc;
    }, {});

    // Format data for PieChart
    const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: amount
    }))

    return (
        <div className='grid gap-4 md:grid-cols-2'>
            <Card>
                <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                    <CardTitle className={'text-base font-normal'}>Recent Transactions</CardTitle>
                    <Select
                        value={selectedAccountId}
                        onValueChange={setSelectedAccountId}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {
                            recentTransactions.length === 0 ? (
                                <p className='text-center text-muted-foreground py-4'>No Recent Transactions</p>
                            ) : (
                                recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className='flex items-center justify-between'
                                    >
                                        <div className='space-y-1'>
                                            <p className='text-sm font-medium leading-none'>
                                                {transaction.description || 'Untitled Transaction'}
                                            </p>
                                            <p className='text-sm text-muted-foreground'>
                                                {format(new Date(transaction.date), 'PP')}
                                            </p>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div
                                                className={cn(
                                                    'flex items-center',
                                                    transaction.type === 'EXPENSE'
                                                        ? 'text-red-500'
                                                        : 'text-green-500'
                                                )}
                                            >
                                                {
                                                    transaction.type === 'EXPENSE' ? (
                                                        <ArrowDownRight className='w-4 h-4 mr-1' />) : (
                                                        <ArrowUpRight className='w-4 h-4 mr-1' />)
                                                }
                                                ${transaction.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                        }
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className={'font-normal test-base'}>Monthly Expense BreakDown</CardTitle>
                </CardHeader>
                <CardContent className={'p-0 pb-4'}>
                    {
                        pieChartData.length === 0 ? (
                            <p className='text-center text-muted-foreground py-4'>No expense in this month</p>
                        ) : (
                            <div className='h-[300px]'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <PieChart >
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill='#8884d8'
                                            dataKey='value'
                                            label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                                        >
                                            {
                                                pieChartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))
                                            }
                                        </Pie>

                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )
                    }
                </CardContent>
            </Card>
        </div>
    )
}

export default DashboardOverView