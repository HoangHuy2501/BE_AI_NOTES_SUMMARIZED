const db = require('../config/ConnectData')
module.exports={
    selectUser(email){
        return db.query("select u.id, u.name,u.email,r.name as role   FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON r.id = ur.role_id where email=$1",[email])
    },
    async createUser(user) {
  // 1. Insert vào bảng users, lấy id trả về
  const resultUser = await db.query(
    "INSERT INTO users(name,email,role,active,image) VALUES($1,$2,$3,$4,$5) RETURNING id",
    [user.name, user.email, 'user', true, user.image]
  );
  const userId = resultUser.rows[0].id;
  // thêm vào role (viewer)
  await db.query("INSERT INTO user_roles(user_id,role_id) VALUES($1,`c650c38e-9987-4ecd-abcb-680d4a363178`)", [userId]);
  // 2. Insert vào bảng account với user_id lấy được
  const resultAccount = await db.query(
    "INSERT INTO accounts (user_id,provider,provider_account_id,type,password,active) VALUES($1,$2,$3,$4,$5,$6)",
    [userId, 'credentials', user.email, 'email', user.password, true]
  );

  // Trả về kết quả thành công (có thể là dữ liệu user hoặc đơn giản là true)
  return { userId };
},
    checkMail(email){
        return db.query("select * from users where email=$1",[email])
    },
    getpass(mail){
        return db.query("select password from accounts where  provider_account_id=$1",[mail])
    },
    checkGG(gg){
        return db.query("select * from accounts where provider_account_id=$1",[gg])
    },
    checkPass(pass){
        return db.query("select * from accounts where password=$1",[pass])
    },
    // kiểm tra user id còn hoạt động và tồn tại không
    checkActive(user_id){
        return db.query("select * from users where id=$1",[user_id]);
    }
}