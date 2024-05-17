"use strict"

import { MongoClient } from "mongodb";
import { DATABASE_NAME } from "./AxialServerConstants.js";
import { AxialCryptoUtils } from "./AxialCryptoUtils.js";

class AxialMongoUtils
{
    /**
     * 
     * @param { MongoClient } mongoClient 
     * @param { String } collectionName 
     * @param { Object } object 
     * @param { Boolean } crypto
     */
    static async registerInCollection( mongoClient, collectionName, object, crypto = false )
    {
        try
        {
            let o = object; // check w/ const
            const client = await mongoClient.connect();    
            const db = client.db(DATABASE_NAME);
            const collection = db.collection(collectionName);

            if( crypto === true )
            {
                for( const p of Object.keys(o) )
                {
                    if( typeof o[p] === "string" )
                    {
                        o[p] = AxialCryptoUtils.encrypt( o[p] );
                    }
                }
            }
            
            if( collection )
            {
                const result = await collection.insertOne( o );
            }
            
        }
        catch( err )
        {
            console.log(err);
        }
        finally
        {
            //await mongoClient.close();
        }
    }
}

export { AxialMongoUtils }