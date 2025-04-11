import express from "express";
import proxy from "express-http-proxy";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const auth = proxy("http://localhost:8081");
const messages = proxy("http://localhost:8082");
const notification = proxy("http://localhost:8083");

app.use("/api/auth", auth);
app.use("/api/messages", messages);
app.use("/api/notification", notification);

const server = app.listen(8080, () => {
  console.log("gateway is listening to port 8080");
});
