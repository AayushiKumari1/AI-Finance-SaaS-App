export const getEnv = ( key : string , defaultValue ? : string ) : string =>{

    const value = process.env[key]

    if( value === undefined ){

        if( defaultValue === undefined ){

            throw new Error(`Environment Variable ${key} is not Set. `)
        }
        return defaultValue;
    }
    return value;
}