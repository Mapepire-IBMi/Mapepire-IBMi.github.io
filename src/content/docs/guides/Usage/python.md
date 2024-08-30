---
title: Python
description: Using Mapepire with Python
sidebar:
    order: 4
---

Full API docs can be found on the [client SDK project page](https://github.com/Mapepire-IBMi/mapepire-python), but the basics are summarized here. 

Using Db2 for IBM i with Python is easy. First, install the package:

```sh
pip install mapepire-python
```
next, setup the server credentials used to connect to the server. One way to do this is to create a `mapepire.ini` file in the root of your project with the following content:

```ini
[mapepire]
SERVER="SERVER"
PORT="PORT"
USER="USER"
PASSWORD="PASSWORD"
```

The following script sets up a `DaemonServer` object that will be used to connect with the Server Component. Then a single `SQLJob` is created to facilitate the connection from the client side. 

```python
import configparser
from mapepire_python.client.sql_job import SQLJob
from mapepire_python.types import DaemonServer

config = configparser.ConfigParser()
config.read('mapepire.ini')

creds = DaemonServer(
    host=config['mapepire']['SERVER'],
    port=config['mapepire']['PORT'],
    user=config['mapepire']['USER'],
    password=config['mapepire']['PASSWORD'],
    ignoreUnauthorized=True
)

with SQLJob(creds) as sql_job:
    with sql_job.query("select * from sample.employee") as query:
        result = query.run(rows_to_fetch=1)
        print(result)
```

Here is the output from the script above:

```json
{
  "id":"query3",
  "has_results":true,
  "update_count":-1,
  "metadata":{
    "column_count":14,
    "job":"330955/QUSER/QZDASOINIT",
    "columns":[
      {
        "name":"EMPNO",
        "type":"CHAR",
        "display_size":6,
        "label":"EMPNO"
      },
      {
        "name":"FIRSTNME",
        "type":"VARCHAR",
        "display_size":12,
        "label":"FIRSTNME"
      },
      {
        "name":"MIDINIT",
        "type":"CHAR",
        "display_size":1,
        "label":"MIDINIT"
      },
      {
        "name":"LASTNAME",
        "type":"VARCHAR",
        "display_size":15,
        "label":"LASTNAME"
      },
      {
        "name":"WORKDEPT",
        "type":"CHAR",
        "display_size":3,
        "label":"WORKDEPT"
      },
      {
        "name":"PHONENO",
        "type":"CHAR",
        "display_size":4,
        "label":"PHONENO"
      },
      {
        "name":"HIREDATE",
        "type":"DATE",
        "display_size":10,
        "label":"HIREDATE"
      },
      {
        "name":"JOB",
        "type":"CHAR",
        "display_size":8,
        "label":"JOB"
      },
      {
        "name":"EDLEVEL",
        "type":"SMALLINT",
        "display_size":6,
        "label":"EDLEVEL"
      },
      {
        "name":"SEX",
        "type":"CHAR",
        "display_size":1,
        "label":"SEX"
      },
      {
        "name":"BIRTHDATE",
        "type":"DATE",
        "display_size":10,
        "label":"BIRTHDATE"
      },
      {
        "name":"SALARY",
        "type":"DECIMAL",
        "display_size":11,
        "label":"SALARY"
      },
      {
        "name":"BONUS",
        "type":"DECIMAL",
        "display_size":11,
        "label":"BONUS"
      },
      {
        "name":"COMM",
        "type":"DECIMAL",
        "display_size":11,
        "label":"COMM"
      }
    ]
  },
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

### Query and Run

To create and run a query in a single step, use the `query_and_run` method: 

```python
import configparser
from mapepire_python.client.sql_job import SQLJob
from mapepire_python.types import DaemonServer

config = configparser.ConfigParser()
config.read('mapepire.ini')

creds = DaemonServer(
    host=config['mapepire']['SERVER'],
    port=config['mapepire']['PORT'],
    user=config['mapepire']['USER'],
    password=config['mapepire']['PASSWORD'],
    ignoreUnauthorized=True
)

with SQLJob(creds) as sql_job:
    # query automatically closed after running
    results = sql_job.query_and_run("select * from sample.employee", rows_to_fetch=1)
    print(result)
```

### Asynchronous Query Execution

The `PoolJob` object can be used to create and run queries asynchronously:

```python
import asyncio
import configparser
from mapepire_python.pool.pool_job import PoolJob
from mapepire_python.types import DaemonServer

config = configparser.ConfigParser()
config.read('mapepire.ini')

creds = DaemonServer(
    host=config['mapepire']['SERVER'],
    port=config['mapepire']['PORT'],
    user=config['mapepire']['USER'],
    password=config['mapepire']['PASSWORD'],
    ignoreUnauthorized=True
)

async def main():
    async with PoolJob(creds=creds) as pool_job:
        async with pool_job.query('select * from sample.employee') as query:
          res = await query.run(rows_to_fetch=1)

if __name__ == '__main__':
    asyncio.run(main())

```

To run a create and run a query asynchronously in a single step, use the `query_and_run` method:

```python
import asyncio
import configparser
from mapepire_python.pool.pool_job import PoolJob
from mapepire_python.types import DaemonServer

config = configparser.ConfigParser()
config.read('mapepire.ini')

creds = DaemonServer(
    host=config['mapepire']['SERVER'],
    port=config['mapepire']['PORT'],
    user=config['mapepire']['USER'],
    password=config['mapepire']['PASSWORD'],
    ignoreUnauthorized=True
)

async def main():
    async with PoolJob(creds=creds) as pool_job:
        res = await pool_job.query_and_run(rows_to_fetch=1)
        print(res)

if __name__ == '__main__':
    asyncio.run(main())

```


## Pooling (beta)

The `Pool` object can be used to create a pool of `PoolJob` objects to run queries concurrently. 

```python
import asyncio
import configparser
from mapepire_python.pool.pool_client import Pool, PoolOptions
from mapepire_python.types import DaemonServer

config = configparser.ConfigParser()
config.read('mapepire.ini')

creds = DaemonServer(
    host=config['mapepire']['SERVER'],
    port=config['mapepire']['PORT'],
    user=config['mapepire']['USER'],
    password=config['mapepire']['PASSWORD'],
    ignoreUnauthorized=True
)


async def main():
    async with Pool(
        options=PoolOptions(
            creds=creds,
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

## Allow all certificates

On the `DaemonServer` interface, the `ignoreUnauthorized` set to `true` will allow either self-signed certificates or certificates from a CA.

:::caution
Validation of self-signed certificates is currently not supported. You can track the progress of this issue [here](https://github.com/Mapepire-IBMi/mapepire-server/issues/28).
:::