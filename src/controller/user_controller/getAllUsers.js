const UserModel = require(
  "../../model/user_model"
);

// =====================================
// GET ALL USERS
// =====================================

const getAllUsers = async (
  req,
  res
) => {
  try {
    // =====================================
    // ADMIN CHECK
    // =====================================

    /*
    if (
      !req.user ||
      !req.user.role.includes(
        "admin"
      )
    ) {
      return res.status(403).json({
        success: false,

        error: true,

        message:
          "Access denied",
      });
    }
    */

    // =====================================
    // QUERY PARAMS
    // =====================================

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) ||
      10;

    const search =
      req.query.search || "";

    const skip =
      (page - 1) * limit;

    // =====================================
    // SEARCH FILTER
    // =====================================

    const filter = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },

        {
          mobile: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // =====================================
    // GET USERS
    // =====================================

    const users =
      await UserModel.find(
        filter
      )
        .select(
          "-password -access_token -refresh_token -otp -otpExpires"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean();

    // =====================================
    // TOTAL USERS
    // =====================================

    const totalUsers =
      await UserModel.countDocuments(
        filter
      );

    // =====================================
    // RESPONSE
    // =====================================

    return res.status(200).json({
      success: true,

      error: false,

      message:
        "Users fetched successfully",

      currentPage: page,

      totalPages:
        Math.ceil(
          totalUsers / limit
        ),

      totalUsers,

      data: users,
    });
  } catch (error) {
    console.log(
      "Get All Users Error:",
      error
    );

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
  getAllUsers;