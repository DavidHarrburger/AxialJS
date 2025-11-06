export const MAIN_DOMAIN = "";
export const MAIN_NAME = "";

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
    "master",
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
    { path: "/master/",  permission: "master" },
    { path: "/admin/",  permission: "admin" },
    { path: "/user/",   permission: "user" },
    { path: "/client/", permission: "client" },
    { path: "/account/verification/", permission: "all"},
    { path: "/account/redirect/", permission: "all"},
    { path: "/checkout/subscription/", permission: "user"}
];

export const API_PRIVATE_PATHES =
[
    { path: "/api/data/get/", verification: true },
    { path: "/api/data/set/", verification: true },
    { path: "/api/data/del/", verification: true },

    { path: "/api/auth/code/send", verification: false },
    { path: "/api/auth/code/verify", verification: false },

    { path: "/api/kpi/database/get", verification: true },
    { path: "/api/kpi/storage/get", verification: true },

    { path: "/api/params/infobar/set", verification: true },
    { path: "/api/params/weektime/set", verification: true },

    { path: "/api/services/qrcode/", verification: true },

    { path: "/api/medias/get", verification: true },
    { path: "/api/medias/all", verification: true },
    { path: "/api/medias/public", verification: true },
    { path: "/api/medias/upload", verification: true },

    { path: "/api/files/get/all", verification: true },

    { path: "/api/products/set/", verification: true },

    { path: "/api/subscriptions/set/", verification: true },
    { path: "/api/subscriptions/get/", verification: true },

    { path: "/api/checkout/session/create", verification: true }, // create the session
    { path: "/api/checkout/session/status", verification: true }, // check the session

    { path: "/api/events/set/", verification: true },

    { path: "/api/webhooks/stripe/", verification: false }
];

export const SUBSCRIPTION_REQUIRED = true; // if we have some plans for the platform : false -> no payment
export const SUBSCRIPTION_FREE_DAY = 0; // when a user create its account, check if he can use the website for free and how much time
export const SUBSCRIPTION_CHECKOUT_PATH = "/checkout/subscription/";
export const SUBSCRIPTION_TYPES = 
[
    "free", "paid"
];

export const STRIPE_USE = true;
export const STRIPE_PRIVATE_KEY = "";
export const STRIPE_WEBHOOK_SECRET = "";

// CONST FOR EMAIL AUTOMATION
export const MAIL_TEMPLATE_SENDER_DOMAIN = "https://dndev.fr";
export const MAIL_TEMPLATE_SENDER_NAME = "dndev.fr";