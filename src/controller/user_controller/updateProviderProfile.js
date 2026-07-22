const UserModel = require("../../model/user_model");

const updateProviderProfile = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId);

    if (!user || !user.role.includes("PROVIDER")) {
      return res.status(403).json({
        success: false,
        message: "You are not a service provider",
      });
    }

    const {
      name,
      mobile,
      description,
      experience,
      availabilityStatus,
      serviceRadius,
      fullAddress,
      city,
      state,
      pincode,
      country,
      services,
    } = req.body;

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;

    user.address = {
      ...user.address,
      fullAddress: fullAddress ?? user.address?.fullAddress,
      city: city ?? user.address?.city,
      state: state ?? user.address?.state,
      pincode: pincode ?? user.address?.pincode,
      country: country ?? user.address?.country,
    };

    if (description !== undefined) {
      user.providerDetails.description = description;
    }

    if (experience !== undefined) {
      user.providerDetails.experience = Number(experience) || 0;
    }

    if (serviceRadius !== undefined) {
      user.providerDetails.serviceRadius = Number(serviceRadius) || 5;
    }

    if (
      availabilityStatus &&
      ["ONLINE", "OFFLINE"].includes(availabilityStatus)
    ) {
      user.providerDetails.availabilityStatus = availabilityStatus;
    }

    // Services: accept a full replacement array. Each item may or may
    // not have _id — Mongoose keeps existing subdocument _ids for
    // matching items and generates new ones for new entries.
    if (Array.isArray(services)) {
      user.providerDetails.services = services.map((s) => ({
        _id: s._id || undefined,
        serviceName: s.serviceName,
        category: s.category,
        description: s.description || "",
         keywords: Array.isArray(s.keywords)
      ? s.keywords
          .map((k) => String(k).trim().toLowerCase())
          .filter(Boolean)
      : String(s.keywords || "")
          .split(",")
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean),
        price: Number(s.price) || 0,
        estimatedTime: s.estimatedTime || "",
      }));
    }

    await user.save({ validateBeforeSave: false });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      provider: userResponse,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = updateProviderProfile;
