"use strict";

class AxialAuthManager extends EventTarget
{
    /// vars
    /** @type { String } */
    #DB_NAME = "AXIAL_AUTH_DB";

    /** @type { Number } */
    #DB_VERSION = 1;

    /** @type { String } */
    #STORE_NAME = "kv";

    /** @type { String } */
    #REFRESH_KEY = "refresh_token";

    /** @type { String } */
    #DEVICE_KEY = "device_id";

    /** @type { IDBOpenDBRequest } */
    #currentRequest;

    /** @type { Boolean } */
    #dbReady = false;

    /// events
    /** @type { Function } */
    #boundRequestUpgradeNeeded;

    /** @type { Function } */
    #boundRequestSuccess;

    /** @type { Function } */
    #boundRequestError;

    /** @type { Function } */
    #boundTransactionComplete;

    /** @type { Function } */
    #boundTransactionError;

    constructor()
    {
        super();

        // db request
        this.#boundRequestUpgradeNeeded = this.#requestUpdgradeNeeded.bind(this);
        this.#boundRequestSuccess = this.#requestSuccess.bind(this);
        this.#boundRequestError = this.#requestError.bind(this);

        // db transaction
        this.#boundTransactionComplete = this.#transactionComplete.bind(this);
        this.#boundTransactionError = this.#transactionError.bind(this);

        this.#checkLogin();

    }

    #requestUpdgradeNeeded( event )
    {
        console.log("DB REQUEST UPGRADE NEEDED")
        console.log( event );
        const db = this.#currentRequest.result;
        if( db.objectStoreNames.contains( this.#STORE_NAME) === false )
        {
            db.createObjectStore( this.#STORE_NAME );
        }
    }

    #requestSuccess( event )
    {
        console.log("DB REQUEST SUCCESS")
        //this.#startLogin();
    }

    #requestError( event )
    {
        //console.log("DB REQUEST ERROR")
    }

    #transactionComplete( event )
    {
        console.log("TRANSACTION SUCCESS")
        console.log( event.target.result );
    }

    #transactionError( event )
    {
        console.log("TRANSACTION ERROR")
    }

    /**
     * 
     * @returns { Promise<Object> }
     */
    async #openDB()
    {
        return new Promise( (resolve, reject ) => 
        {
            const request = indexedDB.open( this.#DB_NAME, this.#DB_VERSION );
            request.addEventListener( "upgradeneeded", () => 
            {
                const db = request.result;
                if( db.objectStoreNames.contains( this.#STORE_NAME ) === false )
                {
                    db.createObjectStore( this.#STORE_NAME );
                }
            });

            request.addEventListener( "success", () => resolve( request.result ) );
            request.addEventListener( "error", () => reject( request.error ) );
        });
    }

    async #checkLogin()
    {
        try
        {
            const token = await this.#getValue( this.#REFRESH_KEY );
            console.log( token );
            
        }
        catch(err)
        {
            console.log( err );
        }
    }

    async #startLogin()
    {
        try
        {

        }
        catch(err)
        {

        }
    }

    async #setKeyValue( key, value )
    {
        try
        {
            const db = await this.#openDB();
            return new Promise( ( resolve, reject ) => 
            {
                const tx = db.transaction( this.#STORE_NAME, "readwrite" );
                tx.objectStore(this.#STORE_NAME).put( value, key); // value and key inverted -> normal :)
                
                tx.addEventListener( "complete", resolve );
                tx.addEventListener( "error", () => reject( tx.error ) );
                
            });
        }
        catch(err)
        {
            console.log(err)
        }
    }

    async #getValue( key )
    {
        try
        {
            const db = await this.#openDB();
            return new Promise( ( reject, resolve ) => 
            {
                const tx = db.transaction( this.#STORE_NAME, "readonly" );
                const request = tx.objectStore( this.#STORE_NAME ).get( key );

                request.addEventListener( "success", () => resolve( request.result ) );
                request.addEventListener( "error", () => reject( request.error ) );
            });
        }
        catch(err)
        {

        }
    }

    #deleteValue( key )
    {

    }

    #createDeviceId() { return crypto.randomUUID(); }

    /** @readonly */
    get deviceId()
    {

    }
}

export { AxialAuthManager }