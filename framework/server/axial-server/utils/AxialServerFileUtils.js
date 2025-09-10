import fsp from "node:fs/promises";

class AxialServerFileUtils
{

    static async getDirSize( path )
    {
        let stats = {};
        try
        {
            let totalFileSize = 0;
            let totalExceptionSize = 0;
            let numOfFiles = 0;
            let numOfDirs = 0;
            let numOfExceptions = 0;
            const dirStats = await fsp.stat( path );
            if( dirStats && dirStats.isDirectory() === true )
            {
                const dir = await fsp.readdir( path , { withFileTypes: true, recursive: true } );
                //console.log( dir );
                for( const file of dir )
                {
                    const filePath = `${file.parentPath}/${file.name}`;
                    const fileStat = await fsp.stat( filePath );
                    //console.log( fileStat );
                    //console.log(fileStat.isDirectory(), fileStat.isFile() );
                    if( fileStat.isDirectory() == true )
                    {
                        numOfDirs += 1;
                    }
                    else if( fileStat.isFile() == true )
                    {
                        numOfFiles += 1;
                        totalFileSize += fileStat.size;
                    }
                    else
                    {
                        numOfExceptions += 1;
                        totalExceptionSize += fileStat.size;
                    }
                }
            }
            
            stats.totalFileSize = totalFileSize;
            stats.totalExceptionSize = totalExceptionSize;
            stats.numOfFiles = numOfFiles;
            stats.numOfDirs = numOfDirs;
            stats.numOfExceptions = numOfExceptions;
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            return stats;
        }
    }

    static async getDirTree( path )
    {
        let tree = {};
        try
        {
            const rootStat = await fsp.stat( path );
            if( rootStat && rootStat.isDirectory() === true )
            {
                const rootDir = await fsp.readdir( path , { withFileTypes: true, recursive: true } );
                console.log( rootDir );
                tree.name = rootStat.name;
                tree.content = "test";
                console.log(tree);
                /*
                for( const file of dir )
                {
                    const filePath = `${file.parentPath}/${file.name}`;
                    const fileStat = await fsp.stat( filePath );
                    console.log( fileStat );
                    console.log(fileStat.isDirectory(), fileStat.isFile() );
                    if( fileStat.isDirectory() == true )
                    {
                        numOfDirs += 1;
                    }
                    else if( fileStat.isFile() == true )
                    {
                        numOfFiles += 1;
                        totalFileSize += fileStat.size;
                    }
                    else
                    {
                        numOfExceptions += 1;
                        totalExceptionSize += fileStat.size;
                    }
                }
                */
            }
            
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            return tree;
        }
    }
}

export { AxialServerFileUtils }