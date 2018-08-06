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

const util = require('util');
const { logger } = require('../logger');
const { MessageNode } = require('./MessageNode');

class LoginMsg extends MessageNode {
    constructor(buffer) {
        super(buffer)

        this.customerId = buffer.readInt32LE(2);
        this.personaId = buffer.readInt32LE(6);

        this.lotOwnerId = buffer.readInt32LE(10)
        this.brandedPartId = buffer.readInt32LE(14)
        this.skinId = buffer.readInt32LE(18)
        this.personaName = buffer.slice(22, 34).toString();

        this.version = buffer.slice(34).toString();

        logger.debug(util.inspect(this))

        this.dumpPacket()
    }

    /**
     * dumpPacket
     */
    dumpPacket() {
        logger.info('[LoginMsg]======================================');
        logger.debug('MsgNo:       ', this.msgNo.toString());
        logger.debug('customerId:  ', this.customerId.toString());
        logger.debug('personaId:   ', this.personaId.toString());
        logger.debug('lotOwnerId:    ', this.lotOwnerId);
        logger.debug('brandedPartId:    ', this.brandedPartId);
        logger.debug('skinId:    ', this.skinId);
        logger.debug('personaName:    ', this.personaName);

        logger.debug('version:    ', this.version);
        logger.info('[LoginMsg]======================================');
    }
}

module.exports = { LoginMsg };
