"use strict"

/**
 * IMPORTANT : first I design the upload task. The purpose of this Class is to queue the tasks to avoid to much requests on the server
 * I only consider to upload file on the server throught https. TODO LATER maybe add ftp and then we can consider a non static class
 * @class
 */
class AxialUploadManager extends EventTarget
{
    /** @type { String } */
    static #UPLOAD_PATH = "";

    /**
     * Return the path of the upload service
     * @type { String }
     */
    static get UPLOAD_PATH()
    {
        return AxialUploadManager.#UPLOAD_PATH;
    }

    static set UPLOAD_PATH( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
    }
}

export { AxialUploadManager }