import { LegacyMessage } from "@rustymotors/shared";
import { handleSendMiniRiffList } from "../../src/handlers/handleSendMiniRiffList.js";
import { describe, it, expect } from "vitest";
import { getServerLogger } from "@rustymotors/shared";

describe("handleSendMiniRiffList", () => {
    it("should return a buffer", async () => {
        // arrange
        const incomingMessage = new LegacyMessage();

        const result = await handleSendMiniRiffList({
            connectionId: "test",
            message: incomingMessage,
            log: getServerLogger({
                level: "silent",
            }),
        });

        expect(result.message).toBeInstanceOf(LegacyMessage);
    });
});