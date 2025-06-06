'use client'

import { updateBudget } from '@/actions/budget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import useFetch from '@/hooks/use-fetch';
import { Check, Pencil, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const BudgetProgress = ({ initialBudget, currentExpenses }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(
        initialBudget?.amount?.toString() || ""
    )

    const percentUsed = Number(initialBudget?.amount) ? (Number(currentExpenses) / Number(initialBudget?.amount)) * 100 : 0;

    const {
        fn: updateBudgetFn,
        data: updatedBudget,
        error,
        loading: isLoading
    } = useFetch(updateBudget);

    const handleUpdateBudget = async () => {
        const amount = parseFloat(newBudget);

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please Enter a Valid Amount!");
            return;
        }

        await updateBudgetFn(amount);
    }

    useEffect(() => {
        if (updatedBudget?.success) {
            toast.success("Budget Updated Successfully.");
            setIsEditing(false);
        }
    }, [updatedBudget]);

    useEffect(() => {
        if (error) {
            toast.error(error?.message || "Failed to Update Budget!");
        }
    }, [error])

    const handleCancel = () => {
        setNewBudget(initialBudget?.amount?.toString() || "");
        setIsEditing(false);
    }

    return (
        <Card>
            <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <div className='flex-1'>
                    <CardTitle>Monthly Budget (Default Account)</CardTitle>
                    <div className='flex items-center gap-2 mt-1'>
                        {isEditing ? (
                            <div className='flex items-center gap-2'>
                                <Input

                                    type={'number'}
                                    value={newBudget}
                                    onChange={(e) => setNewBudget(e.target.value)}
                                    placeholder='Enter amount'
                                    className={'w-38'}
                                    autoFocus
                                    disabled={isLoading}
                                />
                                <Button variant={'ghost'} size={'icon'} onClick={handleUpdateBudget} disabled={isLoading}>
                                    <Check className='w-4 h-4 text-green-500' />
                                </Button>
                                <Button variant={'ghost'} size={'icon'} onClick={handleCancel} disabled={isLoading}>
                                    <X className='w-4 h-4 text-red-500' />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <CardDescription>
                                    {
                                        initialBudget ? `$${currentExpenses.toFixed(2)} of $${initialBudget.amount.toFixed(2)} spent` : 'No Budget Set'
                                    }
                                </CardDescription>
                                <Button
                                    variant={'ghost'}
                                    className={'h-6 w-6'}
                                    onClick={() => setIsEditing(true)}
                                    size={'icon'}
                                >
                                    <Pencil className='h-3 w-3' />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

            </CardHeader>
            <CardContent>
                {
                    initialBudget && <div>
                        <Progress
                            value={percentUsed}
                            extraStyles={`${percentUsed >= 90
                                ? "bg-red-500"
                                : (percentUsed >= 75
                                    ? "bg-yellow-500"
                                    : "bg-blue-500")
                                }`}
                        />
                        <p className='text-xs text-muted-foreground text-right mt-2'>
                            {percentUsed.toFixed(1)}% used
                        </p>
                    </div>
                }
            </CardContent>

        </Card>

    )
}

export default BudgetProgress