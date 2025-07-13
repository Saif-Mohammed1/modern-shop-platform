// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

import dotenv from "dotenv";
import type { Knex } from "knex";

dotenv.config({ path: "./config/.env" }); // Add this at top

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      ssl: {
        rejectUnauthorized: false, // Adjust based on your SSL requirements
      },
    },
    // debug: ["development", "test"].includes(process.env.NODE_ENV || ""),
    migrations: {
      directory: `./app/server/db/migrations`,
      extension: "ts", //define work typescript to migrations
      tableName: "knex_migrations",
    },
    seeds: {
      extension: "ts", //define work typescript to migrations
      directory: `./app/server/db/seeds`,
    },
    debug: false,
    pool: {
      min: 2,
      max: 10,
    },
  },

  // staging: {
  //   client: "postgresql",
  //   connection: {
  //     database: "my_db",
  //     user: "username",
  //     password: "password",
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10,
  //   },
  //   migrations: {
  //     tableName: "knex_migrations",
  //   },
  // },

  // production: {
  //   client: "postgresql",
  //   connection: {
  //     database: "my_db",
  //     user: "username",
  //     password: "password",
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10,
  //   },
  //   migrations: {
  //     tableName: "knex_migrations",
  //   },
  // },
};
export default config;
// module.exports = {

//   development: {
//     client: 'sqlite3',
//     connection: {
//       filename: './dev.sqlite3'
//     }
//   },

//   staging: {
//     client: 'postgresql',
//     connection: {
//       database: 'my_db',
//       user:     'username',
//       password: 'password'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   },

//   production: {
//     client: 'postgresql',
//     connection: {
//       database: 'my_db',
//       user:     'username',
//       password: 'password'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   }

// };
