/**
 * 
 * Author:          TheBeems (Mathijs Beemsterboer)
 * Initial release: 2021-04-07
 * Last modified:   2021-06-04
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
 */
class Data {
    static sVersion: string = "1.5.6";
    static bDebug: boolean = true;
    static bShowMark: boolean = true;
    static aMarks: Position[] = [];
    static nMarkBlock: number = MAGENTA_CARPET;
    static nBuildBlock: number = GRASS;
    static oShape = {
        pCenter: pos(0,0,0),
        nWidth: 0, 
        nHeight: 0, 
        nLength: 0, 
        sPart: "F",
        bFilled: false,
        nBlockID: 0,
        nBlockData: 0,
        sAction: ""
    }  
    static sMsgColor: string = Text.DARK_AQUA; 
    static sDbgColor: string = Text.DARK_GRAY;
    static sValueColor: string = Text.YELLOW;
}

// Initialitation complete.
console.print(`WorldBuilder version (${console.colorize(Data.sVersion)}) ready! \nType 'help' for commands.`);



/**
 * Sets the center of the object to make (sphere, pyramix, cylinder)
 * @param center 
 */
function setCenter(center: Position) {
    Data.oShape.pCenter = center;
    Data.bDebug ? console.debug(`Center set to: pos(${console.colorize(Data.oShape.pCenter)})`) : null;
}



/**
 * Sets the width (X axis) of the object
 * @param width width of the object
 */
function setWidth(width: number) {
    Data.oShape.nWidth = width;
    Data.bDebug ? console.debug(`Width(X) set to: ${console.colorize(Data.oShape.nWidth)}`) : null;
}



/**
 * Sets the height (Y axis) of the object
 * @param height height of the object
 */
function setHeight(height: number) {
    Data.oShape.nHeight = height;
    Data.bDebug ? console.debug(`Height(Y) set to: ${console.colorize(Data.oShape.nHeight)}`) : null;
}



/**
 * Sets the length (Z axis) of the object
 * @param length the length of the object
 */
function setLength(length: number) {
    Data.oShape.nLength = length;
    Data.bDebug ? console.debug(`Length(Z) set to: ${console.colorize(Data.oShape.nLength)}`) : null;
}



/**
 * Sets the part of the object to make
 * Can be: T (top), B (bottom), W (West), E (East), N (North), S (South)
 * @param part the part of the object 
 */
function setPart(part: string) {
    Data.oShape.sPart = part;
    Data.bDebug ? console.debug(`Part set to: ${console.colorize(Data.oShape.sPart)}`) : null;
}



/**
 * Sets the action for additional commands
 * Is used in the wall command, e.g.: wall add <num>
 * In this case 'add' is the action of the command 'wall'.
 * @param action the action to perform (add, destroy, del)
 */
function setAction(action: string) {
    Data.oShape.sAction = action;
    Data.bDebug ? console.debug(`Action set to: ${console.colorize(Data.oShape.sAction)}`) : null;
}



/**
 * Sets a block with an BlockID or when no BlockID is given
 * the function getBlock() is used to determine the block the
 * players is standing on.
 * @param block the BlockID. 
 * @link https://www.digminecraft.com/lists/item_id_list_edu.php 
 */
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
 * Get the minimum Y
 * @returns the minimum Y
 */
function getMinY(): number { return 0; }



/**
 * Get the maximum Y
 * @returns the maximum Y
 */
function getMaxY(): number { return 255; }



/**
 * Get the maximum amount of blocks affected by a fill command
 * @returns the maximum amount of blocks, currently 32768
 */
function getMaxFillBlocks(): number { return 32768; }
    


/**
 * Gets the ENUMval of the type of block player is standing on.
 * @returns block id/enum
 * @link https://educommunity.minecraft.net/hc/en-us/community/posts/360072413711-How-to-get-the-block-id-python-code-
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