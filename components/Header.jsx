import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { Button } from './ui/button';
import { LayoutDashboardIcon, PenBox } from 'lucide-react';
import { checkUser } from '@/lib/checkUser';

const Header = async () => {
    await checkUser();

    return (
        <div className='fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50'>
            <nav className='container mx-auto px-2 py-1 flex items-center justify-between'>
                <Link href={"/"}>
                    <Image
                        src={'/logo.png'}
                        height={60}
                        width={200}
                        className='h-15 w-auto object-contain'
                        alt='SpendSmart Logo'
                    />
                </Link>
                <div className='flex items-center space-x-2'>
                    <SignedIn>
                        <Link href={'/dashboard'} className='text-gray-600 hover:text-blue-400 flex items-center gap-2'>
                            <Button variant={'outline'}>
                                <LayoutDashboardIcon size={18} />
                                <span className='hidden md:inline'>Dashboard</span>
                            </Button>
                        </Link>
                        <Link href={'/transaction/create'} className='text-gray-600 hover:text-blue-400 flex items-center gap-2'>
                            <Button>
                                <PenBox size={18} />
                                <span className='hidden md:inline'>Add Transaction</span>
                            </Button>
                        </Link>

                    </SignedIn>

                    <SignedOut>
                        <SignInButton forceRedirectUrl='/'>
                            <Button variant='outline'>Login</Button>
                        </SignInButton>
                        <SignUpButton>
                            <Button className="ml-2">Sign Up</Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: 'w-10 h-10',
                                },
                            }}
                        />
                    </SignedIn>
                </div>
            </nav>
        </div>
    )
}

export default Header;