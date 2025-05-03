"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import React, { useMemo, useState } from 'react'
import { Day } from 'react-day-picker'
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const DATE_RANGES = {
    '7D': { label: 'Last 7 Days', days: 7 },
    '1M': { label: 'Last Month', days: 30 },
    '3M': { label: 'Last 3 Months', days: 90 },
    '6M': { label: 'Last 6 Months', days: 180 },
    ALL: { label: 'All Time', days: null }
};

const AccountChart = ({ transactions }) => {

    const [dateRanges, setDataRanges] = useState('1M');
    const filterData = useMemo(() => {
        const ranges = DATE_RANGES[dateRanges];
        const now = new Date();
        const startDate = ranges.days ? startOfDay(subDays(now, ranges.days)) : startOfDay(new Date(0));

        // Filter transactions within the dates ranges
        const filteredTransactions = transactions.filter((transaction) => {
            return new Date(transaction.date) >= startDate && new Date(transaction.date) <= endOfDay(now)
        })

        const groupData = filteredTransactions.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), 'MMM dd');

            if (!acc[transaction.date])
                acc[date] = { date, income: 0, expense: 0 };

            if (transaction.type === 'EXPENSE')
                acc[date].expense += transaction.amount;
            else
                acc[date].income += transaction.amount;

            return acc;
        }, {})


        return Object.values(groupData).sort((a, b) => (
            new Date(a) - new Date(b)
        ))
    }, [transactions, dateRanges]);

    const totals = useMemo(() => {
        return filterData.reduce((acc, t) => ({
            income: acc.income + t.income,
            expense: acc.expense + t.expense
        }), { income: 0, expense: 0 });
    }, [filterData])

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-7 '>
                <CardTitle className='text-base font-normal'>Transaction Overview</CardTitle>
                <Select defaultValue={dateRanges} onValueChange={setDataRanges}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select ranges" />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            Object.entries(DATE_RANGES).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>

            </CardHeader>
            <CardContent>
                <div className='flex justify-around mb-6 text-sm'>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Incomes</p>
                        <p className='text-lg font-bold text-green-600'>${totals.income.toFixed(2)}</p>
                    </div>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Expenses</p>
                        <p className='text-lg font-bold text-red-600'>${totals.expense.toFixed(2)}</p>
                    </div>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Net</p>
                        <p className={`text-lg font-bold 
                                ${(totals.income - totals.expense) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>$
                            {
                                (totals.income - totals.expense).toFixed(2)
                            }
                        </p>
                    </div>
                </div>

                <div className='h-[300px]'>

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={filterData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis
                                fontSizeAdjust={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={value => `$${value}`}
                            />
                            <Tooltip
                                formatter={(value) => [`$${value}`, undefined]}
                            />
                            <Legend />
                            <Bar
                                dataKey="income"
                                name={'Income'}
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="expense"
                                name={'Expense'}
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}

                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default AccountChart