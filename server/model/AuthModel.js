const db = require('../config/ConnectData')
class AuthModel{
    async selectUser(email){
        return db.query("select u.id, u.name,u.email,r.name as role, u.image FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON r.id = ur.role_id where email=$1",[email])
    }
    async createUser(user) {
  // 1. Insert vào bảng users, lấy id trả về
  const resultUser = await db.query(
    "INSERT INTO users(name,email,active,image, publicimage) VALUES($1,$2,$3,$4,$5) RETURNING id",
    [user.name, user.email, true, user.image, user.publicImage]
  );
  const userId = resultUser.rows[0].id;
  // thêm vào role (viewer)
  await db.query("INSERT INTO user_roles(user_id,role_id) VALUES($1,'7d7335a9-a141-4893-813a-0ebcfb39a247')", [userId]);
  // 2. Insert vào bảng account với user_id lấy được
   await db.query(
    "INSERT INTO accounts (user_id,provider,provider_account_id,type,password,active) VALUES($1,$2,$3,$4,$5,$6)",
    [userId, 'credentials', user.email, 'email', user.password, true]
  );

  // Trả về kết quả thành công (có thể là dữ liệu user hoặc đơn giản là true)
  return { userId };
}
    checkMail(email){
        return db.query("select * from users where email=$1",[email])
    }
    getpass(mail){
        return db.query("select password from accounts where  provider_account_id=$1",[mail])
    }
    checkGG(gg){
        return db.query("select * from accounts where provider_account_id=$1",[gg])
    }
    checkPass(pass){
        return db.query("select * from accounts where password=$1",[pass])
    }
    // kiểm tra user id còn hoạt động và tồn tại không
    checkActive(user_id){
        return db.query("select * from users where id=$1",[user_id]);
    }
    // lưu refresh token
    saveRefreshToken(token, id){
        return db.query("INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)", [token, id]);
    }
    // kiểm tra refresh token
    checkRefreshToken(id){
        return db.query("select * from refresh_tokens where user_id=$1",[id]);
    }
    //xóa refresh token
    deleteRefreshToken(id) {
        return db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [id]);
    }
}
module.exports = new AuthModel();