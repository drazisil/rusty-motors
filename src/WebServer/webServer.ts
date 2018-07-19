// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import * as bodyParser from 'body-parser'
import * as express from 'express'
import fs = require("fs");
import * as http from "http";
import * as https from "https";
import { Socket } from "net";
import { handleAPIRequest } from "../api/"
import * as MCServer from "../MCServer"
import { IConfigurationFile } from "./config";
import { logger } from "./logger";
import { SSLConfig } from "./ssl-config";


/**
 * Create the SSL options object
 */
function sslOptions(configuration: IConfigurationFile["serverConfig"]) {
  return {
    cert: fs.readFileSync(configuration.certFilename),
    ciphers: SSLConfig.ciphers,
    honorCipherOrder: true,
    key: fs.readFileSync(configuration.privateKeyFilename),
    rejectUnauthorized: false,
    secureOptions: SSLConfig.minimumTLSVersion,
  };
}

const users = [
  {
    "token": "d316cd2dd6bf870893dfbaaf17f965884e",
    "username": "test",
  }
]

function httpsHandler(
  request: http.IncomingMessage,
  response: http.ServerResponse,
  serverConfiguration: IConfigurationFile
) {
  logger.info(
    `[HTTPS] Request from ${request.socket.remoteAddress} for ${
    request.method
    } ${request.url}`
  );

  const routes = {
    "/cert": (): void => {
      console.log("route hit")
    }
  }

  const { url } = request
  const { username, token } = users[0]

  if (request.url.startsWith("/api/")) {
    handleAPIRequest(request, response, MCServer.connectionMgr)
    return
  }

  switch (request.url) {
    case "/cert":
      response.setHeader(
        "Content-disposition",
        "attachment; filename=cert.pem"
      );
      response.end(fs.readFileSync(serverConfiguration.serverConfig.certFilename));
      break;

    case "/key":
      response.setHeader("Content-disposition", "attachment; filename=pub.key");
      response.end(
        fs.readFileSync(serverConfiguration.serverConfig.publicKeyFilename).toString("hex")
      );
      break;
    case "/AuthLogin":
      response.setHeader("Content-Type", "text/plain");
      response.end(`Valid=TRUE\nTicket=${token}`);
      break;

    default:
      if (request.url.startsWith("/AuthLogin?")) {
        response.setHeader("Content-Type", "text/plain");
        response.end(`Valid=TRUE\nTicket=${token}`);
        return;
      }
      response.statusCode = 404;
      response.end("Unknown request.");
      break;
  }
}

export class WebServer {
  public async start(configurationFile: IConfigurationFile) {
    const app = express()

    // parse application/json
    app.use(bodyParser.json())

    app.use((req, res) => {
      httpsHandler(req, res, configurationFile)
    });

    app.use((req, res) => {
      handleAPIRequest(req, res, configurationFile)
    });


    const httpsServer = https
      .createServer(sslOptions(configurationFile.serverConfig), app)
      .listen({ port: 443, host: "0.0.0.0" }, () => {
        logger.info("[webServer] Web server is listening...");
      })
      .on("connection", (socket: Socket) => {
        socket.on("error", (error: NodeJS.ErrnoException) => {
          logger.error(`[webServer] SSL Socket Error: ${error.message}`);
        });
        socket.on("close", () => {
          logger.info("[webServer] SSL Socket Connection closed");
        });
      })
      .on("tlsClientError", (err: Error) => {
        logger.error(`[webServer] tlsClientError: ${err}`);
      });
  }
}

const webServer = new WebServer

export { webServer }
