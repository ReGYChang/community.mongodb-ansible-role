var mongodb_admin_user = process.argv[0];
var mongodb_admin_pwd = process.argv[1];

db = db.getSiblingDB('admin');
db.createUser(
 {
   user: mongodb_admin_user,
   pwd: mongodb_admin_pwd,
   roles: [
    { role: "root", db: "admin" }
   ]
 }
);
