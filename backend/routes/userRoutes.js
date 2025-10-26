import express from "express";
const router = express.Router();

//import các controller
import {getAllUsers} from "../controller/userController.js";

router.get("/users", getAllUsers);

export default router;
