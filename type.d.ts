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