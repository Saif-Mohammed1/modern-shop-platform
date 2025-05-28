import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Check for existing indexes and drop them outside the `alterTable` callback
  // const hasFingerprintIndex = await knex.raw(
  //   `SHOW INDEX FROM device_fingerprints WHERE Key_name = 'idx_device_fingerprints_fingerprint'`
  // );

  const hasFingerprintIndex = await knex
    .select("indexname")
    .from("pg_indexes")
    .where({
      tablename: "device_fingerprints",
      indexname: "idx_device_fingerprints_fingerprint",
    });

  // const hasIpIndex = await knex.raw(
  //   `SHOW INDEX FROM device_fingerprints WHERE Key_name = 'idx_device_fingerprints_ip'`
  // );
  const hasIpIndex = await knex.select("indexname").from("pg_indexes").where({
    tablename: "device_fingerprints",
    indexname: "idx_device_fingerprints_ip",
  });
  // const hasLocationCityIndex = await knex.raw(
  //   `SHOW INDEX FROM device_fingerprints WHERE Key_name = 'idx_device_fingerprints_location_city'`
  // );
  const hasLocationCityIndex = await knex
    .select("indexname")
    .from("pg_indexes")
    .where({
      tablename: "device_fingerprints",
      indexname: "idx_device_fingerprints_location_city",
    });
  // const hasLocationCountryIndex = await knex.raw(
  //   `SHOW INDEX FROM device_fingerprints WHERE Key_name = 'idx_device_fingerprints_location_country'`
  // );
  const hasLocationCountryIndex = await knex
    .select("indexname")
    .from("pg_indexes")
    .where({
      tablename: "device_fingerprints",
      indexname: "idx_device_fingerprints_location_country",
    });
  const hasFingerprintColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "fingerprint"
  );

  const hasOsColumn = await knex.schema.hasColumn("device_fingerprints", "os");
  const hasBrowserColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "browser"
  );
  const hasDeviceColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "device"
  );
  const hasBrandColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "brand"
  );
  const hasModelColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "model"
  );

  await knex.schema.alterTable("device_fingerprints", (table) => {
    if (hasFingerprintIndex.length > 0) {
      table.dropIndex("fingerprint", "idx_device_fingerprints_fingerprint");
    }

    if (hasIpIndex.length > 0) {
      table.dropIndex("ip", "idx_device_fingerprints_ip");
    }

    if (hasLocationCityIndex.length > 0) {
      table.dropIndex("location_city", "idx_device_fingerprints_location_city");
    }

    if (hasLocationCountryIndex.length > 0) {
      table.dropIndex(
        "location_country",
        "idx_device_fingerprints_location_country"
      );
    }

    // Perform the schema changes
    if (hasFingerprintColumn) {
      table
        .string("fingerprint")
        .references("fingerprint")
        .inTable("device_details")
        .onDelete("CASCADE")
        .notNullable()
        .alter();
    } else {
      table
        .string("fingerprint")
        .references("fingerprint")
        .inTable("device_details")
        .onDelete("CASCADE")
        .notNullable();
    }

    if (hasOsColumn) {
      table.dropColumn("os");
    }
    if (hasBrowserColumn) {
      table.dropColumn("browser");
    }
    if (hasDeviceColumn) {
      table.dropColumn("device");
    }
    if (hasBrandColumn) {
      table.dropColumn("brand");
    }
    if (hasModelColumn) {
      table.dropColumn("model");
    }
    // Add new indexes
    table.index("fingerprint", "idx_fingerprints_fingerprint");
    table.index("ip", "idx_fingerprints_ip");
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasOsColumn = await knex.schema.hasColumn("device_fingerprints", "os");
  const hasBrowserColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "browser"
  );
  const hasDeviceColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "device"
  );
  const hasBrandColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "brand"
  );
  const hasModelColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "model"
  );
  const hasFingerprintColumn = await knex.schema.hasColumn(
    "device_fingerprints",
    "fingerprint"
  );
  const hasIpIndex = await knex.select("indexname").from("pg_indexes").where({
    tablename: "device_fingerprints",
    indexname: "idx_device_fingerprints_ip",
  });
  // Check for existing indexes and drop them outside the `alterTable` callback
  // const hasFingerprintIndex = await knex
  //   .select("indexname")
  //   .from("pg_indexes")
  //   .where({
  //     tablename: "device_fingerprints",
  //     indexname: "idx_fingerprints_fingerprint",
  //   });
  // const hasIpIndex = await knex.select("indexname").from("pg_indexes").where({
  //   tablename: "device_fingerprints",
  //   indexname: "idx_fingerprints_ip",
  // });
  // const hasLocationCityIndex = await knex
  //   .select("indexname")
  //   .from("pg_indexes")
  //   .where({
  //     tablename: "device_fingerprints",
  //     indexname: "idx_device_fingerprints_location_city",
  //   });
  const hasUserIdIndex = await knex
    .select("indexname")
    .from("pg_indexes")
    .where({
      tablename: "device_fingerprints",
      indexname: "idx_device_fingerprints_user_id_source",
    });

  await knex.schema.alterTable("device_fingerprints", (table) => {
    // if (hasFingerprintIndex.length > 0) {
    //   table.dropIndex("idx_fingerprints_fingerprint");
    // }

    if (hasUserIdIndex.length > 0) {
      table.dropIndex("idx_device_fingerprints_user_id_source");
    }

    // table.string("os", 50).notNullable();
    // table.string("browser", 50).notNullable();
    // table.string("device", 50).notNullable();
    // table.string("brand", 50).nullable();
    // table.string("model", 50).nullable();
    // table.string("fingerprint", 255).notNullable();

    if (!hasFingerprintColumn) {
      table.string("fingerprint").notNullable();
    }
    if (!hasOsColumn) {
      table.string("os", 50).notNullable();
    }
    if (!hasBrowserColumn) {
      table.string("browser", 50).notNullable();
    }
    if (!hasDeviceColumn) {
      table.string("device", 50).notNullable();
    }
    if (!hasBrandColumn) {
      table.string("brand", 50).nullable();
    }
    if (!hasModelColumn) {
      table.string("model", 50).nullable();
    }
    // Optional: index for faster lookup
    table.index("fingerprint", "idx_device_fingerprints_fingerprint");
    if (!hasIpIndex.length) {
      table.index("ip", "idx_device_fingerprints_ip");
    }
    table.index("location_city", "idx_device_fingerprints_location_city");
    table.index("location_country", "idx_device_fingerprints_location_country");
  });
}
