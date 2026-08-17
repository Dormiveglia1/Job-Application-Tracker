import jwt from "jsonwebtoken";

function authenticateToken(request, response, next) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return response.status(401).json({
      message: "Authentication token is required.",
    });
  }

  const token = authorizationHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    request.user = payload;

    return next();
  } catch (error) {
    return response.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
}

export default authenticateToken;
