import { OldServerMessage } from "rusty-motors-shared";
import { ArcadeCarInfo, ArcadeCarMessage } from "./ArcadeCarMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";

const defaultLogger = getServerLogger("handlers/_getArcadeCarInfo");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _getArcadeCarInfo({
	connectionId,
	packet,
	log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
	const getArcadeCarInfoMessage = new GenericRequestMessage();
	getArcadeCarInfoMessage.deserialize(packet.data);

	log.debug(`Received Message: ${getArcadeCarInfoMessage.toString()}`);

	const arcadeCarInfoMessage = new ArcadeCarMessage();
	arcadeCarInfoMessage._msgNo = 323;

	const car1 = new ArcadeCarInfo();
	car1._brandedPartId = 113; // Bel-air
	car1._lobbyId = 0;
	arcadeCarInfoMessage.addCar(car1);

	const responsePacket = new OldServerMessage();
	responsePacket._header.sequence = packet.sequenceNumber;
	responsePacket._header.flags = 8;

	responsePacket.setBuffer(arcadeCarInfoMessage.serialize());

	return { connectionId, messages: [responsePacket] };
}
