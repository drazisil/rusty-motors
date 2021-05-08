// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// eslint-disable-next-line no-unused-vars
const { ConnectionObj } = require('../ConnectionObj') // lgtm [js/unused-local-variable]
const { MessageNode } = require('./MessageNode')
const logger = require('../../@mcoserver/mco-logger').child({ service: 'mcoserver:MCOTSServer' })
const { MCOTServer } = require('./MCOTServer')
const { ClientConnectMsg } = require('../ClientConnectMsg')
const { GenericReplyMsg } = require('../GenericReplyMsg')
const { GenericRequestMsg } = require('../GenericRequestMsg')
const { StockCar } = require('./StockCar')
const { StockCarInfoMsg } = require('./StockCarInfoMsg')
const { fetchSessionKeyByCustomerId } = require('../../@mcoserver/mco-database')

/**
 * Manages TCP connection packet processing
 * @module TCPManager
 */

const mcotServer = new MCOTServer()

/**
 *
 * @param {ConnectionObj} conn
 * @param {MessageNode} node
 * @returns {Promise<{conn: ConnectionObj, packetToWrite: MessageNode}>}
 */
async function compressIfNeeded (conn, node) {
  const packetToWrite = node

  // Check if compression is needed
  if (node.getLength() < 80) {
    logger.debug('Too small, should not compress')
  } else {
    logger.debug('This packet should be compressed')
    /* TODO: Write compression.
     *
     * At this time we will still send the packet, to not hang connection
     * Client will crash though, due to memory access errors
     */
  }
  return { conn, packetToWrite }
}
module.exports.compressIfNeeded = compressIfNeeded

/**
 *
 * @param {ConnectionObj} conn
 * @param {MessageNode} node
 * @returns {Promise<{conn: ConnectionObj, packetToWrite: MessageNode}>}
 */
async function encryptIfNeeded (conn, node) {
  let packetToWrite = node

  // Check if encryption is needed
  if (node.flags - 8 >= 0) {
    logger.debug('encryption flag is set')

    if (conn.enc) {
      node.updateBuffer(conn.enc.encrypt(node.data))
    } else {
      throw new Error('encryption out on connection is null')
    }
    packetToWrite = node
    logger.debug(`encrypted packet: ${packetToWrite.serialize().toString('hex')}`)
  }

  return { conn, packetToWrite }
}

/**
 *
 * @param {ConnectionObj} conn
 * @param {MessageNode[]} nodes
 * @returns {Promise<ConnectionObj>}
 */
async function socketWriteIfOpen (conn, nodes) {
  const updatedConnection = conn
  nodes.forEach(async node => {
    const { packetToWrite: compressedPacket } = await compressIfNeeded(
      conn,
      node
    )
    const { packetToWrite } = await encryptIfNeeded(conn, compressedPacket)
    // Log that we are trying to write
    logger.debug(
      ` Atempting to write seq: ${packetToWrite.seq} to conn: ${updatedConnection.id}`
    )

    // Log the buffer we are writing
    logger.debug(`Writting buffer: ${packetToWrite.serialize().toString('hex')}`)
    if (conn.sock.writable) {
      // Write the packet to socket
      conn.sock.write(packetToWrite.serialize())
    } else {
      throw new Error(
        `Error writing ${packetToWrite.serialize()} to ${
          conn.sock.remoteAddress
        } , ${conn.sock.localPort.toString()}`
      )
    }
  })
  return updatedConnection
}
module.exports.socketWriteIfOpen = socketWriteIfOpen

/**
 *
 * @param {ConnectionObj} con
 * @param {MessageNode} node
 * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
 */
async function GetStockCarInfo (con, node) {
  const getStockCarInfoMsg = new GenericRequestMsg()
  getStockCarInfoMsg.deserialize(node.data)
  getStockCarInfoMsg.dumpPacket()

  const pReply = new StockCarInfoMsg(200, 0, 105)
  pReply.starterCash = 200
  pReply.dealerId = 8
  pReply.brand = 105

  pReply.addStockCar(new StockCar(113, 20, 0)) // Bel-air
  pReply.addStockCar(new StockCar(104, 15, 1)) // Fairlane - Deal of the day
  pReply.addStockCar(new StockCar(402, 20, 0)) // Century

  pReply.dumpPacket()

  const rPacket = new MessageNode('SENT')

  rPacket.deserialize(node.serialize())

  rPacket.updateBuffer(pReply.serialize())

  rPacket.dumpPacket()

  return { con, nodes: [rPacket] }
}
module.exports.GetStockCarInfo = GetStockCarInfo

/**
 *
 * @param {ConnectionObj} con
 * @param {MessageNode} node
 * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
 */
async function ClientConnect (con, node) {
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMsg = new ClientConnectMsg(node.data)

  logger.debug(`[TCPManager] Looking up the session key for ${newMsg.customerId}...`)
  const res = await fetchSessionKeyByCustomerId(
    newMsg.customerId
  )
  logger.debug('[TCPManager] Session Key located!')

  const connectionWithKey = con

  const { customerId, personaId, personaName } = newMsg
  const sessionkey = res.sessionkey

  const strKey = Buffer.from(sessionkey, 'hex')
  connectionWithKey.setEncryptionKey(Buffer.from(strKey.slice(0, 16)))

  // Update the connection's appId
  connectionWithKey.appId = newMsg.getAppId()

  // Log the session key
  logger.debug(
    `cust: ${customerId} ID: ${personaId} Name: ${personaName}`
  )

  // Create new response packet
  const pReply = new GenericReplyMsg()
  pReply.msgNo = 101
  pReply.msgReply = 438
  const rPacket = new MessageNode('SENT')
  rPacket.deserialize(node.serialize())
  rPacket.updateBuffer(pReply.serialize())
  rPacket.dumpPacket()

  return { con, nodes: [rPacket] }
}

/**
 * Route or process MCOTS commands
 * @param {MessageNode} node
 * @param {ConnectionObj} conn
 * @returns {Promise<ConnectionObj>}
 */
async function ProcessInput (node, conn) {
  const currentMsgNo = node.msgNo
  const currentMsgString = mcotServer._MSG_STRING(currentMsgNo)

  switch (currentMsgString) {
    case 'MC_SET_OPTIONS':
      try {
        const result = await mcotServer._setOptions(conn, node)
        const responsePackets = result.nodes
        return await module.exports.socketWriteIfOpen(
          result.con,
          responsePackets
        )
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error in MC_SET_OPTIONS: ${error}`)
        }
        throw new Error('Error in MC_SET_OPTIONS, error unknown')
      }
    case 'MC_TRACKING_MSG':
      try {
        const result = await mcotServer._trackingMessage(conn, node)
        const responsePackets = result.nodes
        return module.exports.socketWriteIfOpen(
          result.con,
          responsePackets
        )
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error in MC_TRACKING_MSG: ${error}`)
        }
        throw new Error('Error in MC_TRACKING_MSG, error unknown')
      }
    case 'MC_UPDATE_PLAYER_PHYSICAL':
      try {
        const result = await mcotServer._updatePlayerPhysical(conn, node)
        const responsePackets = result.nodes
        return module.exports.socketWriteIfOpen(
          result.con,
          responsePackets
        )
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error in MC_UPDATE_PLAYER_PHYSICAL: ${error}`)
        }
        throw new Error('Error in MC_UPDATE_PLAYER_PHYSICAL, error unknown')
      }

    default:
      break
  }

  if (currentMsgString === 'MC_CLIENT_CONNECT_MSG') {
    try {
      const result = await ClientConnect(conn, node)
      const responsePackets = result.nodes
      // write the socket
      return await socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error('[TCPManager] Error writing to socket, error unknown')
    }
  } else if (currentMsgString === 'MC_LOGIN') {
    try {
      const result = await mcotServer._login(conn, node)
      const responsePackets = result.nodes
      // write the socket
      return socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error('[TCPManager] Error writing to socket, error unknown')
    }
  } else if (currentMsgString === 'MC_LOGOUT') {
    try {
      const result = await mcotServer._logout(conn, node)
      const responsePackets = result.nodes
      // write the socket
      return await socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error('[TCPManager] Error writing to socket, error unknown')
    }
  } else if (currentMsgString === 'MC_GET_LOBBIES') {
    const result = await mcotServer._getLobbies(conn, node)
    logger.debug('Dumping Lobbies response packet...')
    logger.debug(result.nodes)
    const responsePackets = result.nodes
    try {
      // write the socket
      return await socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error('[TCPManager] Error writing to socket, error unknown')
    }
  } else if (currentMsgString === 'MC_STOCK_CAR_INFO') {
    try {
      const result = await GetStockCarInfo(conn, node)
      const responsePackets = result.nodes
      // write the socket
      return socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error('[TCPManager] Error writing to socket, error unknown')
    }
  } else {
    node.setAppId(conn.appId)
    throw new Error(`Message Number Not Handled: ${currentMsgNo} (${currentMsgString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`)
  }
}

/**
 *
 * @param {MessageNode} msg
 * @param {ConnectionObj} con
 * @returns {Promise<ConnectionObj>}
 */
async function MessageReceived (msg, con) {
  const newConnection = con
  if (!newConnection.useEncryption && msg.flags && 0x08) {
    logger.debug('Turning on encryption')
    newConnection.useEncryption = true
  }

  // If not a Heartbeat
  if (msg.flags !== 80 && newConnection.useEncryption) {
    if (!newConnection.isSetupComplete) {
      throw new Error(
        `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`
      )
    }

    if (msg.flags - 8 >= 0) {
      try {
        /**
         * Attempt to decrypt message
         */
        const encryptedBuffer = Buffer.from(msg.data)
        logger.debug(
          `Full packet before decrypting: ${encryptedBuffer.toString('hex')}`
        )

        logger.debug(
          `Message buffer before decrypting: ${encryptedBuffer.toString('hex')}`
        )
        if (!newConnection.enc) {
          throw new Error('ARC4 decrypter is null')
        }
        logger.debug(`Using encryption id: ${newConnection.enc.getId()}`)
        const deciphered = newConnection.enc.decrypt(encryptedBuffer)
        logger.debug(
          `Message buffer after decrypting: ${deciphered.toString('hex')}`
        )

        if (deciphered.readUInt16LE(0) <= 0) {
          throw new Error('Failure deciphering message, exiting.')
        }

        // Update the MessageNode with the deciphered buffer
        msg.updateBuffer(deciphered)
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(
            `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}: ${e}`
          )
        }
        throw new Error(
          `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}, error unknown`
        )
      }
    }
  }

  // Should be good to process now
  return ProcessInput(msg, newConnection)
}

/**
 *
 * @param {IRawPacket} rawPacket
 * @return {Promise<ConnectionObj>}
 */
async function defaultHandler (rawPacket) {
  const { connection, remoteAddress, localPort, data } = rawPacket
  const messageNode = new MessageNode('RECEIVED')
  messageNode.deserialize(data)

  logger.info(
    'Received TCP packet',
    {
      localPort,
      remoteAddress,
      direction: messageNode.direction,
      data: rawPacket.data.toString('hex')
    }
  )
  messageNode.dumpPacket()

  return MessageReceived(messageNode, connection)
}
module.exports.defaultHandler = defaultHandler
