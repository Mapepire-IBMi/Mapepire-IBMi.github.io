---
title: For developers
description: Installing a Mapepire client
---

We provide clients for a few runtimes thus far, with more planned in the future. Select your runtime/language below for a guide to get started with it.

* [Python]() - *Adam Shedivy, IBM*
* [Node.js](/guides/runtimes/nodejs) - *Jonathan Zak, IBM*
* [Java]() - *Sanjula Ganepola, IBM*
* [C#/.NET Core]() - *Mark Goff, IBM*
* [PHP] - tbd
* [Go] - tbh

## Mapepire Reference Archetecture

This is an outline of the reference archetecture for `Mapepire` client libraries. Each client library should implement the following functionality.

### Core Functions

#### SQL Job

**High-Level Overview**

The `SQLJob` "class-like" object is designed to manage and execute SQL queries. It handles the creation of unique identifiers for queries, manages WebSocket connections for sending and receiving data, and provides methods to run and fetch more data from queries. The class ensures that queries are executed in a controlled manner, maintaining their state and handling errors appropriately.

**Class Definitions and Functions**

`get_unique_id`
- Purpose
- Parmeters
- Retuns
- Details

`get_channel`
- Purpose
- Parmeters
- Retuns
- Details

`send`
- Purpose
- Parmeters
- Retuns
- Details

`connect`
- Purpose
- Parmeters
- Retuns
- Details

`query`
- Purpose
- Parmeters
- Retuns
- Details

`query_and_run`
- Purpose
- Parmeters
- Retuns
- Details

`close`
- Purpose
- Parmeters
- Retuns
- Details

#### Query

**High-Level Overview**

The `Query` class-like object is designed to manage and execute SQL queries, handle their states, and fetch additional data if needed. It interacts with an `SQLJob` instance to send and receive data over a socket, ensuring that the query execution is properly managed and any errors are appropriately handled.

**Class Definitions and Functions**

`run`
- Purpose
- Parmeters
- Retuns
- Details

`fetch_more`
- Purpose
- Parmeters
- Retuns
- Details

`close`
- Purpose
- Parmeters
- Retuns
- Details


### Example usage in python:

```python
creds = DaemonServer(
    host="localhost",
    port=8085,
    user=user,
    password=pw,
    ignoreUnauthorized=True,
)

job = SQLJob()
res = job.connect(creds)
query = job.query("select * from sample.employee")
result = query.run(rows_to_fetch=5)
job.close()
```


### App examples

App examples that exist or will be built.

#### TS/JS

* Express and Mapepire
* Fastify and Mapepire
* Next.js CRUD
