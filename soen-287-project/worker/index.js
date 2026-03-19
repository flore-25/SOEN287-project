import { createServer } from "node:http";
import { httpServerHandler } from "cloudflare:node";
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());



app.get("/api", (req, res) =>{
  res.json({ message: "Express.js running on Cloudflare Workers! "});
});

app.use((req,res) => {
  console.log("Unmatched route: ", req.method, req.url);
  res.status(404).json({ error: "Not found", path: req.url});
});

const server = createServer(app);
export default httpServerHandler(server);
