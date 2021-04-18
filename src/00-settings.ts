/**
 * 
 * Author:          TheBeems
 * Initial release: 2021-04-07
 * Last modified:   2021-04-16
 * Description:     Making building inside Minecraft:Education Edition a little easier.
 * 
 */

/**
 * Declare the text colors and effects
 */
 class Text {
    // Colors
    static RED = "§c";
    static DARK_RED = "§4";
    static GOLD = "§6";
    static YELLOW = "§e";
    static GREEN = "§a";
    static DARK_GREEN = "§2";
    static AQUA = "§b";
    static DARK_AQUA = "§3";
    static BLUE = "§9";
    static DARK_BLUE = "§1";
    static PURPLE = "§d";
    static DARK_PURPLE = "§5";
    static WHITE = "§f";
    static GRAY = "§7";
    static DARK_GRAY = "§8";
    static BLACK = "§0";

    // Effects
    static BOLD = "§l";
    static ITALIC = "§o";
    static UNDERLINE = "§n";
    static STRIKE = "§m";
    static RESET = "§r";
}

/**
 * Class with the Data and settings.
 * 
 * Note: aMarks stores positions as strings, because it wasn't possible 
 * to search for positions otherwise. So always have to convert results 
 * from aMark with the function str2pos().
 */
class Data {
    static sVersion: string = "2021-04-16";
    static bDebug: boolean = true;
    static bShowMark: boolean = true;
    static aMarks: string[] = [];
    static nMarkBlock: number = MAGENTA_CARPET;
    static nBuildBlock: number = GRASS;
    static oShape = {
        pCenter: pos(0,0,0),
        nWidth: -1, 
        nHeight: -1, 
        nLength: -1, 
        sPart: "F",
        bFilled: false
    }  
    static sMsgColor: string = Text.DARK_AQUA; 
    static sDbgColor: string = Text.DARK_GRAY;
    static sValueColor: string = Text.YELLOW;
}


namespace shape {
    /**
     * Resets the sphere values to default
     */
    export function reset() {
        Data.oShape.pCenter = pos(0,0,0);
        Data.oShape.nWidth = -1;
        Data.oShape.nHeight = -1;
        Data.oShape.nLength = -1; 
        Data.oShape.sPart = "F";
        Data.oShape.bFilled = false;
    }

    /**
     * 
     * @param sParams 
     * @returns true on success and false on failure.
     */
    export function init(sParams: string[]): boolean {
        let n: number = 0;
        
        if (sParams.length == 0) {
            if (Data.aMarks.length < 2) {
                console.print (`No marks to use.`);
                return false;
            }
            sParams = Data.aMarks;
            console.print (`Using marks to define the shape.`);
            return false;
        }
        
        for (let i = 0; i < sParams.length; i++) {
            if (isNaN(parseInt(sParams[i]))) {
                // arg is not a number.
                setPart(sParams[i]);
            }
            else {
                // arg is a number.
                switch(n) {
                    case 0:
                        setWidth(parseInt(sParams[i]));
                        n++;
                        break;
                    
                    case 1:
                        setHeight(parseInt(sParams[i]));
                        n++;
                        break;
                    
                    case 2:
                        setLength(parseInt(sParams[i]));
                        n++
                        break;
                }
            }
        }
    
        if (Data.oShape.nLength == -1) {
            setLength(Data.oShape.nWidth);
        }
    
        if (Data.oShape.nHeight == -1) {
            setHeight(Data.oShape.nWidth);
        }
    
        if (Data.aMarks.length == 1 ) {
            setCenter(marks.str2pos(Data.aMarks[0]));
        }
        else {
            setCenter(player.position());
        }
    
        return true;
    }


    export function lengthSq2(x: number, z: number) {
        return (x * x) + (z * z)
    }
    /**
     * 
     * @param x 
     * @param y 
     * @param z 
     * @returns 
     */
    export function lengthSq3(x: number, y: number, z: number) {
        return (x * x) + (y * y) + (z * z)
    }
}




function setCenter(center: Position) {
    Data.oShape.pCenter = center;
    Data.bDebug ? console.debug(`Center set to: pos(${console.colorize(Data.oShape.pCenter)})`) : null;
}
function setWidth(width: number) {
    Data.oShape.nWidth = width;
    Data.bDebug ? console.debug(`Width(X) set to: ${console.colorize(Data.oShape.nWidth)}`) : null;
}
function setHeight(height: number) {
    Data.oShape.nHeight = height;
    Data.bDebug ? console.debug(`Height(Y) set to: ${console.colorize(Data.oShape.nHeight)}`) : null;
}
function setLength(length: number) {
    Data.oShape.nLength = length;
    Data.bDebug ? console.debug(`Length(Z) set to: ${console.colorize(Data.oShape.nLength)}`) : null;
}
function setPart(part: string) {
    Data.oShape.sPart = part;
    Data.bDebug ? console.debug(`Part set to: ${console.colorize(Data.oShape.sPart)}`) : null;
}
function setBlock(block?:number) {
    if (block) {
        Data.nBuildBlock = block;
        console.print (`Set block to ID: ${console.colorize(Data.nBuildBlock)}`);
    }
    else {
        Data.nBuildBlock = getBlock();
    }
}

/**
 * Gets the ENUMval of the type of block player is standing on.
 * @returns number
 */
 function getBlock(): number {
    agent.teleportToPlayer();

    let blockID = agent.inspect(AgentInspection.Block, DOWN);
    let blockENUM: number;     

    for (let i = 1; i < 16; i++) {
        blockENUM = 65536 * i + blockID;

        if (blocks.testForBlock(blockENUM, positions.add(agent.getPosition(), pos(0, -1, 0)))) {
            console.print(`Block ENUM = ${blockENUM}`);
            return blockENUM;
        }
    }
    console.print(`BlockID = ${blockID}`);
    return blockID;
}