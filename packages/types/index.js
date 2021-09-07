/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check

/**
 * @module types
 */

/**
 * @global
 * @readonly
 * @enum {string}
 */
export const EServerConnectionAction = {
  REGISTER_SERVICE: 'Register Service',
}

/**
 * @property {string} id
 * @property {Buffer} sessionkey
 * @property {Decipher} in
 * @property {Cipher} out
 */
export class IEncryptionManager {}

/**
 * @global
 * @readonly
 * @enum {string}
 */
export const EServerConnectionName = {
  ADMIN: 'Admin',
  AUTH: 'Auth',
  MCSERVER: 'MCServer',
  PATCH: 'Patch',
  PROXY: 'Proxy',
  SHARD: 'Shard',
}

/**
 * @global
 * @typedef {object} IServerConnection
 * @property {EServerConnectionAction} [action]
 * @property {EServerConnectionName} service
 * @property {string} host
 * @property {number} port
 */

/**
 * @typedef {'Active' | 'Inactive'} ConnectionStatus
 */

/**
 * @class
 * @property { Cipher | null } cipher
 * @property { Decipher | null} decipher
 */
export class ILobbyCiphers {}

/**
 * @property {string} id
 * @property {number} appId
 * @property {ConnectionStatus} status
 * @property {string} remoteAddress
 * @property {string} localPort
 * @property {Socket} sock
 * @property {null} msgEvent
 * @property {number} lastMsg
 * @property {boolean} useEncryption
 * @property {ILobbyCiphers} encLobby
 * @property {IEncryptionManager} enc
 * @property {boolean} isSetupComplete
 * @property {IConnnectionManager} mgr
 * @property {boolean} inQueue
 * @property {Buffer} decryptedCmd
 * @property {Buffer} encryptedCmd
 */
export class ITCPConnection {}

/**
 * @global
 * @typedef {object} IRawPacket
 * @property {string} connectionId
 * @property {ITCPConnection} connection
 * @property {Buffer} data
 * @property {number} localPort
 * @property {string  | undefined } remoteAddress
 * @property {number} timestamp
 */

/**
 * @global
 * @typedef {"Recieved" | "Sent" } EMessageDirection
 */

/**
 *
 * @global
 * @typedef {object} IServerConfig
 * @property {string} certFilename
 * @property {string} ipServer
 * @property {string} privateKeyFilename
 * @property {string} publicKeyFilename
 * @property {string} connectionURL
 */

/**
 *
 * @global
 * @typedef {object} IAppSettings
 * @property {IServerConfig} serverConfig
 */

/**
 * @global
 * @typedef {object} ISessionRecord
 * @property {string} skey
 * @property {string} sessionkey
 */

/**
 *
 * @global
 * @typedef {object} IPersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */

/**
 * @global
 * @typedef {object} ILobbyInfo
 * @property {number} lobbyId
 * @property {number} racetypeId
 * @property {number} turfId
 * @property {string} NPSRiffName
 * @property {string} eTurfName
 * @property {string} clientArt
 * @property {number} elementId
 * @property {number} turfLength
 * @property {number} startSlice
 * @property {number} endSlice
 * @property {number} dragStageLeft
 * @property {number} dragStageRight
 * @property {number} dragStagingSlice
 * @property {number} gridSpreadFactor
 * @property {number} linear
 * @property {number} numplayersmin
 * @property {number} numplayersdefault
 * @property {number} bnumplayersenabled
 * @property {number} numlapsmin
 * @property {number} numlapsmax
 * @property {number} numplayersmax
 * @property {number} numlapsdefault
 * @property {number} bnumlapsenabled
 * @property {number} numroundsmin
 * @property {number} numroundsmax
 * @property {number} numroundsdefault
 * @property {number} bnumroundsenabled
 * @property {number} bweatherdefault
 * @property {number} bweatherenabled
 * @property {number} bnightdefault
 * @property {number} bnightenabled
 * @property {number} bbackwarddefault
 * @property {number} bbackwardenabled
 * @property {number} btrafficdefault
 * @property {number} btrafficenabled
 * @property {number} bdamagedefault
 * @property {number} bdamageenabled
 * @property {number} baidefault
 * @property {number} baienabled
 * @property {string} topDog
 * @property {string} turfOwner
 * @property {number} qualifyingTime
 * @property {number} clubNumPlayers
 * @property {number} clubNumLaps
 * @property {number} clubNumRounds
 * @property {number} clubNight
 * @property {number} clubWeather
 * @property {number} clubBackwards
 * @property {number} bestLapTime
 * @property {number} lobbyDifficulty
 * @property {number} ttPointForQualify
 * @property {number} ttCashForQualify
 * @property {number} ttPointBonusFasterIncs
 * @property {number} ttCashBonusFasterIncs
 * @property {number} ttTimeIncrements
 * @property {number} ttvictory_1st_points
 * @property {number} ttvictory_1st_cash
 * @property {number} ttvictory_2nd_points
 * @property {number} ttvictory_2nd_cash
 * @property {number} ttvictory_3rd_points
 * @property {number} ttvictory_3rd_cash
 * @property {number} minLevel
 * @property {number} minResetSlice
 * @property {number} maxResetSlice
 * @property {number} newbieFlag
 * @property {number} driverHelmetFlag
 * @property {number} clubNumPlayersMin
 * @property {number} clubNumPlayersMax
 * @property {number} clubNumPlayersDefault
 * @property {number} numClubsMin
 * @property {number} racePointsFactor
 * @property {number} bodyClassMax
 * @property {number} powerClassMax
 * @property {number} partPrizesMax
 * @property {number} partPrizesWon
 * @property {number} clubLogoId
 * @property {number} bteamtrialweather
 * @property {number} bteamtrialnight
 * @property {number} bteamtrialbackward
 * @property {number} teamtrialnumlaps
 * @property {number} teamtrialbaseTUP
 * @property {number} raceCashFactor
 */

/**
 * @global
 * @typedef {object} ISslOptions
 * @property {string} cert
 * @property {boolean} honorCipherOrder
 * @property {string} key
 * @property {boolean} rejectUnauthorized
 */

/**
 * @global
 * @typedef {object} IUserRecordMini
 * @property {string} contextId
 * @property {number} customerId
 * @property {number} userId
 */

/**
 * @global
 * @typedef {object} InpsCommandMap
 * @property {string} name
 * @property {number} value
 * @property {'Lobby' | 'Login'} module
 */

/**
 * @global
 * @typedef {object} ShardEntry
 * @property {string} name
 * @property {string} description
 * @property {number} id
 * @property {string} loginServerIp
 * @property {number} loginServerPort
 * @property {string} lobbyServerIp
 * @property {number} lobbyServerPort
 * @property {string} mcotsServerIp
 * @property {number} statusId
 * @property {string} statusReason
 * @property {string} serverGroupName
 * @property {number} population
 * @property {number} maxPersonasPerUser
 * @property {string} diagnosticServerHost
 * @property {number} diagnosticServerPort
 */
