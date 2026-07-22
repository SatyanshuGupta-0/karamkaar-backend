const UserModel = require("../../model/user_model");

const getServiceSuggestions = async (
  req,
  res
) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: [],
      });
    }

    const regex = { $regex: q.trim(), $options: "i" };

    const providers = await UserModel.find({
      role: "PROVIDER",
      "providerDetails.isProvider": true,
      $or: [
        { "providerDetails.services.serviceName": regex },
        { "providerDetails.services.keywords": regex },
      ],
    })
      .select("providerDetails.services")
      .limit(30)
      .lean();

    const queryLower = q.trim().toLowerCase();
    const seen = new Map();

    providers.forEach((provider) => {
      (provider.providerDetails?.services || []).forEach((service) => {
        if (!service.isActive) return;

        const nameMatch = service.serviceName
          ?.toLowerCase()
          .includes(queryLower);

        const keywordMatch = (service.keywords || []).some((k) =>
          k.toLowerCase().includes(queryLower)
        );

        if (!nameMatch && !keywordMatch) return;

        const key = service.serviceName.toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, {
            serviceName: service.serviceName,
            category: service.category,
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      suggestions: Array.from(seen.values()).slice(0, 8),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = getServiceSuggestions;