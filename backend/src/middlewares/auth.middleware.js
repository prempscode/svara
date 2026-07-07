const jwt = require("jsonwebtoken");

async function authArtist(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = decoded.role;

    if (role !== "artist") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only artists can upload music" });
    }

    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized", error: e.message });
  }
}

async function authGlobal(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // just check if user exists - any valid token works
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized", error: e.message });
  }
}

module.exports = { authArtist, authGlobal };
