---
title: Mapepire Client Tests
description: TODO
sidebar:
    order: 1
---

This document outlines the test cases for the Mapepire clients. The test cases cover various scenarios to ensure the clients interact correctly with the Mapepire server and handle different inputs and outputs appropriately.

## Mapepire Test Cases

### 1. Test Case: Connect to Database
- **Test Case ID:** TC01
- **Type:** Connect
- **Description:** Verify successful connection to the database. Ensure existing connections are implicitly disconnected.
- **Inputs:**
  - props: `"system=mySystem;uid=user;pwd=password"`
  - application: `"MyApp"`
  - technique: `"cli"`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - job: Should return the server job identifier (e.g., `"QPADEV0001"`)
- **Validation Criteria:** Verify successful connection and correct job identifier.

---

### 2. Test Case: Connect to Database with Invalid Properties
- **Test Case ID:** TC02
- **Type:** Connect
- **Description:** Verify that connection fails when invalid connection properties are provided.
- **Inputs:**
  - props: `"system=invalidSystem;uid=wrongUser;pwd=wrongPassword"`
  - application: `"MyApp"`
  - technique: `"cli"`
- **Expected Outputs:**
  - **Status Code:** `401 Unauthorized` or appropriate error code
  - **Response Fields:**
    - error: Descriptive error message indicating connection failure (e.g., `"Invalid credentials or system not found."`)
- **Validation Criteria:** Ensure clear error message and no job identifier returned.

---

### 3. Test Case: Run CL Command Successfully
- **Test Case ID:** TC03
- **Type:** CL
- **Description:** Verify that a CL command is executed successfully and returns the correct job log entries.
- **Preconditions:** A valid database connection must be established.
- **Inputs:**
  - cmd: `"WRKACTJOB"`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Should return a list of job log entries related to the executed command.
- **Validation Criteria:** Confirm relevant job log entries and successful command execution.

---

### 4. Test Case: Run Invalid CL Command
- **Test Case ID:** TC04
- **Type:** CL
- **Description:** Verify that an invalid CL command returns an appropriate error message and job log.
- **Preconditions:** A valid database connection must be established.
- **Inputs:**
  - cmd: `"INVALIDCOMMAND"`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - error: Descriptive error message indicating command failure.
    - data: Job log entries indicating the nature of the error.
- **Validation Criteria:** Ensure clear error message and relevant job log entries.

---

### 5. Test Case: Connect to Database via TCP Technique
- **Test Case ID:** TC05
- **Type:** Connect
- **Description:** Verify that the connection can be established using the TCP technique.
- **Inputs:**
  - props: `"system=mySystem;uid=user;pwd=password"`
  - application: `"MyApp"`
  - technique: `"tcp"`
  - job: `""`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - job: Should return the server job identifier.
- **Validation Criteria:** Confirm successful connection using TCP and valid job identifier.

---

### 6. Test Case: Implicit Disconnection on New Connect Request
- **Test Case ID:** TC06
- **Type:** Connect
- **Description:** Verify that making a new connection request from the same client implicitly disconnects any existing connection.
- **Preconditions:** A valid database connection must be established.
- **Inputs:**
  - props: `"system=mySystem;uid=user;pwd=password"`
  - application: `"MyApp"`
  - technique: `"cli"`
  - job: `""`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - job: A new server job identifier.
- **Validation Criteria:** Confirm new job identifier and successful implicit disconnection.

---

## Test Cases for SQL Request

### 1. Test Case: Run a Simple SQL Query
- **Test Case ID:** TC01
- **Type:** SQL
- **Description:** Verify that a simple SQL `SELECT` statement is executed successfully and returns the correct data.
- **Inputs:**
  - sql: `"SELECT * FROM QGPL.TEST_TABLE"`
  - rows: `10`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - metadata: Contains column metadata (e.g., column names, data types).
    - data: Contains up to 10 rows of data from `QGPL.TEST_TABLE`.
    - is_done: `true` if all rows have been fetched, `false` if more rows are available.
- **Validation Criteria:** Verify correct metadata, expected data, and accurate `is_done` field.

---

### 2. Test Case: Run an SQL Query with Large Dataset
- **Test Case ID:** TC02
- **Type:** SQL
- **Description:** Verify that the API handles large result sets by returning only the specified number of rows on the first request.
- **Inputs:**
  - sql: `"SELECT * FROM QGPL.LARGE_TABLE"`
  - rows: `50`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - metadata: Contains column metadata for `QGPL.LARGE_TABLE`.
    - data: Contains the first 50 rows of the result set.
    - is_done: `false` if more rows are available, `true` if the entire dataset has been returned.
- **Validation Criteria:** Verify correct row count, proper `is_done` value, and ability to fetch additional rows.

---

### 3. Test Case: Run an SQL Query in Terse Format
- **Test Case ID:** TC03
- **Type:** SQL
- **Description:** Verify that the SQL query results are returned in terse format when requested.
- **Inputs:**
  - sql: `"SELECT * FROM QGPL.TEST_TABLE"`
  - rows: `5`
  - terse: `true`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - metadata: Contains column metadata in a compact format.
    - data: Contains 5 rows of data in terse format.
    - is_done: `true` if all rows have been fetched, `false` if more rows are available.
- **Validation Criteria:** Confirm terse format accuracy while maintaining data integrity.

---

### 4. Test Case: Run an Invalid SQL Query
- **Test Case ID:** TC04
- **Type:** SQL
- **Description:** Verify that an invalid SQL query returns an appropriate error message.
- **Inputs:**
  - sql: `"SELECT * FROM NON_EXISTENT_TABLE"`
  - rows: `10`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - error: Descriptive error message indicating query failure.
- **Validation Criteria:** Ensure clear error message and no data or metadata returned.

---
### 5. Test Case: Run an SQL Query with Edge Case Inputs
- **Test Case ID:** TC05
- **Type:** SQL
- **Description:** Verify that the API handles edge case inputs such as an empty SQL string or rows set to 0.
- **Inputs:**
  - sql: `""`
  - rows: `0`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - error: A descriptive error message indicating the nature of the invalid input.
- **Validation Criteria:** 
  - Ensure that the error field clearly explains why the input is invalid.
  - Confirm that the API gracefully handles edge cases without crashing or returning unexpected results.

---

### 6. Test Case: Fetch Remaining Rows of a Large Dataset
- **Test Case ID:** TC06
- **Type:** SQL
- **Description:** Verify that the API allows fetching of additional rows after an initial request that did not return the full dataset.
- **Preconditions:** Initial request returned partial data with `is_done` set to `false`.
- **Inputs:**
  - sql: `"SELECT * FROM QGPL.LARGE_TABLE"`
  - rows: `50`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - metadata: Should match the metadata of the initial request.
    - data: Contains the next set of rows from the result set.
    - is_done: `true` if all rows have been fetched, otherwise `false`.
- **Validation Criteria:**
  - Confirm that the subsequent request retrieves additional rows starting from where the last request left off.
  - Ensure that `is_done` eventually returns `true` when all data has been fetched.

---

## Test Cases for Prepare SQL Request

### 1. Test Case: Prepare a Simple SQL Statement
- **Test Case ID:** TC01
- **Type:** prepare_sql
- **Description:** Verify that a simple SQL `SELECT` statement is prepared successfully.
- **Inputs:**
  - sql: `"SELECT * FROM QGPL.TEST_TABLE"`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - Status: SQL statement is prepared successfully.
    - Statement Handle: A unique identifier for the prepared SQL statement.
- **Validation Criteria:**
  - Confirm that the SQL statement is prepared without errors.
  - Ensure that a valid statement handle is returned for future execution.

---

### 2. Test Case: Prepare SQL Statement in Terse Format
- **Test Case ID:** TC02
- **Type:** prepare_sql
- **Description:** Verify that the SQL statement is prepared and returns metadata in terse format.
- **Inputs:**
  - sql: `"SELECT * FROM QGPL.TEST_TABLE WHERE COLUMN1 = ?"`
  - terse: `true`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - Status: SQL statement is prepared successfully.
    - Metadata: Metadata returned in terse format.
    - Statement Handle: A unique identifier for the prepared SQL statement.
- **Validation Criteria:**
  - Ensure that the terse format reduces verbosity while retaining necessary information.
  - Verify that the metadata accurately describes the prepared statement.

---

### 3. Test Case: Prepare an Invalid SQL Statement
- **Test Case ID:** TC03
- **Type:** prepare_sql
- **Description:** Verify that an invalid SQL statement returns an appropriate error message.
- **Inputs:**
  - sql: `"SELECT * FROM NON_EXISTENT_TABLE"`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating why the SQL statement could not be prepared.
- **Validation Criteria:**
  - Ensure that the error message clearly explains the issue with the SQL statement.
  - Confirm that no statement handle is returned.

---

### 4. Test Case: Prepare SQL Statement with No Terse Option Provided
- **Test Case ID:** TC04
- **Type:** prepare_sql
- **Description:** Verify the default behavior when the terse option is not provided.
- **Inputs:**
  - sql: `"SELECT * FROM QGPL.TEST_TABLE WHERE COLUMN1 = ?"`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - Status: SQL statement is prepared successfully.
    - Metadata: Metadata is returned in the default format.
    - Statement Handle: A unique identifier for the prepared SQL statement.
- **Validation Criteria:**
  - Verify that the default format (non-terse) is used for metadata when terse is not specified.
  - Ensure that the statement handle is returned and valid.

---

### 5. Test Case: Prepare a Complex SQL Statement
- **Test Case ID:** TC05
- **Type:** prepare_sql
- **Description:** Verify that a complex SQL statement involving joins, subqueries, and functions is prepared successfully.
- **Inputs:**
  - sql: `"SELECT A.COL1, B.COL2 FROM QGPL.TABLE_A A JOIN QGPL.TABLE_B B ON A.ID = B.ID WHERE A.COL3 IN (SELECT COL3 FROM QGPL.TABLE_C)"`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - Status: SQL statement is prepared successfully.
    - Metadata: Metadata reflecting the complex SQL statement.
    - Statement Handle: A unique identifier for the prepared SQL statement.
- **Validation Criteria:**
  - Ensure that the complex SQL statement is prepared without errors.
  - Verify that the metadata accurately reflects the structure of the prepared SQL statement.

---

### 6. Test Case: Prepare SQL with Edge Case Inputs
- **Test Case ID:** TC06
- **Type:** prepare_sql
- **Description:** Verify that the API handles edge cases such as an empty SQL string.
- **Inputs:**
  - sql: `""`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating why the SQL statement could not be prepared.
- **Validation Criteria:**
  - Ensure that the API returns an appropriate error message for empty SQL input.
  - Confirm that no statement handle is returned.

---

## Test Cases for Execute SQL Request

### 1. Test Case: Execute Prepared SQL Statement
- **Test Case ID:** TC01
- **Type:** execute
- **Description:** Verify that a prepared SQL statement is executed successfully using a valid `cont_id`.
- **Inputs:**
  - cont_id: `"valid-prepared-statement-id"`
  - batch: `false`
  - parameters: `["value1", "value2"]`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Resulting data from the executed SQL statement.
- **Validation Criteria:**
  - Confirm that the SQL statement executes successfully and returns the expected results.
  - Ensure that the returned data matches the expected output based on the SQL statement.

---

### 2. Test Case: Execute SQL Statement in Batch Mode
- **Test Case ID:** TC02
- **Type:** execute
- **Description:** Verify that multiple SQL operations can be added to a batch and executed together.
- **Inputs:**
  - cont_id: `"valid-prepared-statement-id"`
  - batch: `true`
  - parameters: `[["value1a", "value2a"], ["value1b", "value2b"]]`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Combined result set from all SQL operations in the batch.
- **Validation Criteria:**
  - Ensure that all operations in the batch are executed successfully.
  - Verify that the returned data includes results from all executed SQL statements.

---

### 3. Test Case: Execute SQL with Missing `cont_id`
- **Test Case ID:** TC03
- **Type:** execute
- **Description:** Verify that an error is returned when the `cont_id` is missing.
- **Inputs:**
  - cont_id: `""`
  - batch: `false`
  - parameters: `["value1"]`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that `cont_id` is required.
- **Validation Criteria:**
  - Ensure that the error message clearly states that `cont_id` is missing.
  - Confirm that no data is returned.

---

### 4. Test Case: Execute SQL with Invalid `cont_id`
- **Test Case ID:** TC04
- **Type:** execute
- **Description:** Verify that an appropriate error is returned when an invalid `cont_id` is provided.
- **Inputs:**
  - cont_id: `"invalid-prepared-statement-id"`
  - batch: `false`
  - parameters: `["value1"]`
- **Expected Outputs:**
  - **Status Code:** `404 Not Found` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the prepared SQL statement was not found.
- **Validation Criteria:**
  - Ensure that the error message clearly explains that the provided `cont_id` is invalid.
  - Confirm that no data is returned.

---

### 5. Test Case: Execute SQL in Batch Mode without Parameters
- **Test Case ID:** TC05
- **Type:** execute
- **Description:** Verify that executing in batch mode without parameters executes the batch correctly.
- **Inputs:**
  - cont_id: `"valid-prepared-statement-id"`
  - batch: `true`
  - parameters: `[]`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Resulting data from the executed batch of SQL operations.
- **Validation Criteria:**
  - Confirm that the batch is executed even when no parameters are specified.
  - Ensure that the returned data matches the expected output based on the SQL operations in the batch.

---

### 6. Test Case: Execute SQL with Empty Parameter Array
- **Test Case ID:** TC06
- **Type:** execute
- **Description:** Verify that an error is returned when parameters are specified incorrectly in batch mode.
- **Inputs:**
  - cont_id: `"valid-prepared-statement-id"`
  - batch: `true`
  - parameters: `[[]]`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that parameters must not be empty.
- **Validation Criteria:**
  - Ensure that the error message clearly states that empty parameter arrays are invalid.
  - Confirm that no data is returned.

---

### 7. Test Case: Execute SQL Statement with Mixed Parameters
- **Test Case ID:** TC07
- **Type:** execute
- **Description:** Verify that SQL operations with mixed parameters execute correctly in batch mode.
- **Inputs:**
  - cont_id: `"valid-prepared-statement-id"`
  - batch: `true`
  - parameters: `[["value1a", "value2a"], ["value1b"]]`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Combined result set from all SQL operations in the batch.
- **Validation Criteria:**
  - Ensure that all SQL operations in the batch execute successfully, regardless of the number of parameters.
  - Verify that the returned data includes results from all executed SQL statements, with proper handling of missing parameters where applicable.

---

## Test Cases for Prepare and Execute SQL Request

### 1. Test Case: Prepare and Execute Valid SQL Statement
- **Test Case ID:** TC01
- **Type:** prepare_sql_execute
- **Description:** Verify that a valid SQL statement is prepared and executed successfully.
- **Inputs:**
  - parameters: `["value1", "value2"]`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Resulting data from the executed SQL statement.
- **Validation Criteria:**
  - Confirm that the SQL statement executes successfully and returns the expected results.
  - Ensure that the returned data matches the expected output based on the SQL statement.

---

### 2. Test Case: Prepare and Execute SQL Statement with Missing Parameters
- **Test Case ID:** TC02
- **Type:** prepare_sql_execute
- **Description:** Verify that an error is returned when required parameters are missing.
- **Inputs:**
  - parameters: `[]`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that parameters are required.
- **Validation Criteria:**
  - Ensure that the error message clearly states that required parameters are missing.
  - Confirm that no data is returned.

---

### 3. Test Case: Prepare and Execute SQL with Invalid Parameters
- **Test Case ID:** TC03
- **Type:** prepare_sql_execute
- **Description:** Verify that an error is returned when invalid parameter types are provided.
- **Inputs:**
  - parameters: `[123, true]` // Assuming SQL expects strings
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that parameters must be of valid types.
- **Validation Criteria:**
  - Ensure that the error message clearly explains that the provided parameters are invalid.
  - Confirm that no data is returned.

---

### 4. Test Case: Prepare and Execute SQL in Terse Format
- **Test Case ID:** TC04
- **Type:** prepare_sql_execute
- **Description:** Verify that the SQL statement can be executed and the results returned in terse format.
- **Inputs:**
  - parameters: `["value1", "value2"]`
  - terse: `true`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Resulting data in terse format from the executed SQL statement.
- **Validation Criteria:**
  - Confirm that the SQL statement executes successfully and returns the expected results in terse format.
  - Ensure that the returned data matches the expected output based on the SQL statement.

---

### 5. Test Case: Prepare and Execute SQL Statement with No Parameters
- **Test Case ID:** TC05
- **Type:** prepare_sql_execute
- **Description:** Verify that a SQL statement can be prepared and executed without parameters if the statement does not require them.
- **Inputs:**
  - parameters: `[]`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Resulting data from the executed SQL statement.
- **Validation Criteria:**
  - Ensure that the SQL statement executes successfully without any parameters if allowed.
  - Verify that the returned data matches the expected output.

---

### 6. Test Case: Prepare and Execute SQL Statement with Large Parameter Array
- **Test Case ID:** TC06
- **Type:** prepare_sql_execute
- **Description:** Verify that a SQL statement can be prepared and executed with a large array of parameters.
- **Inputs:**
  - parameters: `["value1", "value2", "value3", "value4", "value5", ...]` // Large array
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Resulting data from the executed SQL statement.
- **Validation Criteria:**
  - Confirm that the SQL statement executes successfully with the large array of parameters.
  - Ensure that the returned data matches the expected output based on the SQL statement.

---

### 7. Test Case: Prepare and Execute SQL Statement with SQL Syntax Error
- **Test Case ID:** TC07
- **Type:** prepare_sql_execute
- **Description:** Verify that an error is returned when the SQL statement has a syntax error.
- **Inputs:**
  - parameters: `["value1", "value2"]`
  - terse: `false`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that there is a syntax error in the SQL statement.
- **Validation Criteria:**
  - Ensure that the error message clearly states that there is a syntax error in the SQL statement.
  - Confirm that no data is returned.

---

## Test Cases for SQL More Request

### 1. Test Case: Fetch More Rows from a Valid Request
- **Test Case ID:** TC01
- **Type:** sqlmore
- **Description:** Verify that more rows can be fetched successfully from a previous valid SQL request.
- **Inputs:**
  - cont_id: `"valid_request_id"` // Valid request ID from a previous SQL request
  - rows: `10` // Maximum number of rows to return
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Array of the next set of data rows.
    - is_done: `false` (indicating more rows are available)
- **Validation Criteria:**
  - Confirm that the response contains the expected data and the `is_done` field indicates more rows are available.
  - Ensure that the number of rows returned does not exceed the specified limit.

---

### 2. Test Case: Fetch More Rows with Invalid Request ID
- **Test Case ID:** TC02
- **Type:** sqlmore
- **Description:** Verify that an error is returned when an invalid request ID is provided.
- **Inputs:**
  - cont_id: `"invalid_request_id"` // Invalid request ID
  - rows: `10`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the request ID is invalid.
- **Validation Criteria:**
  - Ensure that the error message clearly states that the request ID is not valid.
  - Confirm that no data is returned.

---

### 3. Test Case: Fetch More Rows When All Rows Have Been Fetched
- **Test Case ID:** TC03
- **Type:** sqlmore
- **Description:** Verify that the response indicates no more rows are available when all rows have been fetched.
- **Inputs:**
  - cont_id: `"request_id_all_fetched"` // Valid request ID where all rows have been fetched
  - rows: `10`
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: `[]` (empty array, indicating no more data)
    - is_done: `true` (indicating that all rows have been fetched)
- **Validation Criteria:**
  - Confirm that the response data is an empty array and the `is_done` field is set to `true`.
  - Ensure that the API correctly identifies that there are no more rows to fetch.

---

### 4. Test Case: Fetch More Rows with Zero Limit
- **Test Case ID:** TC04
- **Type:** sqlmore
- **Description:** Verify that an error is returned when the maximum number of rows to return is zero.
- **Inputs:**
  - cont_id: `"valid_request_id"` // Valid request ID from a previous SQL request
  - rows: `0` // Maximum number of rows to return
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the number of rows must be greater than zero.
- **Validation Criteria:**
  - Ensure that the error message clearly states that the number of rows requested must be greater than zero.
  - Confirm that no data is returned.

---

### 5. Test Case: Fetch More Rows with Negative Row Limit
- **Test Case ID:** TC05
- **Type:** sqlmore
- **Description:** Verify that an error is returned when a negative maximum number of rows is specified.
- **Inputs:**
  - cont_id: `"valid_request_id"` // Valid request ID from a previous SQL request
  - rows: `-5` // Invalid number of rows
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the number of rows must be a positive integer.
- **Validation Criteria:**
  - Ensure that the error message clearly states that the number of rows requested must be a positive integer.
  - Confirm that no data is returned.

---

### 6. Test Case: Fetch More Rows with Large Row Limit
- **Test Case ID:** TC06
- **Type:** sqlmore
- **Description:** Verify that more rows can be fetched with a large row limit.
- **Inputs:**
  - cont_id: `"valid_request_id"` // Valid request ID from a previous SQL request
  - rows: `1000` // Maximum number of rows to return
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Array containing up to 1000 rows of data.
    - is_done: `false` (indicating more rows are available, or `true` if all rows are fetched)
- **Validation Criteria:**
  - Confirm that the response contains the expected number of data rows without exceeding the specified limit.
  - Ensure that the `is_done` field reflects whether more rows are available.

---

### 7. Test Case: Fetch More Rows with Empty Previous Request
- **Test Case ID:** TC07
- **Type:** sqlmore
- **Description:** Verify that an error is returned when trying to fetch more rows from a previous request that returned no data.
- **Inputs:**
  - cont_id: `"request_id_no_data"` // Valid request ID from a previous SQL request that returned no data
  - rows: `10`
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that no data is available to fetch.
- **Validation Criteria:**
  - Ensure that the error message clearly states that there are no rows available to fetch from the previous request.
  - Confirm that no data is returned.

---

## Test Cases for SQL Close Request

### 1. Test Case: Successfully Close a Cursor
- **Test Case ID:** TC01
- **Type:** sqlclose
- **Description:** Verify that a cursor can be closed successfully using a valid request ID.
- **Inputs:**
  - cont_id: `"valid_request_id"` // Valid request ID from a previous SQL/prepare_sql/prepare_sql_execute request
- **Expected Outputs:**
  - **Status Code:** `200 OK`
  - **Response Fields:**
    - data: Confirmation message indicating that the cursor has been closed successfully.
- **Validation Criteria:**
  - Confirm that the response indicates successful closure of the cursor.
  - Ensure that subsequent requests using the same `cont_id` return an error indicating the cursor is closed.

---

### 2. Test Case: Close Cursor with Invalid Request ID
- **Test Case ID:** TC02
- **Type:** sqlclose
- **Description:** Verify that an error is returned when an invalid request ID is provided.
- **Inputs:**
  - cont_id: `"invalid_request_id"` // Invalid request ID
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the request ID is invalid.
- **Validation Criteria:**
  - Ensure that the error message clearly states that the request ID is not valid.
  - Confirm that no data is returned.

---

### 3. Test Case: Close Cursor That is Already Closed
- **Test Case ID:** TC03
- **Type:** sqlclose
- **Description:** Verify that an error is returned when trying to close a cursor that has already been closed.
- **Inputs:**
  - cont_id: `"already_closed_request_id"` // Valid request ID from a previous SQL operation where the cursor has already been closed
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the cursor is already closed.
- **Validation Criteria:**
  - Confirm that the error message states that the cursor has already been closed.
  - Ensure that no data is returned.

---

### 4. Test Case: Close Cursor with Empty Request ID
- **Test Case ID:** TC04
- **Type:** sqlclose
- **Description:** Verify that an error is returned when an empty request ID is provided.
- **Inputs:**
  - cont_id: `""` // Empty request ID
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the request ID cannot be empty.
- **Validation Criteria:**
  - Ensure that the error message clearly states that the request ID cannot be empty.
  - Confirm that no data is returned.

---

### 5. Test Case: Close Cursor with Null Request ID
- **Test Case ID:** TC05
- **Type:** sqlclose
- **Description:** Verify that an error is returned when a null request ID is provided.
- **Inputs:**
  - cont_id: `null` // Null request ID
- **Expected Outputs:**
  - **Status Code:** `400 Bad Request` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the request ID cannot be null.
- **Validation Criteria:**
  - Ensure that the error message clearly states that the request ID cannot be null.
  - Confirm that no data is returned.

---

### 6. Test Case: Close Cursor with Non-Existent Request ID
- **Test Case ID:** TC06
- **Type:** sqlclose
- **Description:** Verify that an error is returned when attempting to close a cursor with a non-existent request ID.
- **Inputs:**
  - cont_id: `"non_existent_request_id"` // Non-existent request ID
- **Expected Outputs:**
  - **Status Code:** `404 Not Found` or appropriate error code
  - **Response Fields:**
    - Error: A descriptive error message indicating that the request ID does not exist.
- **Validation Criteria:**
  - Ensure that the error message clearly states that the request ID does not exist.
  - Confirm that no data is returned.

---

### 7. Test Case: Close Cursor with Multiple Requests
- **Test Case ID:** TC07
- **Type:** sqlclose
- **Description:** Verify that closing a cursor does not affect the ability to close the same cursor from different requests.
- **Inputs:**
  - cont_id: `"valid_request_id"` // Valid request ID from a previous SQL operation
- **Expected Outputs:**
  - **Status Code:** `200 OK` for the first close request.
  - **Status Code:** `400 Bad Request` or appropriate error code for the subsequent close request.
  - **Response Fields:**
    - First close request: `data`: Confirmation message indicating successful closure.
    - Second close request: `Error`: A message indicating the cursor is already closed.
- **Validation Criteria:**
  - Confirm that the first close request is successful.
  - Ensure that the second close request returns an error indicating the cursor is already closed.
