---
title: Why Mapepire?
description: The benefits of Mapepire
sidebar:
    order: 0
---

Mapepire (pronounced 'mapəpɪə' or 'MAH-pup-ee') is a database access layer written on top of secure web sockets. It was built to make developing modern applications in .NET Core, Node.js, PHP, and the likes, easier when using Db2 for i.

The core tenets of Mapepire's design include:
- A consistent client SDK across languages
- Minimal dependencies
- No native dependencies (for instance, drivers) needed on the client machine
- Communication to the server is done through a single port
- Data is always encrypted

Mapepire an ideal choice for deployment of cloud-native applications, running seamlessly in [Red Hat UBI](https://www.redhat.com/en/blog/introducing-red-hat-universal-base-image) deployments, [Alpine Linux](https://alpinelinux.org/) containers, and the magnitude of cloud services available (like IBM Cloud, [IBM WatsonX.ai](http://WatsonX.ai), Vercel, AWS, or Azure). 

Simply put: Mapepire clients can be deployed anywhere!

# Mapepire vs. JDBC and ODBC

|                                                            | JDBC | ODBC | Mapepire |
| ---------------------------------------------------------- | :--: | :--: | :------: |
| Needs only a single port                                   |      |      | ✅ |
| Data is always encrypted                                   |      |      | ✅ |
| Manageable via system exit points                          | ✅   | ✅  | ✅ |
| Enhanced CCSID support                                     | ✅   |      | ✅ |
| Runs in [WatsonX.ai](http://WatsonX.ai) Jupyter notebooks  |      |      | ✅ |
| Runs in lightweight containers (for instance Alpine Linux) | ✅   |      | ✅ |
| Directly supports multiple client languages                |      |      | ✅ |