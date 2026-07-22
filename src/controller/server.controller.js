export const serverStatus = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "running",
      timestamp: new Date(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};