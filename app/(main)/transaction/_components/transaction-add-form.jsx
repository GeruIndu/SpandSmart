"use client"

import { createTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import CreateAccountDrawer from '@/components/Create-account-drawer';
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar1Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReceiptScanner from './ReceiptScanner';

const AddTransactionForm = ({ accounts, categories }) => {
    const router = useRouter();
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
        watch,
        getValues,
        reset
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'EXPENSE',
            amount: '',
            description: '',
            accountId: accounts.find(ac => ac.isDefault)?.id,
            date: new Date(),
            isReccuring: false,
            category: ''
        }
    })

    const type = watch('type');
    const date = watch('date');
    const isReccuring = watch('isReccuring');
    const category = watch('category');

    const filteredCategories = categories.filter(cat => cat.type === type);

    const {
        data: transactionData,
        loading: transactionLoading,
        fn: transactionFn,
        error
    } = useFetch(createTransaction);

    const onSubmit = (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount)
        };
        transactionFn(formData);
    };

    useEffect(() => {
        if (transactionData?.success && !transactionLoading) {
            toast.success('Transaction created successfully..');
            reset();
            router.push(`/account/${transactionData.data.accountId}`)
        }

    }, [transactionData, transactionLoading]);

    useEffect(() => {
        if (error)
            toast.error(error);
    }, [error])

    const handleScanComplete = (scannedData) => {
        if (scannedData) {
            setValue('type', scannedData.type);
            setValue('amount', scannedData.amount.toString());
            setValue('date', new Date(scannedData.date));
            if (scannedData.description) {
                setValue('description', scannedData.description);
            }
            if (scannedData.category) {
                setValue('category', scannedData.category)
            }
        }
        console.log(scannedData)
    };

    return (
        <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
            {/* AI receipt scnaner */}
            <ReceiptScanner onScanComplete={handleScanComplete} />

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Type</label>
                <Select
                    onValueChange={(value) => setValue('type', value)}
                    defaultValue={type}
                >
                    <SelectTrigger className={'w-full'}>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>

                {
                    errors.type && <p className='text-sm text-red-500'>{errors.type.message}</p>
                }
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Amount</label>
                    <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...register('amount')}
                    />
                    {
                        errors.amount && <p className='text-sm text-red-500'>{errors.amount.message}</p>
                    }
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Account</label>
                    <Select
                        onValueChange={(value) => setValue('accountId', value)}
                        defaultValue={getValues('accountId')}
                    >
                        <SelectTrigger className={'w-full'}>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name} (${parseFloat(acc.balance).toFixed(2)})
                                    </SelectItem>
                                ))
                            }
                            <CreateAccountDrawer>
                                <Button
                                    variant={'ghost'}
                                    className={'w-full select-none text-center text-sm outline-none'}
                                >Create Account</Button>
                            </CreateAccountDrawer>
                        </SelectContent>
                    </Select>
                    {
                        errors.accountId && <p className='text-sm text-red-500'>{errors.accountId.message}</p>
                    }
                </div>
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Category</label>
                <Select
                    onValueChange={(value) => setValue('category', value)}
                    value={category}
                >
                    <SelectTrigger className={'w-full'}>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            filteredCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                {
                    errors.category && <p className='text-sm text-red-500'>{errors.category.message}</p>
                }
            </div>


            <div className='space-y-2'>
                <label className='text-sm font-medium'>Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={'outline'} className={'w-full pl-3 text-left font-normal'}>
                            {date ? format(date, 'PPP') : <span>Pick a Date</span>}
                            <Calendar1Icon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={'w-auto p-0'} align='start'>
                        <Calendar
                            mode='single'
                            selected={date}
                            onSelect={(date) => setValue('date', date)}
                            disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {
                    errors.date && <p className='text-sm text-red-500'>{errors.date.message}</p>
                }
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Description</label>
                <Input
                    placeholder='Enter Description'
                    {...register('description')}
                />
                {
                    errors.description && <p className='text-sm text-red-500'>{errors.description.message}</p>
                }
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                    <label className='text-sm font-medium cursor-pointer'>Recurring Transaction</label>
                    <p className='text-sm text-muted-foreground'>
                        This account will be selected by default for transactions
                    </p>
                </div>
                <Switch
                    id={'isReccuring'}
                    onCheckedChange={(checked) => setValue("isReccuring", checked)}
                />
            </div>

            {
                isReccuring && (
                    <div>
                        <label className='text-sm font-medium'>Recurring Interval</label>
                        <Select
                            onValueChange={(value) => setValue('reccuringInterval', value)}
                            defaultValue={getValues('reccuringInterval')}
                        >
                            <SelectTrigger className={'w-full'}>
                                <SelectValue placeholder="Select Interval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='DAILY'>Daily</SelectItem>
                                <SelectItem value='WEEKLY'>Weekly</SelectItem>
                                <SelectItem value='MONTHLY'>Monthly</SelectItem>
                                <SelectItem value='YEARLY'>Yearly</SelectItem>
                            </SelectContent>
                        </Select>

                        {
                            errors.category && <p className='text-sm text-red-500'>{errors.category.message}</p>
                        }
                    </div>
                )
            }

            <div className='flex gap-4'>
                <Button
                    type='button'
                    className={'w-1/2'}
                    variant={'outline'}
                    onClick={() => router.back()}
                >Cancel</Button>
                <Button
                    className={'w-1/2'}
                    type='submit'
                    disabled={transactionLoading}
                >Create Transaction</Button>
            </div>
        </form>
    )
}

export default AddTransactionForm