"use strict"


class Axial3DShaderLoader extends EventTarget
{
    /**
     * The main path to the folder which contains the vertex.glsl and th fragment.glsl files
     * @type { String }
     */
    #path;

    /**
     * Contains the glsl code for the vertex shader
     * @type { String }
     */
    #vertexShaderCode;

    /**
     * Contains the glsl code for the fragment shader
     * @type { String }
     */
    #fragmentShaderCode;

    /**
     * @type { String }
     */
    #vertexShaderName = "vertex.glsl";

    /**
     * @type { String }
     */
    #fragmentShaderName = "fragment.glsl";

    constructor()
    {
        super();
    }

    get path() { return this.#path; }
    set path( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#path = value;
    }

    /**
     * @type { String }
     * @readonly
     */
    get vertexShaderCode() { return this.#vertexShaderCode; }

    /**
     * @type { String }
     * @readonly
     */
    get fragmentShaderCode() { return this.#fragmentShaderCode; }

    /**
     * Load the vertex and the fragement shaders
     */
    async load()
    {
        if( this.#path === undefined || this.#path === "" )
        {
            throw new Error("Axial3DShaderLoader : invalid path string");
        }

        try
        {
            const vertexPath = this.#path + this.#vertexShaderName;
            const vertexResponse = await fetch( vertexPath, { method:"GET" } );
            this.#vertexShaderCode =  await vertexResponse.text();

            const fragmentPath = this.#path + this.#fragmentShaderName;
            const fragmentResponse = await fetch( fragmentPath, { method:"GET" } );
            this.#fragmentShaderCode =  await fragmentResponse.text();

            const shaderEvent = new CustomEvent( "shaderLoaded" );
            this.dispatchEvent( shaderEvent );
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

export { Axial3DShaderLoader }