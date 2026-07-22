const NotificationModel =
  require("../../model/notification_model");

const markNotificationRead =
  async (req, res) => {
    try {
      const {
        notificationId,
      } = req.params;

      const notification =
        await NotificationModel.findByIdAndUpdate(
          notificationId,
          {
            isRead: true,
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

module.exports = markNotificationRead;