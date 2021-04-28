/**
 * 
 * Author:          TheBeems (Mathijs Beemsterboer)
 * Initial release: 2021-04-07
 * Last modified:   2021-04-28
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
    static sVersion: string = "1.4.1";
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
        nBlockData: 0
    }  
    static sMsgColor: string = Text.DARK_AQUA; 
    static sDbgColor: string = Text.DARK_GRAY;
    static sValueColor: string = Text.YELLOW;
}

// Initialitation complete.
console.print(`WorldBuilder version (${console.colorize(Data.sVersion)}) ready! \nType 'help' for commands.`);





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
 * @returns block id/enum
 */
// Code from: https://educommunity.minecraft.net/hc/en-us/community/posts/360072413711-How-to-get-the-block-id-python-code-
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
 *  File: src/01-search.ts
 *  Description: Different search algorithms to find a block.
 * 
 ******************************************************************************/

namespace search {

    /**
     * Exponentional search to determine a range that the search block resides in
     * and performs a binary search within that range. Can outperform binary
     * search if the block is close to the starting point.
     * @param pPos position to start the search from
     * @param nSize the maximum height to search for (maxY is 255 in minecraft)
     * @param nBlockID the blockID to search
     * @param dDir the direction in which to search
     * @returns 
     */
    // Code from: https://en.wikipedia.org/wiki/Exponential_search
    export function exponential(pPos: Position, nSize: number, nBlockID: number, dDir: Axis = Axis.Y): number {
        let x = 0, y = 0, z = 0;
        dDir == Axis.X ? x = 1 : dDir == Axis.Y ? y = 1 : z = 1;

        // nBlockID is found at first Y position
        if (blocks.testForBlock(nBlockID, positions.add(pPos, pos(x, y, z)))) {
            return pPos.getValue(dDir);
        } 

        // Find range for binary search by repeated doubling
        while ((x < nSize || y < nSize || z < nSize) && !blocks.testForBlock(nBlockID, positions.add(pPos, pos(x, y, z)))) {
            dDir == Axis.X ? x *= 2 : dDir == Axis.Z ? z *= 2 : y *= 2;
        }
        
        // Call binary search for the found range
        let i = x > y ? x : y > z ? y : z;
        return search.binary(pPos, i/2, Math.min(i, nSize - 1), nBlockID, dDir);
    }


    /**
     * Binary search compares the middle block and the block beneath it, to 
     * determine if the block is to be found above or beneath it. 
     * @param pPos position to start the search from
     * @param nLeft the left value of the range
     * @param nRight the right value of the range
     * @param nBlockID the blockID to search
     * @param dDir the direction in which to search
     * @returns 
     */
    // Code from: https://en.wikipedia.org/wiki/Binary_search_algorithm#Procedure
    export function binary(pPos: Position, nLeft: number, nRight: number, nBlockID: number, dDir: Axis = Axis.Y): number {
        if (nLeft <= nRight) {
            let x = 0, y = 0, z = 0, midBlock, midNextBlock, nMid;

            // determine the middle of the range
            dDir == Axis.X ? x = Math.floor((nLeft + nRight) / 2) : x = 0;
            dDir == Axis.Y ? y = Math.floor((nLeft + nRight) / 2) : y = 0;
            dDir == Axis.Z ? z = Math.floor((nLeft + nRight) / 2) : z = 0;

            // check if midblock is the block to be found.
            midBlock = blocks.testForBlock(nBlockID, positions.add(pPos, pos(x, y, z)));

            // check what block is the next from the middle block. We need that to 
            // determine if we found the top of the building/structure.
            if (dDir == Axis.X) {
                midNextBlock = blocks.testForBlock(nBlockID, positions.add(pPos, pos(x - 1, y, z)));
                nMid = x;
            } 
            else if (dDir == Axis.Y) {
                midNextBlock = blocks.testForBlock(nBlockID, positions.add(pPos, pos(x, y - 1, z)));
                nMid = y;
            }
            else {
                midNextBlock = blocks.testForBlock(nBlockID, positions.add(pPos, pos(x, y, z - 1)));
                nMid = z
            }
            
            // If the block is found at the middle itself
            if (midBlock && !midNextBlock) {
                return nMid;
            }

            // If the block is both not found, the block should be found upwards
            if(!midBlock && !midNextBlock) {
                return search.binary(pPos, nMid + 1, nRight, nBlockID, dDir);
            }

            // if the block is both found, the block should be found downwards
            return search.binary(pPos, nLeft, nMid - 1, nBlockID, dDir);
        }
        console.error(`Block not found!`);
        return -1
    }
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

    //export let Data.aMarks: Position[] = []
    
    /**
     * Shows the mark
     * @param pMark 
     */
    function show(pMark: Position): void {
        blocks.place(Data.nMarkBlock, pMark);
    }



    /**
     * Hides the mark
     * @param pMark 
     */
    function hide(pMark: Position): void {
        if (blocks.testForBlock(Data.nMarkBlock, pMark)) {
            blocks.place(AIR, pMark);
        }
    }



    /**
     * Sets the mark in Data.aMarks and 
     * shows it in the world.
     * @param pMark 
     */
    function set(pMark: Position): void {
        Data.aMarks.push(pMark);

        if (Data.bShowMark) {
            show(pMark);
        }
    }



    /**
     * Checks wheter the position is allready been set in Data.aMarks.
     * @param pMark position to check
     * @returns -1 if not found, >= 0 if found
     */
    export function check(pMark: Position): number {
        //return Data.aMarks.indexOf(pMark.toString());
        for(let i = 0; i < Data.aMarks.length; i++){
            if (Data.aMarks[i].toString() == pMark.toString()) {
                return i;
            }
        }
        return -1;
    }



    /**
     * Converts a string into a Position.
     * @param sPos string to convert 
     * @returns position X, Y, Z
     */
    export function str2pos (sPos: string): Position {
        let aPos = sPos.split(" ");
        return world( +aPos[0], +aPos[1], +aPos[2]);
    }




    /**
     * Removing a mark from a certain index, or clean out
     * all the marks when no index has been given.
     * 
     * @param nIndex the index to remove from Data.aMarks
     * @returns true on succes or false when there are no marks.
     */
    export function remove(pMark?: Position, nIndex?: number): boolean {
        if (Data.aMarks.length == 0) {
            return false;
        }

        if (pMark == undefined && nIndex == undefined) {
            // When no position was given, loop to delete all marks.
            while (Data.aMarks.length) {
                let pMark = marks.getLast();
                hide(pMark);
                Data.aMarks.pop();
            }
            return true;
        }

        let i: number;

        // i = the index to be removed from the array.
        pMark != undefined ? i = check(pMark) : nIndex != undefined ? i = nIndex : i = -1;
        if (i == -1) { return false; }

        // Remove the mark at the given index
        pMark = Data.aMarks.removeAt(i);
        hide(pMark) // removed the markBlock
        console.print(`Mark[${console.colorize(i)}] with pos(${console.colorize(pMark.toString())}) removed.`) ;

        return true;  
    }




    /**
     * Toggles between showing or hidding the marks.
     * @return true/false
     */
    export function toggle(): boolean {
        if (Data.aMarks.length == 0) {
            return false;
        }

        Data.bShowMark = (!Data.bShowMark);

        for (let i = 0; i < Data.aMarks.length; i++) {
            let pMark = Data.aMarks.get(i);
            if (Data.bShowMark) {
                show(pMark);
            }
            else {
                hide(pMark);
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
                let pMark = Data.aMarks.get(i);
                bWorld ? show(pMark) : null;
                sResult += (`Mark[${console.colorize(i)}] has pos(${console.colorize(pMark)})\n`)
            }
            console.print(sResult);
        }
        return true
    }




     /**
     * Returns the last position in Data.aMarks.
     * @returns Position
     */
      export function getFirst(): Position {
        return Data.aMarks.get(0);
    }




    /**
     * Returns the last position in Data.aMarks.
     * @returns Position
     */
    export function getLast(): Position {
        return Data.aMarks.get(Data.aMarks.length-1);
    }



    /**
     * Returns the last index from Data.aMarks.
     * @returns index number of Data.aMarks
     */
    export function getLastIndex(): number {
        return Data.aMarks.length-1;
    }




    /**
     * The command to place a mark on the map.
     * @returns string
     */
    export function place(pMark: Position): void {
        // Check if position is in Data.aMarks.
        let i = check(pMark)
        if ( i < 0) {
            set(pMark);
            console.print (`Mark[${console.colorize(getLastIndex())}] has been set with pos(${console.colorize(pMark)})`); 
        }
        else {
            console.print (`§cPosition allready marked!`);
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
            "Use 'unmark all' te remove all marks. When you try to unmark when there is no mark, it return an console.error."],
        ["togglemarks", 
            "Toggles between showing or hiding the marks on the map.",
            "There are no details..."],
        ["showmarks", 
            "Prints the marks in chat.", 
            "Use 'showmarks world' to also show the marks in the world."],
        ["fill", 
            "Fills an area with blocks.",
            "First place two marks on the map, then type 'fill' to fill it with the standard building block. Or use 'fill <blockid> <blockdata>' to specify the block to use."],
        ["sphere", 
            "Creates a sphere with n radius. Optionally specify the part you want to create. ",
            "Use 'sphere <radius> <part>'. Example: 'sphere 5 T' to create a sphere with radius 5 and only the top part of the sphere."],
        ["elips", 
            "Creates an elips with width, height and length.",
            "Use 'elips <width> <height> <length> <part>'. For example: 'elips 9 7 12 T'. "],
        ["wall",
            "Creates a wall with a certain height.",
            "Use 'wall <height>', to create a wall of the given height. Standard height is 1."],
        ["pyramid",
            "Creates a pyramid with a given height.",
            "Use 'pyramid <height>' to build a pyramid. You can specify a <part> if needed. When given a minus height, the pyramid is created upside down."],
        ["set", 
            "Sets individual settings like width, height, length, block, part and center.",
            "Use 'set block <number>' or 'set width <number>', et cetera."],
        ["clearmarks", 
            "Clears all the marks currently saved.",
            "This command is the same as 'unmark all'."],
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
            setBlock(undefined);
        }
    }
})



/**
 * Set marks while using the Wooden Axe. 
 */
 player.onItemInteracted(WOODEN_AXE, function () {
    marks.place(player.position());
})





/**
 * Places a mark in the world.
 */
 player.onChatCommandCore("mark", function(){
    marks.place(player.position());   
      
})




/**
 * Removes the mark from Data.aMarks when a player
 * stands on top of it and breaks it.
 * @param Data.nMarkBlock the ID for the mark block.
 */
 blocks.onBlockBroken(Data.nMarkBlock, () => {
    if (Data.aMarks.length !== 0) {
       if (marks.check(player.position()) === -1) {
            //marks.print(true);
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
        if (!isNaN(parseInt(arg))) {
            // arg is a number
            marks.remove(undefined, parseInt(arg));
            break;

        }
        switch(arg) {         
            case "all":
                console.print (marks.remove() ? "All marks removed." : "There were no marks.");
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
    console.print (marks.remove() ? "All marks removed." : "There were no marks.");
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

    shapes.build("fill", sParams);
})




/**
 * Copies the blocks within two marks
 */
player.onChat("copy", function () {
    if (Data.aMarks.length == 2) {
        builder.teleportTo(marks.getFirst());
        builder.mark();
        builder.teleportTo(marks.getLast());
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
        let amountOfBlocks: number = 0;
    
        if (init(sType, sParams)) {
            if(Data.oShape.nWidth > 0 || Data.oShape.nHeight > 0 || Data.oShape.nLength > 0 || sType == "fill") {
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
                    
                    case "fill":
                        amountOfBlocks = fill(Data.oShape.nBlockID, Data.oShape.nBlockData);
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
        Data.oShape.nWidth = 0;
        Data.oShape.nHeight = 0;
        Data.oShape.nLength = 0; 
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
        let n: number = 0; // iterate through the parameters that are numbers.
        
        if (sParams.length == 0) {
            if (Data.aMarks.length < 2) {
                console.print (`No marks to use.`);
                return false;
            }

            switch (sType) {
                case "wall":
                    setHeight(1);
                    return true;
                
                case "fill":
                    Data.oShape.nBlockID = Data.nBuildBlock;
                    Data.oShape.nBlockData = 0;
                    return true;
                
                default:
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
                        if (sType == "fill") {
                            Data.oShape.nBlockID = parseInt(sParams[i]);
                        }
                        else {
                            if (sType == "pyramid" || sType == "wall") {
                                setHeight(parseInt(sParams[i]));
                            } else { 
                                setWidth(parseInt(sParams[i]));
                            } 
                        }
                        
                        n++;
                        break;
                    
                    case 1:
                        if (sType == "fill") {
                            Data.oShape.nBlockData = parseInt(sParams[i]);
                        }
                        else {
                            setHeight(parseInt(sParams[i]));
                        };
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
            setCenter(marks.getFirst());
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

    function calcVolume(pStart: Position, pEnd: Position, pHeight?: number): number {
        // Variables needed for calculating the amount of blocks affected
        let x1 = pStart.getValue(Axis.X);
        let y1 = pStart.getValue(Axis.Y);
        let z1 = pStart.getValue(Axis.Z);

        let x2 = pEnd.getValue(Axis.X);
        let y2 = pEnd.getValue(Axis.Y);
        let z2 = pEnd.getValue(Axis.Z);

        // Calculate amount of blocks between two positions.
        // Add +1 for missing block. E.g. pos(18) - pos(15) = 3, 
        // but are actually four blocks: 18, 17, 16, 15
        let x = Math.abs(x1 - x2) + 1;
        let y = Math.abs(y1 - y2) + 1;
        let z = Math.abs(z1 - z2) + 1;
        
        return (pHeight == undefined) ? x * y * z : (x > z) ? x * pHeight : z * pHeight;
    }

    function fill(nBlockID: number, nBlockData: number): number {
        if (Data.aMarks.length > 1) {
            let pFrom = marks.getFirst();
            let pTo = marks.getLast();
    
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

            return calcVolume(pFrom, pTo);
        }
        return -1;
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
    // Code from: https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1762
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
    // Code from: https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1668
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
    // Code from: https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1848
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
     * @param block the block id to make the wall with
     * @param height height of the wall
     * @returns amount of blocks added
     */
     function wall(block: number, height: number): number {
        let affected: number = 0;
        let ceil: Position;
        let end: Position;
        let size: number;
        let start: Position;
        let walls: number = Data.aMarks.length;
        const ext = pos(0, height - 1, 0);

        if (walls < 2) {
            console.error(`You need atleast two marks to build a wall.`)
            return 0;
        }

        // use exponentional search to find the first AIR block in Y-direction.
        start = marks.getFirst()
        size = getMaxY() - start.getValue(Axis.Y);
        ceil = pos(0, search.exponential(start, size, AIR), 0);
        
        for (let i = 1; i < walls; ++i) {
            end = Data.aMarks[i];

            // Return 0 if wall height exceeds maximum heightlimit.
            if ( height > size) {
                console.error(`Wall height exceeds heightlimit of 255 blocks.\nMaximum height of the wall can be ${size} blocks.`);
                return 0;
            }

            // If the to be created wall is lower then the 
            // current wall, then first destroy current wall
            if((ceil.getValue(Axis.Y) - ext.getValue(Axis.Y)) > 0) {
                shapes.line(AIR, start, end, ceil);
            }

            // Make the wall.
            shapes.line(block, start, end, ext); 

            // Calculate the volume of blocks that have been added.
            affected += calcVolume(start, end, height);

            // Make the next wall.
            start = Data.aMarks[i];
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

