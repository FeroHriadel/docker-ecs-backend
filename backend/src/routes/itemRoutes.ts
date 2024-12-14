import express from "express";
import { deleteItem, getItems, saveItem } from "../controllers/itemControllers";



const router = express.Router();

router.get('/', getItems);
router.post('/', saveItem);
//@ts-ignore
router.delete('/', deleteItem);



export default router;