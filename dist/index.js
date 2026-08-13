import Express from "express";
import mongoose from "mongoose";
const app = Express();
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
//# sourceMappingURL=index.js.map