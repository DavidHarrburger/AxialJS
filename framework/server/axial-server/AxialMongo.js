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
     * @param { Boolean} r recursive
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


    static getObjectDifference( no, oo )
    {
        // todo
    }

    async getData( c = "", f = {}, m = "" )
    {
        console.log("AxialMongo.getData");
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
            console.log("final result", result);
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
            if( m !== "" && m !== undefined && m !== null )
            {
                tempModel = await models.findOne( { name: m } );
            }

            if( _id !== undefined )
            {
                actualDocument = await collection.findOne( { _id: new ObjectId( String(_id) ) } );
            }

            if( tempModel )
            {
                const initial = d;
                d = {};
                // check for immutable prop and review this part w/ a good objectutils
                if( actualDocument && actualDocument.uuid )
                {
                    d.uuid = actualDocument.uuid;
                }
                const props = tempModel.props;
                
                if( props )
                {
                    for( const p of Object.keys(props) )
                    {
                        let finalValue = undefined;

                        const modelProperty = props[p];

                        let value = initial[p];
                        if( value === undefined )
                        {
                            const tempObject = AxialMongo.getObjectByField( initial, "field", p );
                            if( tempObject && tempObject.value )
                            {
                                // cas spécial des array qd chaine requise // A REVOIR MAIS FIXE POUR LE MOMENT
                                if( Array.isArray( tempObject.value ) === true )
                                {
                                    let parser = {};
                                    parser.array = tempObject.value;
                                    value = AxialMongo.getObjectByField( parser, "field", p ).value;
                                }
                                else
                                {
                                    value = tempObject.value;
                                }
                            }
                        }
                    
                        // cryptage si requis et si la valeyur est bien une chaine
                        if( value )
                        {
                            if( modelProperty.type && modelProperty.type === "number" )
                            {
                                value = Number(value);
                            }

                            if( modelProperty.crypted && modelProperty.crypted === true && typeof value === "string" )
                            {
                                const cryptedValue = AxialCryptoUtils.encrypt(value);
                                finalValue = cryptedValue;
                            }
                            else
                            {
                                finalValue = value;
                            }
                        }

                        // comparaison rapide pour ne pas écraser l'objet créer Utils pour diff
                        if( finalValue === undefined )
                        {
                            if( actualDocument && actualDocument[p] )
                            {
                                finalValue = actualDocument[p];
                            }
                            else
                            {
                                if( Object.hasOwn(modelProperty,"default") === true )
                                {
                                    finalValue = modelProperty.default;
                                }
                                else
                                {
                                    finalValue = "";
                                }
                            }
                        }

                        if( finalValue !== undefined )
                        {
                            d[p] = finalValue;
                        }
                    }
                }
            }

            // check what happen without models

            if( d.uuid === undefined )
            {
                d.uuid = crypto.randomUUID();
            }

            if( d.creation_date === undefined )
            {
                d.creation_date = new Date();
            }
            
            if( _id )
            {
                delete d._id; // there is probably a mongo flag for that
                const replaced = await collection.updateOne({ _id: new ObjectId( String(_id) ) }, { $set: d } ); // use set / update instead of replace here important
                // DO NOT DELETED ID
                // PARSE THE NEW DOC AND COMPARE
                // THEN UPDATE
                result = replaced;
            }
            else
            {
                const inserted = await collection.insertOne(d);
                result = inserted;
            }
            
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            //await this.#mongo.close();
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
     * @param { String } c 
     * @param { String } uuid 
     * @returns 
     */
    async delData( c = "", uuid = "" )
    {
        let result;
        try
        {
            const mongo = await this.#mongo.connect();
            const db = mongo.db( this.#dbName );
            const collection = db.collection( c );
            const deletion = collection.deleteOne( { uuid: uuid } );
        }
        catch(err)
        {
            console.log(err);
            result = err;
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
