import express from "express";
import { connect } from "../config/db.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    let pool = await connect();
    let result = await pool.request().query("SELECT * FROM Users");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
