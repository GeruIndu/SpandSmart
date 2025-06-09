"use client"

import React, { useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import useFetch from '@/hooks/use-fetch';
import CreateAccount from '@/actions/dashboard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CreateAccountDrawer = ({ children }) => {
    const [open, setOpen] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            type: "CURRENT",
            balance: "",
            isDefault: false
        }
    })

    const { data: newAccount, loading: CreateAccountLoading, error, fn: createAccountFn } = useFetch(CreateAccount);

    useEffect(() => {
        if (newAccount && !CreateAccountLoading) {
            toast.success("Account Created Successfully.");
            setOpen(false);
            reset();
        }
    }, [CreateAccountLoading, newAccount])

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to Create Account!");
        }
    }, [error])

    const onSubmit = async (data) => {
        console.log(data);
        await createAccountFn(data);
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                </DrawerHeader>

                <div className='px-4 pb-4'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='space-y-2'>
                            <label htmlFor="name" className='mb-2'>Account Name</label>
                            <Input
                                id='name'
                                placeholder="e.g., Main Checking"
                                {...register("name")}
                            />
                            {
                                errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>
                            }
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor="type" className='mb-2'>Account Type</label>
                            <Select
                                onValueChange={(value) => setValue("type", value)}
                                defaultValues={watch("type")}
                            >
                                <SelectTrigger id='type' className={'w-full'}>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT">CURRENT</SelectItem>
                                    <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                                </SelectContent>
                            </Select>
                            {
                                errors.type && <p className='text-sm text-red-600'>{errors.type.message}</p>
                            }
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor="balance" className='mb-2'>Balance</label>
                            <Input
                                type={'number'}
                                id="balance"
                                placeholder="0.00"
                                step="0.01"
                                {...register("balance")}
                            />
                            {
                                errors.balance && <p className='text-sm text-red-600'>{errors.balance.message}</p>
                            }
                        </div>

                        <div className='flex items-center justify-between rounded-lg border p-3'>
                            <div className='space-y-0.5'>
                                <label htmlFor="isDefault" className='text-sm font-medium cursor-pointer'>Set As Default</label>
                                <p className='text-sm text-muted-foreground'>This account will be selected by default for transaction</p>
                            </div>
                            <Switch
                                id={'isDefault'}
                                onCheckedChange={(checked) => setValue("isDefault", checked)}
                                checked={watch("isDefault")}
                            />
                        </div>

                        <div>
                            <DrawerClose asChild>
                                <Button type="button" variant='outline' className="flex-1" >
                                    Cancel
                                </Button>
                            </DrawerClose>

                            <Button type='submit' disabled={createAccountFn}>
                                {CreateAccountLoading ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Creating...</> : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>

    )
}

export default CreateAccountDrawer