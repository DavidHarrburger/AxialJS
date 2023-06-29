"use strict";

import EventEmitter from "events";
import process from "process";
import path from "path";
import fse from "fs-extra";
import less from "less";
import webpack from "webpack";
import os from "os";

class AxialCommands extends EventEmitter
{
    /**
     * @type { Set }
     */
    #commands = new Set( [ "init", "newpage", "build", "config" ] );

    #paramsInit = new Set( [ "-front", "-server", "-electron" ] );
    #paramsNew = new Set( [ "-name", "-template", "-path" ] );
    #paramsBuild = new Set( [ "-dev", "-prod" ] );

    /**
     * @type { String }
     */
    #configurationFileName = "axial-config.json";

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

                case "upload":
                    this.#upload();
                break;

                default:
                    console.log("INVALID ARGUMENT");
                break;
            }

            
        }
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
            if( this.#paramsInit.has(initType) == false )
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

    async #newpage( params )
    {
        console.log("AXIAL NEW");

        try
        {
            // get config
            const config = await this.#getAxialConfiguration();
            if( config == undefined )
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

            let newPageObject = {};
            for( let i = 0; i < paramsLength; i++ )
            {
                if( i % 2 != 0 ) { continue; }
                const param = params[i];
                if( this.#paramsNew.has(param) == false )
                {
                    console.log("[AXIAL_ERROR] unknown 'newpage' parameter");
                    return;
                }

                const tempValue = params[i+1];
                // check if exist else return


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
                    // TODO
                }
                else if( param == "-path" )
                {
                    // check if value is ok
                    newPageObject.path = tempValue;
                }
            }
            const templatePath = path.resolve(this.#currentDirectory, "axial/templates/page");
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
            await fse.copy(buildDirectoryPath, localhostServerPath);
        }
        catch(err)
        {
            console.log(err);
        }
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