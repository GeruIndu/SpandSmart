import { getAccounts } from '@/actions/dashboard';
import CreateAccountDrawer from '@/components/Create-account-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React from 'react'
import AccountCard from './_components/account-card';

const Dashboard = async () => {

    const accounts = await getAccounts();

    return (
        <div className='px-4'>
            {/* Budget Progress */}

            {/* Overview */}

            {/* Accounts Grid */}

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <CreateAccountDrawer>
                    <Card className={'hover:shadow-md transition-shadow cursor-pointer border-dashed'}>
                        <CardContent className={'flex flex-col items-center justify-center text-muted-foreground w-full pt-5'}>
                            <Plus className='w-10 h-10 mb-2' />
                            <p className='text-sm font-medium'>Add New Account</p>
                        </CardContent>
                    </Card>
                </CreateAccountDrawer>

                {
                    accounts?.length > 0 && accounts.map((acc) => {
                        return <AccountCard key={acc.id} account={acc} />
                    })
                }
            </div>

        </div>
    )
}

export default Dashboard;