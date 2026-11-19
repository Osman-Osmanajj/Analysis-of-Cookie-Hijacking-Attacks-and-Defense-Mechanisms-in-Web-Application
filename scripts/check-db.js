import "dotenv/config";
import { connectDatabase, closeDatabase } from "../config/database.js";

try {
    const database = await connectDatabase();
        console.log(`MongoDb u lidh me databazen: ${database.databaseName}`)
} catch (error) {
    console.log("Lidhja me database deshtoj:", error.message);
    process.exitCode = 1;
}
await closeDatabase();
