const NotificationModel =
  require("../../model/notification_model");

const deleteNotification =
  async (req, res) => {
    try {
      const {
        notificationId,
      } = req.params;

      const notification =
        await NotificationModel.findByIdAndDelete(
          notificationId
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
          "Notification deleted successfully",
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

module.exports = deleteNotification;