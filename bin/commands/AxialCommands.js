"use strict";

import EventEmitter from "events";
import process, { config } from "process";
import path from "path";
import fse from "fs-extra";
import less from "less";
import webpack from "webpack";

class AxialCommands extends EventEmitter
{
    /**
     * @type { Set }
     */
    #commands = new Set( [ "init", "new", "build", "config" ] );

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
        console.log("CURRENT DIRECTORY = " + this.#currentDirectory);

        const commandLineArguments = process.argv;
        /// TODO : manage errors

        this.#axialDirectory =  commandLineArguments[1].split("\\bin\\axial.js")[0];
        console.log("AXIAL CLI DIRECTORY = " + this.#axialDirectory);
        
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

            switch( currentCommand )
            {
                case "init":
                    this.init();
                break;

                case "new":
                break;

                case "build":
                    this.build();
                break;

                case "config":
                    this.#getAxialConfiguration();
                break;

                default:
                    console.log("INVALID ARGUMENT");
                break;
            }

            
        }
    }

    async #getAxialConfiguration()
    {
        try
        {
            const axialConfigurationPath = path.resolve(this.#currentDirectory, this.#configurationFileName);
            const data = await fse.readFile(axialConfigurationPath, "utf-8");
            const json = JSON.parse(data);
            console.log(json.mode);
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async init()
    {
        const frameworkDirectory = this.#axialDirectory + this.#frameworkDirectory;
        try
        {
            await fse.copy(frameworkDirectory, this.#currentDirectory);
        }
        catch(err)
        {
            console.log(err);
        }
        
    }

    new( name = "" )
    {

    }

    async build()
    {
        console.log("AxialCommands.build()");
        // copy
        try
        {
            const htmlSource = this.#currentDirectory + "/project/main/index.html";
            const htmlDest = this.#currentDirectory + "/build/index.html";
            await fse.copy(htmlSource, htmlDest);
        }
        catch(err)
        {
            console.log(err);
        }

        // less
        
        const cssSource = this.#currentDirectory + "/project/main/less/styles.less";
        const cssSourcePath = path.resolve(cssSource);
        console.log(cssSourcePath);
        const cssDest = path.resolve(this.#currentDirectory, "build/styles.css");

        try
        {
            const cssInput = await fse.readFile(cssSource, "utf-8");
            console.log(cssInput);
            const cssOutput = await less.render(cssInput, {filename: cssSourcePath});
            console.log(cssOutput);
            await fse.outputFile(cssDest, cssOutput.css);
        }
        catch(err)
        {
            console.log(err);
        }
        

        // webpack
        //const jsInput = this.#currentDirectory + "/project/main/js/Application.js";
        const jsInput = path.resolve(this.#currentDirectory, "project/main/js/Application.js");
        console.log(jsInput);
        //const jsOutputPath = this.#currentDirectory + "/build";
        const jsOutputPath = path.resolve(this.#currentDirectory, "build");
        console.log(jsOutputPath);

        const webpackConfig = 
        {
            mode: "development",
            entry: jsInput,
            output:
            {
                path: jsOutputPath,
                filename: "application.js"
            }

        }

        const compiler = webpack( webpackConfig );
        
        compiler.run( (err, stats) =>
        {
            console.log(err);

            compiler.close( (closeErr) =>
            {
                console.log("close");
                console.log(closeErr);
            })
        });
        
        
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