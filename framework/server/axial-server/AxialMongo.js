"use strict";

import { MongoClient, ServerApiVersion } from "mongodb";

class AxialMongo
{
    /**
     * @type { MongoClient }
     */
    #mongo = undefined;

    /**
     * @type { String }
     */
    #dbUrl = "";

    /**
     * @type { String }
     */
    #dbName = "";

    /**
     * @type { Boolean }
     */
    #isInit = false;

    /**
     * Init the MongoClient and stores the database where we work
     * @param { String } url 
     * @param { String } name 
     * @returns 
     */
    constructor( url = "", name = "" )
    {
        this.#dbUrl = url;
        this.#dbName = name;
        const MONGO_CLIENT = new MongoClient( this.#dbUrl,
        {
            serverApi:
            {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        if( MONGO_CLIENT )
        {
            this.#mongo = MONGO_CLIENT;
        }
    }

    /**
     * Returns all documents from a MongoDB collection into an Array
     * @param { String } c 
     * @returns { Array }
     * @async
     */
    async getCollection( c = "" )
    {
        console.log("AxialMongo.getCollection");
        if( typeof c !== "string" )
        {
            throw new Error("[AXIAL_SERVER_ERROR] AxialMongo.getCollection");
        }

        let result = [];
        try
        {
            const mongo = await this.#mongo.connect();
            const db = mongo.db( this.#dbName );
            const collection = db.collection( c );
            const docs = await collection.find({}).toArray();
            result = docs;
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            await this.#mongo.close();
            return result;
        }
    }
}

export { AxialMongo }
