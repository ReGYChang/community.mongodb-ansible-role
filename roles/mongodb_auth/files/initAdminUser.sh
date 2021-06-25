mongo --port $0 <<EOF
use admin;
db.createUser({user:$1,pwd:$2,roles:[{role:"root",db:"admin"}]})
EOF