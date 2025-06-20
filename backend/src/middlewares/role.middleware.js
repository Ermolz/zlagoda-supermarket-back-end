export const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.empl_role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
}; 