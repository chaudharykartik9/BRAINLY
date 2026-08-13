import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/v1/signin", (req, res) => {});

app.post("/api/v1/content", (req, res) => {});

app.get("/api/v1/content", (req, res) => {});

app.delete("/api/v1/content", (req, res) => {});

app.post("/api/v1/brain/share", (req, res) => {});
app.get("/api/v1/brain/:shareId", (req, res) => {});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
