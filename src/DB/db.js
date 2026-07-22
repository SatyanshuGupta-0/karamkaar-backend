const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB Connected");

    try {
      await mongoose.connection.db
        .collection("users")
        .dropIndex("mobile_1");

      console.log("✅ mobile_1 index deleted");
    } catch (err) {
      console.log("Index delete error:", err.message);
    }
  })
  .catch((err) => {
    console.log(err);
  });