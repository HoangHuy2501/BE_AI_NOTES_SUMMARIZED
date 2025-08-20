const ApiError = require("../utils/ApiError");
const db=require('../config/ConnectData')
module.exports = function authorize(requiredPermissions = []) {
  return async function (req, res, next) {
    try {
      if (!req.user || !req.user.userId) {
        return next(ApiError.Unauthorized());
      }

      if (requiredPermissions.length === 0) {
        return next(); // Không yêu cầu quyền cụ thể → cho qua
      }

      // Lấy quyền của user từ DB
      const result = await db.query(
        `
        SELECT p.name AS permission
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = $1
      `,
        [req.user.userId]
      );
      // lấy tất cả tên quyền
      const userPermissions = result.rows.map((row) => row.permission);

      // Kiểm tra quyền
      const hasPermission = requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return next(ApiError.Forbidden());
      }
      next();
    } catch (err) {
      console.error(err);
      return next(ApiError.Internal());
    }
  };
};
