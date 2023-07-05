const path = require("path");

module.exports =
{
    packagerConfig:
    {
        
    },
    rebuildConfig: {},
    makers:
    [
        {
            name: '@electron-forge/maker-squirrel',
            platforms: ["win32"],
            config: {},
        }
    ],
    publishers: [],
    plugins: [],
    hooks: {},
    buildIdentifier: {}
};