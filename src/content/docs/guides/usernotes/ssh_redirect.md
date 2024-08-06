# SSH port redirection for connections through firewall to remote mapepire-server

When mapepire-js runs on a workstation and connects to mapepire-server running on a remote host that is firewalled, you can use Secure Shell (SSH) port redirection as a means to connect through the firewall.

Assuming maprepire-server is running on port 8076 on `myserver.mybiz.com` and appears on that server's `localhost` TCP/IP interface, you can redirect the remote 8076 port to a local port (let's say, 8081 on `localhost`) as follows:

```sh
ssh -L8081:localhost:8076 -l myuserid myserver.mybiz.com
```

The "localhost" bind specification here refers to the `localhost` interface on the server side. The "localhost" bind specification for the local workstation is implicit in the absence of a bind address specification preceding the local port number. [(See the OpenSSH manual for the `ssh` comand)](https://man.openbsd.org/ssh).

If mapepire-server only appears on the public interface of the remote server, try:

```sh
ssh -L8081:myserver.mybiz.com:8076 -l myuserid myserver.mybiz.com
```

In either case, the workstation localhost port 8081 will be a redirect to the remote server's port 8076.
