---
title: Why Apron?
description: A guide into why Apron
---

Apron, or Db2 Apron, is a database protocol written on top of websockets. It was built to make developing modern applications in .NET Core, Node.js, PHP, and the likes, easier when using Db2 for i. Previously, there have been other alternatives (like ODBC) which sometimes require compiled binaries or external drivers for database connectivity running along side the app runtime.

Apron moves all of the database logic out of the client and on to the server, making it easier to develop and ship code that talks directly to Db2 for IBM i. This is the purpose of the Apron Daemon Server. The clients connect directly to the Daemon Server via secured websocket. This make it easier to deploy your app not only to IBM i, but the magnitude of cloud services available (like Vercel, AWS, or Azure) without having to worry about installing the ODBC drivers correctly.