import { Request, Response, NextFunction} from "express";
import { getDbConnection } from "../db/createConnection";



export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getDbConnection(); if (!connection) throw new Error("No database connection");
    const [rows] = await connection.execute('SELECT * FROM Items');
    res.status(200).json({ ok: true, data: rows });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const saveItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getDbConnection(); if (!connection) throw new Error("No database connection");
    const { name } = req.body;
    const [insertResult] = await connection.execute("INSERT INTO Items (name) VALUES (?)", [name]);
    const insertId = (insertResult as any).insertId;
    const [rows] = await connection.execute("SELECT id, name FROM Items WHERE id = ?", [insertId]);
    const insertedItem = (rows as any[])[0];
    res.status(200).json({ ok: true, data: insertedItem });
  } catch (error) {
    console.error("Error saving item:", error);
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = getDbConnection(); if (!connection) throw new Error("No database connection");
    const { id } = req.body; if (!id) { return res.status(400).json({ ok: false, message: "Item ID is required" }); }
    const [result] = await connection.execute("DELETE FROM Items WHERE id = ?", [id]);
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0) { return res.status(404).json({ok: false, message: "Item not found or already deleted"}); }
    res.status(200).json({ ok: true, message: "Item deleted successfully", data: {id}});
  } catch (error) {
    console.error("Error deleting item:", error);
    next(error);
  }
};

