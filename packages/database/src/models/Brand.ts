import { DataTypes, Model } from "sequelize";
import { getDatabase } from "../services/database.js";

export class Brand extends Model {}

Brand.init(
    {
        brandId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        brand: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        picName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },            
        },
        isStock: {
            type: DataTypes.SMALLINT,
            defaultValue: 0,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "Brand",
        tableName: "brands",
        timestamps: false,
        indexes: [
            {
                fields: ["brandId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/Brand.ts