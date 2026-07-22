const NotificationModel = require(
  "../model/notification_model"
);

// =====================================
// CREATE NOTIFICATION
// =====================================

const createNotification =
  async (req, res) => {
    try {
      const {
        receiver,
        receiverType,
        sender,
        senderType,
        booking,
        title,
        message,
        type,
        image,
        redirectUrl,
        screen,
        metadata,
      } = req.body;

      if (
        !receiver ||
        !receiverType ||
        !title ||
        !message
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Required fields missing",
        });
      }

      const notification =
        await NotificationModel.create({
          receiver,

          receiverType,

          sender,

          senderType,

          booking,

          title,

          message,

          type,

          image,

          redirectUrl,

          screen,

          metadata,
        });

      return res.status(201).json({
        success: true,

        message:
          "Notification created successfully",

        notification,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// GET USER NOTIFICATIONS
// =====================================

const getUserNotifications =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const notifications =
        await NotificationModel.find({
          receiver: userId,

          isDeleted: false,
        })
          .sort({
            createdAt: -1,
          })
          .populate(
            "booking",
            "bookingId status"
          );

      return res.status(200).json({
        success: true,

        total:
          notifications.length,

        notifications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// MARK SINGLE AS READ
// =====================================

const markNotificationAsRead =
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification =
        await NotificationModel.findByIdAndUpdate(
          id,
          {
            isRead: true,

            readAt: new Date(),
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
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// MARK ALL AS READ
// =====================================

const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      const userId = req.user.id;

      await NotificationModel.updateMany(
        {
          receiver: userId,

          isRead: false,
        },
        {
          $set: {
            isRead: true,

            readAt: new Date(),
          },
        }
      );

      return res.status(200).json({
        success: true,

        message:
          "All notifications marked as read",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// DELETE NOTIFICATION
// =====================================

const deleteNotification =
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification =
        await NotificationModel.findByIdAndUpdate(
          id,
          {
            isDeleted: true,
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
          "Notification deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Internal server error",
      });
    }
  };

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createNotification,

  getUserNotifications,

  markNotificationAsRead,

  markAllNotificationsAsRead,

  deleteNotification,
};