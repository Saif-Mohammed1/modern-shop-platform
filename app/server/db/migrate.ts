//  migrate.ts
/**
 * to run this script you need to have tsx pkg installed
 * npm i  tsx
 * then run
 * npm tsx migrate.ts <command>
 * you can add it to your package.json scripts
 * "migrate": "tsx migrate.ts"
 * then run
 * npm run migrate <command>
 * example:
 * npm run migrate migrate:up
 */
import { connectDB } from "./db";

type MigrationResult = [batch: number, migrations: string[]];
function showMigrationResult(
  label: string,
  [batch, migrations]: MigrationResult
) {
  if (migrations.length === 0) {
    console.log("No migrations affected.");
    return;
  }
  console.log(label, "batch:", batch);
  console.log("migrations:");
  console.log(migrations.map((s) => `- ${s}`).join("\n"));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length == 0) {
    console.error("Error: missing connectDB() command in argument");
    return;
  }

  switch (args[0]) {
    case "migrate:up": {
      showMigrationResult("migrate:up", await connectDB().migrate.up());
      break;
    }
    case "migrate:down": {
      showMigrationResult("migrate:down", await connectDB().migrate.down());
      break;
    }
    case "migrate:latest": {
      showMigrationResult("migrate:latest", await connectDB().migrate.latest());
      break;
    }
    case "migrate:rollback": {
      const config = undefined;
      const all = args[1] === "--all";
      showMigrationResult(
        "rollback",
        await connectDB().migrate.rollback(config, all)
      );
      break;
    }
    case "migrate:status": {
      type Result = [{ name: string }[], { file: string }[]];
      const [done, pending] = (await connectDB().migrate.list()) as Result;

      console.log(done.length, "applied migrations");
      for (const each of done) {
        console.log(`- ${each.name}`);
      }

      console.log(pending.length, "pending migrations");
      for (const each of pending) {
        console.log(`- ${each.file}`);
      }
      break;
    }
    case "migrate:make": {
      const result = await connectDB().migrate.make(args[1]);
      console.log(result);
      break;
    }
    case "seed:run": {
      await connectDB().seed.run();
      console.log("seed applied successfully");
      console.log("");
      break;
    }
    default: {
      console.error("Error: unknown arguments:", args);
    }
  }
}
main()
  .catch((e) => console.error("Error:", e))
  .finally(async () => {
    await connectDB().destroy();
    console.log(" ");
    console.log("Database connection closed.");
  });
