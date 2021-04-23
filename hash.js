const crypto = require("crypto");

exports.encode = async function (salt, msg) {
  // console.log("hashing string: " + msg);
  // console.log("salt: " + salt);

  return await new Promise((resolve, reject) => {
    crypto.pbkdf2(msg, salt, 100000, 64, "sha512", (err, hashedKey) => {
      if (err) reject(err);
      else resolve(hashedKey);
    });
  })
    .then((hashedKey) => {
      return hashedKey;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  // .then((hashedKey)=>{

  // console.log("hashed Key is : ")
  // console.log(hashedKey);

  // });
};

// exports.encrypt = function(lookUp, key){
//   // let salt  = lookUp.split('');
//   // let msg = key.split('');
//   //
//   //
//   // let newMsg = [];
//   // for(let i = 0; i < 3; i++){
//   //   newMsg.push(salt.splice(0,7).join(''));
//   //
//   // if(msg.length > 0)
//   //   newMsg.push(msg.splice(0,7).join(''));
//   // }
//   //
//   // newMsg = newMsg.join('');
//
//
//
// }
