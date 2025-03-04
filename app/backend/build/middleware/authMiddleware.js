import jwt from 'jsonwebtoken';
const verifyToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const jwtPayload = decoded; // add this line
        if (jwtPayload && typeof jwtPayload !== 'string' && jwtPayload.userId) { // Check for JwtPayload and userId
            req.userId = jwtPayload.userId;
            next();
        }
        else {
            return res.status(403).json({ message: 'Forbidden' });
        }
    });
};
export default verifyToken;
