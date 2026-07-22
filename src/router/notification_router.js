const express = require("express");

const router = express.Router();

const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} = require("../controller/notification_controller");

const auth = require("../middleware/auth");

// =====================================
// CREATE NOTIFICATION
// =====================================

router.post(
    "/create",
    auth,
    createNotification
);

// =====================================
// GET ALL USER NOTIFICATIONS
// =====================================

router.get(
    "/my-notifications",
    auth,
    getUserNotifications
);

// =====================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================

router.put(
    "/read/:id",
    auth,
    markNotificationAsRead
);

// =====================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================

router.put(
    "/read-all",
    auth,
    markAllNotificationsAsRead
);

// =====================================
// DELETE NOTIFICATION
// =====================================

router.delete(
    "/delete/:id",
    auth,
    deleteNotification
);

module.exports = router;