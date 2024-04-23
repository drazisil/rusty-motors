import { DataTypes, Model } from "sequelize";
import { getDatabase } from "../services/database.js";

export class AttachmentPoint extends Model {};

AttachmentPoint.init(
    {
        attachmentPointId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        attachmentPoint: {
            type: DataTypes.STRING,
            validate: {
                len: [1, 100],
            },
            allowNull: false,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "AttachmentPoint",
        tableName: "attachment_points",
        timestamps: false,
        indexes: [
            {
                fields: ["attachmentPointId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/AttachmentPoint.ts
