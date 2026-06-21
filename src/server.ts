import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

connectDB().then(() => {
  app.listen(ENV.PORT, () => console.log("server started at port " + ENV.PORT));
});
