"use strict";

class FileUtils
{
    static #FILE_TYPES = Object.freeze
    ({
        // Images
        PNG:  { mime: 'image/png', extensions: ['png'] },
        JPEG: { mime: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
        GIF:  { mime: 'image/gif', extensions: ['gif'] },
        WEBP: { mime: 'image/webp', extensions: ['webp'] },
        SVG:  { mime: 'image/svg+xml', extensions: ['svg'] },
        BMP:  { mime: 'image/bmp', extensions: ['bmp'] },
        ICO:  { mime: 'image/x-icon', extensions: ['ico'] },
        AVIF: { mime: 'image/avif', extensions: ['avif']  },

        // Documents
        PDF:  { mime: 'application/pdf', extensions: ['pdf'] },
        TXT:  { mime: 'text/plain', extensions: ['txt'] },
        CSV:  { mime: 'text/csv', extensions: ['csv'] },
        JSON: { mime: 'application/json', extensions: ['json'] },
        XML:  { mime: 'application/xml', extensions: ['xml'] },

        // Microsoft Office
        DOC:  { mime: 'application/msword', extensions: ['doc'] },
        DOCX: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extensions: ['docx'] },
        XLS:  { mime: 'application/vnd.ms-excel', extensions: ['xls'] },
        XLSX: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extensions: ['xlsx'] },
        PPT:  { mime: 'application/vnd.ms-powerpoint', extensions: ['ppt'] },
        PPTX: { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extensions: ['pptx'] },

        // OpenDocument
        ODT:  { mime: 'application/vnd.oasis.opendocument.text', extensions: ['odt'] },
        ODS:  { mime: 'application/vnd.oasis.opendocument.spreadsheet', extensions: ['ods'] },
        ODP:  { mime: 'application/vnd.oasis.opendocument.presentation', extensions: ['odp'] },

        // Archives
        ZIP:       { mime: 'application/zip', extensions: ['zip'] },
        RAR:       { mime: 'application/vnd.rar', extensions: ['rar'] },
        SEVEN_ZIP: { mime: 'application/x-7z-compressed', extensions: ['7z'] },
        TAR:       { mime: 'application/x-tar', extensions: ['tar'] },
        GZIP:      { mime: 'application/gzip', extensions: ['gz'] },

        // Audio
        MP3:  { mime: 'audio/mpeg', extensions: ['mp3'] },
        WAV:  { mime: 'audio/wav',  extensions: ['wav'] },
        OGG:  { mime: 'audio/ogg', extensions: ['ogg'] },
        AAC:  { mime: 'audio/aac', extensions: ['aac'] },
        FLAC: { mime: 'audio/flac', extensions: ['flac'] },

        // Vidéos
        MP4:  { mime: 'video/mp4', extensions: ['mp4'] },
        WEBM: { mime: 'video/webm', extensions: ['webm'] },
        AVI:  { mime: 'video/x-msvideo', extensions: ['avi'] },
        MOV:  { mime: 'video/quicktime', extensions: ['mov'] },
        MKV:  { mime: 'video/x-matroska', extensions: ['mkv'] },

        // Web
        HTML: { mime: 'text/html', extensions: ['html', 'htm'] },
        CSS:  { mime: 'text/css', extensions: ['css'] },
        JS:   { mime: 'text/javascript', extensions: ['js'] },
        TS:   { mime: 'application/typescript', extensions: ['ts'] },
        MD:   { mime: 'text/markdown', extensions: ['md'] }
    });

    /**
     * @static
     * @readonly
     */
    static get FILE_TYPES() { return FileUtils.#FILE_TYPES; }

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
        return "todo";
    }
}

export { FileUtils }