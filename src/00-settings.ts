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
    static Sphere = {
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


function setCenter(center: Position) {
    Data.Sphere.pCenter = center;
    Data.bDebug ? console.debug(`Center set to: pos(${console.colorize(Data.Sphere.pCenter)})`) : null;
}
function setWidth(width: number) {
    Data.Sphere.nWidth = width;
    Data.bDebug ? console.debug(`Width(X) set to: ${console.colorize(Data.Sphere.nWidth)}`) : null;
}
function setHeight(height: number) {
    Data.Sphere.nHeight = height;
    Data.bDebug ? console.debug(`Height(Y) set to: ${console.colorize(Data.Sphere.nHeight)}`) : null;
}
function setLength(length: number) {
    Data.Sphere.nLength = length;
    Data.bDebug ? console.debug(`Length(Z) set to: ${console.colorize(Data.Sphere.nLength)}`) : null;
}
function setPart(part: string) {
    Data.Sphere.sPart = part;
    Data.bDebug ? console.debug(`Part set to: ${console.colorize(Data.Sphere.sPart)}`) : null;
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