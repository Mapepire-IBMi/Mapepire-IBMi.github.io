---
title: Python
description: Using Mapepire with Python
sidebar:
    order: 4
---

Find the source code for the python client: [client SDK project page](https://github.com/Mapepire-IBMi/mapepire-python).

`mapepire-python` is a Python client implementation for [Mapepire](https://github.com/Mapepire-IBMi) that provides a simple interface for connecting to an IBM i server and running SQL queries. The client is designed to work with the [Mapepire Server Component](https://github.com/Mapepire-IBMi/mapepire-server)

## Setup

`mapepire-python` requires Python 3.10 or later.

:::note
New websocket Implementation: As of version 0.2.0, `mapepire-python` uses the `websockets` library for websocket connections. If you are upgrading from a previous version, make sure to update your dependencies. The `websocket-client` library is no longer supported.
- To update run `pip install -U mapepire-python`
- More info on [websockets](https://websockets.readthedocs.io/en/stable/)
:::

### Install with `pip`

`mapepire-python` is available on [PyPi](https://pypi.org/project/mapepire-python/). Just Run

```bash
pip install mapepire-python
```

### Server Component Setup
To use `mapepire-python`, you will need to have the Mapepire Server Component running on your IBM i server. Follow these instructions to set up the server component: [Mapepire Server Installation](https://mapepire-ibmi.github.io/guides/sysadmin/)

## Quick Start

To get started with `mapepire-python`, you will need to set up connection credentials for the Mapepire server. You can use a dictionary to store the connection details:

```python
from mapepire_python import connect

creds = {
  "host": "SERVER",
  "port": 8076,
  "user": "USER",
  "password": "PASSWORD",
}

with connect(creds) as conn:
    with conn.execute("select * from sample.employee") as cursor:
        result = cursor.fetchone()
        print(result)

```

## Other Connection Options

:::note
TLS support as of version 0.3.0 is now available. Server certificate verification is enabled by default. To disable certificate verification, set the `ignoreUnauthorized` field to `True` in the connection details.
- To update run `pip install -U mapepire-python`
- More info TLS Configuration [here](#tls-configuration)
:::

There are four ways to configure Mapepire server connection details using `mapepire-python`:

1. Using the `DaemonServer` object
2. Passing the connection details as a dictionary
3. Using a config file (`.ini`) to store the connection details
4. Using environment variables

### 1. Using the `DaemonServer` object

`DaemonServer` is importable directly from `mapepire_python`:

```python
from mapepire_python import DaemonServer

creds = DaemonServer(
    host="SERVER",
    port="PORT",
    user="USER",
    password="PASSWORD"
)
```

Once you have created the `DaemonServer` object, you can pass it to the `SQLJob` object to connect to the Mapepire server:

```python
from mapepire_python import SQLJob, DaemonServer

creds = DaemonServer(
    host="SERVER",
    port="PORT",
    user="USER",
    password="PASSWORD"
)

job = SQLJob(creds)
```

#### 1.1 Authenticating with Kerberos

If your IBM i is configured to support Kerberos authentication, you can authenticate using Kerberos instead of passing a plain-text password to the `DaemonServer` object.

##### 1.1.1 Windows

If your Windows machine is part of a Kerberos realm and supports SSPI authentication, you can authenticate by creating the `DaemonServer` as shown below:

```python
from mapepire_python import DaemonServer, SQLJob
from mapepire_python.authentication.kerberosTokenProvider import KerberosTokenProvider

creds = DaemonServer(
    host="SERVER",
    password=KerberosTokenProvider(host="SERVER"),
    user="USER",
    port="PORT",
)

job = SQLJob(creds)
```

##### 1.1.2 Other Platforms

For non-Windows platforms, Kerberos authentication requires a valid Ticket Granting Ticket (TGT) in your credential cache.

Required parameters:

- `host`: The IBM i host you are connecting to
- `realm`: Your Kerberos realm
- `realm_user`: Your Kerberos username
- `krb5_path`: Path to your `krb5.conf` configuration file

Optional parameters:

- `ticket_cache`: Path to your ticket cache (if not the default location)
- `krb5_mech`: The Kerberos 5 mechanism to use (if not the default)

```python
from mapepire_python import DaemonServer, SQLJob
from mapepire_python.authentication.kerberosTokenProvider import KerberosTokenProvider

token_provider = KerberosTokenProvider(
    realm="REALM",
    realm_user="REALM_USER",
    host="SERVER",
    krb5_path="/etc/krb5.conf"
)

creds = DaemonServer(
    host="SERVER",
    password=token_provider,
    user="USER",
    port="PORT",
)

job = SQLJob(creds)
```

### 2. Passing the connection details as a dictionary

You can also use a dictionary to configure the connection details:

```python
from mapepire_python import SQLJob

creds = {
  "host": "SERVER",
  "port": "port",
  "user": "USER",
  "password": "PASSWORD",
}

job = SQLJob(creds)
```

This is a convenient way to pass the connection details to the Mapepire server.

### 3. Using a config file (`.ini`) to store the connection details


If you use a config file (`.ini`), you can pass the path to the file as an argument:

First create a `mapepire.ini` file in the root of your project with the following required fields:

```ini title=mapepire.ini
[mapepire]
host=SERVER
port=PORT
user=USER
password=PASSWORD
```

> **Note:** The keys must match the `DaemonServer` fields (`host`, `port`, `user`, `password`), and values must **not** be quoted — write `host=myhost`, not `host="myhost"`.

Then you can create a `SQLJob` object by passing the path to the `.ini` file which will handle the connection details


```python
from mapepire_python import SQLJob

job = SQLJob("./mapepire.ini", section="mapepire")
```

The `section` argument is optional and allows you to specify a specific section in the `.ini` file where the connection details are stored. This allows you to store multiple connection details to different systems in the same file. If you do not specify a `section`, the first section in the file will be used.

### 4. Using environment variables

You can configure connection credentials through environment variables, avoiding the need to pass them explicitly in code:

| Variable | Required | Default | Description |
|---|---|---|---|
| `MAPEPIRE_HOST` | Yes | — | Server hostname |
| `MAPEPIRE_USER` | Yes | — | Database user |
| `MAPEPIRE_PASSWORD` | Yes | — | Database password |
| `MAPEPIRE_PORT` | No | `8076` | Server port |
| `MAPEPIRE_CA_PATH` | No | — | Path to CA certificate file |

Set the variables in your shell:

```bash
export MAPEPIRE_HOST=myibmi.example.com
export MAPEPIRE_USER=myuser
export MAPEPIRE_PASSWORD=mypassword
```

Then `connect()` and `async_connect()` can be called with no arguments:

```python
from mapepire_python import connect

with connect() as conn:
    with conn.execute("select * from sample.employee") as cursor:
        print(cursor.fetchone())
```

You can also create a `DaemonServer` directly from environment variables:

```python
from mapepire_python import DaemonServer, SQLJob

creds = DaemonServer.from_env()
job = SQLJob(creds)
```

### TLS Configuration

Server certificate verification (`ssl.CERT_REQUIRED`) is enabled by default. To disable certificate verification, set the `ignoreUnauthorized` field to `True` in the connection details.

Get the server certificate:

```python
from mapepire_python import DaemonServer
from mapepire_python.ssl import get_certificate

creds = DaemonServer(host=server, port=port, user=user, password=password)
cert = get_certificate(creds)
print(cert)
```

:::caution
Validation of self-signed certificates is currently not supported. You can track the progress of this issue [here](https://github.com/Mapepire-IBMi/mapepire-server/issues/28).
:::

## Logging

`mapepire-python` emits structured logs through the standard library `logging` module. Following library best practice, it does not configure any handlers itself, so logging is silent until your application opts in. Each module logs under the `mapepire_python` namespace:

```python
import logging

# Enable INFO-level logs from mapepire-python
logging.basicConfig(level=logging.INFO)

# Enable DEBUG-level logs for more detail
logging.getLogger("mapepire_python").setLevel(logging.DEBUG)
```

## Running Queries

The following examples all assume that the connection details are stored in a `.ini` file called `mapepire.ini` in the root of the project. All four connection options from [Other Connection Options](#other-connection-options) are interchangeable anywhere a credentials argument is accepted.

There are four main ways to run queries using `mapepire-python`:
1.  Using the `SQLJob` object to run queries synchronously
2.  Using the `PoolJob` object to run queries asynchronously
3.  Using the `Pool` object to run queries "concurrently"
4.  Using PEP 249 Implementation

### 1. Using the `SQLJob` object to run queries synchronously

Using Python context managers, the `SQLJob` object can be used to create and run queries synchronously. `sql_job` and `query` objects are automatically closed after running the query.

```python
from mapepire_python import SQLJob

with SQLJob("./mapepire.ini") as sql_job:
    with sql_job.query("select * from sample.employee") as query:
        result = query.run(rows_to_fetch=1)
        print(result)
```

Here is the output from the script above:

```json
{
  "id": "query-1",
  "has_results": true,
  "update_count": -1,
  "metadata": {
    "columns": [
      { "name": "EMPNO",    "type": "CHAR",    "display_size": 6  },
      { "name": "FIRSTNME", "type": "VARCHAR", "display_size": 12 },
      { "name": "LASTNAME", "type": "VARCHAR", "display_size": 15 }
    ]
  },
  "data": [
    {
      "EMPNO": "000010",
      "FIRSTNME": "CHRISTINE",
      "MIDINIT": "I",
      "LASTNAME": "HAAS",
      "WORKDEPT": "A00",
      "PHONENO": "3978",
      "HIREDATE": "01/01/65",
      "JOB": "PRES",
      "EDLEVEL": 18,
      "SEX": "F",
      "BIRTHDATE": "None",
      "SALARY": 52750.0,
      "BONUS": 1000.0,
      "COMM": 4220.0
    }
  ],
  "is_done": false,
  "success": true
}
```

The result object is a JSON object that contains the metadata and data from the query. Here are the different fields returned:
- `id` — the query ID
- `has_results` — whether the query returned any rows
- `update_count` — number of rows updated by the query (`-1` if the query was not an update)
- `metadata` — information about the columns returned by the query (name, type, display size, etc.)
- `data` — the result rows
- `is_done` — whether all rows have been fetched
- `success` — whether the query executed successfully

#### Query and run

To create and run a query in a single step, use the `query_and_run` method:

```python
from mapepire_python import SQLJob

with SQLJob("./mapepire.ini") as sql_job:
    # query automatically closed after running
    results = sql_job.query_and_run("select * from sample.employee", rows_to_fetch=1)
    print(results)
```

### 2. Using the `PoolJob` object to run queries asynchronously

The `PoolJob` object can be used to create and run queries asynchronously:

```python
import asyncio
from mapepire_python import PoolJob

async def main():
    async with PoolJob("./mapepire.ini") as pool_job:
        async with pool_job.query('select * from sample.employee') as query:
          res = await query.run(rows_to_fetch=1)

if __name__ == '__main__':
    asyncio.run(main())

```

To create and run a query asynchronously in a single step, use the `query_and_run` method:

```python
import asyncio
from mapepire_python import PoolJob

async def main():
    async with PoolJob("./mapepire.ini") as pool_job:
        res = await pool_job.query_and_run("select * from sample.employee", rows_to_fetch=1)
        print(res)

if __name__ == '__main__':
    asyncio.run(main())

```


### 3. Using the `Pool` object to run queries "concurrently"

The `Pool` object can be used to create a pool of `PoolJob` objects to run queries concurrently. As of 0.3.0, pool connections are initialized in parallel and queries are distributed to the least-loaded connection, spreading concurrent work across all available connections instead of serializing onto one.

```python
import asyncio
from mapepire_python import Pool, PoolOptions

async def main():
    async with Pool(
        options=PoolOptions(
            creds="./mapepire.ini",
            opts=None,
            max_size=5,
            starting_size=3
        )
    ) as pool:
      job_names = []
      resultsA = await asyncio.gather(
          pool.execute('values (job_name)'),
          pool.execute('values (job_name)'),
          pool.execute('values (job_name)')
      )
      job_names = [res['data'][0]['00001'] for res in resultsA]

      print(job_names)


if __name__ == '__main__':
    asyncio.run(main())
```
This script will create a pool of 3 `PoolJob` objects and run the query `values (job_name)` concurrently. The results will be printed to the console.

```bash
['004460/QUSER/QZDASOINIT', '005096/QUSER/QZDASOINIT', '005319/QUSER/QZDASOINIT']
```

### 4. Using PEP 249 Implementation

PEP 249 is the Python Database API Specification v2.0. The `mapepire-python` client provides a PEP 249 implementation that allows you to use the `Connection` and `Cursor` objects to interact with the Mapepire server. Like the examples above, we can pass the `mapepire.ini` file to the `connect` function to create a connection to the server:

```python
from mapepire_python import connect

with connect("./mapepire.ini") as conn:
    with conn.execute("select * from sample.employee") as cursor:
        result = cursor.fetchone()
        print(result)
```

#### `fetchmany()` and `fetchall()` methods

The `Cursor` object provides the `fetchmany()` and `fetchall()` methods to fetch multiple rows from the result set:

```python
with connect("./mapepire.ini") as conn:
    with conn.execute("select * from sample.employee") as cursor:
        results = cursor.fetchmany(size=2)
        print(results)
```
---

```python
with connect("./mapepire.ini") as conn:
    with conn.execute("select * from sample.employee") as cursor:
        results = cursor.fetchall()
        print(results)
```

### PEP 249 Asynchronous Implementation

The PEP 249 implementation provides a native async interface backed by non-blocking WebSocket I/O — no thread delegation. Use `async_connect` from the top-level package, or `connect` from `mapepire_python.asyncio`:

```python
import asyncio
from mapepire_python import async_connect

async def main():
    async with async_connect("./mapepire.ini") as conn:
        async with await conn.execute("select * from sample.employee") as cursor:
            result = await cursor.fetchone()
            print(result)

if __name__ == '__main__':
    asyncio.run(main())
```

Fetch multiple rows at once with `fetchmany` or drain the full result set with `fetchall`:

```python
import asyncio
from mapepire_python import async_connect

async def main():
    async with async_connect("./mapepire.ini") as conn:
        async with await conn.execute("select * from sample.employee") as cursor:
            page = await cursor.fetchmany(10)   # first 10 rows
            rest = await cursor.fetchall()       # remaining rows

if __name__ == '__main__':
    asyncio.run(main())
```

Stream rows one at a time using `async for`:

```python
import asyncio
from mapepire_python import async_connect

async def main():
    async with async_connect("./mapepire.ini") as conn:
        async for row in await conn.execute("select * from sample.employee"):
            print(row)

if __name__ == '__main__':
    asyncio.run(main())
```

## Allow all certificates

On the `DaemonServer` interface, setting `ignoreUnauthorized=True` will allow either self-signed certificates or certificates from a CA.

:::caution
Validation of self-signed certificates is currently not supported. You can track the progress of this issue [here](https://github.com/Mapepire-IBMi/mapepire-server/issues/28).
:::
