---
title: For system admins
description: Installing the Mapepire Daemon
---

In order for apps to use Db2 for i with Mapepire clients from their runtimes, the Daemon must be installed and started-up on each IBM i. This is a simple process and there are many ways to achieve it.

### Installation

#### yum

```sh
yum install Mapepire-daemon
```

#### App Installer

```sh
# jesse to fill this in
app-inst Mapepire-daemon
```

#### From latest build

```
wget github.com/x/y/z
```

### Startup

After installing the Daemon, you must start it up once. The good news, is once it has started up, it can be just left running.

#### Shell

```sh
Mapepire /
```

#### Service Commander

```sh
# jesse pls
sc start Mapepire
```

#### Submit Job

```sh
SBMJOB NAME(Mapepire) CMD(QSH('/x/y/z/Mapepire'))
```

### Configuration

The following are the defaults for Mapepire. It is not recommended to change them.

* `port`: `8076`
* `secure`: always on. It is up to the clients to ensure they're encrypted.