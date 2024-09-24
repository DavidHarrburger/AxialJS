"use strict"

class AxialUploadTask extends EventTarget
{
    /** @type { String } */
    #path;

    /** @type { File } */
    #file;

    /** @type { Boolean } */
    #public = false;

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
            //console.log(response);
            return response;
        }
        catch(err)
        {
            console.log(err);
            return err;
        }
    }
}

export { AxialUploadTask }