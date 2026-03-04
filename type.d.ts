declare type Transaction = {
    dataTime: Date,
    amount: number,
    receiver: string,
    balance: number
}

declare type Statement = {
    transactions: Transaction[],
    dateRange: [start: Date, end: Date],
    accoutnNumber: string,
    bankName: string
}

declare type MonthlyTransaction = {
    balance: number
    month: number
    year: number
}

declare interface RankedMonthlyTransaction extends MonthlyTransaction {

    amount_rank: number,
    amount: number
}