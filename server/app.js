const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { checkFileType } = require("./utils");
const PORT = process.env.PORT || 3030;
const CLIENT_LINk = process.env.CLIENT_LINK || "*";
const app = express();
const storageEngine = multer.diskStorage({
   destination: "./images",
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}--${file.originalname}`);
   },
});
const upload = multer({
   storage: storageEngine,
   fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
   },
});

app.use(
   cors({
      origin: CLIENT_LINk,
   })
);

app.get("/", (req, res) => {
   res.send("Click Fit");
});
app.post("/upload", upload.any("image"), (req, res) => {
   if (req.files) {
      res.send("Images uploaded successfully ");
   } else {
      res.status(400).send("Please upload valid images");
   }
});

app.listen(PORT, () => {
   console.log(`listening on port ${PORT}`);
});
