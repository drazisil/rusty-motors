import { describe, it, expect, vi } from "vitest";
import { generateShardList } from "../../shard/src/ShardServer";
import {
    handleGetCert,
    handleGetKey,
    handleGetRegistry,
} from "../../shard/src/index";

function mockConfig() {
    return {
        certificateFile: "test",
        privateKeyFile: "test",
        publicKeyFile: "test",
        host: "test",
    };
}

describe("web", () => {
    it("handleGetCert", async () => {
        vi.mock("fs/promises", async (importOriginal) => {
            return {
                ...(await importOriginal<typeof import("node:fs/promises")>()),
                readFile: async (path: string, encoding: string) => {
                    return "test";
                },
            };
        });
        const config = mockConfig();
        const result = await handleGetCert(config);
        expect(result).toBe("test");
    });

    it("handleGetRegistry", async () => {
        const config = mockConfig();
        const result = await handleGetRegistry(config);
        expect(result).toContain(`Windows Registry Editor Version 5.00`);
        expect(result).toContain(`"ShardUrlDev"="http://test/ShardList/"`);
    });

    it("handleGetKey", async () => {
        const config = mockConfig();
        const result = await handleGetKey(config);
        expect(result).toBe("test");
    });
});
