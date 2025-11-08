const bcrypt = require('bcryptjs'); 

    hashPassword = async (password) => {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }
    checkHashPass=async (password,hash) =>{
     const check=await bcrypt.compare(password,hash)
    //  console.log('check12',check);
     
        if(check){
            return true
        }else{
            return false
        }
    }
module.exports={hashPassword,checkHashPass}
