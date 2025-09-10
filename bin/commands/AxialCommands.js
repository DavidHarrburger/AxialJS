"use strict";

import crypto from "node:crypto";
import EventEmitter from "events";
import process from "process";
import path from "path";
import fse from "fs-extra";
import less from "less";
import webpack from "webpack";
import os from "os";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { api as electronForge } from "@electron-forge/core";

class AxialCommands extends EventEmitter
{
    /**
     * @type { String }
     */
    #VERSION = "1.0.0";

    /** @type { String } */
    #CRYPTO_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    /**
     * @type { Set }
     */
    #commands = new Set( [ "init", "newpage", "build", "config", "electron", "database", "sitemap", "keys", "version" ] );

    #paramsInit =     new Set( [ "-front", "-server", "-electron" ] );
    #paramsNewPage =  new Set( [ "-name", "-template", "-path" ] );
    #paramsBuild =    new Set( [ "-dev", "-prod" ] );
    #paramsElectron = new Set( [ "-start", "-package", "-make", "-publish" ] ); //etc "-publish"  move to start atm

    /**
     * @type { String }
     */
    #configurationFileName = "axial-config.json";

    /**
     * @type { String }
     */
    #databaseConfigurationFileName = "axial-database.json";

    /**
     * @type { String }
     */
    #currentDirectory = "";

    /**
     * @type { String }
     */
    #axialDirectory = "";

    /**
     * @type { String }
     */
    #frameworkDirectory = "/framework";

    /// sitemaps vars
    /** @type { String } */
    #sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>';

    /** @type { String } */
    #sitemapUrlsetOpener = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    /** @type { String } */
    #sitemapUrlsetCloser = '</urlset>';

    

    constructor()
    {
        super();
        this.#currentDirectory = process.cwd();
        //console.log("CURRENT DIRECTORY = " + this.#currentDirectory);

        const commandLineArguments = process.argv;
        /// TODO : manage errors

        this.#axialDirectory =  commandLineArguments[1].split("\\bin\\axial.js")[0];
        //console.log("AXIAL CLI DIRECTORY = " + this.#axialDirectory);
        
        const commandLineArgumentsLength = commandLineArguments.length;

        if( commandLineArgumentsLength > 2 )
        {
            const currentCommand = commandLineArguments[2];

            // throw here
            /*
            if( this.#commands.has(currentCommand) == false )
            {
                console.log("INVALID ARGUMENT"); 
                return;
            }
            */

            const params = commandLineArguments.slice(3);

            switch( currentCommand )
            {
                case "init":
                    this.#init(params);
                break;

                case "newpage":
                    this.#newpage(params);
                break;

                case "build":
                    this.#build(params);
                break;

                case "config":
                    this.#config();
                break;

                case "sitemap":
                    this.#sitemap();
                break;

                case "upload":
                    this.#upload();
                break;

                case "electron":
                    this.#electron(params);
                break;

                case "database":
                    this.#database();
                break;

                case "keys":
                    this.#keys();
                break;

                case "version":
                    this.#version();
                break;

                default:
                    console.log("INVALID ARGUMENT");
                break;
            }
        }
    }

    #version()
    {
        console.log( this.#VERSION );
    }

    async #getAxialConfiguration()
    {
        let config = undefined;
        try
        {
            const axialConfigurationPath = path.resolve(this.#currentDirectory, this.#configurationFileName);
            const data = await fse.readFile(axialConfigurationPath, "utf-8");
            const json = JSON.parse(data);
            if( json )
            {
                config = json;
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            return config;
        }
    }

    async #writeAxialConfiguration( json )
    {
        // TODO check on json
        try
        {
            const axialConfigurationPath = path.resolve(this.#currentDirectory, this.#configurationFileName);
            const options = { spaces: 4, EOL: os.EOL };
            await fse.writeJson(axialConfigurationPath, json, options);
        }
        catch( err )
        {
            console.log(err);
        }
    }

    async #config()
    {
        console.log("AXIAL CONFIG");
        try
        {
            const config =  await this.#getAxialConfiguration();
            if( config )
            {
                console.log(config);
            }
            else
            {
                console.log("[AXIAL_ERROR] 'axial-config.json' file not found. Use 'axial init' to init your project.");
            }
        }
        catch( err )
        {
            if( err ) { console.log(err); }
        }
    }

    /**
     * 
     * @param { Array.<String> } params 
     */
    async #init( params )
    {
        console.log("AXIAL INIT");

        // rewrite
        const config =  await this.#getAxialConfiguration();
        if( config != undefined )
        {
            console.log("[AXIAL_ERROR] the 'init' command has been already used");
            return;
        }

        console.log(params);

        let initTypeDirectory = "";

        if( params.length > 1 )
        {
            console.log("[AXIAL_ERROR] 'init' command can take only one parameter : '-front', '-server', '-electron'. Other parameters are ignored. ");
        }

        if( params.length > 0 )
        {
            const initType = params[0];
            if( this.#paramsInit.has(initType) === false )
            {
                console.log("[AXIAL_ERROR] 'init' unknown parameter : use '-front', '-server', '-electron'.");
            }
            else
            {
                switch( initType )
                {
                    case "-front":    initTypeDirectory =  "/front";    break;
                    case "-server":   initTypeDirectory =  "/server";   break;
                    case "-electron": initTypeDirectory =  "/electron"; break;
                    default:          initTypeDirectory =  "";          break;
                }
            }
        }
        
        try
        {
            //const frameworkDirectory = path.resolve(this.#axialDirectory + this.#frameworkDirectory);
            const frameworkDirectory = path.resolve(this.#axialDirectory + this.#frameworkDirectory + "/common");
            await fse.copy(frameworkDirectory, this.#currentDirectory);

            if( initTypeDirectory != "" )
            {
                const frameworkTypeDirectory = path.resolve(this.#axialDirectory + this.#frameworkDirectory + initTypeDirectory);
                await fse.copy(frameworkTypeDirectory, this.#currentDirectory);
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async #sitemap()
    {
        console.log("AXIAL SITEMAP");
        try
        {
            const config = await this.#getAxialConfiguration();
            const site = config.site;
            const pages = config.pages;

            const tab = "    ";
            
            let sitemap = this.#sitemapXml + os.EOL;
            sitemap += this.#sitemapUrlsetOpener + os.EOL + os.EOL;

            

            if( site && pages )
            {
                for( const page of pages )
                {
                    const pageMapModel = page.sitemap;
                    if( pageMapModel && pageMapModel.use && pageMapModel.use === true )
                    {
                        sitemap += tab + "<url>" + os.EOL;
                        sitemap += tab + tab + "<loc>" + config.site + page.path + "</loc>" + os.EOL;
                        sitemap += tab + tab + "<priority>" + pageMapModel.priority + "</priority>" + os.EOL;
                        sitemap += tab + tab + "<changefreq>" + pageMapModel.changefreq + "</changefreq>" + os.EOL;
                        sitemap += tab + "</url>" + os.EOL + os.EOL;
                    }
                }
            }
            sitemap += this.#sitemapUrlsetCloser;

            const sitemapDest = path.join( this.#currentDirectory, "sitemap.xml");
            await fse.outputFile(sitemapDest, sitemap);
        }
        catch(err)
        {
            console.log(err);
        }
    }

    /**
     * Generate a key
     * @param { Number } n The length of the key
     * @returns { String } The pseudo random key
     */
    #generateKey( n = 32 )
    {
        const d = 32;

        if( isNaN(n) === true ) { n = d; }
        if( n <= 0 )            { n = d; }
        if( n > 256 )           { n = d; }
        
        let a = this.#CRYPTO_CHARS.split("");
        let b = new Array();
        while( a.length > 0 )
        {
            let l = a.length;
            let i = Math.round( Math.random() * l );
            i = i == l ? i-1 : i;
            let e = a.splice(i,1);
            b.push(e[0]);
        }
        
        const c = b.length;
        let r = "";
        for( let k = 0; k < n; k++ )
        {
            const w = b[Math.round( Math.random() * (c-1) )];
            r = r + w;
        }
        return r;
    }

    async #keys()
    {
        console.log("AXIAL KEYS")
        try
        {
            const keysPath = path.join( this.#currentDirectory, "keys.txt");
            const keysExists = fse.existsSync(keysPath);
            if( keysExists === true )
            {
                console.log("WARNING Keys already generated !!!");
                return;
            }

            const crypto_key = this.#generateKey(32);
            const crypto_iv = this.#generateKey(16);
            const jwt_secret_key = this.#generateKey(32);

            const keysData = "crypto_key" + os.EOL + crypto_key + os.EOL + "crypto_iv" + os.EOL + crypto_iv + os.EOL + "jwt_secret_key" + os.EOL + jwt_secret_key;

            await fse.outputFile(keysPath, keysData);
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async #database()
    {
        console.log("AXIAL DATABASE");
        let MONGO_CLIENT;
        try
        {
            const databaseConfigPath = path.join( this.#currentDirectory, this.#databaseConfigurationFileName);
            /*
            const databaseConfigExist = fse.existsSync(databaseConfigPath);
            if( databaseConfigExist === true )
            {
                
                // SUPER CHECK TODO HERE
            }
            */
            const databaseConfig = await fse.readJSON(databaseConfigPath);
            //console.log(databaseConfig);
            
            MONGO_CLIENT = new MongoClient( databaseConfig.path,
            {
                serverApi:
                {
                    version: ServerApiVersion.v1,
                    strict: false,
                    deprecationErrors: true,
                }
            });
            
            const client = await MONGO_CLIENT.connect();
            console.log("mongo client ok");
            
            const db = client.db();
            const admin = db.admin();
            const dbs = await admin.listDatabases();
            let dbExists = false;
            for( const dbprops of dbs.databases )
            {
                if( dbprops.name === databaseConfig.dbname )
                {
                    dbExists = true;
                    break;
                }
            }
            console.log(dbExists);
            if( dbExists === false )
            {
                const newDb = client.db(databaseConfig.dbname);
                // we create
                let modelsCollection; 
                const collections = databaseConfig.collections;
                if( collections && Array.isArray(collections) )
                {
                    for( const collectionObject of collections )
                    {
                        const collectionName = collectionObject.name;
                        const collectionOptions = collectionObject.options;
                        
                        const collection = await newDb.createCollection( collectionName, collectionOptions );

                        if( collectionName === "models" ) { modelsCollection = collection; }

                    }
                }

                const modelsToInsert = databaseConfig.models;
                const docsToInsert = databaseConfig.documents;

                const modelsInserted = await modelsCollection.insertMany( modelsToInsert );

                for( let doc of docsToInsert )
                {
                    const docModelName = doc.model;
                    let docModel;
                    for( const tempModel of modelsToInsert )
                    {
                        if( tempModel.name == docModelName )
                        {
                            docModel = tempModel;
                            break;
                        }
                    }

                    // encrypt
                    for( const p of Object.keys(doc) )
                    {
                        //console.log(p);
                        const modelProp = docModel.props[p];
                        if( modelProp !== undefined && modelProp.crypted && modelProp.crypted === true )
                        {
                            //console.log("crypted property found");
                            let propToEncrypt = doc[p];
                            //console.log(propToEncrypt);
                            const cipher = crypto.createCipheriv( "aes-256-cbc", Buffer.from(databaseConfig.crypto_key), Buffer.from(databaseConfig.crypto_iv) );
                            let encrypted = cipher.update(propToEncrypt, "utf-8", "hex");
                            encrypted += cipher.final("hex");
                            //console.log(encrypted);
                            doc[p] = encrypted;
                        }
                    }

                    // check for missin props and them
                    if( docModel )
                    {
                        const modelProperties = docModel.props;
                        for( const prop of Object.keys(modelProperties) )
                        {
                            console.log(prop, Object.hasOwn(doc,prop));
                            const propExists = Object.hasOwn(doc,prop);
                            if( propExists === false )
                            {
                                const propertyModel = modelProperties[prop];
                                let propertyDefault = propertyModel.default;
                                if( propertyDefault === undefined )
                                {
                                    // switch() here
                                    if( propertyModel.type && propertyModel.type === "date" )
                                    {
                                        propertyDefault = new Date();
                                    }
                                    else
                                    {
                                        propertyDefault = "";
                                    }
                                }
                                doc[prop] = propertyDefault;
                            }
                        }
                    }


                    // default properties for every docs -> TODO : add to a config file
                    doc.uuid = crypto.randomUUID();
                    doc.creation_date = new Date();

                    const collectionName = docModel.collection;
                    const collection = newDb.collection(collectionName);
                    const result = await collection.insertOne( doc );
                }
            }
            else if( dbExists === true )
            {
                const currentDb = client.db( databaseConfig.dbname );
                const currentCollections = await currentDb.listCollections( {}, {nameOnly:true}).toArray();
                console.log( currentCollections );

                // create collection if does not exist
                const localCollections = databaseConfig.collections;
                for( const lc of localCollections )
                {
                    const lcName = lc.name;
                    let collectionExists = false;
                    for( const cc of currentCollections )
                    {
                        const ccName = cc.name;
                        if( lcName === ccName )
                        {
                            collectionExists = true;
                            break;
                        }
                    }
                    console.log(`Collection ${lcName} exists = ${collectionExists}`);
                    if( collectionExists === false )
                    {
                        const newCollection = await currentDb.createCollection( lcName, lc.options );
                    }
                }

                // add model if does not exist and update its props if exists
                const currentModels = currentDb.collection("models");
                const currentModelsArray = await currentModels.find({}).toArray();

                const localModelsArray = databaseConfig.models;
                for( const localModel of localModelsArray )
                {
                    const localModelName = localModel.name;
                    let modelExists = false;
                    
                    for( const currentModel of currentModelsArray )
                    {
                        const currentModelName = currentModel.name;
                        if( localModelName === currentModelName )
                        {
                            modelExists = true;
                            break;
                        }
                    }

                    console.log(`Model ${localModelName} exists = ${modelExists}`);
                    if( modelExists === false )
                    {
                        const newModel = await currentModels.insertOne( localModel );
                    }
                    else
                    {
                        const updatedModel = await currentModels.findOneAndUpdate( { name: localModelName }, { $set: {props: localModel.props } } );
                    }
                }
            }
            else
            {
                console.log("SOMETHING IS SUPER WRONG");
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            if( MONGO_CLIENT )
            {
                await MONGO_CLIENT.close();
                console.log("MONGO_CLIENT closed");
            }
            
        }
        
    }

    async #newpage( params )
    {
        console.log("AXIAL NEWPAGE");

        try
        {
            // get config
            const config = await this.#getAxialConfiguration();
            if( config === undefined )
            {
                console.log("[AXIAL_ERROR] 'axial-config.json' file not found. Use 'axial init' to init your project.");
                return;
            }

            // check params
            console.log(params);
            const paramsLength = params.length;
            // TODO : check if ok

            // params
            let nameProp;
            let templateProp;
            let pathProp;

            // sitemap
            const sitemapObject = { use: true, priority: 1, changefreq: "weekly" };

            let newPageObject = {};
            
            newPageObject.build = true;
            //newPageObject.active = true; //later
            
            for( let i = 0; i < paramsLength; i++ )
            {
                if( i % 2 != 0 ) { continue; }
                const param = params[i];
                if( this.#paramsNewPage.has(param) === false )
                {
                    console.log("[AXIAL_ERROR] unknown 'newpage' parameter");
                    return;
                }

                const tempValue = params[i+1];
                if( tempValue === undefined )
                {
                    console.log("[AXIAL_ERROR] the 'newpage' parameter of param " + param + " does not exist and it is required");
                    return;
                }

                if( param == "-name" )
                {
                    // check if value is ok
                    for( let i = 0; i < config.pages.length; i++ )
                    {
                        const pageName = config.pages[i].name;
                        if( pageName == tempValue )
                        {
                            console.log("[AXIAL_ERROR] the name you used already exists");
                            return;
                        }
                    }
                    newPageObject.name = tempValue;
                }
                else if( param == "-template" )
                {
                    newPageObject.template = tempValue;
                }
                else if( param == "-path" )
                {
                    // check if value is ok
                    newPageObject.path = tempValue;
                }
            }

            // awfull quick fix !!!
            if( newPageObject.template === undefined )
            {
                newPageObject.template = "base";
            }

            // sitemap insert point / no paramas ATM
            newPageObject.sitemap = sitemapObject;

            const templatePath = path.resolve(this.#currentDirectory, "axial/templates/pages", newPageObject.template);
            const newPagePath = path.resolve(this.#currentDirectory, config.project_directory, config.pages_directory, newPageObject.name);
            console.log(templatePath);
            console.log(newPagePath);
            await fse.copy(templatePath, newPagePath);

            const newConfig = config;
            newConfig.pages.push(newPageObject);
            await this.#writeAxialConfiguration(newConfig);
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async #build( params )
    {
        console.log("AXIAL BUILD");
        const startTime = Date.now();
        try
        {
            // get config
            const config = await this.#getAxialConfiguration();

            let mode = config.mode || "development";
            
            console.log(params);
            const paramsLength = params.length;
            for( let i = 0; i < paramsLength; i++ )
            {
                const param = params[i];
                if( this.#paramsBuild.has(param) == false )
                {
                    console.log("[AXIAL_ERROR] unknown 'build' parameter");
                    return;
                }
                if( param == "-dev" )  { mode = "development"; }
                if( param == "-prod" ) { mode = "production"; }
            }

            const pages = config.pages;
            const pagesLength = pages.length;

            // get vars for the process
            const buildDirectoryPath = path.resolve(this.#currentDirectory, config.build_directory);

            // clean
            const clean = config.clean_on_build;
            if( clean == true )
            {
                // clean build
                await fse.emptyDir(buildDirectoryPath);
            }

            // files to copy

            // directories to copy
            const dirToCopy = config.directories_to_copy;
            if( dirToCopy )
            {
                const dirToCopyLength = dirToCopy.length;
                for( let i = 0; i < dirToCopyLength; i++ )
                {
                    const dirToCopyModel = dirToCopy[i];
                    const dirSource = path.resolve(this.#currentDirectory, dirToCopyModel.source);
                    const dirDest = path.resolve(this.#currentDirectory, config.build_directory, dirToCopyModel.dest);
                    await fse.copy(dirSource, dirDest);
                }
            }

            for( let i = 0; i < pagesLength; i++ )
            {
                const pageModel = pages[i];

                let shouldBuildPage = true;
                if( pageModel.build != undefined)
                {
                    shouldBuildPage = pageModel.build;
                }

                if( shouldBuildPage === false ) { continue; }

                // html
                const htmlSource = path.resolve(this.#currentDirectory, config.project_directory, config.pages_directory, pageModel.name, "index.html" );
                const htmlDest =  path.resolve(this.#currentDirectory, config.build_directory, pageModel.path, "index.html");
                await fse.copy(htmlSource, htmlDest);

                // less
                const cssSource = this.#currentDirectory + "/" + config.project_directory + "/" + config.pages_directory + "/" + pageModel.name + "/less/styles.less";
                const cssSourcePath = path.resolve(cssSource);
                const cssDest = path.resolve(this.#currentDirectory, config.build_directory, pageModel.path, "styles.css");

                const cssInput = await fse.readFile(cssSource, "utf-8");
                const cssOutput = await less.render(cssInput, {filename: cssSourcePath});
                await fse.outputFile(cssDest, cssOutput.css);

                // js webpack
                const jsInput = path.resolve(this.#currentDirectory, config.project_directory, config.pages_directory, pageModel.name, "js/Page.js");
                const jsOutputPath = path.resolve(this.#currentDirectory, config.build_directory, pageModel.path);
                const jsOutput = config.js_output_filename || "application.js";

                const webpackConfig = 
                {
                    mode: mode,
                    entry: jsInput,
                    output:
                    {
                        path: jsOutputPath,
                        filename: jsOutput
                    }
                }

                const compiler = webpack( webpackConfig );
                
                compiler.run( (err, stats) =>
                {
                    if( err ) { console.log(err); }
                    compiler.close( (closeErr) =>
                    {
                        if( closeErr ) { console.log(closeErr); }
                    })
                });
            }
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            const endTime = Date.now();
            const deltaTime = endTime - startTime;
            console.log("BUILD DONE (ms) : ");
            console.log( deltaTime );
        }
    }

    async #upload()
    {
        console.log("AXIAL UPLOAD");
        try
        {
            // get config
            const config = await this.#getAxialConfiguration();

            // get vars for the process
            const buildDirectoryPath = path.resolve(this.#currentDirectory, config.build_directory);
            const localhostServerPath = config.server_localhost == "" ? undefined : path.resolve(config.server_localhost);

            // clean
            const clean = config.clean_on_build;
            if( clean == true )
            {
                // clean localhost
                if( localhostServerPath != undefined )
                {
                    await fse.emptyDir(localhostServerPath);
                }
            }
            await fse.copy(buildDirectoryPath, localhostServerPath); // not sure I have to remove await
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async #electron( params )
    {
        console.log("electron");
        console.log(params);

        try
        {
            // get config
            const config = await this.#getAxialConfiguration();
            if( config == undefined )
            {
                console.log("[AXIAL_ERROR] 'axial-config.json' file not found. Use 'axial init' to init your project.");
                return;
            }

            let electronMethod = "start";
            let electronConfig = this.#getElectronStartConfig();

            if( params !== undefined && params.length == 1 )
            {
                const electronParam = params[0];
                console.log(electronParam);
                if( this.#paramsElectron.has(electronParam) === false )
                {
                    console.log("[AXIAL_ERROR] electron param not found");
                    return;
                }

                switch( electronParam )
                {
                    case "-start":     electronMethod =  "start";    electronConfig = this.#getElectronStartConfig();   break;
                    case "-package":   electronMethod =  "package";  electronConfig = this.#getElectronPackageConfig(); break;
                    case "-make":      electronMethod =  "make";     electronConfig = this.#getElectronMakeConfig();    break;
                    case "-publish":   electronMethod =  "start";    electronConfig = this.#getElectronStartConfig();   break; // WARNING move to publish when ready
                    default:           electronMethod =  "start";    electronConfig = this.#getElectronStartConfig();   break;
                }
            }

            console.log(electronMethod);
            console.log(electronConfig);

            await electronForge[electronMethod](electronConfig);

            //const electronOutDir = path.resolve(this.#currentDirectory, "electron-package");
            //console.log(electronOutDir);
            //await electronForge.package( { dir: this.#currentDirectory, outDir: electronOutDir } );
        }
        catch(err)
        {
            console.log(err);
        }
    }

    /// ELECTRON UTILS

    #getElectronStartConfig()
    {
        return { dir: this.#currentDirectory, interactive: true };
    }

    #getElectronPackageConfig()
    {
        const electronOutDir = path.resolve(this.#currentDirectory, "electron-package");
        return { dir: this.#currentDirectory, interactive: true, outDir: electronOutDir };
    }

    #getElectronMakeConfig()
    {
        const electronOutDir = path.resolve(this.#currentDirectory, "electron-package");
        return { dir: this.#currentDirectory, interactive: true, outDir: electronOutDir };
    }

    #getElectronPublishConfig()
    {
        
    }
    
    test()
    {
        console.log("AxialCommands.test()");
        console.log( process.argv );
        console.log( process.cwd());
        console.log(this.#commands);
    }
}

export default AxialCommands