/**
 * 
 * Author:          TheBeems
 * Initial release: 2021-04-07
 * Last modified:   2021-04-08
 * Description:     Making building inside Minecraft:Education Edition a little easier.
 * 
 */

// Variables
let sMessage = "";
let sMsgColor = "§3"; // cyan
let sValueColor = "§e"; // yellow
let bPositionSet = false;
let pStartPosition: Position = null;
let pEndPosition: Position = null;

/**
 * Class with the Data and settings.
 * 
 * Note: aMarks stores positions as strings, because it wasn't possible 
 * to search for positions otherwise. So always have to convert results 
 * from aMark with the function str2pos().
 */
class Data {
    static nBuildBlock: number = GRASS;
    static nMarkBlock: number = MAGENTA_CARPET;
    static bShowMark: boolean = true;
    static aMarks: string[] = [];   
    static sVersion: string = "2021-04-08";   
}

print(`WorldBuilder version (${colorize(Data.sVersion)}) ready!`);


/**
 * Shows the mark
 * @param pMark 
 */
function showMark(pMark: Position) {
    blocks.place(Data.nMarkBlock, pMark);
}

/**
 * Hides the mark
 * @param pMark 
 */
function hideMark(pMark: Position) {
    blocks.place(AIR, pMark);
}

/**
 * Sets the mark in aMarks and 
 * shows it in the world.
 * @param pMark 
 */
function setMark(pMark: Position = pos(0,0,0)): Position {
    Data.aMarks.push(pMark.toString());

    if (Data.bShowMark) {
        showMark(pMark);
    }
    return getLastMark();
}

/**
 * Checks wheter the position is allready been set in aMarks.
 * @param pMark position to check
 * @returns -1 if not found, >= 0 if found
 */
function checkMark(pMark: Position = pos(0,0,0)): number {
   return Data.aMarks.indexOf(pMark.toString());
}

/**
 * Converts a string into a Position.
 * @param sMark string to convert 
 * @returns position X, Y, Z
 */
function str2pos (sMark: string): Position {
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
function delMark(pMark: Position = pos(0,0,0)): boolean {
    if (Data.aMarks.length == 0) {
        return false;
    }

    // Delete given position.
    if (pMark != null) {
        let i = Data.aMarks.indexOf(pMark.toString());

        // remove single element.
        if (Data.aMarks.removeElement(pMark.toString())) {
            hideMark(pMark) // removed the markBlock
            print(`Mark[${i}] with pos(${colorize(pMark.toString())}) removed.`) ;
            return true;
        }
    }

    while (Data.aMarks.length) {
        let sMark = Data.aMarks.get(Data.aMarks.length-1);
        hideMark(str2pos(sMark));
        Data.aMarks.pop();
    }
    
    return true;
}

/**
 * Toggles between showing or hidding the marks.
 * @return true/false
 */
function toggleMarks(): boolean {
    if (Data.aMarks.length == 0) {
        return undefined;
    }

    Data.bShowMark = (!Data.bShowMark);

    for (let i = 0; i < Data.aMarks.length; i++) {
        let sMark = Data.aMarks.get(i);
        if (Data.bShowMark) {
            showMark(str2pos(sMark));
        }
        else {
            hideMark(str2pos(sMark));
        }
    }
    return Data.bShowMark;
}

/**
 * Shows marks in world and optionally prints them in chat.
 * @param bPrint true/false to print position in chat.
 * @returns true/false
 */
function showMarks(bPrint: boolean = false): boolean {
    if (Data.aMarks.length == 0) {
        print (`No marks set.`);
        return false;
    }
    else {
        for (let i = 0; i < Data.aMarks.length; i++) {
            let sMark = Data.aMarks.get(i);
            showMark(str2pos(sMark));
            bPrint ? print (`Mark[${ i}] has pos(${colorize(sMark)})`) : null;
        }
    }
    return true
}

/**
 * Returns the last position in aMarks.
 * @returns Position
 */
function getLastMark(): Position {
    if (Data.aMarks.length == 0) {
        return null;
    }
    return str2pos(Data.aMarks.get(Data.aMarks.length-1));
}

/**
 * The command to place a mark on the map.
 * @returns string
 */
 function cmdMark(): string {
    let pMark = player.position();

    // Check if position is in aMarks.
    let i = checkMark(pMark)
    if ( i < 0) {
        pMark = setMark(pMark);
        return (`Mark[${Data.aMarks.length-1}] has been set with pos(${colorize(pMark.toString())})`); 
    }
    else {
        return (`§cPosition allready marked!`);
    }
}

/**
 * The command to fill an area between two positions.
 * @param nBlockID Block ID 
 * @param nBlockData Block Data
 * @returns the time it took to fulfill this command.
 */
function cmdFill (nBlockID: number = Data.nBuildBlock, nBlockData: number = 0): number {
    let startTimer = gameplay.timeQuery(GAME_TIME);

    if (Data.aMarks.length > 1) {
        let pFrom = str2pos(Data.aMarks[0]);
        let pTo = getLastMark();

        blocks.fill(
            blocks.blockWithData(nBlockID, nBlockData), 
            pFrom, pTo, 
            FillOperation.Replace
        );

        print(`Filled pos(${colorize(pFrom)}) to pos(${colorize(pTo)}) with blockID: ${colorize(nBlockID)} and blockData: ${colorize(nBlockData)}`);
    }

    return (gameplay.timeQuery(GAME_TIME)-startTimer)/20;
}

/**
 * Wisphers a message to the player
 * @param sMessage content of the message.
 */
 function print(sMessage: any) {
    player.tell(mobs.target(LOCAL_PLAYER), sMsgColor + sMessage);
}

/**
 * Wisphers an errormessage to the player
 * @param sErrorMsg content of the error
 */
function error(sErrorMsg: any) {
    player.errorMessage(sErrorMsg);
}

/**
 * Colorize a string with sValueColor.
 * @param sMessage string to colorize
 * @returns colorized string
 */
function colorize(sMessage: any): string {
    sMessage = `${sValueColor} ${sMessage} ${sMsgColor}`;
    return sMessage;
}

/**
 * Command to set a mark in the world.
 */
player.onChatCommandCore("mark", function(){
    print(cmdMark());   
      
})

/**
 * Command to remove a mark from the world.
 */
player.onChatCommandCore("unmark", function(){
    let args = player.getChatArgs("unmark") as string[];

    for (let arg of args) {
        switch(arg) {
            case "this":
                print (delMark(player.position()) ? "This mark removed." : "There is no mark.");
                break;
            
            case "all":
                print (delMark(null) ? "All marks removed." : "There were no marks.");
                break;
            
            default:
                print (delMark(player.position()) ? "A Mark removed." : "There is no mark.");
                break;
        }
    }
    
})

player.onChatCommandCore("clearmarks", function(){
    print (delMark(null) ? "All marks removed." : "There were no marks.");
})

player.onChatCommandCore("showmarks", function(){
    if(showMarks(true)) {
        print(`---done---`);
    }
})

player.onChatCommandCore("togglemarks", function(){
    if (toggleMarks()){
        print (`Marks ${colorize("shown")}.`)
    }
    else {
        print (`Marks ${colorize("hidden")}.`)
    }
})

player.onChatCommandCore("setblock", function() {
    let args = player.getChatArgs("setblock") as string[]
})


/**
 * Set marks while using the Wooden Axe. 
 */
player.onItemInteracted(WOODEN_AXE, function () {
    print(cmdMark());
})

/**
 * Removes the mark from Data.aMarks when a player
 * stands on top of it and breaks it.
 * @param Data.nMarkBlock the ID for the mark block.
 */
 blocks.onBlockBroken(Data.nMarkBlock, () => {
    if (Data.aMarks.length !== 0) {
       if (checkMark(player.position()) === -1) {
            showMarks(false);
            error (`You need to stand on the mark in order to remove it.`);
        }
        else {
            delMark(player.position());
        } 
    }
    
});

/**
 * Command: fill <block ID> <block Data>
 * @param nBlockID defines de block being used, defaults to Data.nBuildBlock
 * @param nBlockData further defines the block being placed. Defaults to 0 if ommited
 */
player.onChat("fill", function (nBlockID: number, nBlockData: number = 0) {  
    if (nBlockID === 0) { nBlockID = Data.nBuildBlock }
    print(`Command took ${colorize(cmdFill(nBlockID,nBlockData))} seconds.`);
})

/**
 * Command: air
 * Fills the area between Start- and EndPosition with air
 */
player.onChat("air", function () {
    print(`Command took ${colorize(cmdFill(AIR))} seconds.`);
})

player.onChat("copy", function () {
    if (Data.aMarks.length == 2) {
        builder.teleportTo(str2pos(Data.aMarks[0]));
        builder.mark();
        builder.teleportTo(getLastMark());
        builder.copy();
    }
})

player.onChat("paste", function () {
    builder.teleportTo(player.position());
    builder.paste();
})

/**
 * Command: wand
 * Summons a Wooden Axe to the players inventory
 */
player.onChat("wand", function () {
    mobs.give(mobs.target(LOCAL_PLAYER), WOODEN_AXE, 1)
    print(`You received item ID: ${sValueColor}${WOODEN_AXE} ${sMsgColor}(Wooden Axe)`)
})

/**
 * Command: \\elip length (N/S), height (U/D), width (E/W)
 * Order of arguments: X: width (+E/-W), Y: height (+UP/-Down), Z: length (+S/-N), type: <string>
 * Creates a full hollow sphere
 */
 player.onChatCommandCore("elips", function () {
    let args = player.getChatArgs("elips") as string[];

    let width: number = 0;
    let height: number = 0;
    let length: number = 0;
    let type: string = null;
    let j: number = 0;

    for (let i = 0; i < args.length; i++) {
        if (isNaN(parseInt(args[i]))) {
            // arg is not a number.
            type = args[i];
            print(args[i]);

        }
        else {
            // arg is a number.
            switch(j) {
                case 0:
                    width = parseInt(args[i]);
                    j++;
                    print(width);
                    break;
                
                case 1:
                    height = parseInt(args[i]);
                    j++;
                    print(height);
                    break;
                
                case 2:
                    length = parseInt(args[i]);
                    j++;
                    print(length);
                    break;
            }
        }
    }
    
    sphereCommand(length, height, width, type);
})

/**
 * Command: \\sphere X
 * Creates a full hollow sphere
 */
player.onChat("sphere", function (radius: number) {
    sphereCommand(radius, radius, radius, "F");
})

/**
 * 
 * @param radius The sphere's radius
 * @param part The part of the sphere to make (F, T, B, E, W, TN, TS, BN, BS, TNW, TNE, TSW, TSE, BNW, BNE, BSW, BSE)
 */
function sphereCommand(radiusX: number, radiusY: number, radiusZ: number, part: string) {
    let startTimer = gameplay.timeQuery(GAME_TIME);
    if (!pStartPosition) {
        pStartPosition = player.position();
    }

    if(radiusX > 0) {
        let amountOfBlocks = makeSphere(pStartPosition, 2, radiusX, radiusY, radiusZ, false, part);
        let amountOfSeconds = (gameplay.timeQuery(GAME_TIME)-startTimer)/20

        print(`${amountOfBlocks} blocks added in ${amountOfSeconds} seconds.`);
    }
    else {
        error(`Please specify the radius of the sphere. For example: \\sphere 5`);
    }
}

/**
 * 
 * @param pCenter 
 * @param block 
 * @param radiusX 
 * @param radiusY 
 * @param radiusZ 
 * @param filled 
 * @param part 
 * @returns 
 */
function makeSphere(pCenter: Position, block: number, radiusX: number, radiusY: number, radiusZ: number, filled: boolean, part: string): number {
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

                let distanceSq = lengthSq(xn, yn, zn);
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
                    if (lengthSq(nextXn, yn, zn) <= 1 && lengthSq(xn, nextYn, zn) <= 1 && lengthSq(xn, yn, nextZn) <= 1) {
                        continue;
                    }
                }


                /**
                 * T = Top     N = North   W = West     F = Full 
                 * B = Bottom  S = South   E = East
                 * 
                 * North (negative Z)   West (negative X)   Up (positive Y)
                 * South (positive Z)   East (positive X)   Down (negative Y)
                 */
                //Top
                if (part == "TNW" || part == "TN" || part == "W" || part == "T" || part == "F") {
                    blocks.place(block, positions.add(pCenter, world(x, y, z)));
                    ++affected;
                }
                if (part == "TNE" || part == "TN" || part == "E" || part == "T" || part == "F") {
                    blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                    ++affected;
                }
                if (part == "TSW" || part == "TS" || part == "W" || part == "T" || part == "F") {
                    blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                    ++affected;
                }
                if (part == "TSE" || part == "TS" || part == "E" || part == "T" || part == "F") {
                    blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                    ++affected;
                }
                // Bottom
                 if (part == "BNW" || part == "BN" || part == "W" || part == "B" || part == "F") {
                    blocks.place(block, positions.add(pCenter, world(x, -y, z)));
                    ++affected;
                }
                if (part == "BNE" || part == "BN" || part == "E" || part == "B" || part == "F") {
                    blocks.place(block, positions.add(pCenter, world(-x, -y, z)));
                    ++affected;
                }
                if (part == "BSW" || part == "BS" || part == "W" || part == "B" || part == "F") {
                    blocks.place(block, positions.add(pCenter, world(x, -y, -z)));
                    ++affected;
                }
                if (part == "BSE" || part == "BS" || part == "E" || part == "B" || part == "F") {
                    blocks.place(block, positions.add(pCenter, world(-x, -y, -z)));
                    ++affected;
                }
            }
        }
    }
    return affected;
}

/**
 * 
 * @param x 
 * @param y 
 * @param z 
 * @returns 
 */
function lengthSq(x: number, y: number, z: number) {
    return (x * x) + (y * y) + (z * z)
}