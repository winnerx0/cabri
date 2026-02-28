import { serve } from 'bun'
import readXlsxFile from 'read-excel-file/node'
import { convertToDate } from './utils'
import { Database } from './database'

const database = Database.getInstance()

database.connect().catch((err) => {
  console.error('Failed to connect to the database:', err)
  process.exit(1)
})

database
  .query(
    `
    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        data_time TIMESTAMPTZ NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        receiver VARCHAR(100) NOT NULL,
        balance NUMERIC(15, 2) NOT NULL
    )
    `
  )
  .then(() => {
    console.log('Tables created successfully')
  })
  .catch((err) => {
    console.error('Failed to create tables:', err)
  })

serve({
  port: process.env.PORT,
  routes: {
    '/upload': async (req) => {
      const data = readXlsxFile('transactions.xlsx').then((rows) => {
        rows = rows.toSpliced(0, 16).map((row) => row.filter((cell) => !!cell))

        const transactions: Promise<Transaction>[] = rows.map(async (row) => {
          const data = row as [string, string, string, string, string, string]

          const transaction = {
            dataTime: convertToDate(data[0]),
            amount: parseFloat(
              (data[2] === 'inward transfer' ? data[1] : `-${data[1]}`).replace('₦', '')
            ) as number,
            receiver: data[3],
            balance: parseFloat(
              (data[data.length - 1] ?? ('0' as string)).replace('₦', '')
            ) as number
          } satisfies Transaction

          return transaction
        })

        return transactions
      })

      const transactions = await Promise.all(await data)

      for (let i = 0; i < 3; i++) {
        const worker = new Worker('./dist/worker.js', { type: 'module' })

        worker.postMessage(transactions.slice(i * 100, (i + 1) * 100))

        worker.onmessage = (event: MessageEvent) => {
          console.log(event.data)
        }

        worker.onerror = (err) => {
          console.error('Worker error:', err)
        }
      }

      return new Response(JSON.stringify({ message: 'Transactions uploaded successfully' }), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  },
  fetch(req) {
    return new Response(JSON.stringify({ message: 'Route not found' }))
  }
})

console.log('Server is running on port', process.env.PORT)
