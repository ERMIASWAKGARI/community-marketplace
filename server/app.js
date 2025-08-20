import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Hello World, from the community marketplace API!",
  });
});

export default app;
