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

export const AUTHORIZED_DOMAINS = [];

export const ROLES = 
[
    "admin",
    "user",
    "client"
];

export const MEDIAS_FOLDER = "medias";
export const UPLOADS_FOLDER = "uploads";

export const AUTH_LOGIN_PATH = "/account/login/";
export const AUTH_VERIFICATION_PATH = "/account/verification/";
export const AUTH_REGISTER_PATH = "/account/register/";
export const AUTH_REDIRECT_PATH = "/account/redirect/";

export const AUTH_PATHES = 
[
    { path: "/admin/",  permission: "admin" },
    { path: "/user/",   permission: "user" },
    { path: "/client/", permission: "client" },
    { path: "/account/verification/", permission: "all"},
    { path: "/account/redirect/", permission: "all"},
    { path: "/payment/", permission: "user"}
];

export const API_PRIVATE_PATHES =
[
    { path: "/api/params/infobar/set", verification: true },

    { path: "/api/data/get", verification: true },
    { path: "/api/data/set", verification: true },
    { path: "/api/data/del", verification: true },

    { path: "/api/auth/code/send", verification: false },
    { path: "/api/auth/code/verify", verification: false },

    { path: "/api/medias/get", verification: true },
    { path: "/api/medias/all", verification: true },
    { path: "/api/medias/public", verification: true },
    { path: "/api/medias/upload", verification: true },

    { path: "/api/products/set/", verification: true },

    { path: "/api/prices/set/", verification: true },

    { path: "/api/pay/client/add", verification: true }
];

export const SUBSCRIPTION_REQUIRED = false; // if we have some plans for the platform : false -> no payment
export const SUBSCRIPTION_FREE_DAY = 0; // when a user create its account, check if he can use the website for free and how much time
export const SUBSCRIPTION_PAYMENT_PATH = "/payment/";
export const SUBSCRIPTION_TYPES = 
[
    "free", "basic", "premium", "pro"
];

export const STRIPE_USE = true;
export const STRIPE_PRIVATE_KEY = "";