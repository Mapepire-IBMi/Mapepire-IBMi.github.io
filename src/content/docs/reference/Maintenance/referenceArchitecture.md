---
title: Client Reference Architecture
description: Installing a Mapepire client
sidebar:
    order: 0
---

This is an outline of the Python reference archetecture for `Mapepire`. The core components of the reference archetecture are the `SQLJob` and `Query` classes. The `SQLJob` class manages the WebSocket connection to the server and provides methods to create and run queries. The `Query` class manages the state of the query, sends it to the server, and fetches results.

## Core Functions

### SQL Job

**High-Level Overview**

The `SQLJob` "class-like" object is designed to manage the client connection to the `mapepire-server`. It handles the creation of unique identifiers for queries, manages WebSocket connections for sending and receiving data, and provides methods to create and run SQL queries. The class ensures that queries are executed in a controlled manner, maintaining their state and handling errors appropriately.

**Class Definitions and Functions**

```python
class SQLJob:
    def __init__(self, options: Dict[Any, Any] = {}) -> None:
        """
        Initialize a new instance of the class.

        Args:
            options (Dict[Any, Any], optional): A dictionary of options for the job. Defaults to an empty dictionary.

        Attributes:
            options (Dict[Any, Any]): Stores the options passed during initialization.
            _unique_id_counter (int): Counter for generating unique IDs.
            _reponse_emitter: Placeholder for a response emitter, initially set to None.
            _status (JobStatus): The current status of the job, initially set to NotStarted.
            _trace_file: Placeholder for a trace file, initially set to None.
            _is_tracing_channeldata (bool): Flag indicating whether channel data tracing is enabled, initially set to True.
            __unique_id: A unique identifier generated for the job.
            id (Optional[str]): An optional identifier for the job, initially set to None.
        """
        self.options = options
        self._unique_id_counter: int = 0
        self._reponse_emitter = None
        self._status: JobStatus = JobStatus.NotStarted
        self._trace_file = None
        self._is_tracing_channeldata: bool = True

        self.__unique_id = self._get_unique_id("sqljob")
        self.id: Optional[str] = None
```


`_get_unique_id(self, prefix: str = "id") -> str`
- **Parameters**:
    - prefix (`str`): A string containing the prefix for the unique identifier.
- **Returns**: (`str`) A unique identifier for a query.

    This function should update a counter for the number of queries executed and return a unique identifier for the query.

`_get_channel(self, db2_server: DaemonServer) -> WebSocket`
- **Parameters**: 
    - db2_server (`Dict[str, Any]`): A dictionary-like object containing the connection information for the DB2 server. Here is a sample definition of the `DaemonServer` class:
    ```python
    @dataclass
    class DaemonServer:
        host: str
        user: str
        password: str
        port: int
        ignoreUnauthorized: Optional[bool] = None
        ca: Optional[Union[str, bytes]] = None
    ```
- **Returns**: (`WebSocket`) A WebSocket connection to the DB2 server.

    This function is responsible for setting up a secure WebSocket connection to the `mapepire-server`. It constructs the connection URI, prepares the necessary headers for authentication, configures SSL options, and finally establishes the connection. The function returns the WebSocket object, which can then be used for communication with the server.

`send(self, content: Any)`
- **Parameters**: 
    - content (`Any`): Any object that can be serialized into a JSON string.
- **Returns**: None
    
    This function is responsible for sending data to the `mapepire-server` over a WebSocket connection.

`connect(self, db2_server: DaemonServer) -> Dict[Any, Any]`
- **Parameters**: 
    - db2_server (`DaemonServer`): A dictionary-like object containing the connection information for the DB2 server. Here is a sample definition of the `DaemonServer` class:
    ```python
    @dataclass
    class DaemonServer:
        host: str
        user: str
        password: str
        port: int
        ignoreUnauthorized: Optional[bool] = None
        ca: Optional[Union[str, bytes]] = None
    ```
- **Returns**: (`Dict[str, Any]`) A dictionary-like object containing the response from the server.

    This function is responsible for establishing a connection to the `mapepire-server`. It calls the `_get_channel(db2_server)` function to create a WebSocket connection, sends the connection request to the server, and waits for a response. The function returns the response from the server, which contains information about the connection status.

`query(self, sql: str, opts: Optional[Union[Dict[str, Any], QueryOptions]] = None)`
- **Parameters**:    
    - sql (`str`): A string containing the SQL query to be executed.
    - opts (`Optional[Union[Dict[str, Any], QueryOptions]]`): A dictionary-like object containing additional options for the query. Here is a sample definition of the `QueryOptions` class:
    ```python
    @dataclass
    class QueryOptions:
        isTerseResults: Optional[bool] = None
        isClCommand: Optional[bool] = None
        parameters: Optional[List[str]] = None
        autoClose: Optional[bool] = None
    ```
- **Returns**: (`Query`) A `Query` object representing the query to be executed.

    This function is responsible for creating a `Query` object that represents the SQL query to be executed. It constructs the query object with the provided SQL statement and any additional options. The function returns the `Query` object, which can then be used to run the query.

`query_and_run(self, sql: str, opts: Optional[Union[Dict[str, Any], QueryOptions]] = None)`
- **Parameters**:
    - sql (`str`): A string containing the SQL query to be executed.
    - opts (`Optional[Union[Dict[str, Any], QueryOptions]]`): A dictionary-like object containing additional options for the query.

- **Returns**: (`Query`) A `Query` object representing the query to be executed.

    This function is a convenience method that combines the `query` and `run` functions. It creates a `Query` object with the provided SQL statement and options, then immediately runs the query. The function returns the `Query` object, which can be used to fetch more data or close the query.

`close(self)`
- **Parameters**: None
- **Returns**: None

    This function is responsible for closing the WebSocket connection to the DB2 server. It sends a close request to the server and waits for a response. Once the connection is closed, the function cleans up any resources associated with the connection.

### Query

**High-Level Overview**

The `Query` class-like object is designed to manage and execute SQL queries, handle their states, and fetch additional data. The `Query` object inherits an `SQLJob` instance and uses it's WebSocket connection to send and receive data. See the Query Class definition below.

**Class Definitions and Functions**

```python
class Query(Generic[T]):
    global_query_list: List["Query[Any]"] = []

    def __init__(self, job: SQLJob, query: str, opts: QueryOptions) -> None:
        """
        Initialize a new instance of the Query class.

        Args:
            job (SQLJob): The SQL job associated with this query.
            query (str): The SQL query string.
            opts (QueryOptions): Options for configuring the query.

        Attributes:
            job (SQLJob): Stores the SQL job associated with this query.
            is_prepared (bool): Indicates whether the query is prepared based on the presence of parameters.
            parameters (Optional[List[str]]): The parameters for the query, if any.
            sql (str): The SQL query string.
            is_cl_command (Optional[bool]): Indicates if the query is a command line command.
            should_auto_close (Optional[bool]): Indicates if the query should auto-close.
            is_terse_results (Optional[bool]): Indicates if the query should return terse results.
            _rows_to_fetch (int): The number of rows to fetch, default is 100.
            state (QueryState): The current state of the query, initially set to NOT_YET_RUN.

        Class Attributes:
            global_query_list (List["Query[Any]"]): A global list of all Query instances.
        """
        self.job = job
        self.is_prepared: bool = True if opts.parameters is not None else False
        self.parameters: Optional[List[str]] = opts.parameters
        self.sql: str = query
        self.is_cl_command: Optional[bool] = opts.isClCommand
        self.should_auto_close: Optional[bool] = opts.autoClose
        self.is_terse_results: Optional[bool] = opts.isTerseResults

        self._rows_to_fetch: int = 100
        self.state: QueryState = QueryState.NOT_YET_RUN

        Query.global_query_list.append(self)

```

`run(self, rows_to_fetch: Optional[int] = None) -> Dict[str, Any]`
- **Parameters**:
    - rows_to_fetch (`Optional[int]`): An integer specifying the number of rows to fetch from the query result.
- **Returns**: (`Dict[str, Any]`) A dictionary-like object containing the response from the server.

    This function is responsible for executing the query and fetching the initial set of results. It sends the query to the server, waits for a response, and returns the result. If `rows_to_fetch` is specified, the function fetches the specified number of rows from the result set.

`fetch_more(self, rows_to_fetch: Optional[int] = None) -> Dict[str, Any]`
- **Parameters**:
    - rows_to_fetch (`Optional[int]`): An integer specifying the number of rows to fetch from the query result.
- **Returns**: (`Dict[str, Any]`) A dictionary-like object containing the response from the server.

    This function is responsible for fetching additional rows from the query result. It sends a request to the server to fetch more rows, waits for a response, and returns the result.


### Query Objects

A query object is a dictionary-like object that represents a SQL query to be executed. It contains the SQL statement, any additional options, and the unique identifier for the query. The query object is used to manage the state of the query, send it to the server, and fetch results. 

Here is a sample definition of a query object:

```python
query_object = {
    "id": self.job._get_unique_id("query"),
    "type": "prepare_sql_execute" if self.is_prepared else "sql",
    "sql": self.sql,
    "terse": self.is_terse_results,
    "rows": rows_to_fetch,
    "parameters": self.parameters,
}
```

Here is a sample definition of a query object for a cl command:

```python
query_object = {
    "id": self.job._get_unique_id("clcommand"),
    "type": "cl",
    "terse": self.is_terse_results,
    "cmd": self.sql,
}
```

here is a sample definition of a query object for fetch more:

```python
query_object = {
    "id": self.job._get_unique_id("fetchMore"),
    "cont_id": self._correlation_id,
    "type": "sqlmore",
    "sql": self.sql,
    "rows": rows_to_fetch,
}

```

### Example usage in python

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