const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log("Received token:", token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found for id:", decoded.id);
      throw new Error();
    }
    
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    console.log("Auth successful. User ID:", req.userId, "Role:", req.userRole);
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
}; 