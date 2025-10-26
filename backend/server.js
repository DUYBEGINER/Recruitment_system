import express from "express";
import cors from "cors";
import usersAPI from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use("/api", usersAPI);

app.listen(5000, () => console.log("✅ Server running on port 5000"));
