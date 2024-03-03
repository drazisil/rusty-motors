import { SlonikMigrator } from "@slonik/migrator";
import { getSlonik } from "./packages/database/src/services/database.js";

const migrator = new SlonikMigrator({
    migrationsPath: "migrations",
    migrationTableName: "migration",
    // @ts-ignore We know this works
    slonik: getSlonik().slonik,
    logger: SlonikMigrator.prettyLogger,
});

migrator.runAsCLI();
