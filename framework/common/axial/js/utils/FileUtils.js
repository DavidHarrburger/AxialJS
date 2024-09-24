"use strict";

class FileUtils
{
    static #FILE_TYPES = new Map
    ([
        [ ".png" , "image" ],
        [ ".webp", "image" ],
        [ ".jpg" , "image" ],
        [ ".jpeg", "image" ],

        [ ".mp4" , "video" ],
        [ ".webm", "video" ],

        [ ".pdf", "file" ],
        [ ".docx", "file" ],
        [ ".xlsx", "file" ],
        [ ".pptx", "file" ],
    ]);

    /**
     * @static
     * @param { String } ext 
     * @returns { String }  
     */
    static getFileType( ext )
    {
        if( typeof ext !== "string" )
        {
            throw new TypeError("String value required");
        }
        return FileUtils.#FILE_TYPES.get(ext);
    }
}

export { FileUtils }