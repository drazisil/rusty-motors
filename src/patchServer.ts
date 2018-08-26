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

import * as http from "http";

import { IServerConfiguration } from "./IServerConfiguration";
import { logger } from "./logger";

const castanetResponse = {
  body: Buffer.from("cafebeef00000000000003", "hex"),
  header: {
    type: "Content-Type",
    value: "application/octet-stream",
  },
};

// TODO: Combine these threes functions.
// The long-term plan is to actually have an update server,
// but it's very low priority
function patchUpdateInfo() {
  return castanetResponse;
}

function patchNPS() {
  return castanetResponse;
}

function patchMCO() {
  return castanetResponse;
}

/**
 * Generate a shard list web document
 * @param {JSON} config
 */
function generateShardList(serverConfig: IServerConfiguration["serverConfig"]) {
  return `[The Clocktower]
  Description=The Clocktower
  ShardId=44
  LoginServerIP=${serverConfig.ipServer}
  LoginServerPort=8226
  LobbyServerIP=${serverConfig.ipServer}
  LobbyServerPort=7003
  MCOTSServerIP=${serverConfig.ipServer}
  StatusId=0
  Status_Reason=
  ServerGroup_Name=Group - 1
  Population=88
  MaxPersonasPerUser=2
  DiagnosticServerHost=${serverConfig.ipServer}
  DiagnosticServerPort=80
[Twin Pines Mall]
  Description=Twin Pines Mall
  ShardId=88
  LoginServerIP=mc.drazisil.com
  LoginServerPort=8226
  LobbyServerIP=mc.drazisil.com
  LobbyServerPort=7003
  MCOTSServerIP=mc.drazisil.com
  StatusId=0
  Status_Reason=
  ServerGroup_Name=Group - 1
  Population=88
  MaxPersonasPerUser=2
  DiagnosticServerHost=mc.drazisil.com
  DiagnosticServerPort=80
[Marty's House]
  Description=Marty's House
  ShardId=22
  LoginServerIP=192.168.5.14
  LoginServerPort=8226
  LobbyServerIP=192.168.5.14
  LobbyServerPort=7003
  MCOTSServerIP=192.168.5.14
  StatusId=0
  Status_Reason=
  ServerGroup_Name=Group - 1
  Population=88
  MaxPersonasPerUser=2
  DiagnosticServerHost=192.168.5.14
  DiagnosticServerPort=80`;
}

function httpHandler(
  request: http.IncomingMessage,
  response: http.ServerResponse,
  serverConfiguration: IServerConfiguration
) {
  logger.info(
    `[PATCH] Request from ${request.socket.remoteAddress} for ${
      request.method
    } ${request.url}`
  );
  let responseData;
  switch (request.url) {
    case "/ShardList/":
      response.setHeader("Content-Type", "text/plain");
      response.end(generateShardList(serverConfiguration.serverConfig));
      break;

    case "/games/EA_Seattle/MotorCity/UpdateInfo":
      responseData = patchUpdateInfo();
      response.setHeader(responseData.header.type, responseData.header.value);
      response.end(responseData.body);
      break;
    case "/games/EA_Seattle/MotorCity/NPS":
      responseData = patchNPS();
      response.setHeader(responseData.header.type, responseData.header.value);
      response.end(responseData.body);
      break;
    case "/games/EA_Seattle/MotorCity/MCO":
      responseData = patchMCO();
      response.setHeader(responseData.header.type, responseData.header.value);
      response.end(responseData.body);
      break;

    default:
      response.end("foo");
      break;
  }
}

export class PatchServer {
  public async start(configurationFile: IServerConfiguration) {
    const serverPatch = http.createServer((req, res) => {
      httpHandler(req, res, configurationFile);
    });
    serverPatch.listen({ port: "3000", host: "0.0.0.0" }, () => {
      logger.info("[patchServer] Patch server is listening...");
    });
  }
}
