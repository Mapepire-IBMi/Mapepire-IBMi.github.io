---
title: For system admins
description: Installing the Mapepire Daemon
---

In order for apps to use Db2 for i with Mapepire clients from their runtimes, the Daemon must be installed and started-up on each IBM i. This is a simple process and there are many ways to achieve it.

### Installation

#### Option 1: RPM (recommended)

```sh
yum install mapepire-server
```

#### Option 2: manual installation

1. Make a "download" directory on IBM i by running the following from an SSH terminal:

```sh
mkdir -p /opt/download
```

2. Download the distribution zip file (filename will look something like `mapepire-server-v___.zip`) from the [release page](https://github.com/Mapepire-IBMi/mapepire-server/releases/) and save it to the download directory you created. Rename the file to `mapepire-server-dist.zip`

If you have `wget` installed and have internet access, you could use wget to download the file from IBM i, for instance (replace with proper version): 

```sh
cd /opt/download
wget -O mapepire-server-dist.zip https://github.com/Mapepire-IBMi/mapepire-server/releases/download/v2.0.3/mapepire-server-2.0.3.zip
```

3. Unzip the file and reset ownership/permissions
```sh
cd /opt
jar xvf /opt/download/mapepire-server-dist.zip
chown -R qsys mapepire
```


### Startup

After installing the Daemon, you must start it up once. The good news, is once it has started up, it can be just left running.

#### Service Commander (recommended)

If you are running the RPM version of the mapepire server, you can install service commander (`yum install service-commander`) and use it to start the mapepire service:

```sh
sc start mapepire
```

#### Manual shell invocation

```sh
nohup /opt/mapepire/bin/mapepire &
```

### Configuration

The following are the defaults for Mapepire. It is not recommended to change them.

* `port`: `8076`
* `secure`: always on. It is up to the clients to ensure they're encrypted.
