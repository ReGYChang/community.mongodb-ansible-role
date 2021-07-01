# Ansible roles for MongoDB

> Ansible roles to install and manage [MongoDB](http://www.mongodb.org/).

Features:
- Configure operating system
- Install the MongoDB packages
- Configure and start MongoDB service
- Configure and buildup Config servers
- Configure authentication
- Configure replica set
- Configure sharded cluster
- Backup MongoDB data automatically
- Restore MongoDB data automatically

# Usage
> Select the roles you need and combine them into playbook

Example playbook for setup a replica set cluster:
```yaml
- hosts: mongodbsvrs
  vars:
    - mongodb_master: mongodb-ansible-1

  tasks:
    - name: Confiure Operating System
      include_role:
        name: mongodb_linux

    - name: Install MongoDB Packages
      include_role:
        name: mongodb_install

    - name: Setup of MongoDB Service
      include_role:
        name: mongodb_mongod

    - name: Initialise MongoDB Replicaset
      mongodb_replicaset:
        login_database: "admin"
        login_host: localhost
        replica_set: "rs0"
        members:
          - "ansible-1"
          - "ansible-2"
          - "ansible-3"
      when: ansible_hostname == mongodb_master
      register: repl

    - name: Initialise MongoDB Replicaset Authentication
      include_role:
        name: mongodb_auth
      vars:
        mongod_host: "127.0.0.1"
        mongodb_admin_pwd: "admin"
      when: ansible_hostname == mongodb_master
```

# Variables
mongodb_linux
```yaml
# /etc/hosts
mongodb_hosts: |
  10.140.0.31 ansible-1 # Add by Ansible
  10.140.0.67 ansible-2 # Add by Ansible
  10.140.0.68 ansible-3 # Add by Ansible

# Packages for RedHat-7 distros
ntp_package: ntp
ntp_service: ntpd
gnu_c_lib: glibc

# swappiness is 0-100; 60 is the default on many distros.
# 0=disable swapping; 1=swap only to avoid OOM; 60=swap often; 100=swap aggressively
swappiness: "1"

# TODO: mongo suggests infinity here
memlock_limit: 1024
```

mongodb_install
```yaml
# `mongodb_version` variable sets version of MongoDB.
# Should be '4.2'. This role doesn't support MongoDB without 4.2 yet.
mongodb_version: 4.2.14
```

mongodb_mongod
```yaml
mongodb_user: "mongod"
mongodb_group: "mongod"
mongod_service: "mongod"

mongod_config_template: "mongod.conf.j2"

# mongodb
db_path: /data
mongod_port: 27017
bind_ip: 0.0.0.0

# security
authorization: "enabled"
mongodb_admin_user: admin
mongodb_admin_pwd: admin

# replicaset
repl_set_name: rs0
openssl_keyfile_content: |
  Z2CeA9BMcoY5AUWoegjv/XWL2MA1SQcL4HvmRjYaTjSp/xosJy+LL2X3OQb1xVWC
  rO2e6Tu6A3R4muunitI6Vr0IKeU5UbTpR0N4hSU6HDrV9z2PIEWlkQqKh01ZRLEY
  V3hR73acj0jA8eWIWeiV039d18jvMb8X2h8409lfcD6PPJJGjyaC8S4LY/TrsK2z
  tx+l/vqOOAMhGB5mEMjx1LXUMsRG9ot6vFu9I5LPd1A4q9xw9jddYK5C6YTLccun
  ZyCDsv7ImkCprV0+0vhTyxIEnfaNtvOlWypuvmRr/DEyd2NPowd1n6C+rgk8gs1t
  SGLCZP93gXza0rIoQzHtuf5pOJK9qyKjuNtuuLa/KFsida8a69JXn7fmS0IIja0m
  Ir0OrQ2Ta3n4VbQwQo97BWODWmkgzz0mUd6VmMps5zLsCW1vVqYFQHuAAbLekW0q
  8JRm8OQ6n2hp8j4zYd3/Qw7vqsVj8sHicNB0bCW29b64H4f2J/AcUA/cm0xSUQyb
  +myeCB4vWvydh5AfFVnw7sXvzU6egaYRomdmrl59QrTDneJu13hwzIchsFparoWJ
  XjpldopGeDaJLU18ga7MSL02ozB+EoJ14DJxQU7E5MQk7fDMPeitXKZ8ymxb7LeA
  k0Rtc/JQM8aDLoRklhLZRRARBrv1RLo8DM8CB2q4s+FwVU4QJl7mFyiwk3eTN6sN
  PTgFRo3/dHsEA2OwGG+hnGFGnoYf2mkECR5jqai83CXgva9v2rPNjDTJYHpmd3I0
  fNijueXZZdzUA58y8mcoSGVYdRhr0g8jaWQ12PZEgX5Nnlekh5GHG0j8HT4qj/0Y
  D3xVuE3WvrhldY5EOsaTt2ZXZx5REmJDIW1KcnvQKiVDJ2QzP5xdXYA0hh3TdTVE
  sb4UreMw/WyBpANiICMlJRBgSd0f0VGMlYzLX2BL14YpNnLhmoQqKzfBN6v2XAEG
  mJfrCUVuP1nBEklk23lYkNi/ohe+aodNjdN+2DHp42sGZHYP
replicaset: true
sharding: false

skip_restart: true
```

mongodb_auth
```yaml
# defaults file for mongodb_auth
mongodb_port: 27017

authorization: "enabled"

# when adding auth, the login credentials to use
mongodb_admin_user: admin
# For production use - please change the admin password!
mongodb_admin_pwd: "{{ mongodb_default_admin_pwd }}"
# The default is separate so other roles can provide a default without overriding a user provided password.
mongodb_default_admin_pwd: admin
# allow for alternate admin roles (eg userAdminAnyDatabase)
mongodb_admin_roles: "root"

# Additional users to add.
mongodb_users: []
#  - db: somedatabase
#    user: someuser
#    pwd: "S0meP@ss"
#    roles: readWrite

# whether or not to force a password update for any users in mongodb_users
# Setting this to yes will result in 'changed' on every run, even if the password is the same.
# See the comment in tasks/main.yml for more details.
mongodb_force_update_password: no

pyyaml_package: PyYAML
mongodb_python: "{{ ansible_python_interpreter | default( (ansible_python|default({})).get('executable', 'python') ) }}"
```