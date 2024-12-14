import mysql from "mysql2/promise";
import "colors";
import dotenv from "dotenv";
dotenv.config();



let connection: mysql.Connection | null;

export const connectToDatabase = async () => {
  if (!connection) {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT!),
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_DATABASE!,
      });
      console.log('Connected to db'.cyan);
    } catch (error) {
      console.error('Error connecting to the database:', (error as Error).message.red);
      process.exit(1);
    }
  }
  return connection;
}

export const getDbConnection = () => connection;