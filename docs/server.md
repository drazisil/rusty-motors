# Installing and running the server

This assumes you know the basics of checking out a git repo. If you don't, please search it.

## Requirements

- Linux
    \*\* If you want to try running on Windows it may work, but I'm not going to support it
- NodeJS
- [Docker](https://docs.docker.com/compose/install/) (A way to see the logs of the node pod would be very helpful if you need to file a bug report)
- [nvm](https://github.com/nvm-sh/nvm) would be helpful

### Configure server settings

- Set the `EXTERNAL_HOST` enviroment variable in docker-compose.yaml to the external hostname or IP address of the machine the server is running on

- Generate the SSL cert and keys using `make certs`. WARNING: The certificates in this repo and those generated by `make certs` are for development/testing only. For production environments, always generate new certificates with stronger keys (minimum 2048-bit RSA) and obtain them from a trusted Certificate Authority. However, if you are running the client on Windows XP, be advised that connection to the sever may fail with stronger keys.

## Installing

- `nvm install && nvm use` (Optional, but recomended)
- `pnpm install`

### Ports

You will need to open the following ports:

- 80
- 443
- 6660
- 7003
- 8226
- 8227
- 8228
- 43200
- 43300
- 43400
- 53303
- 9000 - 9014 (not yet used, I think they are for UDP client racing

### Running

- `make uo`
- `make start`

This will start the server cluster which involves the database, SSL gateway, and server(s)

🤞 If someththing explodes, open an issue or [ping me on Discord](drazi#3741). I might have forgoten a step.
