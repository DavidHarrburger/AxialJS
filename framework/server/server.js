console.log("Hello Back End");

import AXIAL_SERVER_APPLICATION from "./server-app.js";

const PORT = process.env.PORT || 80;
AXIAL_SERVER_APPLICATION.listen(PORT);