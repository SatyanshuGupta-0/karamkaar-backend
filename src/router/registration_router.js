const express = require("express");
const router = express.Router();

const registerUserController = require("../controller/user_controller/registerUserController");
const verifyOtpController = require("../controller/user_controller/verifyOtpController");
const loginUserController = require("../controller/user_controller/loginUserController");
const logoutController = require("../controller/user_controller/logoutController");
const resetPassword = require("../controller/user_controller/resetPassword");
const forgetPasswordController = require("../controller/user_controller/forgetPasswordController");
const verifyForgotPasswordOtp = require("../controller/user_controller/verifyForgotPasswordOtp");
const updatePassword = require("../controller/user_controller/updatePassword");
const getAllUsers = require("../controller/user_controller/getAllUsers");
const updateUserdetails = require("../controller/user_controller/updateUserDetails");
const getNearbyProvidersController = require("../controller/user_controller/getNearbyProvidersController");
const updateLocation = require("../controller/user_controller/updateLocation");
const getProviderProfileController = require("../controller/user_controller/getProviderProfileController");
const updateProviderProfile = require("../controller/user_controller/updateProviderProfile");
const toggleAvailability = require("../controller/user_controller/toggleAvailability");
const getServiceSuggestions = require("../controller/user_controller/getServiceSuggestions");
const sendMobileOtp = require("../controller/user_controller/sendMobileOtp");
const verifyMobileOtp = require("../controller/user_controller/verifyMobileOtp");
const sendEmailOtp = require("../controller/user_controller/sendEmailOtp");
const verifyEmailOtp = require("../controller/user_controller/verifyEmailOtp");
const googleLoginController = require("../controller/user_controller/googleLoginController");


const {
  userAvatarController,
  removeImageFromCloudinary,
  refreshToken,
  userDetails,
  getUserByIdController,
} = require("../controller/registration_controller");

const auth = require("../middleware/auth");
const verifyReset = require("../middleware/verifyReset");
const upload = require("../middleware/upload");


// ==========================
// PUBLIC ROUTES
// ==========================

router.post("/register", registerUserController);

router.post("/verifyotp", verifyOtpController);

router.post("/login", loginUserController);

router.post( "/google-auth", googleLoginController);

router.post( "/forgot-password", forgetPasswordController);

router.post( "/verify-forgot-password-otp", verifyForgotPasswordOtp);

router.post( "/reset-password", verifyReset, resetPassword);

router.post( "/refresh-token", refreshToken);


// ==========================
// AUTH ROUTES
// ==========================

router.get(
  "/provider/profile",
  auth,
  getProviderProfileController
);

router.get("/services/suggest", auth, getServiceSuggestions);

router.put(
  "/provider/profile",
  auth,
  updateProviderProfile
);

router.get( "/logout", auth, logoutController);

router.get( "/user-details", auth, userDetails);

router.post(
  "/avatar",
  auth,
  upload.array("avatar", 1),
  userAvatarController
);

router.get( "/providers/nearby", auth, getNearbyProvidersController);

router.delete( "/deleteImage", auth, removeImageFromCloudinary);

router.post( "/update-password", auth, updatePassword);


// ==========================
// LOCATION ROUTE
// MUST COME BEFORE /:id
// ==========================

router.put( "/update-location", auth, updateLocation);

router.put( "/toggle-availability", auth, toggleAvailability);


// ==========================
// SELF-SERVICE PROFILE (customer-facing Edit Profile page)
// Thin aliases over the existing self-only user-details endpoints —
// no id in the URL, so there's nothing to guess/tamper with.
// MUST COME BEFORE /:id
// ==========================

router.get( "/profile", auth, userDetails);

router.put(
  "/profile",
  auth,
  (req, res, next) => {
    req.params.id = req.user.id;
    next();
  },
  updateUserdetails
);


// ==========================
// MOBILE / EMAIL OTP (Edit Profile "Verify" buttons)
// MUST COME BEFORE /:id
// ==========================

router.post( "/send-mobile-otp", auth, sendMobileOtp);

router.post( "/verify-mobile-otp", auth, verifyMobileOtp);

router.post( "/send-email-otp", auth, sendEmailOtp);

router.post( "/verify-email-otp", auth, verifyEmailOtp);


// ==========================
// USER UPDATE ROUTE
// ==========================

router.put( "/:id", auth, updateUserdetails);


// ==========================
// ADMIN ROUTES
// ==========================

router.get( "/getuser", getAllUsers);


// router.get(
//   "/:id",
//   isAdmin("superadmin","admin"),
//   getUserByIdController
// );

module.exports = router;