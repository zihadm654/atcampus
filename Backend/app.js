const express = require("express");
const cors = require("cors");
const db = require("./db/db");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./public"));
app.use(cors());

const PORT = process.env.PORT || 5000;

db.initDb((err, dataBase) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  }
});
