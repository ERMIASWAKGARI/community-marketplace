import "./config/env.js";

import app from "./app.js";
import db from "./config/db.js";

db();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
