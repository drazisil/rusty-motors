CREATE TABLE StockVehicleAttributes (
	BrandedPartID INTEGER NOT NULL,
	CarClass INTEGER,
	AIRestrictionClass INTEGER,
	ModeRestriction INTEGER,
	Sponsor INTEGER,
	VinBrandedPartID INTEGER,
	TrackID INTEGER DEFAULT 0,
	VinCrc INTEGER DEFAULT 0 NOT NULL,
	RetailPrice INTEGER DEFAULT 1000,
	CONSTRAINT SYS_PK_12168 PRIMARY KEY (BrandedPartID),
	CONSTRAINT STOCKVEHICLEATTRIBUTES_BRANDEDPARTSTOCKVEHICLEATTRIBUTES FOREIGN KEY (BrandedPartID) REFERENCES BrandedPart(BrandedPartID) ON DELETE CASCADE,
	CONSTRAINT STOCKVEHICLEATTRIBUTES_BRANDEDPARTSTOCKVEHICLEATTRIBUTES1 FOREIGN KEY (VinBrandedPartID) REFERENCES BrandedPart(BrandedPartID),
	CONSTRAINT STOCKVEHICLEATTRIBUTES_SVA_CARCLASSSTOCKVEHICLEATTRIBUTES FOREIGN KEY (CarClass) REFERENCES SVA_CarClass(SVA_CarClass),
	CONSTRAINT STOCKVEHICLEATTRIBUTES_SVA_MODERESTRICTIONSTOCKVEHICLEATTRIBUTES FOREIGN KEY (ModeRestriction) REFERENCES SVA_ModeRestriction(SVA_ModeRestriction) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX STOCKVEHICLEATTRIBUTES_COPTRACKID ON StockVehicleAttributes (TrackID);
CREATE INDEX SYS_IDX_STOCKVEHICLEATTRIBUTES_BRANDEDPARTSTOCKVEHICLEATTRIBS1_12795 ON StockVehicleAttributes (VinBrandedPartID);
CREATE INDEX SYS_IDX_STOCKVEHICLEATTRIBUTES_BRANDEDPARTSTOCKVEHICLEATTRIBS_12786 ON StockVehicleAttributes (BrandedPartID);
CREATE UNIQUE INDEX SYS_IDX_STOCKVEHICLEATTRIBUTES_PARENTBRANDEDPARTID_12162 ON StockVehicleAttributes (BrandedPartID);
CREATE INDEX SYS_IDX_STOCKVEHICLEATTRIBUTES_SVA_CARCLASSSTOCKVEHICLEATTRIBUTES_12804 ON StockVehicleAttributes (CarClass);
CREATE INDEX SYS_IDX_STOCKVEHICLEATTRIBUTES_SVA_MODERESTRICTIONSTOCKVEHICLEATTRIBUTES_12813 ON StockVehicleAttributes (ModeRestriction);
CREATE UNIQUE INDEX SYS_IDX_SYS_PK_12168_12169 ON StockVehicleAttributes (BrandedPartID);