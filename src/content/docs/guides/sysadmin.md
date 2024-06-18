---
title: For system admins
description: Installing the Apron Daemon
---

In order for apps to use Db2 for i with Apron clients from their runtimes, the Daemon must be installed and started-up on each IBM i. This is a simple process and there are many ways to achieve it.

### Installation

#### yum

```sh
yum install apron-daemon
```

#### App Installer

```sh
# jesse to fill this in
app-inst apron-daemon
```

#### From latest build

```
wget github.com/x/y/z
```

### Startup

After installing the Daemon, you must start it up once. The good news, is once it has started up, it can be just left running.

#### Shell

```sh
apron /
```

#### Service Commander

```sh
# jesse pls
sc start apron
```

#### Submit Job

```sh
SBMJOB NAME(apron) CMD(QSH('/x/y/z/apron'))
```

### Configuration

The following are the defaults for Apron. It is not recommended to change them.

* `port`: `8076`
* `secure`: always on. It is up to the clients to ensure they're encrypted.