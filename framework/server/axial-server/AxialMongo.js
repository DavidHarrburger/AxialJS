"use strict";

import EventEmitter from "node:events";
import crypto from "node:crypto";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { AxialCryptoUtils } from "./AxialCryptoUtils.js";


class AxialMongo extends EventEmitter
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
        super();

        this.#dbUrl = url;
        this.#dbName = name;
        const MONGO_CLIENT = new MongoClient( this.#dbUrl,
        {
            serverApi:
            {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            family: 4
        });

        if( MONGO_CLIENT )
        {
            this.#mongo = MONGO_CLIENT;
        }
    }

    /**
     * 
     * @param { Object } o the object we want to parse
     * @param {*} n 
     * @param {*} f 
     * @param { Boolean } r recursive
     * @returns 
     */
    static getObjectByField( o, n, f, r = true )
    {
        // do not forget to check args ;)
        for( const p of Object.keys( o ) )
        {
            const a = o[p];
            if( p === n && a === f ) { return o; }
            if( r === true && Array.isArray(a) === true )
            {
                for( const b of a )
                {
                    const i = AxialMongo.getObjectByField( b, n, f );
                    if( i !== undefined ) { return i; }
                }
            }
        }
        return undefined;
    }

    async getDatabaseStats()
    {
        let stats = {}
        try
        {
            const mongo = await this.#mongo.connect();
            const db = mongo.db( this.#dbName );
            const collections = await db.listCollections().toArray();
            for( const collection of collections )
            {
                
            }
            stats = await db.stats( { scale: 1024 } );
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            return stats;
        }
    }


    static getObjectDifference( no, oo )
    {
        // todo
    }

    async getData( c = "", f = {}, m = "" )
    {
        console.log("AxialMongo.getData");

        /// DANGER TEST
        if( f && f._id )
        {
            f._id = new ObjectId( String(f._id ) );
        }

        console.log( c, f, m );
        let result;
        try
        {
            // check
            if( typeof c !== "string" )
            {
                throw new Error("[AXIAL_SERVER_ERROR] AxialMongo.getData");
            }

            if( typeof m !== "string" )
            {
                throw new Error("[AXIAL_SERVER_ERROR] AxialMongo.getData");
            }
            // more checks even if the api should have checked them

            // test error
            //throw new Error("[AXIAL_SERVER_ERROR] AxialMongo.getData");

            // db
            const mongo = await this.#mongo.connect();
            const db = mongo.db( this.#dbName );
            
            // model check
            let modelObject;
            if( m !== "" )
            {
                const models = db.collection( "models" );
                const modelArray = await models.find( { name: m } ).toArray();
                if( modelArray.length === 1 )
                {
                    modelObject = modelArray[0];
                }
            }
            // rewrite filter if model
            if( modelObject && modelObject.props )
            {
                const modelProps = modelObject.props;
                for( const pf of Object.keys(f) )
                {
                    const modelValue = modelProps[pf];
                    if( modelValue && modelValue.crypted && modelValue.crypted === true )
                    {
                        f[pf] = AxialCryptoUtils.encrypt( f[pf] );
                    }
                }
            }

            // get requested collection
            const collection = db.collection( c );
            result = await collection.find(f).toArray();
            
            // model exists, go for decrypt
            if( modelObject && modelObject.props )
            {
                const modelProps = modelObject.props;
                for( const p of Object.keys( modelProps ) )
                {
                    const modelValue = modelProps[p];
                    // decrypt
                    if( modelValue && modelValue.crypted && modelValue.crypted === true )
                    {
                        //console.log( `${p} requires decrypt` );
                        for( const item of result )
                        {
                            if( item[p] )
                            {
                                item[p] = AxialCryptoUtils.decrypt( item[p]);
                            } 
                        }
                    }

                    // delete retricted properties
                    if( modelValue && modelValue.restricted && modelValue.restricted === true )
                    {
                        //console.log( `${p} requires decrypt` );
                        for( const item of result )
                        {
                            if( item[p] )
                            {
                                delete item[p];
                            } 
                        }
                    }
                }
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            //await this.#mongo.close();
            if( result === undefined )
            {
                result = null;
            }
            else if( Array.isArray(result) )
            {
                if( result.length === 0 )
                { 
                    result = null;
                }
                else if( result.length === 1 )
                {
                    result = result[0];
                }
            }
            //console.log("api data get result", result);
            return result;
        }
    }

    /**
     * 
     * @param { String } c The Collection name
     * @param { Object } d The Document object
     * @param { String } m The Model name
     * @returns 
     */
    async setData( c = "", d = {}, m = "" )
    {
        //console.log("AxialMongo.setData");
        let result = {};
        const _id = d._id;
        
        try
        {
            const mongo = await this.#mongo.connect();
            const db = mongo.db( this.#dbName );
            const collection = db.collection( c );

            const models = db.collection( "models" );
            let tempModel = undefined;
            let actualDocument = undefined;
            let update = false;
            let final = {};

            // on récupère le modèle
            if( m !== "" && m !== undefined && m !== null )
            {
                tempModel = await models.findOne( { name: m } );
            }

            // on recherche un document existant
            if( _id !== undefined )
            {
                actualDocument = await collection.findOne( { _id: new ObjectId( String(_id) ) } );
            }

            // le document existe on ne mettra à jour que les champs concernés
            if( actualDocument ) { update = true; } else { update = false; }

            if( tempModel )
            {
                // le modèle existe et un document existe avec un _id
                // on parse d avec le modèle pour le checker par exemple si il faut crypter un champ
                const props = tempModel.props;
                for( const propertyName of Object.keys(props) )
                {
                    let testValue = undefined;
                    let finalValue = undefined;
                    const propertyParams = props[propertyName];

                    // on recherche la propriété au niveau 1 de l'objet
                    testValue = d[propertyName];
                    // propriété non trouvée, on cherche
                    if( testValue === undefined )
                    {
                        const testObject = AxialMongo.getObjectByField( d, "field", propertyName );
                        if( testObject && testObject.value )
                        {
                            testValue = testObject.value;
                        }
                    }
                    
                    if( testValue === undefined )
                    {
                        // AUCUNE valeur n'a été trouvée dans le document transmis en POST
                        // si le document n'existe pas, on crée le default
                        if( update === false && propertyParams.default !== undefined )
                        {
                            testValue = propertyParams.default;
                        }
                    }
                    else
                    {
                        // une valeur a été trouvée, on regarde si elle doit être traitée et notamment cryptée
                        // passage en nombre
                        if( propertyParams.type && propertyParams.type === "number" )
                        {
                            testValue = Number(testValue);
                        }

                        // cryptage
                        if( propertyParams.crypted && propertyParams.crypted === true && typeof testValue === "string" )
                        {
                            const cryptedValue = AxialCryptoUtils.encrypt(testValue);
                            testValue = cryptedValue;
                        }
                    }
                    finalValue = testValue; // not super but have my idea
                    if( update === false || ( update === true && finalValue != undefined ) )
                    {
                        final[propertyName] = finalValue;
                    }
                }
            }
            else
            {
                final = d;
            }

            /// final
            if( update === false )
            {
                if( final.uuid === undefined ) { final.uuid = crypto.randomUUID(); }
                if( final.creation_date === undefined ) { final.creation_date = new Date(); }

                result = await collection.insertOne( final );
            }
            else
            {
                delete final._id; // there is probably a mongo flag for that
                result = await collection.updateOne({ _id: new ObjectId( String(_id) ) }, { $set: final } ); // use set / update instead of replace here important
            }            
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            return result;
        }
    }

    /**
     * 
     * @param { String } c 
     * @param { Object } f 
     * @param { Object } u 
     */
    async updateData( c = "", f = {}, u = {} )
    {
        //console.log("AxialMongo.updateData");
        let result;
        try
        {
            const mongo = await this.#mongo.connect();
            const db = mongo.db( this.#dbName );
            const collection = db.collection( c );
            result = await collection.updateOne( f, u );
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            return result;
        }
    }

    /**
     * 
     * @param { String } m 
     * @param { String } _id 
     * @returns 
     */
    async delData( m = "", _id = "" )
    {
        let result;
        try
        {
            if( m === undefined || m.trim() === "" )
            {
                throw new Error("param 'm' model is missing");
            }

            if( _id === undefined || _id.trim() === "" )
            {
                throw new Error("param '_id' is missing");
            }

            const mongo = await this.#mongo.connect();
            const db = mongo.db( this.#dbName );
            const model = await this.getData("models", { name: m} );
            const collection = db.collection( model.collection );
            const deletion = await collection.deleteOne( { _id: new ObjectId( String(_id) ) } );
            console.log( deletion );
            result = deletion;
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            return result;
        }
    }

    /**
     * 
     * @param { String } code 
     * @param { String } checker 
     * @returns { Object }
     */
    async setTimeCode( code, checker )
    {
        try
        {
            const mongo = await this.#mongo.connect();
            const db = mongo.db( this.#dbName );
            const collection = db.collection( "codes" );
            const timedoc =
            {
                timeid: new Date(),
                timecode: code,
                timechecker: checker
            };
            const result = await collection.insertOne(timedoc);
            return result;

        }
        catch(err)
        {
            console.log(err);
        }
    }
}

export { AxialMongo }