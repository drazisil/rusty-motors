CREATE TABLE
	IF NOT EXISTS pt_skin (
		skin_id INTEGER NOT NULL,
		creator_id INTEGER,
		skin_type_id INTEGER,
		part_type_id INTEGER,
		e_skin VARCHAR(100),
		g_skin VARCHAR(20),
		f_skin VARCHAR(20),
		s_skin VARCHAR(20),
		i_skin VARCHAR(20),
		j_skin VARCHAR(20),
		sw_skin VARCHAR(20),
		b_skin VARCHAR(20),
		price INTEGER NOT NULL,
		part_filename VARCHAR(20),
		h0 SMALLINT,
		s0 SMALLINT,
		v0 SMALLINT,
		c0 SMALLINT,
		x0 SMALLINT,
		y0 SMALLINT,
		h1 SMALLINT,
		s1 SMALLINT,
		v1 SMALLINT,
		c1 SMALLINT,
		x1 SMALLINT,
		y1 SMALLINT,
		h2 SMALLINT,
		s2 SMALLINT,
		v2 SMALLINT,
		c2 SMALLINT,
		x2 SMALLINT,
		y2 SMALLINT,
		h3 SMALLINT,
		s3 SMALLINT,
		v3 SMALLINT,
		c3 SMALLINT,
		x3 SMALLINT,
		y3 SMALLINT,
		h4 SMALLINT,
		s4 SMALLINT,
		v4 SMALLINT,
		c4 SMALLINT,
		x4 SMALLINT,
		y4 SMALLINT,
		h5 SMALLINT,
		s5 SMALLINT,
		v5 SMALLINT,
		c5 SMALLINT,
		x5 SMALLINT,
		y5 SMALLINT,
		h6 SMALLINT,
		s6 SMALLINT,
		v6 SMALLINT,
		c6 SMALLINT,
		x6 SMALLINT,
		y6 SMALLINT,
		h7 SMALLINT,
		s7 SMALLINT,
		v7 SMALLINT,
		c7 SMALLINT,
		x7 SMALLINT,
		y7 SMALLINT,
		default_flag INTEGER DEFAULT 0,
		creator_name VARCHAR(24),
		comment_text VARCHAR(128),
		CONSTRAINT sys_pk_12047 PRIMARY KEY (skin_id),
		CONSTRAINT pt_skin_part_type_pt_skin FOREIGN KEY (part_type_id) REFERENCES part_type (part_type_id),
		CONSTRAINT pt_skin_skin_type_pt_skin FOREIGN KEY (skin_type_id) REFERENCES skin_type (skin_type_id)
	);

CREATE INDEX sys_idx_pt_skin_part_type_pt_skin_12628 ON pt_skin (part_type_id);

CREATE INDEX sys_idx_pt_skin_skin_type_pt_skin_12636 ON pt_skin (skin_type_id);

CREATE UNIQUE INDEX sys_idx_sys_pk_12047_12048 ON pt_skin (skin_id);