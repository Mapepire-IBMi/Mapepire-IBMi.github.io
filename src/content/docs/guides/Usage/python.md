
---
title: Python
description: Using Mapepire with Python
sidebar:
    order: 4
---

Using Db2 for IBM i with Python is easy. First, install the package:

```sh
pip install mapepire-python
```


The following script sets up a `DaemonServer` object that will be used to connect with the Server Component. Then a single `SQLJob` is created to facilitate the connection from the client side. 

```python
from mapepire_python.client.sql_job import SQLJob
from mapepire_python.types import DaemonServer

creds = DaemonServer(
    host="localhost",
    port=8085,
    user="USER",
    password="PASSWORD",
    ignoreUnauthorized=True
)


job = SQLJob()
res = job.connect(creds)
query = job.query("select * from sample.employee")
result = query.run(rows_to_fetch=3)
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
