import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.js";
import dotenv from "dotenv";

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

dotenv.config();

app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("Hello This is the landing page");
});

// Connecting to the database MongoDB Atlas
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server is Running at ${PORT}`))
  )
  .catch((error) => console.log(error.message));
