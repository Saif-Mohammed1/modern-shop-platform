// import type { Knex } from "knex";

// import { createRandomUsers } from "@/app/lib/utilities/faker";

// export async function seed(knex: Knex): Promise<void> {
//   // Deletes ALL existing entries
//   await knex("users").del();
//   const users = await createRandomUsers(5);
//   /** filter emails is not gmail or yahoo */
//   const filteredUsers = users.filter((user) => {
//     const email = user.email;
//     return !email.includes("gmail.com") && !email.includes("yahoo.com");
//   });
//   console.log("filteredUsers", filteredUsers);
//   // Inserts seed entries
//   //   await knex("users").insert(filteredUsers);
// }
