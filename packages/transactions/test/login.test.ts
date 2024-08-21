import { describe, expect, it } from "vitest";
import { getServerLogger } from "../../shared/log.js";
import { OldServerMessage } from "../../shared/messageFactory.js";
import { login } from "../src/login.js";

describe("login", () => {
	it("returns a message", async () => {
		// arrange
		const connectionId = "test";
		const incomingMessage = new OldServerMessage();
		const imcommingBuffer = Buffer.from(JSON.stringify(incomingMessage));
		incomingMessage.setBuffer(imcommingBuffer);
		const log = getServerLogger({});

		// act
		const result = await login({
			connectionId,
			packet: incomingMessage,
			log,
		});

		// assert
		expect(result.messages[0]).toBeInstanceOf(OldServerMessage);
	});
});
