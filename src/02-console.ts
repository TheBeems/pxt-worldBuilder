/******************************************************************************
 * 
 *  File: src/02-console.ts
 *  Description: console functions to display messages to the player.
 * 
 ******************************************************************************/

namespace console {
    
    /**
     * Wisphers a message to the player
     * @param sMessage content of the message.
     */
    export function print(sMessage: any) {
        player.tell(mobs.target(LOCAL_PLAYER), Data.sMsgColor + "\n" + sMessage);
    }



    /**
     * Wisphers a debug-message to the player
     * @param sMessage content of the message.
     */
    export function debug(sMessage: any) {
        if (Data.bDebug) {
            player.tell(mobs.target(LOCAL_PLAYER), Data.sDbgColor + "\n" + sMessage);
        }
    }



    /**
     * Wisphers an errormessage to the player
     * @param sErrorMsg content of the error
     */
    export function error(sErrorMsg: any) {
        player.errorMessage("\n" + sErrorMsg);
    }



    /**
     * Colorize a string with sValueColor.
     * @param sMessage string to colorize
     * @returns colorized string
     */
    export function colorize(sMessage: any): string {
        sMessage = `${Data.sValueColor} ${sMessage} ${Data.sMsgColor}`;
        return sMessage;
    }
}