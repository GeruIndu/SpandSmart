"use client"

import { bulkDeleteTransactions } from '@/actions/account'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { categoryColors } from '@/data/categories'
import useFetch from '@/hooks/use-fetch'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { BarLoader } from 'react-spinners'
import { toast } from 'sonner'

const TransactionTable = ({ transactions }) => {

    const router = useRouter();

    const [selectedIds, setSelectedIds] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        field: 'date',
        direction: 'desc'
    })

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [reccuringFilter, setReccuringFilter] = useState("");

    const RECCURING_INTERVALS = {
        DAILY: 'Daily',
        WEEKLY: 'Weekly',
        MONTHLY: 'Monthly',
        YEARLY: 'Yearly',
    }

    const handleSort = (field) => {
        setSortConfig(current => ({
            field,
            direction: current.field == field && current.direction == 'desc' ? 'asc' : 'desc',
        }))
    }

    const handleChecked = (id) => {
        setSelectedIds(current => (
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        ));
    }

    const handleAllChecked = () => {
        setSelectedIds(current => (
            current.length === filteredTransactions.length ? [] : filteredTransactions.map(transaction => transaction.id)
        ))
    }
    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Apply on searchTerm 
        if (searchTerm) {
            const seachLower = searchTerm.toLowerCase();
            result = result.filter((transaction) => {
                return transaction.description?.toLowerCase()?.includes(seachLower);
            })
        }

        // Type filter
        if (typeFilter) {
            result = result.filter((transaction) => (
                transaction.type === typeFilter
            ))
        }

        // Reccuring Filters 
        if (reccuringFilter) {
            result = result.filter((transaction) => {
                if (reccuringFilter === 'reccuring')
                    return transaction.isReccuring;
                return !transaction.isReccuring;
            })
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortConfig.field) {
                case 'date':
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case 'category':
                    comparison = a.category.localeCompare(b.category);
                    break;
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
                default:
                    comparison = 0;
            }
            return (sortConfig.direction === 'asc') ? comparison : -comparison;
        })

        return result;
    }, [transactions, searchTerm, reccuringFilter, typeFilter, sortConfig]);

    const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted,
        error
    } = useFetch(bulkDeleteTransactions);

    const handleBulkDeleted = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions`)) {
            return;
        }
        deleteFn(selectedIds)
        setSelectedIds([]);
    }

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.success("Transactions deleted successfully.");
        }
    }, [deleteLoading, deleted])

    useEffect(() => {
        if (error)
            toast.error(error);
    }, [error])

    const handleClearFilters = () => {
        setReccuringFilter("");
        setSearchTerm("");
        setSelectedIds([]);
        setTypeFilter("");
    }

    return (
        <div className='space-y-4'>
            {/* Filter Section */}

            {
                deleteLoading && <BarLoader className='mt-4' width={'100%'} color='#9333ea' />
            }
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder="Search Transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={'pl-8'}
                    />
                </div>

                <div className='flex gap-3'>
                    <Select
                        value={typeFilter}
                        onValueChange={(value) => setTypeFilter(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>


                    <Select
                        value={reccuringFilter}
                        onValueChange={(value) => setReccuringFilter(value)}
                    >
                        <SelectTrigger className='w-[160px]'>
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reccuring">Reccuring Only</SelectItem>
                            <SelectItem value="non-reccuring">Non-reccuring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {
                        selectedIds.length > 0 && <div>
                            <Button
                                variant='destructive'
                                size='sm'
                                onClick={handleBulkDeleted}
                            >
                                Delete Selected ({selectedIds.length})
                            </Button>
                        </div>
                    }

                    {
                        (selectedIds.length > 0 || searchTerm || typeFilter || reccuringFilter) && (
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={handleClearFilters}
                                title='Clear Filters'
                            >
                                <X className='h-4 w-4' />
                            </Button>
                        )
                    }
                </div>
            </div>


            {/* Transaction Data */}
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    onCheckedChange={handleAllChecked}
                                    checked={
                                        selectedIds.length === filteredTransactions.length && selectedIds.length > 0
                                    }
                                />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort("date")}
                            >
                                <div className='flex items-center'>
                                    Date
                                    {
                                        sortConfig.field === 'date' && (sortConfig.direction === 'desc' ? (
                                            <ChevronDown className='h-4 w-4' />
                                        ) : (
                                            <ChevronUp className='h-4 w-4' />
                                        ))}
                                </div>
                            </TableHead>
                            <TableHead>
                                Description
                            </TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort("category")}
                            >
                                <div className='flex items-center'>
                                    Category
                                    {
                                        sortConfig.field === 'category' && (sortConfig.direction === 'desc' ? (
                                            <ChevronDown className='h-4 w-4' />
                                        ) : (
                                            <ChevronUp className='h-4 w-4' />
                                        ))}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer"
                                onClick={() => handleSort("amount")}
                            >
                                <div className='flex items-center justify-end'>
                                    Amount
                                    {
                                        sortConfig.field === 'amount' && (sortConfig.direction === 'desc' ? (
                                            <ChevronDown className='h-4 w-4' />
                                        ) : (
                                            <ChevronUp className='h-4 w-4' />
                                        ))}
                                </div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>
                            <TableHead className="w-[50px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className={'text-center text-muted-foreground'}>No Transaction Found</TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <Checkbox
                                                onCheckedChange={() => handleChecked(transaction.id)}
                                                checked={selectedIds.includes(transaction.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{format(new Date(transaction.date), 'PP')}</TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell className={'capitalize'}>
                                            <span
                                                style={{
                                                    background: categoryColors[transaction.category]
                                                }}
                                                className='px-2 py-1 rounded text-white text-sm'
                                            >
                                                {transaction.category}
                                            </span>
                                        </TableCell>
                                        <TableCell
                                            className={'text-right font-medium'}
                                            style={{
                                                color: transaction.type === "EXPENSE" ? 'red' : 'green'
                                            }}
                                        >
                                            {transaction.type === "EXPENSE" ? '-' : '+'}
                                            $ {transaction.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="">
                                            {
                                                transaction.isReccuring ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Badge
                                                                    variant={'outline'}
                                                                    className={'gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200'}
                                                                >
                                                                    <RefreshCw className='h-3 w-3' />
                                                                    {RECCURING_INTERVALS[transaction.reccuringInterval]}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className='text-sm'>
                                                                    <div className='font-medium'>Next Date: </div>
                                                                    <div>{format(new Date(transaction.nextRecurringDate), 'PP')}</div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                ) : (
                                                    <Badge variant={'outline'} className={'gap-1'}>
                                                        <Clock className='h-3 w-3' />
                                                        One-time
                                                    </Badge>
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant={'ghost'} className={'h-8 w-8 p-0'}>
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem
                                                        className={'cursor-pointer'}
                                                        onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}
                                                    >Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className={'text-destructive'}
                                                        onClick={() => deleteFn([transaction.id])}
                                                    >Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        }
                    </TableBody>
                </Table>
            </div>
        </div >
    )
}

export default TransactionTable