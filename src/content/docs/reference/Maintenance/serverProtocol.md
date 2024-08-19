---
title: Server protocol
description: Websocket flow
---

1. When the mapepire-server is started, it opens a websocket at `wss://<db2ServerHostname>:8076/db/` and listens for connections.
2. The client calls `connect` either directly with an instance of the `SQLJob` class or indirectly using the `init` method of the `Pool` class to initiate a connection with the server.
3. Calling the execute method of the `SQLJob`, `Query`, or `Pool` class will send a query object to the server with the following format:
    ```
    {
        id: string
        type: string
        sql: string
        cmd: string
        terse: boolean
        rows: number,
        parameters: any[]
    }
    ```
4. The server responds by sending back a message to the client with the corresponding query id, and some associated information. Ex.
    ```
    {"id":"query12","has_results":true,"update_count":-1,"metadata":{"column_count":1,"job":"057235/QUSER/QZDASOINIT","columns":[{"name":"00001","type":"VARCHAR","display_size":28,"label":"00001"}]},"data":[{"00001":"057235/QUSER/QZDASOINIT"}],"is_done":true,"success":true}
    ```

5. The socket connection can be closed by calling the `close` method if the `SQLJob` or `Query` class was being used or the `end` method if the `Pool` class was used.