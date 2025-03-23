"use strict";

class AxialUploadTask extends EventTarget
{
    /** @type { String } */
    #path;

    /** @type { File } */
    #file;

    /** @type { Boolean } */
    #public = false;

    /** @type { Number } */
    #maxFileSize = 2000000; // 2Mb

    constructor()
    {
        super();
    }

    get maxFileSize() { return this.#maxFileSize; }
    set maxFileSize( value )
    {
        if( isNaN(value) === true )
        {
            throw new TypeError("Number value required");
        }
        this.#maxFileSize = Math.abs( Math.round( value ) );
    }

    get path() { return this.#path; }
    set path( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        // do control here on the path
        // add some magic about cors etc
        this.#path = value;
    }

    get public() { return this.#public; }
    set public( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#public = value;
    }

    get file() { return this.#file; }
    set file( value )
    {
        if( value instanceof Blob === false )
        {
            throw new TypeError("Blob or File value required");
        }
        // do control here on the path
        // add some magic about cors etc
        this.#file = value;
    }

    async upload()
    {
        if( this.#file == undefined )
        {
            throw new Error("File required to upload !!!");
        }

        if( this.#path == undefined )
        {
            throw new Error("Path required to upload !!!");
        }

        if( this.#file && this.#file.size > this.#maxFileSize )
        {
            throw new Error(`File ${this.#file.name} exceeds the authorized ${this.#maxFileSize} maximum file size`);
        }

        try
        {
            const formData = new FormData();
            formData.append("axial_file", this.#file);
            const headers = 
            {
                
                "axial_filename": this.#file.name,
                "axial_filetype": this.#file.type,
                "axial_filepublic": Number(this.#public)
            }
            const response = await fetch(this.#path, { method: "POST", body: formData, headers: headers } );
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            return jsonResponse;
        }
        catch(err)
        {
            console.log(err);
            return err;
        }
    }
}

export { AxialUploadTask }