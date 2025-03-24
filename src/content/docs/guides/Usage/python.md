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
New websocket Implementation: As of version 0.2.0, `mapepire-python` uses the `websockets` library for websocket connections. If you are upgrading from a previous version, make sure to update your dependecies. The `websocket-client` library is no longer supported.
- To update run `pip install -U mapepire-python`
- More info on [websockets](https://websockets.readthedocs.io/en/stable/)
:::


### Install with `pip`

`mapepire-python` is available on [PyPi](https://pypi.org/project/mapepire-python/). Just Run

```bash
pip install mapepire-python
```

### Server Component Setup
To use mapire-python, you will need to have the Mapepire Server Component running on your IBM i server. Follow these instructions to set up the server component: [Mapepire Server Installation](https://mapepire-ibmi.github.io/guides/sysadmin/)

## Quick Start

To get started with `mapepire-python`, you will need to setup a connection credentials for the Mapepire server. You can use a dictionary to store the connection details:

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

## Other Connection options

 > [!NOTE]
 >  TLS support as of version 0.3.0 is now available. Server certificate verification is enabled by default. To disable certificate verification, set the `ignoreUnauthorized` field to `True` in the connection details.
 > - To update run `pip install -U mapepire-python`
 >
 > - More info TLS Configuration [here](#tls-configuration)

:::note
TLS support as of version 0.3.0 is now available. Server certificate verification is enabled by default. To disable certificate verification, set the `ignoreUnauthorized` field to `True` in the connection details.
- To update run `pip install -U mapepire-python`
- More info TLS Configuration [here](#tls-configuration)
:::

 

There are three ways to configure mapepire server connection details using `mapepire-python`:

1. Using the `DaemonServer` object
2. Passing the connection details as a dictionary
3. Using a config file (`.ini`) to store the connection details

### 1. Using the `DaemonServer` object

to use the `DaemonServer` object, you will need to import the `DaemonServer` class from the `mapepire_python.data_types` module:

```python
from mapepire_python.data_types import DaemonServer

creds = DaemonServer(
    host="SERVER",
    port="PORT",
    user="USER",
    password="PASSWORD"
)
```

Once you have created the `DaemonServer` object, you can pass it to the `SQLJob` object to connect to the mapepire server:

```python
from mapepire_python.client.sql_job import SQLJob
from mapepire_python.data_types import DaemonServer

creds = DaemonServer(
    host="SERVER",
    port="PORT",
    user="USER",
    password="PASSWORD"
)

job = SQLJob(creds)
```

### 2. Passing the connection details as a dictionary

You can also use a dictionary to configure the connection details:

```python
from mapepire_python.client.sql_job import SQLJob

creds = {
  "host": "SERVER",
  "port": "port",
  "user": "USER",
  "password": "PASSWORD",
}

job = SQLJob(creds)
```

this is a convenient way to pass the connection details to the mapepire server.

### 3. Using a config file (`.ini`) to store the connection details


If you use a config file (`.ini`), you can pass the path to the file as an argument:

First create a `mapepire.ini` file in the root of your project with the following required fields:

```ini title=mapepire.ini
[mapepire]
SERVER="SERVER"
PORT="PORT"
USER="USER"
PASSWORD="PASSWORD"
```

Then you can create a `SQLJob` object by passing the path to the `.ini` file which will handle the connection details


```python
from mapepire_python.client.sql_job import SQLJob

job = SQLJob("./mapepire.ini", section="mapepire")
```

The `section` argument is optional and allows you to specify a specific section in the `.ini` file where the connection details are stored. This allows you to store multiple connection details to different systems in the same file. If you do not specify a `section`, the first section in the file will be used. 

### TLS Configuration

Server certificate verification (`ssl.CERT_REQUIRED`) is enabled by default. To disable certificate verification, set the `ignoreUnauthorized` field to `True` in the connection details.

get the server certificate:

```python
from mapepire_python.data_types import DaemonServer
from mapepire_python.ssl import get_certificate

creds = DaemonServer(host=server, port=port, user=user, password=password)
cert = get_certificate(creds)
print(cert)
```



## Usage

Depending on your setup and use case, you can choose the most convenient way to configure the connection details. The following usage examples are compatible with all three connection options detailed above. For simplicity, we assume there is a `mapepire.ini` file in the root of the project with the connection details.


There are four main ways to run queries using `mapepire-python`:
1.  Using the `SQLJob` object to run queries synchronously
2.  Using the `PoolJob` object to run queries asynchronously
3.  Using the `Pool` object to run queries "concurrently"
4.  Using PEP 249 Implementation



### 1. Using the `SQLJob` object to run queries synchronously

```python
from mapepire_python.client.sql_job import SQLJob

with SQLJob("./mapepire.ini") as sql_job:
    with sql_job.query("select * from sample.employee") as query:
        result = query.run(rows_to_fetch=1)
        print(result['data'])
```

Here is the output from the script above:

```json
{
  "data":[
    {
      "EMPNO":"000010",
      "FIRSTNME":"CHRISTINE",
      "MIDINIT":"I",
      "LASTNAME":"HAAS",
      "WORKDEPT":"A00",
      "PHONENO":"3978",
      "HIREDATE":"01/01/65",
      "JOB":"PRES",
      "EDLEVEL":18,
      "SEX":"F",
      "BIRTHDATE":"None",
      "SALARY":52750.0,
      "BONUS":1000.0,
      "COMM":4220.0
    }
  ],
  "is_done":false,
  "success":true
}

```
The results object is a JSON object that contains the metadata and data from the query. Here are the different fields returned:
- `id` field contains the query ID
- `has_results` field indicates whether the query returned any results
- `update_count` field indicates the number of rows updated by the query (-1 if the query did not update any rows)
- `metadata` field contains information about the columns returned by the query
- `data` field contains the results of the query 
- `is_done` field indicates whether the query has finished executing
- `success` field indicates whether the query was successful. 

### Configure Connection Details with `.ini` file

The connection details can be stored in a `.ini` file and passed directly to `SQLJob` or `PoolJob` objects:

```ini title=mapepire.ini
[myserver]
SERVER="SERVER"
PORT="PORT"
USER="USER"
PASSWORD="PASSWORD"
```

Then pass the path to the `.ini` file and the section name to the `SQLJob` object:

```python
from mapepire_python.client.sql_job import SQLJob

with SQLJob("./mapepire.ini", section="myserver") as sql_job:
    with sql_job.query("select * from sample.employee") as query:
        result = query.run(rows_to_fetch=1)
        print(result)
```

If `section` is not provided, the first section in the `.ini` file will be used.


## Running Queries

The following examples all assume that the connection details are stored in a `.ini` file called `mapepire.ini` in the root of the project.

There are four main ways to run queries using `mapepire-python`:
1.  Using the `SQLJob` object to run queries synchronously
2.  Using the `PoolJob` object to run queries asynchronously
3.  Using the `Pool` object to run queries "concurrently"
4.  Using PEP 249 Implementation
  
### 1. Using the `SQLJob` object to run queries synchronously

Using python context managers, the `SQLJob` object can be used to create and run queries synchronously. `sql_job` and `query` objects are automatically closed after running the query.

```python
from mapepire_python.client.sql_job import SQLJob

with SQLJob("./mapepire.ini") as sql_job:
    with sql_job.query("select * from sample.employee") as query:
        result = query.run(rows_to_fetch=1)
        print(result)
```

#### Query and run 

To create and run a query in a single step, use the `query_and_run` method: 

```python
from mapepire_python.client.sql_job import SQLJob

with SQLJob("./mapepire.ini") as sql_job:
    # query automatically closed after running
    results = sql_job.query_and_run("select * from sample.employee", rows_to_fetch=1)
    print(result)
```

### 2. Using the `PoolJob` object to run queries asynchronously

The `PoolJob` object can be used to create and run queries asynchronously:

```python
import asyncio
from mapepire_python.pool.pool_job import PoolJob

async def main():
    async with PoolJob("./mapepire.ini") as pool_job:
        async with pool_job.query('select * from sample.employee') as query:
          res = await query.run(rows_to_fetch=1)

if __name__ == '__main__':
    asyncio.run(main())

```

To run a create and run a query asynchronously in a single step, use the `query_and_run` method:

```python
import asyncio
from mapepire_python.pool.pool_job import PoolJob

async def main():
    async with PoolJob("./mapepire.ini") as pool_job:
        res = await pool_job.query_and_run("select * from sample.employee", rows_to_fetch=1)
        print(res)

if __name__ == '__main__':
    asyncio.run(main())

```


### 3. Using the `Pool` object to run queries "concurrently"

The `Pool` object can be used to create a pool of `PoolJob` objects to run queries concurrently. 

```python
import asyncio
from mapepire_python.pool.pool_client import Pool, PoolOptions

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

The PEP 249 implementation also provides an asynchronous interface for running queries. The `connect` function returns an asynchronous context manager that can be used with the `async with` statement:

```python
import asyncio
from mapepire_python.asycnio import connect

async def main():
    async with connect("./mapepire.ini") as conn:
        async with await conn.execute("select * from sample.employee") as cursor:
            result = await cursor.fetchone()
            print(result)
            
if __name__ == '__main__':
    asyncio.run(main())
```

<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
## Allow all certificates

On the `DaemonServer` interface, the `ignoreUnauthorized` set to `true` will allow either self-signed certificates or certificates from a CA.

:::caution
Validation of self-signed certificates is currently not supported. You can track the progress of this issue [here](https://github.com/Mapepire-IBMi/mapepire-server/issues/28).
:::