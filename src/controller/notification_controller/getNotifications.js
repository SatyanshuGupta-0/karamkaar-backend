const NotificationModel =
  require("../../model/notification_model");

const getNotifications =
  async (req, res) => {
    try {
      const userId =
        req.user.id;

      const notifications =
        await NotificationModel.find({
          receiver: userId,
        })
          .populate(
            "sender",
            "name avatar"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count:
          notifications.length,
        notifications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

module.exports = getNotifications;