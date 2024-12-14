import express from "express";
import { test } from "../controllers/testControllers";



const router = express.Router();

router.get('/', test);



export default router;
