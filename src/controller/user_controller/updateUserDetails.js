const bcrypt = require(
  "bcrypt"
);

const cloudinary = require(
  "../../config/cloudinaryConfig"
);

const UserModel = require(
  "../../model/user_model"
);

const sendEmailFun = require(
  "../../config/sendEmail"
);

const verificationEmail = require(
  "../../utils/verifyEmailTemplate"
);

// =====================================
// UPDATE USER DETAILS
// =====================================

const updateUserdetails =
  async (req, res) => {
    try {
      const userId =
        req.params.id;

      // =====================================
      // VALIDATION
      // =====================================

      if (!userId) {
        return res.status(401).json({
          success: false,

          error: true,

          message:
            "Unauthorized",
        });
      }

      // =====================================
      // OWNERSHIP CHECK
      // Prevent one user from editing another user's profile
      // by simply changing the :id in the URL.
      // =====================================

      const isAdmin =
        req.user?.role?.includes("ADMIN");

      if (
        req.user?.id !== userId &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,

          error: true,

          message:
            "You can only update your own profile",
        });
      }

      const {
        name,
        email,
        mobile,
        password,
        avatar,
        currentLocation,
        address,
      } = req.body;

      // =====================================
      // FIND USER
      // =====================================

      const user =
        await UserModel.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,

          error: true,

          message:
            "User not found",
        });
      }

      // =====================================
      // CHECK DUPLICATE EMAIL
      // =====================================

      if (
        email &&
        email !== user.email
      ) {
        const emailExists =
          await UserModel.findOne({
            email:
              email.toLowerCase(),
          });

        if (emailExists) {
          return res.status(400).json({
            success: false,

            error: true,

            message:
              "Email already exists",
          });
        }
      }

      // =====================================
      // HASH PASSWORD
      // =====================================

      let hashedPassword =
        user.password;

      if (password) {
        const salt =
          await bcrypt.genSalt(
            10
          );

        hashedPassword =
          await bcrypt.hash(
            password,
            salt
          );
      }

      // =====================================
      // GENERATE EMAIL OTP
      // =====================================

      let verifyCode = null;

      if (
        email &&
        email !== user.email
      ) {
        verifyCode = Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();
      }

      // =====================================
      // AVATAR UPDATE
      // =====================================

      if (
        avatar &&
        avatar.publicId !==
          user.avatar?.publicId
      ) {
        // remove old image
        if (
          user.avatar?.publicId
        ) {
          await cloudinary.uploader.destroy(
            user.avatar.publicId
          );
        }

        user.avatar = avatar;
      }

      // =====================================
      // REMOVE AVATAR
      // =====================================

      if (avatar === null) {
        if (
          user.avatar?.publicId
        ) {
          await cloudinary.uploader.destroy(
            user.avatar.publicId
          );
        }

        user.avatar = {
          url: "",
          publicId: null,
        };
      }

      // =====================================
      // UPDATE BASIC FIELDS
      // =====================================

      if (name)
        user.name = name;

      if (mobile)
        user.mobile = mobile;

      // =====================================
      // EMAIL UPDATE
      // =====================================

      if (
        email &&
        email !== user.email
      ) {
        user.email =
          email.toLowerCase();

        user.verify_email =
          false;

        user.otp = verifyCode;

        user.otpExpires =
          new Date(
            Date.now() +
              10 *
                60 *
                1000
          );
      }

      // =====================================
      // PASSWORD UPDATE
      // =====================================

      user.password =
        hashedPassword;

      // =====================================
      // UPDATE LIVE LOCATION
      // =====================================

      if (currentLocation) {
        // validate coordinates
        if (
          !Array.isArray(
            currentLocation.coordinates
          ) ||
          currentLocation
            .coordinates
            .length !== 2
        ) {
          return res.status(400).json({
            success: false,

            error: true,

            message:
              "Coordinates must be [longitude, latitude]",
          });
        }

        user.currentLocation =
          {
            type: "Point",

            coordinates:
              currentLocation.coordinates,

            lastUpdated:
              new Date(),
          };
      }

      // =====================================
      // UPDATE ADDRESS
      // =====================================

      if (address) {
        user.address = {
          fullAddress:
            address.fullAddress ||
            user.address
              .fullAddress,

          houseNo:
            address.houseNo ||
            user.address.houseNo,

          landmark:
            address.landmark ||
            user.address.landmark,

          city:
            address.city ||
            user.address.city,

          state:
            address.state ||
            user.address.state,

          pincode:
            address.pincode ||
            user.address.pincode,

          country:
            address.country ||
            user.address.country,
        };
      }

      // =====================================
      // SAVE USER
      // =====================================

      await user.save({
        validateBeforeSave: false,
      });

      // =====================================
      // SEND VERIFY EMAIL
      // =====================================

      if (verifyCode) {
        await sendEmailFun(
          user.email,
          "Verify your email",
          "",
          verificationEmail(
            user.name,
            verifyCode
          )
        );
      }

      // =====================================
      // REMOVE PASSWORD
      // =====================================

      const userResponse =
        user.toObject();

      delete userResponse.password;

      // =====================================
      // RESPONSE
      // =====================================

      return res.status(200).json({
        success: true,

        error: false,

        message:
          "User updated successfully",

        user: userResponse,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,

        error: true,

        message:
          error.message ||
          "Internal Server Error",
      });
    }
  };

module.exports =
  updateUserdetails;