import app from "./app";
import connectDB from "./db/index";
import dotenv from "dotenv";

// const app = express();
dotenv.config({
  path: "./env",
});
// const PORT = 5000;
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Application is listening on port-${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error in Index", error);
  });
