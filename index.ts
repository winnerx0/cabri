import { serve } from 'bun'
import readXlsxFile from 'read-excel-file/node'
import { convertToDate } from './utils'
import { Database } from './database'
import type { QueryResult } from 'pg'

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
        date_time TIMESTAMPTZ NOT NULL,
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
        console.log(rows)
        rows = rows.toSpliced(0, 16).map((row) => row.filter((cell) => !!cell))

        const transactions: Promise<Transaction>[] = rows.map(async (row) => {
          const data = row as [string, string, string, string, string, string]

          const transaction = {
            dataTime: convertToDate(data[0]),
            amount: parseFloat(
              (data[2] === 'inward transfer' || data[2] === 'local funds transfer'
                ? data[1]
                : `-${data[1]}`
              )
                .replace('₦', '')
                .replaceAll(',', '')
            ) as number,
            receiver: data[3],
            balance: parseFloat(
              (data[data.length - 1] ?? ('0' as string)).replace('₦', '').replaceAll(',', '')
            ) as number
          } satisfies Transaction

          return transaction
        })

        return transactions
      })

      const transactions = await Promise.all(await data)

      console.log('Transactions parsed successfully:', transactions.length)

      const numberOfWorkers = 3

      const CHUNK_SIZE = transactions.length / numberOfWorkers

      // Split transactions into chunks and send to workers for parallel processing
      for (let i = 0; i < numberOfWorkers; i++) {
        const worker = new Worker('./worker.ts')

        worker.postMessage(transactions.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE))

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
    },
    '/monthly_transactions': async (req) => {
      const month = new URL(req.url).searchParams.get('month')
      const query = `
      select 
        case
          when sum(t.amount) <= 0 
            then 0.0 else sum(t.amount) 
        end as monthly_total,
      DATE_PART('month', t.date_time ) as month, 
      DATE_PART('year', t.date_time ) as year
      from transactions t 
      where ($1::int IS NULL OR DATE_PART('month', t.date_time) = $1::int)
      group by "month", "year" 
      order by "year" asc, "month" asc
    `
      try {
        const result = (await database.query(query, [month])) as QueryResult<MonthlyTransaction>

        return new Response(
          JSON.stringify({
            message: 'Monthly transactions fetched successfully',
            transactions: result.rows
          }),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      } catch (error) {
        return new Response(JSON.stringify({ message: error }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
    },
    '/rank_monthly_transactions': async (req) => {
      const query = `
        WITH monthly_totals AS (
            SELECT
                t.*,
                DATE_PART('year', t.date_time) AS year,
                DATE_PART('month', t.date_time) AS month,
                SUM(t.amount) OVER (
                    PARTITION BY DATE_PART('year', t.date_time), DATE_PART('month', t.date_time)
                ) AS month_sum
            FROM transactions t
        )

        select 
        month,
        year,
        amount,
        rank() over (PARTITION BY DATE_PART('year', t.date_time), DATE_PART('month', t.date_time) order by t.amount desc) as amount_rank,
            CASE 
                WHEN month_sum <= 0.0
                THEN 0.0
                ELSE month_sum
            END AS total_balance
        from monthly_totals t
        order by "year", "month" ASC
   
    `
      try {
        const result = (await database.query(query)) as QueryResult<RankedMonthlyTransaction>

        return new Response(
          JSON.stringify({
            message: 'Monthly transactions fetched successfully',
            transactions: Object.groupBy(result.rows, (row) => {
              return `${row.year}-${row.month}`
            })
          }),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      } catch (error) {
        return new Response(JSON.stringify({ message: error }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
    }
  },
  fetch(req) {
    return new Response(JSON.stringify({ message: 'Route not found' }))
  }
})

console.log('Server is running on port', process.env.PORT)
