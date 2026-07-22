const NotificationModel =
  require("../model/notification_model");

const createNotification =
  async ({
    receiver,
    sender = null,
    title,
    message,
    type = "GENERAL",
    booking = null,
  }) => {
    try {
      await NotificationModel.create({
        receiver,
        sender,
        title,
        message,
        type,
        booking,
      });
    } catch (error) {
      console.log(
        "Notification Error:",
        error
      );
    }
  };

module.exports =
  createNotification;