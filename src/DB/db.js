const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB Connected");

    console.log("Database:", mongoose.connection.name);

    const indexes = await mongoose.connection.db
      .collection("users")
      .indexes();

    console.log(indexes);
  })
  .catch((err) => {
    console.log(err);
  });