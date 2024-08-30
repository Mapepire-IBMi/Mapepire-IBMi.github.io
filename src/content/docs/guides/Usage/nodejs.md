---
title: Node.js
description: Using Mapepire with Node.js
sidebar:
    order: 2
---

Full API docs can be found on the [client SDK project page](https://github.com/Mapepire-IBMi/mapepire-js), but the basics are summarized here. 


Using Db2 for IBM i with Node.js is easy. First, install the package:

```sh
npm i @ibm/mapepire-js
```

## Basic architecture

mapepire-js is a pooling asynchronous client to an instance of the [mapepire-server](https://github.com/Mapepire-IBMi/mapepire-server). The mapepire-server authorizes and mediates connections to an IBM i Db2 server on behalf of the client.

This document illustrates the use of the mapepire-js client. Other language clients and the mapepire-server itself are documented elsewhere.

### Specifying the mapepire-server instance for the connection

The location and port of the mapepire-server instance as well as the credentials for IBM i Db2 can be specified in a `.env` file. Copy the `.env.sample` file in the root directory of mapepire-js to `.env` and fill in the values. Note that any entry in the `.env` file containing javascript metacharacters such as `$` may need to be backslash-escaped , e.g.,

```sh
VITE_DB_PASS=MYPAS\$WORD
```

### Simple test

Credentials belong in an object which can be passed to a `Pool` or `SQLJob`.

```ts
const creds: DaemonServer = {
  host: process.env.DB2_HOST,
  user: process.env.DB2_USER,
  password: process.env.DB2_PASS,
}
```

Create a function to test the database connection:

```ts
function testDb() {
  const job = new SQLJob();

  await job.connect(creds);

  const query = job.query<any[]>(`values job_name`);
  const result = await query.run();

  job.close();
}
```

### Pooling

For typical production workloads, a connection pool should be used and created when in your apps startup process.

The pool provides APIs to access a free job or to send a query directly to a free job.

```ts
const pool = new Pool({ creds, maxSize: 5, startingSize: 3 });

await pool.init();
```

### Securing

By default, Mapepire will always try to connect securely. A majority of the time, servers are using their own self-signed certificate that is not signed by a recognized CA (Certificate Authority). There are two options with the Node.js client:

#### Allow all certificates

On the `DaemonServer` interface, the `ignoreUnauthorized` set to `true` will allow either self-signed certificates or certificates from a CA.

#### Validate the self-signed certificate

The Mapepire Node.js client ships with an API, `getCertificate`, where you can fetch the self-signed certificate from the server before connecting to the Mapepire daemon. This allows your code to validate it using your own validation implementation before using it.

`getCertificate` returns [an object](https://nodejs.org/api/tls.html#certificate-object) with the `raw` property, which can in turn be passed in as `ca` as part of the `DaemonServer` interface.

```ts
import { getCertificate } from 'mapepire-js';

async function validateTheCert(creds: DaemonServer) {
  const cert = await getCertificate(creds);

  // validate the certs, maybe throw an error if it's bad?
  // throw new Error('very bad cert')

  return cert.raw;
}

async function getDbPool() {
  let creds: DaemonServer = {...};

  const rawCa = await validateTheCert(creds);

  creds.ca = rawCa;

  return new Pool({ creds, maxSize: 5, startingSize: 3 })
}
```
