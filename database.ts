import { Client } from 'pg'

export class Database {
  private static instance: Database
  private client: Client
  private connected = false

  private constructor() {
    this.client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT ?? '5432')
    })
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  public async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect()
      this.connected = true
      console.log('Database connected')
    }
  }

  public query(text: string, params?: any[]) {
    return this.client.query(text, params)
  }

  public async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.end()
      this.connected = false
      console.log('Database disconnected')
    }
  }
}
