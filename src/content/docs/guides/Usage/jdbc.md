---
title: JDBC
description: Using Mapepire with the JDBC driver
sidebar:
    order: 4
---

Full documentation can be found on the [JDBC driver project page](https://github.com/Mapepire-IBMi/mapepire-jdbc), but the basics are summarized here.

The `mapepire-jdbc` driver lets any Java application or tool that speaks standard JDBC (`java.sql`) work with Db2 for IBM i through the `mapepire-server` daemon. It is built on top of the [Java client SDK](/guides/usage/java), so no ODBC driver, native driver or IBM i Access Client Solutions install is required on the client machine. To get started, install the package with `maven`. Make sure to install the latest version from [Maven Central](https://central.sonatype.com/artifact/io.github.mapepire-ibmi/mapepire-jdbc).

```xml
<dependency>
    <groupId>io.github.mapepire-ibmi</groupId>
    <artifactId>mapepire-jdbc</artifactId>
    <version>1.0.0</version>  
</dependency>
```

:::tip[JDBC driver or Java client SDK?]
Use the JDBC driver when you want the standard `java.sql` API, for example to plug into existing JDBC-based code, frameworks or tools. Use the [Java client SDK](/guides/usage/java) when you need Mapepire-specific features such as connection pools, CL commands or batch execution.
:::

## Requirements

* Java 8 or later
* A running `mapepire-server` daemon on the target IBM i (see the [server installation guide](/guides/sysadmin))

## Registering the Driver

Register the driver with `DriverManager` once, before opening any connections:

```java
DriverManager.registerDriver(new MapepireDriver());
```

## Connecting

### Connection URL

The database connection URL has the following syntax:

```
jdbc:mapepire://host[:port][;property1=value1][;property2=value2]...
```

* `host` (*required*): The hostname or IP address of the IBM i.
* `port` (*optional*): The port the `mapepire-server` is running on. Defaults to `8076`.
* `property=value` (*optional*): A semicolon-separated list of connection properties. A value can't contain a `;`.

### Connection Properties

Property names are case-insensitive. The following properties are supported:

* `USER` (*required*): The IBM i user profile.
* `PASSWORD` (*required*): The IBM i user password.
* `REJECTUNAUTHORIZED` (*optional*, default `true`): Whether to verify the server's TLS certificate. See [Secure Connections](#secure-connections).
* Any [JDBC property](https://www.ibm.com/docs/en/i/7.4?topic=jdbc-toolbox-java-properties) supported by the Java client SDK, such as `naming`, `libraries` or `errors`.

### Example Connections

Properties can be passed with a `Properties` object:

```java
Properties p = new Properties();
p.put("USER", "myuser");
p.put("PASSWORD", "mypassword");
p.put("naming", "system");
p.put("errors", "full");

Connection connection = DriverManager.getConnection("jdbc:mapepire://myhost.example.com:8076", p);
```

Or directly in the connection URL:

```java
Connection connection = DriverManager.getConnection(
        "jdbc:mapepire://myhost.example.com:8076;USER=myuser;PASSWORD=mypassword;naming=system;errors=full");
```

:::caution
Avoid hard-coding credentials. Load them from a configuration file or environment variables instead, and prefer the `Properties` form so the password doesn't end up in a logged URL.
:::

## Running Queries

Queries are run with the standard `Statement` and `ResultSet` APIs:

```java
try (Statement statement = connection.createStatement();
        ResultSet rs = statement.executeQuery("SELECT * FROM SAMPLE.DEPARTMENT")) {
    while (rs.next()) {
        System.out.println(rs.getString("DEPTNO") + ": " + rs.getString("DEPTNAME"));
    }
}
```

### Prepared Statements

Use a `PreparedStatement` to safely pass parameter values without building SQL strings by hand:

```java
try (PreparedStatement statement = connection.prepareStatement(
        "SELECT * FROM SAMPLE.EMPLOYEE WHERE WORKDEPT = ?")) {
    statement.setString(1, "A00");

    try (ResultSet rs = statement.executeQuery()) {
        while (rs.next()) {
            System.out.println(rs.getString("LASTNAME"));
        }
    }
}
```

### Updates

```java
try (Statement statement = connection.createStatement()) {
    int updated = statement.executeUpdate(
            "UPDATE SAMPLE.EMPLOYEE SET SALARY = SALARY * 1.05 WHERE WORKDEPT = 'A00'");
    System.out.println(updated + " rows updated");
}
```

## Transactions

Auto-commit is on by default, as the JDBC specification requires. Turn it off to group statements into a single transaction:

```java
connection.setAutoCommit(false);
try (Statement statement = connection.createStatement()) {
    statement.executeUpdate("UPDATE SAMPLE.EMPLOYEE SET SALARY = SALARY * 1.05 WHERE WORKDEPT = 'A00'");
    statement.executeUpdate("INSERT INTO SAMPLE.AUDIT_LOG (MESSAGE) VALUES ('Applied raise for A00')");
    connection.commit();
} catch (SQLException e) {
    connection.rollback();
    throw e;
}
```

## Supported JDBC API

The driver covers the core of the JDBC API needed to run queries, updates and transactions. It is not yet a complete `java.sql` implementation. If you need something from the "not yet supported" list, please [open an issue](https://github.com/Mapepire-IBMi/mapepire-jdbc/issues).

**Supported**

* `Statement` and `PreparedStatement`: `executeQuery`, `executeUpdate`, `execute`, parameter binding, fetch size and query timeout
* Forward-only `ResultSet` reading, by column index or label
* Transactions: `setAutoCommit`, `commit`, `rollback`, `setTransactionIsolation` and `setReadOnly`
* `setSchema` / `getSchema`
* `Connection.isValid()` for pool health checks
* Query and network timeouts
* `getWarnings` / `clearWarnings` (the driver never raises SQL warnings, so these always return `null`)

**Not yet supported** (these throw `SQLFeatureNotSupportedException`)

* `DatabaseMetaData` and `ResultSetMetaData`
* Scrollable or updatable `ResultSet`s
* Batch execution (`addBatch` / `executeBatch`)
* `CallableStatement`, savepoints and generated keys
* BLOB, CLOB, Array, Ref, RowId and SQLXML types

## Exception Handling

As with any JDBC driver, errors are reported as `SQLException`s. Errors returned by the server typically include a `reason` and `SQLState`.

## Secure Connections

By default, the driver always connects securely and validates the server's TLS certificate against the Java trust store. This works without extra configuration when your server certificate is signed by a recognized CA.

If your server uses a self-signed certificate, either import that certificate into the Java trust store used by your application, or skip certificate validation by setting `REJECTUNAUTHORIZED` to `false`:

```java
Connection connection = DriverManager.getConnection(
        "jdbc:mapepire://myhost.example.com:8076;REJECTUNAUTHORIZED=false", p);
```

:::danger
Only disable certificate validation for local development. With `REJECTUNAUTHORIZED=false`, credentials are exposed to anyone who can intercept traffic on the network.
:::
