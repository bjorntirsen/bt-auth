import { app } from "./app";

const port = 3000;
app.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    console.log(`Server listening on port ${port}`);
  } else {
    console.log(`BFF/API listening on http://localhost:${port}/api`);
  }
});
