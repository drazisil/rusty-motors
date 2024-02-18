import { log } from "../../../shared/log.js";
import { setVehiclePartTree } from "../cache.js";
import { DBPart } from "../services/admin.js";
import { createSqlTag, slonik, z } from "../services/database.js";
import { TPart } from "./Part.js";

const level1PartTypes = [1001, 2001, 4001, 5001, 6001, 15001, 36001, 37001];

const partNumbersMap = new Map<number, number>();

export function getPartDepth(partId: number): number {
    if (level1PartTypes.includes(partId)) {
        return 1;
    }
    return 2;
}

export type TVehicle = {
    vehicleId: number;
    skinId: number;
    flags: number;
    class: number;
    infoSetting: number;
    damageInfo: Buffer | null;
};

export type VehiclePartTreeType = {
    vehicleId: number;
    skinId: number;
    flags: number;
    class: number;
    infoSetting: number;
    damageInfo: Buffer | null;
    isStock: boolean;
    // One of the following two properties is required
    ownedLotId: number | null;
    ownerID: number | null;
    partId: number;
    parentPartId: null;
    brandedPartId: number;
    partTree: {
        level1: {
            partId: number;
            parts: TPart[];
        };
        level2: {
            partId: number;
            parts: TPart[];
        };
    };
};

const sql = createSqlTag({
    typeAliases: {
        id: z.number(),
        brandedPart: z.object({
            partid: z.number() || z.null(),
            parentpartid: z.number() || z.null(),
            brandedpartid: z.number() || z.null(),
            attachmentpointid: z.number() || z.null(),
        }),
        part: z.object({
            partid: z.number(),
            parentpartid: z.number(),
            brandedpartid: z.number(),
            percentdamage: z.number(),
            itemwear: z.number(),
            attachmentpointid: z.number(),
            partname: z.string() || z.null(),
            ownerid: z.number(),
            repaircost: z.number(),
            scrapvalue: z.number(),
        }),
        abstractPartType: z.object({
            abstractparttypeid: z.number(),
        }),
        ptSkin: z.object({
            skinid: z.number(),
            defaultflag: z.number(),
        }),
        nextPartId: z.object({
            nextval: z.bigint(),
        }),
        dbPart: z.object({
            partid: z.number(),
            parentpartid: z.number(),
            brandedpartid: z.number(),
            percentdamage: z.number(),
            itemwear: z.number(),
            attachmentpointid: z.number(),
            ownerid: z.number(),
            partname: z.string() || z.null(),
            repaircost: z.number(),
            scrapvalue: z.number(),
        }),
        detailedPart: z.object({
            brandedpartid: z.number(),
            parttypeid: z.number(),
            abstractparttypeid: z.number(),
            parentabstractparttypeid: z.number(),
            attachmentpointid: z.number(),
        }),
        vehicle: z.object({
            vehicleid: z.number(),
            skinid: z.number(),
            flags: z.number(),
            class: z.number(),
            infosetting: z.number(),
            damageinfo: z.instanceof(Buffer) || z.null(),
        }),
    },
});

async function getNextPartId(): Promise<number> {
    const { nextval } = await slonik.one(sql.typeAlias("nextPartId")`
        SELECT nextval('part_partid_seq')
    `);
    return Number(nextval);
}

export async function savePart(part: TPart): Promise<void> {
    await slonik.query(sql.typeAlias("dbPart")`
        INSERT INTO part (
            partid,
            parentpartid,
            brandedpartid,
            percentdamage,
            itemwear,
            attachmentpointid,
            ownerid,
            partname,
            repaircost,
            scrapvalue
        ) VALUES (
            ${part.partId},
            ${part.parentPartId},
            ${part.brandedPartId},
            ${part.percentDamage},
            ${part.itemWear},
            ${part.attachmentPointId},
            ${part.ownerID},
            ${part.partName},
            ${part.repairCost},
            ${part.scrapValue}
        )
    `);
}

export async function saveVehicle(
    vehiclePartTree: VehiclePartTreeType,
): Promise<void> {
    try {
        const vehiclePart: TPart = {
            partId: vehiclePartTree.vehicleId,
            parentPartId: null,
            brandedPartId: vehiclePartTree.brandedPartId,
            percentDamage: 0,
            itemWear: 0,
            attachmentPointId: null,
            ownerID: vehiclePartTree.ownerID || null,
            partName: null,
            repairCost: 0,
            scrapValue: 0,
        };

        log.debug(`Saving vehicle part: ${JSON.stringify(vehiclePart)}`);
        await savePart(vehiclePart);

        const newVehicle: TVehicle = {
            vehicleId: vehiclePartTree.vehicleId,
            skinId: vehiclePartTree.skinId,
            flags: vehiclePartTree.flags,
            class: vehiclePartTree.class,
            infoSetting: vehiclePartTree.infoSetting,
            damageInfo: vehiclePartTree.damageInfo,
        };

        log.debug(`Saving vehicle: ${JSON.stringify(newVehicle)}`);

        await slonik.query(sql.typeAlias("vehicle")`
            INSERT INTO vehicle (
                vehicleid,
                skinid,
                flags,
                class,
                infosetting,
                damageinfo
            ) VALUES (
                ${newVehicle.vehicleId},
                ${newVehicle.skinId},
                ${newVehicle.flags},
                ${newVehicle.class},
                ${newVehicle.infoSetting},
                ${newVehicle.damageInfo}
            )
        `);
    } catch (error) {
        log.error(`Error saving vehicle: ${error}`);
        throw error;
    }
}

export async function saveVehiclePartTree(
    vehiclePartTree: VehiclePartTreeType,
): Promise<void> {
    try {
        const partIds = new Set<number>();

        const partTree = vehiclePartTree.partTree;

        for (const part of partTree.level1.parts) {
            partIds.add(part.partId);
        }

        for (const part of partTree.level2.parts) {
            partIds.add(part.partId);
        }

        for (const partId of partIds) {
            const part =
                partTree.level1.parts.find((p) => p.partId === partId) ||
                partTree.level2.parts.find((p) => p.partId === partId);
            if (!part) {
                throw new Error(`Part with partId ${partId} not found`);
            }
            await savePart(part);
        }

        // Save the vehicle part tree in the cache
        setVehiclePartTree(vehiclePartTree.vehicleId, vehiclePartTree);

    } catch (error) {
        log.error(`Error saving vehicle part tree: ${error}`);
        throw error;
    }
}

export async function buildVehiclePartTreeFromDB(
    vehicleId: number,
): Promise<VehiclePartTreeType> {
    const vehicle = await slonik.one(sql.typeAlias("vehicle")`
        SELECT vehicleid, skinid, flags, class, infosetting, damageinfo
        FROM vehicle
        WHERE vehicleid = ${vehicleId}
    `);

    if (!vehicle) {
        throw new Error(`Vehicle with id ${vehicleId} does not exist`);
    }

    const vehiclePartTree: VehiclePartTreeType = {
        vehicleId: vehicle.vehicleid,
        skinId: vehicle.skinid,
        flags: vehicle.flags,
        class: vehicle.class,
        infoSetting: vehicle.infosetting,
        damageInfo: vehicle.damageinfo,
        isStock: false,
        ownedLotId: null,
        ownerID: null,
        partId: vehicle.vehicleid,
        parentPartId: null,
        brandedPartId: 0,
        partTree: {
            level1: {
                partId: 0,
                parts: [],
            },
            level2: {
                partId: 0,
                parts: [],
            },
        },
    };

    // Get first part
    const part = await slonik.one(sql.typeAlias("part")`
        SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue
        FROM part
        WHERE partid = ${vehicleId}
    `);

    if (!part) {
        throw new Error(`Part with id ${vehicleId} does not exist`);
    }

    vehiclePartTree.brandedPartId = part.brandedpartid;
    vehiclePartTree.ownerID = part.ownerid;

    const level1Parts = await slonik.many(sql.typeAlias("part")`
        SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue
        FROM part
        WHERE parentpartid = ${vehicleId}
    `);

    if (level1Parts.length === 0) {
        throw new Error(`Vehicle with id ${vehicleId} has no parts`);
    }

    log.debug(`We got parts!`);
    log.debug(
        `There are ${level1Parts.length} level 1 parts in the vehicle assembly`,
    );

    const level1PartsIds = level1Parts.map((part) => part.partid);

    log.debug(`level1PartsIds: ${level1PartsIds}`);

    for (const part of level1Parts) {

        log.debug(`Adding part: ${JSON.stringify(part)} to vehicle part tree level 1`);

        const newPart: TPart = {
            partId: part.partid,
            parentPartId: part.parentpartid,
            brandedPartId: part.brandedpartid,
            percentDamage: part.percentdamage,
            itemWear: part.itemwear,
            attachmentPointId: part.attachmentpointid,
            ownerID: part.ownerid,
            partName: part.partname,
            repairCost: part.repaircost,
            scrapValue: part.scrapvalue,
        };

        vehiclePartTree.partTree.level1.parts.push(newPart);
    }

    const level2Parts = await slonik.many(sql.typeAlias("part")`
        SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue
        FROM part
        WHERE parentpartid IN (${sql.join(level1PartsIds, sql.fragment`, `)})
    `);

    if (level2Parts.length === 0) {
        throw new Error(`Vehicle with id ${vehicleId} has no level 2 parts`);
    }

    log.debug(`We got parts!`);
    log.debug(
        `There are ${level2Parts.length} level 2 parts in the vehicle assembly`,
    );

    for (const part of level2Parts) {
        const newPart: TPart = {
            partId: part.partid,
            parentPartId: part.parentpartid,
            brandedPartId: part.brandedpartid,
            percentDamage: part.percentdamage,
            itemWear: part.itemwear,
            attachmentPointId: part.attachmentpointid,
            ownerID: part.ownerid,
            partName: part.partname,
            repairCost: part.repaircost,
            scrapValue: part.scrapvalue,
        };

        vehiclePartTree.partTree.level2.parts.push(newPart);
    }

    log.debug(`Vehicle part tree populated`);
    log.debug(`Vehicle part tree: ${JSON.stringify(vehiclePartTree)}`);

    setVehiclePartTree(vehiclePartTree.vehicleId, vehiclePartTree);

    return vehiclePartTree;
}
    

export async function buildVehiclePartTree({
    brandedPartId,
    skinId,
    ownedLotId,
    ownerID,
    isStock,
}: {
    brandedPartId: number;
    skinId: number;
    ownedLotId?: number;
    ownerID?: number;
    isStock: boolean;
}): Promise<VehiclePartTreeType> {
    if (ownedLotId === undefined && ownerID === undefined) {
        throw new Error("ownedLotId or ownerID is required");
    }

    const skinFlags = await slonik.one(sql.typeAlias("ptSkin")`
        SELECT defaultflag
        FROM ptskin
        WHERE skinid = ${skinId}
    `);

    if (!skinFlags) {
        throw new Error(`Skin with id ${skinId} does not exist`);
    }

    let vehicleId = undefined;

    // Get the vehicle assembly from the database
    const vehicleAssembly = await slonik.many(sql.typeAlias("detailedPart")`
        SELECT bp.brandedpartid, bp.parttypeid, a.attachmentpointid, pt.abstractparttypeid, apt.parentabstractparttypeid
        FROM stockassembly a
        INNER JOIN brandedpart bp ON a.childbrandedpartid = bp.brandedpartid
        inner join parttype pt on pt.parttypeid = bp.parttypeid
        inner join abstractparttype apt on apt.abstractparttypeid = pt.abstractparttypeid
        WHERE a.parentbrandedpartid = ${brandedPartId}
    `);

    if (vehicleAssembly.length === 0) {
        throw new Error(
            `Vehicle assembly with branded part id ${brandedPartId}`,
        );
    }

    // But we did get parts, right?
    log.debug(`We got parts!`);
    log.debug(
        `There are ${vehicleAssembly.length} parts in the vehicle assembly`,
    );

    const topPartId = await getNextPartId();

    partNumbersMap.set(101, topPartId);

    const vehiclePartTree: VehiclePartTreeType = {
        vehicleId: topPartId,
        skinId,
        isStock,
        flags: skinFlags.defaultflag,
        class: 0,
        infoSetting: 0,
        damageInfo: null,
        ownedLotId: ownedLotId || null,
        ownerID: ownerID || null,
        partId: topPartId,
        parentPartId: null,
        brandedPartId,
        partTree: {
            level1: {
                partId: 0,
                parts: [],
            },
            level2: {
                partId: 0,
                parts: [],
            },
        },
    };

    log.debug(`Vehicle part tree created`);
    log.debug(`Vehicle part tree: ${JSON.stringify(vehiclePartTree)}`);

    // Populate the vehicle part tree
    for (const part of vehicleAssembly) {
        const parentPartId = partNumbersMap.get(part.parentabstractparttypeid);

        log.debug(
            `parentAbstractPartTypeId: ${part.parentabstractparttypeid}, parentPartId: ${parentPartId}`,
        );

        if (parentPartId === undefined) {
            log.error(
                `parentPartId is undefined for part with parentabstractparttypeid ${part.parentabstractparttypeid}`,
            );
            console.dir(partNumbersMap);
            throw new Error(
                `parentPartId is undefined for part with parentabstractparttypeid ${part.parentabstractparttypeid}`,
            );
        }

        const thisPartId = await getNextPartId();

        if (!partNumbersMap.has(part.abstractparttypeid)) {
            partNumbersMap.set(part.abstractparttypeid, thisPartId);
        }

        const newPart: TPart = {
            partId: thisPartId,
            parentPartId: parentPartId,
            brandedPartId: part.brandedpartid,
            percentDamage: 0,
            itemWear: 0,
            attachmentPointId: part.attachmentpointid,
            ownerID: ownerID || null,
            partName: null,
            repairCost: 0,
            scrapValue: 0,
        };

        const partDepth = getPartDepth(part.abstractparttypeid);

        if (partDepth === 1) {
            vehiclePartTree.partTree.level1.parts.push(newPart);
        } else if (partDepth === 2) {
            vehiclePartTree.partTree.level2.parts.push(newPart);
        } else {
            throw new Error(`Part depth ${partDepth} is not supported`);
        }
    }

    log.debug(`Vehicle part tree populated`);
    log.debug(`Vehicle part tree: ${JSON.stringify(vehiclePartTree)}`);

    return vehiclePartTree;
}