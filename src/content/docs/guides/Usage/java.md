---
title: Java
description: Using Mapepire with Java
sidebar:
    order: 3
---

Full API docs can be found on the [client SDK project page](https://github.com/Mapepire-IBMi/mapepire-java), but the basics are summarized here. 

Using DB2 for IBM i with Java is now easy with the help of the `mapepire-java` client SDK. To get started, install the package with `maven`. Make sure to install the latest version from [Maven Central](https://central.sonatype.com/artifact/io.github.mapepire-ibmi/mapepire-sdk).

```xml
<dependency>
    <groupId>io.github.mapepire-ibmi</groupId>
    <artifactId>mapepire-sdk</artifactId>
    <version>0.0.5</version>  <!-- Use the latest version -->
</dependency>
```

## Requirements

* Java 8 or later

## Specifying the `mapepire-server` Instance for the Connection

The location and port of the `mapepire-server` instance as well as the credentials for IBM i Db2 can be specified in a `config.properties` file. Copy the [`config.properties.sample`](https://github.com/Mapepire-IBMi/java/simple-app/src/main/resources/config.properties.sample) file from the [simple-app](https://github.com/Mapepire-IBMi/java/simple-app) demo project to `config.properties` and fill in the credentials.

The following function can be used to construct a `DaemonServer` object with the credentials you just specified. This object will be passed to a `SqlJob` or `Pool` object.

```java
private static DaemonServer getDaemonServer() throws IOException {
    // Load config properties
    Properties properties = new Properties();
    try (InputStream input = App.class.getClassLoader().getResourceAsStream("config.properties")) {
        if (input == null) {
            throw new FileNotFoundException("Unable to find config.properties");
        }
        properties.load(input);
    }

    // Retrieve credentials
    String host = properties.getProperty("IBMI_HOST");
    String user = properties.getProperty("IBMI_USER");
    String password = properties.getProperty("IBMI_PASSWORD");
    int port = Integer.parseInt(properties.getProperty("IBMI_PORT"));

    return new DaemonServer(host, port, user, password, true, "");
}
```

## Running Queries

The core APIs lie in the `SqlJob` and `Query` classes which are what give you the ability to execute queries.

```java
// Create a single job and connect
DaemonServer creds = getDaemonServer();
SqlJob job = new SqlJob();
job.connect(creds).get();

// Initialize and execute query
Query query = job.query("SELECT * FROM SAMPLE.DEPARTMENT");
QueryResult<Object> result = query.execute().get();

// Close query and job
query.close().get();
job.close();
```

### Prepared Statements 

Statements can be easily prepared and executed with parameters:

```java
QueryOptions options = new QueryOptions(false, false, Arrays.asList("A00"));
Query query = job.query("SELECT * FROM SAMPLE.DEPARTMENT WHERE ADMRDEPT = ?", options);
QueryResult<Object> result = query.execute().get();
```

### CL Commands

CL commands can be easily run by setting the `isClCommand` option to be `true` on the `QueryOptions` object or by directly using the `clCommand` API on a job:

```java
Query query = job.clCommand("CRTLIB LIB(MYLIB1) TEXT('My cool library')");
QueryResult<Object> result = query.execute().get();
```

### Paginating Results

Paginating results can be easily achieved using the `rowsToFetch` parameter when executing a query along with the `fetchMore` API to retrieve more results.

```java
// Execute query and fetch 10 rows
Query query = job.query("SELECT * FROM SAMPLE.EMPLOYEE");
QueryResult<Object> result = query.execute(10).get();

// Continuously fetch 10 more rows until all all rows have been returned
while (!result.getIsDone()) {
    result = query.fetchMore(50).get();
}
```

## Pooling

To streamline the creation and reuse of `SqlJob` objects, your application should establish a connection pool on startup. This is recommended as connection pools significantly improve performance as it reduces the number of connection objects that are created.

A pool can be initialized with a given starting size and maximum size. Once initialized, the pool provides APIs to access a free job or to send a query directly to a free job.

```java
// Create a pool with a max size of 5 and starting size of 3
DaemonServer creds = getDaemonServer();
PoolOptions poolOptions = new PoolOptions(creds, 5, 3);
Pool pool = new Pool(poolOptions);
pool.init().get();

// Initialize and execute query
Query query = pool.query("SELECT * FROM SAMPLE.DEPARTMENT");
QueryResult<Object> result = query.execute().get();

// Close query and pool
query.close().get();
pool.end();
```

## JDBC Options

When creating an `SqlJob` or `Pool` object, JDBC options can be specified. For a full list of all options, check out the documentation [here](https://www.ibm.com/docs/en/i/7.4?topic=jdbc-toolbox-java-properties).

```java
// Set JDBC options
JDBCOptions jdbcOptions = new JDBCOptions();
jdbcOptions.setNaming(Naming.SQL);
jdbcOptions.setLibraries(Arrays.asList("MYLIB1", "MYLIB2"));

// Create a single job with JDBC options
SqlJob job = new SqlJob(jdbcOptions);

// Create a pool with JDBC options
PoolOptions poolOptions = new PoolOptions(creds, jdbcOptions, 5, 3);
Pool pool = new Pool(poolOptions);
```

## Exception Handling

The APIs provided by the client SDK can throw various checked exceptions which should be caught and handled. In particular, the following exceptions communicate important error information from either the `mapepire-server` component or the client SDK itself:

* `SQLException` - This is thrown when an SQL related exception occurs. This will also typically communicate a `reason` and `SQLState`.
* `UnknownServerException` - This is throw when the server hits an unknown exception.
* `ClientException` - This is thrown when the client SDK wants to communicate an error with calling an API.

## Secure Connections

By default, Mapepire will always try to connect securely. A majority of the time, servers are using their own self-signed certificate that is not signed by a recognized CA (Certificate Authority). There are two options with the Java client.

### Allow All Certificates

On the `DaemonServer` object, the `ignoreUnauthorized` option can be set to `true` which will allow either self-signed certificates or certificates from a CA.

### Validate Self-signed Certificates

:::caution
Validation of self-signed certificates is currently not supported. You can track the progress of this issue [here](https://github.com/Mapepire-IBMi/mapepire-java/issues/49).
:::