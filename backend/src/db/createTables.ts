import { getDbConnection } from "./createConnection";
import "colors";
import dotenv from "dotenv";
dotenv.config();



const createItemsTableQuery = `
  CREATE TABLE IF NOT EXISTS Items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );
`;

export const createTables = async () => {
  const connection = getDbConnection(); if (!connection) throw new Error("No database connection");
  try {
    await connection.query(`USE ${process.env.DB_DATABASE};`);
    await connection.execute(createItemsTableQuery);
    console.log('Items table created or already exists.'.cyan);
  } catch (error) {
    console.error('Error creating ITEMS table:', (error as Error).message.red);
    process.exit(1);
  }
};

