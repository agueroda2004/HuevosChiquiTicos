CREATE TYPE "public"."application_form" AS ENUM('food', 'water', 'fumigation', 'injection');--> statement-breakpoint
CREATE TYPE "public"."death_type" AS ENUM('sacrifice', 'disease', 'other');--> statement-breakpoint
CREATE TABLE "deaths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cage_id" uuid NOT NULL,
	"death_date" date NOT NULL,
	"quantity" integer NOT NULL,
	"type" "death_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cage_id" uuid NOT NULL,
	"discard_date" date NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "egg_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cage_id" uuid NOT NULL,
	"collection_date" date NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cage_id" uuid NOT NULL,
	"entry_date" date NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication_application_cages" (
	"application_id" uuid NOT NULL,
	"cage_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medication_id" uuid NOT NULL,
	"dose" varchar(100) NOT NULL,
	"application_date" date NOT NULL,
	"bird_count" integer NOT NULL,
	"type" "application_form",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deaths" ADD CONSTRAINT "deaths_cage_id_cages_id_fk" FOREIGN KEY ("cage_id") REFERENCES "public"."cages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discards" ADD CONSTRAINT "discards_cage_id_cages_id_fk" FOREIGN KEY ("cage_id") REFERENCES "public"."cages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egg_collections" ADD CONSTRAINT "egg_collections_cage_id_cages_id_fk" FOREIGN KEY ("cage_id") REFERENCES "public"."cages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_cage_id_cages_id_fk" FOREIGN KEY ("cage_id") REFERENCES "public"."cages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_application_cages" ADD CONSTRAINT "medication_application_cages_application_id_medication_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."medication_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_application_cages" ADD CONSTRAINT "medication_application_cages_cage_id_cages_id_fk" FOREIGN KEY ("cage_id") REFERENCES "public"."cages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_applications" ADD CONSTRAINT "medication_applications_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deaths_date_idx" ON "deaths" USING btree ("death_date");--> statement-breakpoint
CREATE INDEX "deaths_cage_idx" ON "deaths" USING btree ("cage_id");--> statement-breakpoint
CREATE INDEX "discards_date_idx" ON "discards" USING btree ("discard_date");--> statement-breakpoint
CREATE INDEX "discards_cage_idx" ON "discards" USING btree ("cage_id");--> statement-breakpoint
CREATE INDEX "egg_collections_date_idx" ON "egg_collections" USING btree ("collection_date");--> statement-breakpoint
CREATE INDEX "egg_collections_cage_idx" ON "egg_collections" USING btree ("cage_id");--> statement-breakpoint
CREATE INDEX "entries_date_idx" ON "entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "entries_cage_idx" ON "entries" USING btree ("cage_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medication_application_cages_idx" ON "medication_application_cages" USING btree ("application_id","cage_id");--> statement-breakpoint
CREATE INDEX "medication_application_cages_cage_idx" ON "medication_application_cages" USING btree ("cage_id");--> statement-breakpoint
CREATE INDEX "medication_applications_date_idx" ON "medication_applications" USING btree ("application_date");--> statement-breakpoint
CREATE UNIQUE INDEX "medications_name_idx" ON "medications" USING btree ("name");