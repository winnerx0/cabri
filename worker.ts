import { Database } from './database'

declare var self: Worker

const database = Database.getInstance()

database.connect().catch((err) => {
  console.error('Failed to connect to the database:', err)
  process.exit(1)
})

self.onmessage = (event: MessageEvent) => {
  const data: Transaction[] = event.data

  console.log('Worker received transactions:', data.length)

  for (const transaction of data) {
    database
      .query(
        `   
                INSERT INTO transactions (data_time, amount, receiver, balance)
                VALUES ($1, $2, $3, $4)
                `,
        [transaction.dataTime, transaction.amount, transaction.receiver, transaction.balance]
      )
      .catch((err) => {
        console.error('Failed to insert transaction:', err)
      })
      .then(() => console.log('Successfully inserted transaction:', transaction))
      .catch(() => console.log('Failed to insert transaction:', transaction))

  }

  postMessage('Transactions processed successfully')
}
