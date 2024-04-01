---
title: For system admins
description: Installing the wsdb Daemon
---

In order for apps to use Db2 for i with wsdb clients from their runtimes, the Daemon must be installed and started-up on each IBM i. This is a simple process and there are many ways to achieve it.

### Installation

#### yum

```sh
yum install wsdb-daemon
```

#### App Installer

```sh
# jesse to fill this in
app-inst wsdb-daemon
```

#### From latest build

```
wget github.com/x/y/z
```

### Startup

After installing the Daemon, you must start it up once. The good news, is once it has started up, it can be just left running.

#### Shell

```sh
wsdb /
```

#### Service Commander

```sh
# jesse pls
sc start wsdb
```

#### Submit Job

```sh
SBMJOB NAME(WSDB) CMD(QSH('/x/y/z/wsdb'))
```

### Configuration

The following are the defaults for WSDB. It is not recommended to change them.

* `port`: `8076`
* `secure`: always on. It is up to the clients to ensure they're encrypted.