export const DATABASE_URL = "";
export const DATABASE_NAME = "";

export const CRYPTO_ALGORITHM = "aes-256-cbc";
export const CRYPTO_KEY = ""; // 32
export const CRYPTO_IV = ""; // 16

export const JWT_SECRET_KEY = ""; //32

export const EMAIL_HOST = "";
export const EMAIL_PASS = "";
export const EMAIL_PORT = 465;
export const EMAIL_USER = "";
export const EMAIL_RECIPIENT = "";

export const ROLES = 
[
    "admin",
    "user",
    "client"
];

export const MEDIAS_FOLDER = "medias";
export const UPLOADS_FOLDER = "uploads";

export const AUTH_LOGIN_PATH = "/login";
export const AUTH_PATHES = 
[
    { path: "/admin",  permission: "admin" },
    { path: "/user",   permission: "user" },
    { path: "/client", permission: "client" }
];

export const API_PRIVATE_PATHES =
[
    { path: "/api/site/infobar/set" },

    { path: "/api/model/get" },
    { path: "/api/model/set" },

    { path: "/api/model/get" },
    { path: "/api/model/set" },

    { path: "/api/medias/get" },
    { path: "/api/medias/all" },
    { path: "/api/medias/public" },
    { path: "/api/medias/upload" }
];