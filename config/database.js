import { MongoClient } from "mongodb";
let client;

export async function connectDatabase(){
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if(!uri || !dbName){
        throw new Error("MONGO_DB dhe MONGO_DB_NAME are missing in .env");
    }
    client = new MongoClient(uri,{serverSelectionTimeoutMS : 5000});
    await client.connect();

    const database = client.db(dbName);
    await database.command({ping : 1});

    return database;
}
export async function closeDatabase(){
    if(client){
        await client.close();
    }
}