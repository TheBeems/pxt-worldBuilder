/**
 * 
 * Author:          TheBeems
 * Initial release: 2021-04-07
 * Last modified:   2021-04-21
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
    static sVersion: string = "2021-04-21";
    static bDebug: boolean = true;
    static bShowMark: boolean = true;
    static aMarks: string[] = [];
    static nMarkBlock: number = MAGENTA_CARPET;
    static nBuildBlock: number = GRASS;
    static oShape = {
        pCenter: pos(0,0,0),
        nWidth: 0, 
        nHeight: 0, 
        nLength: 0, 
        sPart: "F",
        bFilled: false
    }  
    static sMsgColor: string = Text.DARK_AQUA; 
    static sDbgColor: string = Text.DARK_GRAY;
    static sValueColor: string = Text.YELLOW;
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

function getMinY(): number { return 0; }
function getMaxY(): number { return 255; }
    
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

/******************************************************************************
 * 
 *  File: src/01-index.ts
 *  Description: lists all the chatcommands that you can use in worldBuilder.
 * 
 ******************************************************************************/

console.print(`WorldBuilder version (${console.colorize(Data.sVersion)}) ready! \nType 'help' for commands.`);



/**
 * The command to fill an area between two positions.
 * @param nBlockID Block ID 
 * @param nBlockData Block Data
 * @returns the time it took to fulfill this command.
 */
function cmdFill (nBlockID: number = Data.nBuildBlock, nBlockData: number = 0): number {
    let startTimer = gameplay.timeQuery(GAME_TIME);

    if (Data.aMarks.length > 1) {
        let pFrom = marks.str2pos(Data.aMarks[0]);
        let pTo = marks.getLastPos();

        blocks.fill(
            blocks.blockWithData(nBlockID, nBlockData), 
            pFrom, pTo, 
            FillOperation.Replace
        );
        
        let msg = `Filled pos(${console.colorize(pFrom)}) to pos(${console.colorize(pTo)}) with blockID: ${console.colorize(nBlockID)}`;
        if (nBlockID >= 65536) {
            console.print(msg); 
        }
        else {
            console.print(msg + `and blockData: ${console.colorize(nBlockData)}`)
        }
    }

    return (gameplay.timeQuery(GAME_TIME)-startTimer)/20;
}

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

/******************************************************************************
 * 
 *  File: src/03-marks.ts
 *  Description: All the functions in order to interact with marks.
 * 
 ******************************************************************************/



namespace marks {
    
    /**
     * Shows the mark
     * @param pMark 
     */
    function show(pMark: Position) {
        blocks.place(Data.nMarkBlock, pMark);
    }



    /**
     * Hides the mark
     * @param pMark 
     */
    function hide(pMark: Position) {
        if (blocks.testForBlock(Data.nMarkBlock, pMark)) {
            blocks.place(AIR, pMark);
        }
    }



    /**
     * Sets the mark in aMarks and 
     * shows it in the world.
     * @param pMark 
     */
    function set(pMark: Position = pos(0,0,0)): Position {
        Data.aMarks.push(pMark.toString());

        if (Data.bShowMark) {
            show(pMark);
        }
        return getLastPos();
    }



    /**
     * Checks wheter the position is allready been set in aMarks.
     * @param pMark position to check
     * @returns -1 if not found, >= 0 if found
     */
    export function check(pMark: Position = pos(0,0,0)): number {
        return Data.aMarks.indexOf(pMark.toString());
    }



    /**
     * Converts a string into a Position.
     * @param sMark string to convert 
     * @returns position X, Y, Z
     */
    export function str2pos (sMark: string): Position {
        if (sMark == "") {
            return undefined;
        }
        let args = sMark.split(" ");
        
        return world( parseInt(args[0], 10), parseInt(args[1], 10), parseInt(args[2], 10) );
    }




    /**
     * Removing a mark from a certain index, or clean out
     * all the marks when no index has been given.
     * 
     * @param nIndex the index to remove from Data.aMarks
     * @returns true on succes or false when there are no marks.
     */
    export function remove(pMark: Position = pos(0,0,0)): boolean {
        if (Data.aMarks.length == 0) {
            return false;
        }

        // Delete given position.
        if (pMark != null) {
            let i = Data.aMarks.indexOf(pMark.toString());

            // remove single element.
            if (Data.aMarks.removeElement(pMark.toString())) {
                hide(pMark) // removed the markBlock
                console.print(`Mark[${console.colorize(i)}] with pos(${console.colorize(pMark.toString())}) removed.`) ;
                return true;
            }
        }

        while (Data.aMarks.length) {
            let sMark = Data.aMarks.get(Data.aMarks.length-1);
            hide(str2pos(sMark));
            Data.aMarks.pop();
        }
        
        return true;
    }




    /**
     * Toggles between showing or hidding the marks.
     * @return true/false
     */
    export function toggle(): boolean {
        if (Data.aMarks.length == 0) {
            return undefined;
        }

        Data.bShowMark = (!Data.bShowMark);

        for (let i = 0; i < Data.aMarks.length; i++) {
            let sMark = Data.aMarks.get(i);
            if (Data.bShowMark) {
                show(str2pos(sMark));
            }
            else {
                hide(str2pos(sMark));
            }
        }
        return Data.bShowMark;
    }




    /**
     * Prints marks in chat and optionally shows them in the world.
     * @param bPrint true/false to show position in world.
     * @returns true/false
     */
    export function print(bWorld: boolean = false): boolean {
        let sResult: string = "";

        if (Data.aMarks.length == 0) {
            console.error (`There are no marks.`);
            return false;
        }
        else {
            for (let i = 0; i < Data.aMarks.length; i++) {
                let sMark = Data.aMarks.get(i);
                bWorld ? show(str2pos(sMark)) : null;
                sResult += (`Mark[${console.colorize(i)}] has pos(${console.colorize(sMark)})\n`)
            }
            console.print(sResult);
        }
        return true
    }




    /**
     * Returns the last position in aMarks.
     * @returns Position
     */
    export function getLastPos(): Position {
        if (Data.aMarks.length == 0) {
            return null;
        }
        return str2pos(Data.aMarks.get(Data.aMarks.length-1));
    }



    /**
     * Returns the last index from aMarks.
     * @returns index number of aMarks
     */
    export function getLastIndex(): number {
        return Data.aMarks.length-1;
    }




    /**
     * The command to place a mark on the map.
     * @returns string
     */
    export function place(): string {
        let pMark = player.position();

        // Check if position is in aMarks.
        let i = check(pMark)
        if ( i < 0) {
            pMark = set(pMark);
            return (`Mark[${console.colorize(getLastIndex())}] has been set with pos(${console.colorize(pMark.toString())})`); 
        }
        else {
            return (`§cPosition allready marked!`);
        }
    }
 
}

/******************************************************************************
 * 
 *  File: src/04-commands.ts
 *  Description: lists all the chatcommands that you can use in worldBuilder.
 * 
 ******************************************************************************/


/**
 * Command: help <cmd>
 * Prints the help in chat. Use 'help <cmd>' to get more details on the command.
 */
 player.onChatCommandCore("help", function () {
    let sParams = player.getChatArgs("help") as string[];
    let sResults: string = "";

    let aCommands = [
        ["help", 
            "Shows a list of all the commands. Use 'help <command>' for more details.", 
            "You need more help on the help command? You are helpless my friend..."],
        ["mark", 
            "Place a mark at the players current position.",
            "There are no details..."],
        ["unmark", 
            "Removes a mark from the players current position.", 
            "When you try to unmark when there is no mark, it return an console.error. Use 'unmark all' te remove all marks."],
        ["togglemarks", 
            "Toggles between showing or hiding the marks on the map."],
        ["showmarks", 
            "Prints the marks in chat.", 
            "Use 'showmarks world' to also show the marks in the world."],
        ["fill", 
            "Fills an area with blocks.",
            "First place two marks on the map, then type 'fill' to fill it with the standard building block. Or use 'fill <blockid> <blockdata>' to specify the block to use."],
        ["sphere", 
            "Creates a sphere with n radius. Optionally give the part you want to create. Use 'sphere <number> <part>'. Example: 'sphere 5 T' to create a sphere with radius 5 and only the top part of the sphere."],
        ["elips", 
            "Creates an elips with width, height and length. Use 'elips <width> <height> <length> <part>'. For example: 'elips 9 16 7 T'. "],
        ["set", 
            "Sets individual settings like width, height, length, block, part and center. Use 'set block <number>' or 'set width <number>'."],
        ["clearmarks", 
            "Clears all the marks currently saved."],
        ["wand", 
            "Gives a Wooden Axe so you can easily place marks in the world by right clicking with it."]
    ];

    // No certain command to show help for.
    if (sParams.length == 0 ){
        for (let i = 0; i < aCommands.length; i++) {
            sResults +=`${Text.BOLD+console.colorize(aCommands[i][0])+Text.RESET+Data.sMsgColor} = ${aCommands[i][1]}\n`;
        }
    }
    else { // show the help of a particular command.
        for (let i = 0; i < aCommands.length; i++) {
            if (sParams[0] == aCommands[i][0]) {
                sResults +=`${Text.BOLD+console.colorize(aCommands[i][0])+Text.RESET+Data.sMsgColor} = ${aCommands[i][1] + `\n`+Text.PURPLE+`Details: ` + aCommands[i][2]}\n`;
            }
        }
    }
    console.print(sResults);
})



/**
 * Sets different paramters in the game through commands.
 */
player.onChatCommandCore("set", function(){
    let sParams = player.getChatArgs("set") as string[];

    if (sParams.length >= 2) {
        let sCmd = sParams[0].trim().toLowerCase();
        let sParam = sParams[1].trim().toLowerCase();

        switch (sCmd) {
            case "width":
                setWidth(parseInt(sParam));
                break;

            case "height":
                setHeight(parseInt(sParam));
                break;
            
            case "length":
                setLength(parseInt(sParam));
                break;
            
            case "part":
                setPart(sParam);
                break;
            
            case "block":
                setBlock(parseInt(sParam));
                break;
            
            case "center":
                setCenter(marks.str2pos(sParam));
                break;
        }
    }
    else {
        if (sParams.length == 1 && sParams[0].trim().toLowerCase() == "block") {
            setBlock(null);
        }
    }
})



/**
 * Set marks while using the Wooden Axe. 
 */
 player.onItemInteracted(WOODEN_AXE, function () {
    console.print(marks.place());
})





/**
 * Places a mark in the world.
 */
 player.onChatCommandCore("mark", function(){
    console.print(marks.place());   
      
})




/**
 * Removes the mark from Data.aMarks when a player
 * stands on top of it and breaks it.
 * @param Data.nMarkBlock the ID for the mark block.
 */
 blocks.onBlockBroken(Data.nMarkBlock, () => {
    if (Data.aMarks.length !== 0) {
       if (marks.check(player.position()) === -1) {
            marks.print(true);
            console.error (`You need to stand on the mark in order to remove it.`);
        }
        else {
            marks.remove(player.position());
        } 
    }
});



/**
 * Command to remove a mark from the world.
 */
player.onChatCommandCore("unmark", function(){
    let args = player.getChatArgs("unmark") as string[];

    for (let arg of args) {
        switch(arg) {
            case "this":
                console.print (marks.remove(player.position()) ? "This mark removed." : "There is no mark.");
                break;
            
            case "all":
                console.print (marks.remove(null) ? "All marks removed." : "There were no marks.");
                break;
            
            default:
                console.print (marks.remove(player.position()) ? "A Mark removed." : "There is no mark.");
                break;
        }
    }
    
})



/**
 * Clears all the marks from memory.
 */
player.onChatCommandCore("clearmarks", function(){
    console.print (marks.remove(null) ? "All marks removed." : "There were no marks.");
})



/**
 * Prints the marks in chat and optionally shows them
 * in the world when using 'showmarks world'.
 */
player.onChatCommandCore("showmarks", function(){
    let sParams = player.getChatArgs("showmarks") as string[]; 

    if (sParams.length > 0) {
        switch (sParams[0]) {
            case "world":
                marks.print(true);
                break;
            
            default:
                marks.print(false);
                break;
        }
    }
    else {
        marks.print(false);
    }  
})



/**
 * Toggles between showing and hidding the marks in the world.
 */
player.onChatCommandCore("togglemarks", function(){
    if (marks.toggle()){
        console.print (`Marks ${console.colorize("shown")}.`)
    }
    else {
        console.print (`Marks ${console.colorize("hidden")}.`)
    }
})



/**
 * Command: fill <block ID> <block Data>
 * @param nBlockID defines de block being used, defaults to Data.nBuildBlock
 * @param nBlockData further defines the block being placed. Defaults to 0 if ommited
 */
 player.onChatCommandCore("fill", function () { 
    let sParams = player.getChatArgs("fill") as string[]; 
    let nBlockID: number;
    let nBlockData: number;

    switch (sParams.length) {        
        case 1:
            nBlockID = parseInt(sParams[0]);
            nBlockData = 0;
            break;

        case 2:
            nBlockID = parseInt(sParams[0]);
            nBlockData = parseInt(sParams[1]);
            break;

        default:
            nBlockID = Data.nBuildBlock;
            nBlockData = 0;
            break;
    }
    console.print(`Command took ${console.colorize(cmdFill(nBlockID,nBlockData))} seconds.`);
})



/**
 * Command: air
 * Fills the area between Start- and EndPosition with air
 */
player.onChat("air", function () {
    console.print(`Command took ${console.colorize(cmdFill(AIR))} seconds.`);
})



/**
 * Copies the blocks within two marks
 */
player.onChat("copy", function () {
    if (Data.aMarks.length == 2) {
        builder.teleportTo(marks.str2pos(Data.aMarks[0]));
        builder.mark();
        builder.teleportTo(marks.getLastPos());
        builder.copy();
    }
})



/**
 * Pastes the copied blocks to current position.
 */
player.onChat("paste", function () {
    builder.teleportTo(player.position());
    builder.paste();
})



/**
 * Summons a Wooden Axe to the players inventory
 */
player.onChat("wand", function () {
    mobs.give(mobs.target(LOCAL_PLAYER), WOODEN_AXE, 1)
    console.print(`You received item ID: ${console.colorize(WOODEN_AXE)} (Wooden Axe)`)
})



/**
 * Command: ellips length (N/S), height (U/D), width (E/W)
 * Order of arguments: X: width (+E/-W), Y: height (+UP/-Down), Z: length (+S/-N), type: <string>
 * Creates a full hollow sphere
 */
 player.onChatCommandCore("ellips", function () {
    let sParams = player.getChatArgs("ellips") as string[];

    shapes.build("ellips", sParams);
})



/**
 * Command: sphere <radius>
 * Creates a full hollow sphere
 */
player.onChatCommandCore("sphere", function () {
    let sParams = player.getChatArgs("sphere") as string[];

    shapes.build("sphere", sParams);
})



/**
 * Command: cylinder <radius>
 * Creates a hollow cylinder
 */
 player.onChatCommandCore("cylinder", function () {
    let sParams = player.getChatArgs("cylinder") as string[];

    shapes.build("cylinder", sParams);
})

/**
 * Command: pyramid <height>
 * Creates a hollow pyramid
 */
 player.onChatCommandCore("pyramid", function () {
    let sParams = player.getChatArgs("pyramid") as string[];

    shapes.build("pyramid", sParams);
})

/**
* Command: wall <height>
* Creates a wall between two or more marks
*/
player.onChatCommandCore("wall", function () {
   let sParams = player.getChatArgs("wall") as string[];

   shapes.build("wall", sParams);
})


/******************************************************************************
 * 
 *  File: src/05-shapes.ts
 *  Description:    Functions to initialise and build different shapes, like
 *                  sphere, ellipsoids, pyramids, cylinders, etc.
 * 
 ******************************************************************************/

/**
 * Commands to builds shapes like sphere, ellipsoids, cylinders, pyramids 
 */
namespace shapes {
    

    /**
     * Build function to initialize the shape to be build and deciding which 
     * function to use to build it.
     * @param sType The type of shape to build.
     * @param sParams The parameters to use for building.
     */
     export function build(sType: string, sParams: string[]) {
        let startTimer = gameplay.timeQuery(GAME_TIME);
        let amountOfBlocks: number;
    
        if (init(sType, sParams)) {
            if(Data.oShape.nWidth > 0 || Data.oShape.nHeight > 0 || Data.oShape.nLength > 0) {
                switch (sType) {
                    case "sphere":
                    case "ellips":
                        amountOfBlocks = ellipsoid(Data.oShape.pCenter, Data.nBuildBlock, Data.oShape.nWidth, Data.oShape.nHeight, Data.oShape.nLength, Data.oShape.bFilled, Data.oShape.sPart);
                        break;
                    
                    case "cylinder":
                    case "cyl":
                        amountOfBlocks = cylinder(Data.oShape.pCenter, Data.nBuildBlock, Data.oShape.nWidth, Data.oShape.nHeight, Data.oShape.nLength, Data.oShape.bFilled, Data.oShape.sPart);
                        break;
                    
                    case "pyramid":
                        amountOfBlocks = pyramid(Data.oShape.pCenter, Data.nBuildBlock, Data.oShape.nHeight, Data.oShape.bFilled, Data.oShape.sPart);
                        break;
                    
                    case "wall":
                        amountOfBlocks = wall(Data.nBuildBlock, Data.oShape.nHeight);
                        break;
                    
                    default:
                        break;
                        
                }
                
                let amountOfSeconds = (gameplay.timeQuery(GAME_TIME)-startTimer)/20
        
                console.print(`${amountOfBlocks} blocks added in ${amountOfSeconds} seconds.`);
                reset();
            }
            else {
                switch(sType) {
                    case "sphere":
                        console.error(`Please specify the radius of the sphere. For example: \\sphere 5`);
                        break;

                    case "ellips":
                        break;
                    
                    default:
                        console.error(`Something went wrong.`);
                        break;
                }
            }
        }
    }



    /**
     * Resets the sphere values to default
     */
    function reset() {
        Data.oShape.pCenter = pos(0,0,0);
        Data.oShape.nWidth = null;
        Data.oShape.nHeight = null;
        Data.oShape.nLength = null; 
        Data.oShape.sPart = "F";
        Data.oShape.bFilled = false;
    }




    /**
     * Initializing the parameters of different types of shapes.
     * @param sType string which represents the type of the shape
     * @param sParams the paramters as strings in an array
     * @returns true/false
     */
    function init(sType: string, sParams: string[]): boolean {
        let n: number = 0;
        
        if (sParams.length == 0) {
            if (Data.aMarks.length < 2) {
                console.print (`No marks to use.`);
                return false;
            }

            if (sType == "wall") {
                setHeight(1);
                return true;
            }
            else {
                return false;
            }
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
                        if (sType == "pyramid" || sType == "wall") {
                            setHeight(parseInt(sParams[i]));
                        } else { 
                            setWidth(parseInt(sParams[i]))} 
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


    function lengthSq2(x: number, z: number) {
        return (x * x) + (z * z)
    }
    function lengthSq3(x: number, y: number, z: number) {
        return (x * x) + (y * y) + (z * z)
    }



    /**
     * Function to create the actual sphere in the world.
     * @param pCenter the position which is the center of the sphere
     * @param block the blockID to use
     * @param radiusX 
     * @param radiusY 
     * @param radiusZ 
     * @param filled Filled if true, hollow by default.
     * @param part Specifies the part of the sphere to be build (top, bottom, west, east, north, south, etc.)
     * @returns 
     */
    function ellipsoid(pCenter: Position, block: number, radiusX: number, radiusY: number, radiusZ: number, filled: boolean, part: string): number {
        let affected: number = 0;
    
        pCenter = pCenter.toWorld();
    
        radiusX += 0.5;
        radiusY += 0.5;
        radiusZ += 0.5;
    
        const invRadiusX = 1 / radiusX;
        const invRadiusY = 1 / radiusY;
        const invRadiusZ = 1 / radiusZ;
    
        const ceilRadiusX = Math.ceil(radiusX);
        const ceilRadiusY = Math.ceil(radiusY);
        const ceilRadiusZ = Math.ceil(radiusZ);
    
        let nextXn = 0;
        forX: for (let x = 0; x <= ceilRadiusX; ++x) {
            const xn = nextXn;
            nextXn = (x + 1) * invRadiusX;
            let nextYn = 0;
            forY: for (let y = 0; y <= ceilRadiusY; ++y) {
                const yn = nextYn;
                nextYn = (y + 1) * invRadiusY;
                let nextZn = 0;
                forZ: for (let z = 0; z <= ceilRadiusZ; ++z) {
                    const zn = nextZn;
                    nextZn = (z + 1) * invRadiusZ;
    
                    let distanceSq = lengthSq3(xn, yn, zn);
                    if (distanceSq > 1) {
                        if (z == 0) {
                            if (y == 0) {
                                break forX;
                            }
                            break forY;
                        }
                        break forZ;
                    }
    
                    if (!filled) {
                        if (lengthSq3(nextXn, yn, zn) <= 1 && lengthSq3(xn, nextYn, zn) <= 1 && lengthSq3(xn, yn, nextZn) <= 1) {
                            continue;
                        }
                    }
    
    
                    /**
                     * T = Top     N = North   W = West     F = Full 
                     * B = Bottom  S = South   E = East
                     * 
                     * North (negative Z)   West (negative X)   Down (negative Y)
                     * South (positive Z)   East (positive X)   Up (positive Y)
                     */
                    //Top
                    if (part == "TSE" || part == "TS" || part == "E" || part == "T" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, y, z)));
                        ++affected;
                    }
                    if (part == "TSW" || part == "TS" || part == "W" || part == "T" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                        ++affected;
                    }
                    if (part == "TNE" || part == "TN" || part == "E" || part == "T" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                        ++affected;
                    }
                    if (part == "TNW" || part == "TN" || part == "W" || part == "T" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                        ++affected;
                    }
                    // Bottom
                     if (part == "BSE" || part == "BS" || part == "E" || part == "B" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, -y, z)));
                        ++affected;
                    }
                    if (part == "BSE" || part == "BS" || part == "W" || part == "B" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, -y, z)));
                        ++affected;
                    }
                    if (part == "BNE" || part == "BN" || part == "E" || part == "B" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, -y, -z)));
                        ++affected;
                    }
                    if (part == "BNW" || part == "BN" || part == "W" || part == "B" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, -y, -z)));
                        ++affected;
                    }
                }
            }
        }
        return affected;
    }



    /**
     * Function to create the actual sphere in the world.
     * @param pCenter the position which is the center of the sphere
     * @param block the blockID to use
     * @param radiusX 
     * @param radiusY 
     * @param radiusZ 
     * @param filled Filled if true, hollow by default.
     * @param part Specifies the part of the sphere to be build (top, bottom, west, east, north, south, etc.)
     * @returns 
     */
     function cylinder(pCenter: Position, block: number, radiusX: number, height: number, radiusZ: number, filled: boolean, part: string): number {
        let affected: number = 0;
    
        pCenter = pCenter.toWorld();

        radiusX += 0.5;
        radiusZ += 0.5;

        if (height == 0) {
            return 0;
        } else if (height < 0) {
            // if height is negative, then build cylinder downwards from pCenter.
            pCenter = positions.add(pCenter, pos(0, height, 0));
            height = -height; // make height a positive number.
        }

        // not sure if this is really needed?
        if (pCenter.getValue(Axis.Y) < getMinY()) {
            pCenter = world(pCenter.getValue(Axis.X), getMinY(), pCenter.getValue(Axis.Z));
        } else if (pCenter.getValue(Axis.Y) + height - 1 > getMaxY()) {
            height = getMaxY() - pCenter.getValue(Axis.Y) + 1;
        }

        const invRadiusX = 1 / radiusX;
        const invRadiusZ = 1 / radiusZ;

        const ceilRadiusX = Math.ceil(radiusX);
        const ceilRadiusZ = Math.ceil(radiusZ);

        let nextXn = 0;
        forX: for (let x = 0; x <= ceilRadiusX; ++x) {
            const xn = nextXn;
            nextXn = (x + 1) * invRadiusX;
            let nextZn = 0;
            forZ: for (let z = 0; z <= ceilRadiusZ; ++z) {
                const zn = nextZn;
                nextZn = (z + 1) * invRadiusZ;

                let distanceSq = lengthSq2(xn, zn);
                if (distanceSq > 1) {
                    if (z == 0) {
                        break forX;
                    }
                    break forZ;
                }

                if (!filled) {
                    if (lengthSq2(nextXn, zn) <= 1 && lengthSq2(xn, nextZn) <= 1) {
                        continue;
                    }
                }

                /**
                 * N = North   W = West     F = Full 
                 * S = South   E = East
                 * 
                 * North (negative Z)   West (negative X)   Down (negative Y)
                 * South (positive Z)   East (positive X)   Up (positive Y)
                 */
                for (let y = 0; y < height; ++y) {
                    if (part == "SE" || part == "S" || part == "E" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, y, z)));
                        ++affected;
                    }
                    if (part == "SW" || part == "S" || part == "W" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                        ++affected;
                    }
                    if (part == "NE" || part == "N" || part == "E" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                        ++affected;
                    }
                    if (part == "NW" || part == "N" || part == "W" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                        ++affected;
                    }
                }
            }
        }
        return affected;
    }



    /**
     * Makes a pyramid.
     *
     * @param position a position
     * @param block a block
     * @param size size of pyramid
     * @param filled true if filled
     * @return number of blocks changed
     * @throws MaxChangedBlocksException thrown if too many blocks are changed
     */
     function pyramid(pCenter: Position, block: number, size: number, filled: boolean, part: string): number {
        let affected = 0;
        let reverse: boolean = false
        let height: number;

        size > 0 ? height = size : height = -size - 1;

        if (size < 0) {
            reverse = true
            size = 0;
        }

        for (let y = 0; y <= height; ++y) {
            if (!reverse) {
                size--;
                for (let x = 0; x <= size; ++x) {
                    for (let z = 0; z <= size; ++z) {

                        if ((filled && z <= size && x <= size) || z == size || x == size) {

                            if (part == "SE" || part == "S" || part == "E" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(x, y, z)));
                                ++affected;
                            }
                            if (part == "SW" || part == "S" || part == "W" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                                ++affected;
                            }
                            if (part == "NE" || part == "N" || part == "E" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                                ++affected;
                            }
                            if (part == "NW" || part == "N" || part == "W" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                                ++affected;
                            }
                        }
                    }
                }
            }
            else {
                if (y == 0) {
                    blocks.place(block, positions.add(pCenter, world(0, y, 0)));
                    ++affected;
                }
                else {
                    size++;
                    for (let x = size; x >= 0; --x) {
                        for (let z = size; z >= 0; --z) {
                            
                            if ((filled && z <= size && x <= size) || z == size || x == size) {

                                if (part == "SE" || part == "S" || part == "E" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(x, y, z)));
                                ++affected;
                                }
                                if (part == "SW" || part == "S" || part == "W" || part == "F") {
                                    blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                                    ++affected;
                                }
                                if (part == "NE" || part == "N" || part == "E" || part == "F") {
                                    blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                                    ++affected;
                                }
                                if (part == "NW" || part == "N" || part == "W" || part == "F") {
                                    blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                                    ++affected;
                                }
                            }
                        }
                    }
                }   
            }
        }
        return affected;
    }


    /**
     * Makes a wall with a certain height.
     * @param block 
     * @param height 
     * @returns 
     */
     function wall(block: number, height: number): number {
        let start: Position;
        let end: Position;
        let affected: number = 0;
        let walls: number = Data.aMarks.length;
        const dh = pos(0, height - 1, 0);

        if (walls < 2) {
            console.error(`You need atleast two marks to build a wall.`)
            return 0;
        }

        start = marks.str2pos(Data.aMarks[0]);
        for (let i = 1; i < walls; i++) {
            end = marks.str2pos(Data.aMarks[i]);
            shapes.line(block, start, end, dh);

            /**
             * Calculate the amount of blocks affected
             */
            let x, z: number;

            let x1 = start.getValue(Axis.X);
            let z1 = start.getValue(Axis.Z);

            let x2 = end.getValue(Axis.X);
            let z2 = end.getValue(Axis.Z);

            // making sure x and z are positive numbers
            x1 > x2 ? x = x1 - x2 : x = x2 - x1;
            z1 > z2 ? z = z1 - z2 : z = z2 - z1;

            /**
             * if the wall is not build in x-dir or z-dir, then set those to 1. 
             * Otherwise add +1 for correct calculation of affected blocks.
             */ 
            x == 0 ? x = 1 : x++;
            z == 0 ? z = 1 : z++;
            
            if (x > z) {
                affected = affected + (x * height);
            }
            else {
                affected = affected + (z * height);
            }
            start = marks.str2pos(Data.aMarks[i]);
        }

        // Change calculation of affected blocks when there are two walls or more.
        if (walls > 2) {
            return affected - ((walls - 2) * height);
        }
        else {
            return affected;
        }
        
    }
}

