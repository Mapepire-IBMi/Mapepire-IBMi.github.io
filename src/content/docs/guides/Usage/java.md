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
    <version>0.1.0</version>  <!-- Use the latest version -->
</dependency>
```

## Requirements

* Java 8 or later

## Specifying the `mapepire-server` Instance for the Connection

The location and port of the `mapepire-server` instance as well as the credentials for IBM i Db2 can be specified in a `config.properties` file. Copy the [`config.properties.sample`](https://github.com/Mapepire-IBMi/samples/blob/main/java/simple-app/src/main/resources/config.properties.sample) file from the [simple-app](https://github.com/Mapepire-IBMi/samples/tree/main/java/simple-app) demo project to `config.properties` and fill in the credentials. Note that the `IBMI_PORT` is set to where the mapepire server is running.

```ini
IBMI_HOST=host.somewhere.com
IBMI_USER=JIMBOB
IBMI_PASSWORD=letMeInNow
IBMI_PORT=8076
```

The following function can be used to construct a `DaemonServer` object with the credentials you just specified. This object will be passed to a `SqlJob` or `Pool` object.

:::note
Refer to the [Secure Connections](#secure-connections) section to learn how this function should be updated based on your server certificate configuration.
:::

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

    return new DaemonServer(host, port, user, password, false, "");
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
QueryResult<Object> result = query.execute(3).get();

// Close query and job
query.close().get();
job.close();

// Convert to JSON string and output
ObjectMapper mapper = new ObjectMapper();
mapper.enable(SerializationFeature.INDENT_OUTPUT);
String jsonString = mapper.writeValueAsString(result);
System.out.println(jsonString);
```

Output:

```json
{
  "id" : "query3",
  "success" : true,
  "error" : null,
  "sql_rc" : 0,
  "sql_state" : null,
  "execution_time" : 174,
  "metadata" : {
    "column_count" : 5,
    "columns" : [ 
      { "display_size" : 3, "label" : "DEPTNO", "name" : "DEPTNO", "type" : "CHAR", "precision" : 3, "scale" : 0 },
      { "display_size" : 36, "label" : "DEPTNAME", "name" : "DEPTNAME", "type" : "VARCHAR", "precision" : 36, "scale" : 0 },
      { "display_size" : 6, "label" : "MGRNO", "name" : "MGRNO", "type" : "CHAR", "precision" : 6, "scale" : 0 },
      { "display_size" : 3, "label" : "ADMRDEPT", "name" : "ADMRDEPT", "type" : "CHAR", "precision" : 3, "scale" : 0 },
      { "display_size" : 16, "label" : "LOCATION", "name" : "LOCATION", "type" : "CHAR", "precision" : 16, "scale" : 0 }
    ],
    "job" : "058971/QUSER/QZDASOINIT",
    "parameters" : null
  },
  "is_done" : false,
  "has_results" : true,
  "update_count" : -1,
  "data" : [ 
    { "DEPTNO" : "A00", "DEPTNAME" : "SPIFFY COMPUTER SERVICE DIV.", "MGRNO" : "000010", "ADMRDEPT" : "A00", "LOCATION" : null },
    { "DEPTNO" : "B01", "DEPTNAME" : "PLANNING", "MGRNO" : "000020", "ADMRDEPT" : "A00", "LOCATION" : null },
    { "DEPTNO" : "C01", "DEPTNAME" : "INFORMATION CENTER", "MGRNO" : "000030", "ADMRDEPT" : "A00", "LOCATION" : null }
  ],
  "parameter_count" : 0,
  "output_parms" : null
}
```

### Prepared Statements 

Statements can be easily prepared and executed with parameters:

```java
QueryOptions options = new QueryOptions(false, false, Arrays.asList("A00"));
Query query = job.query("SELECT * FROM SAMPLE.DEPARTMENT WHERE ADMRDEPT = ?", options);
QueryResult<Object> result = query.execute().get();
```

### Batch Queries

Multiple queries can be executed in a batch:

```java
QueryOptions options = new QueryOptions(false, false, Arrays.asList(
    Arrays.asList("SAM", "416 345 0879"),
    Arrays.asList("BOB", "647 821 7261"),
    Arrays.asList("JOHN", "289 726 1823"),
    Arrays.asList("JANE", "416 345 0879")
));
Query query = job.query("INSERT INTO SAMPLE.EMPLOYEE VALUES (?, ?)", options);
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

## Job Status and Query State

For any `SqlJob` object, you can check its status via its [JobStatus](https://github.com/Mapepire-IBMi/mapepire-java/blob/main/src/main/java/io/github/mapepire_ibmi/types/JobStatus.java):

```java
SqlJob job = new SqlJob();
JobStatus status = job.getStatus();
```

Similarily, you can check the state of a query via its [QueryState](https://github.com/Mapepire-IBMi/mapepire-java/blob/main/src/main/java/io/github/mapepire_ibmi/types/QueryState.java):

```java
Query query = job.query("SELECT * FROM SAMPLE.DEPARTMENT");
QueryState state = query.getState();
```

## Exception Handling

The APIs provided by the client SDK can throw various checked exceptions which should be caught and handled. In particular, the following exceptions communicate important error information from either the `mapepire-server` component or the client SDK itself:

* `SQLException` - This is thrown when an SQL related exception occurs. This will also typically communicate a `reason` and `SQLState`.
* `UnknownServerException` - This is throw when the server hits an unknown exception.
* `ClientException` - This is thrown when the client SDK wants to communicate an error with calling an API.

## Secure Connections

By default, Mapepire will always try to connect securely. With the Java client, there are three options for connecting based on your server certificate configuration.

### Allow All Certificates

In the case you would like to allow all certificates and skip any form of certificate validation, the `rejectUnauthorized` option can be set to `false` on the `DaemonServer` object.

```java
DaemonServer creds = new DaemonServer("HOST", 8076, "USER", "PASSWORD", false);
```

### Validate Self-Signed Certificates

In the case you have configured your server to use a self-signed certificate, you can use the `getCertificate` API provided by the Java client to fetch this certificate. The returned value should be passed as the `ca` to the `DaemonServer` object before connecting.

```java
DaemonServer creds = new DaemonServer("HOST", 8076, "USER", "PASSWORD");
String ca = Tls.getCertificate(creds).get();
creds.setCa(ca);
```

### Validate Certificate Signed by a Recognized CA

In the case your server certificate is signed by a recognized CA, the `DaemonServer` object can be constructed without any additional parameters. Certificate validation will still take place using the Java trust store.

```java
DaemonServer creds = new DaemonServer("HOST", 8076, "USER", "PASSWORD");
```

## Sample Projects

The following [Java Sample Projects](https://github.com/Mapepire-IBMi/samples/tree/main/java) showcase how the Java client SDK can be used in various applications. They are also a great starting point for building your own applications!

* [simple-app](https://github.com/Mapepire-IBMi/samples/tree/main/java/simple-app): Simple demo application of using the Mapepire Java client SDK
* [company-web-server](https://github.com/Mapepire-IBMi/samples/tree/main/java/company-web-server): Jetty company web server to manage departments, employees, and sales