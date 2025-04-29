import React, { Suspense } from 'react'
import Dashboard from './page'
import { BarLoader } from 'react-spinners'

const DashBoardLayout = () => {
    return (
        <div className='px-5'>
            <h1 className='text-5xl font-bold mb-5 gradient-title'>Dashboard</h1>

            {/* Dashboard Page */}

            <Suspense fallback={<BarLoader className='mt-4' width={'100%'} color='#9333ea' />}>
                <Dashboard />
            </Suspense>

        </div>
    )
}

export default DashBoardLayout