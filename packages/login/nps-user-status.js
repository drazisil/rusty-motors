/* eslint-disable @typescript-eslint/no-unused-vars */
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { privateDecrypt } from 'crypto'
import { readFileSync, statSync } from 'fs'
import { Logger } from '@drazisil/mco-logger'
import { Socket } from 'net'
import { Buffer } from 'buffer'
import { NPSMessage } from 'transactions'
import { NPSMessageFactory } from '../transactions/nps-message-factory'

const { log } = Logger.getInstance()

/**
 *
 */

/**
 * Load the RSA private key
 *
 * @param {string} privateKeyPath
 * @return {string}
 */
function fetchPrivateKeyFromFile(privateKeyPath) {
  try {
    statSync(privateKeyPath)
  } catch (error) {
    if (error instanceof Error) {
      throw new TypeError(
        `[npsUserStatus] Error loading private key: ${error.message}`,
      )
    }

    throw new Error('[npsUserStatus] Error loading private key, error unknown')
  }

  return readFileSync(privateKeyPath).toString()
}

/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @return {LoginPacket}
 */

/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
export class NPSUserStatus {
  /**
   *
   * @param {NPSMessage} message
   * @returns {NPSUserStatus}
   */
  static fromMessage(message) {
    return new NPSUserStatus(message.direction)
  }

  /**
   *
   * @param {import('types').EMessageDirection} direction
   */
  constructor(direction) {
    this.msgNo = 0
    this.msgVersion = 0
    this.reserved = 0
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04])
    this.msgLength = this.content.length + 12
    this.direction = direction
    this.serviceName = 'mcoserver:NPSUserStatus'
    this.messageType = 'NPSUserStatus'
    this.sessionkey = ''
    this.opCode = null
    this.contextId = ''
    this.buffer = Buffer.alloc(0)
  }

  /**
   * @deprecated
   * @returns {Buffer}
   */
  serialize() {
    return Buffer.alloc(0)
  }

  /**
   *
   * @param {Buffer} packet
   * @returns {NPSUserStatus}
   */
  deserialize(packet) {
    // Save the NPS opCode
    this.opCode = packet.readInt16LE(0)

    // Save the contextId
    this.contextId = packet.slice(14, 48).toString()

    // Save the raw packet
    this.buffer = packet
    return this
  }

  /**
   * ExtractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   *
   * @param {import('types').IAppConfiguration['certificate']} serverConfig
   * @param {Buffer} packet
   * @return {void}
   */
  extractSessionKeyFromPacket(serverConfig, packet) {
    // Decrypt the sessionkey
    const privateKey = fetchPrivateKeyFromFile(serverConfig.privateKeyFilename)

    const sessionkeyString = Buffer.from(
      packet.slice(52, -10).toString('utf8'),
      'hex',
    )
    const decrypted = privateDecrypt(privateKey, sessionkeyString)
    this.sessionkey = decrypted.slice(2, -4).toString('hex')
  }

  /**
   *
   * @return {import('types').INPSMessageJSON}
   */
  toJSON() {
    return {
      msgNo: this.msgNo,
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString('hex'),
      direction: this.direction,
      opCode: this.opCode,
      contextId: this.contextId,
      sessionkey: this.sessionkey,
      rawBuffer: this.buffer.toString('hex'),
    }
  }

  /**
   * @return {void}
   */
  dumpPacket() {
    NPSMessageFactory.dumpPacketHeader(this, 'NPSUserStatus')
    log(
      'debug',
      `NPSUserStatus,
      ${JSON.stringify({
        contextId: this.contextId,
        sessionkey: this.sessionkey,
      })}`,
      { service: 'mcoserver:NPSUserStatus' },
    )
  }
}
