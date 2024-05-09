import { pgTable, serial, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const assemblyPartTable = pgTable('assembly_part', {
	id: serial('assembly_part_id').primaryKey(),
	name: text('name'),
	count: integer('count'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date()),
	assemblyId: integer('assembly_id')
});

export const assemblyTable = pgTable('assembly', {
	id: serial('assembly_id').primaryKey(),
	name: text('name'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date()),
	finishedAt: timestamp('finished_at'),
	logsPath: text('logs_path')
});

export const modelTable = pgTable('model', {
	id: serial('model_id').primaryKey(),
	type: text('type'),
	path: text('path'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const renderTable = pgTable('render', {
	id: serial('render_id').primaryKey(),
	imgPath: text('img_path'),
	labelPath: text('label_path'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date()),
	modelId: integer('model_id')
});

export const frameTable = pgTable('frame', {
	id: serial('frame_id').primaryKey(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date()),
	labelsPath: text('labels_path'),
	path: text('path'),
	assemblyId: integer('assembly_id')
});

export const assemblyRelations = relations(assemblyTable, ({ many }) => ({
	assemblyParts: many(assemblyPartTable),
	frames: many(frameTable),
	assembliesToModels: many(assembliesToModels)
}));

export const assemblyPartRelations = relations(assemblyPartTable, ({ one }) => ({
	assembly: one(assemblyTable, {
		fields: [assemblyPartTable.assemblyId],
		references: [assemblyTable.id]
	})
}));

export const frameRelations = relations(frameTable, ({ one }) => ({
	assembly: one(assemblyTable, {
		fields: [frameTable.assemblyId],
		references: [assemblyTable.id]
	})
}));

export const modelRelations = relations(modelTable, ({ many }) => ({
	renders: many(renderTable),
	assembliesToModels: many(assembliesToModels)
}));

export const renderRelations = relations(renderTable, ({ one }) => ({
	model: one(modelTable, {
		fields: [renderTable.modelId],
		references: [modelTable.id]
	})
}));

export const assembliesToModels = pgTable(
	'assemblies_to_models',
	{
		assemblyId: integer('assembly_id')
			.notNull()
			.references(() => assemblyTable.id),
		modelId: integer('model_id')
			.notNull()
			.references(() => modelTable.id)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.assemblyId, t.modelId] })
	})
);

export const assembliesToModelsRelations = relations(assembliesToModels, ({ one }) => ({
	assembly: one(assemblyTable, {
		fields: [assembliesToModels.assemblyId],
		references: [assemblyTable.id]
	}),
	model: one(modelTable, {
		fields: [assembliesToModels.modelId],
		references: [modelTable.id]
	})
}));
