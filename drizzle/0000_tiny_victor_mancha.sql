CREATE TABLE IF NOT EXISTS "assemblies_to_models" (
	"assembly_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	CONSTRAINT "assemblies_to_models_assembly_id_model_id_pk" PRIMARY KEY("assembly_id","model_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assembly_part" (
	"assembly_part_id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"count" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"assembly_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assembly" (
	"assembly_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"finished_at" timestamp,
	"logs_path" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "frame" (
	"frame_id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"labels_path" text,
	"path" text,
	"assembly_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "model" (
	"model_id" serial PRIMARY KEY NOT NULL,
	"type" text,
	"path" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "render" (
	"render_id" serial PRIMARY KEY NOT NULL,
	"img_path" text,
	"label_path" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"model_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assemblies_to_models" ADD CONSTRAINT "assemblies_to_models_assembly_id_assembly_assembly_id_fk" FOREIGN KEY ("assembly_id") REFERENCES "assembly"("assembly_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assemblies_to_models" ADD CONSTRAINT "assemblies_to_models_model_id_model_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "model"("model_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
