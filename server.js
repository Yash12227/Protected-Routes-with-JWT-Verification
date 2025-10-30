// server.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Hardcoded sample user
const user = {
  id: 1,
  username: "admin",
  password: "password123",
};

// ========================
// LOGIN ROUTE
// ========================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate user credentials
  if (username === user.username && password === user.password) {
    // Create JWT payload
    const payload = { id: user.id, username: user.username };

    // Sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.json({ message: "Login successful!", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// ========================
// JWT VERIFICATION MIDDLEWARE
// ========================
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // Attach decoded data to request
    next();
  });
}

// ========================
// PROTECTED ROUTE
// ========================
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Access granted to protected route!",
    user: req.user,
  });
});

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
