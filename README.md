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
        mongodb_host: "127.0.0.1"
        mongodb_admin_pwd: "admin"
      when: ansible_hostname == mongodb_master
```

# Variables
## Required
### linux config
- mongodb_hosts: FQDN of your server.

### install config
- mongodb_version: The version of the mongo binary packages. Default `4.2.14`.

### mongod config
- mongodb_master: The initial primary mongod instance.
- db_path: The directory where the mongod instance stores its data. Default `/data`.
- log_path: The path of the log file to which mongod or mongos should send all diagnostic logging information. Default `/data/log`.
- mongodb_port: The port used by the mongod process. Default `27017`.
- bind_ip: The IP address mongod will bind to. Default `0.0.0.0`.

### cluster config
- openssl_keyfile_content: The path to a key file that stores the shared secret that MongoDB instances use to authenticate to each other in a sharded cluster or replica set. Should regenerate a brand new keyfile with `openssl` when initial.
- replicaset: When enabled add a replication section to the configuration. Default `true`.
- sharding: If this replicaset member will form part of a sharded cluster. Default `false`.

### rs config
- repl_set_name: The name of the replica set that the mongod is part of. Default `rs0`.
- replica_set_members: Consisting of the replicaset members.

### auth config
- authorization: Enable authorization. Default `enabled`.
- mongodb_admin_user: MongoDB admin username. Default `admin`.
- mongodb_admin_pwd: MongoDB admin username. Default `admin`.
- mongodb_admin_roles: allow for alternate admin roles (eg userAdminAnyDatabase)

## Optional
### linux config
- Packages for RedHat-7 distros
  - ntp_package: ntp
  - ntp_service: ntpd
  - gnu_c_lib: glibc

<!-- 0=disable swapping; 1=swap only to avoid OOM; 60=swap often; 100=swap aggressively -->
- swappiness: swappiness is 0-100; 60 is the default on many distros. Default `"1"`
### mongod config
- mongodb_user: The Linux OS user for MongoDB. Default `mongod`.
- mongodb_group: The Linux OS user group for MongoDB. Default `mongod`.
- mongod_service: The name of the mongod service. Default `mongod`.
- mongod_config_template: If defined allows to override path to mongod config template with custom configuration. Default `mongod.conf.j2`
- skip_restart: If set to true will skip restarting mongod service when config file or the keyfile content changes. Default `true`.