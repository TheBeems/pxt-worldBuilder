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
        ["wand", 
            "Gives a Wooden Axe and Diamond Axe",
            "With the Wooden Axe and Diamond Axe you can easily place marks/editMarks in the world by right clicking with it."],
        ["mark", 
            "Place a mark at the players current position.",
            "There are no details..."],
        ["unmark", 
            "Removes a mark.", 
            "Use 'unmark' to remove the mark on current position.\nUse 'unmark <num>' to remove a mark from the array at index <num>.\nUse 'unmark all' te remove all marks.\nTip: you can also remove a mark by breaking the mark while standing on top of its position."],
        ["clearmarks",
            "The same usuage as 'unmark all'."],
        ["Wooden Axe & Diamond Axe",
            "To place a mark or an editMark respectively with the use-key.",
            "EditMarks are especially usefull if you need to alter excisisting blocks or need to copy/paste a wall or building."],
        ["showmarks", 
            "Prints the marks in chat.", 
            "Use 'showmarks world' to also show the marks in the world."],
        ["togglemarks", 
            "Toggles between showing or hiding the marks on the map.",
            "There are no details..."],
        ["fill", 
            "Fills an area with blocks.",
            "First place two marks on the map, then type 'fill' to fill it with the standard building block.\nOr use 'fill <blockid> <blockdata>' to specify the block to fill with."],
        ["sphere", 
            "Creates a sphere with n radius. Optionally specify the part you want to create. ",
            "Use 'sphere <radius> <part>'. Example: 'sphere 5 T' to create a sphere with radius 5 and only the top part of the sphere."],
        ["ellips", 
            "Creates an ellips with width, height and length.",
            "Use 'ellips <width> <height> <length> <part>'. For example: 'elips 9 7 12 T'. "],
        ["wall",
            "Creates a wall with a certain height. Additional commands are 'add', 'del', 'destroy'.",
            "Use 'wall <height>', to create a wall of the given height. Standard height is 1.\nUse 'wall add <num>' to place a wall on top of an excisting wall.\nUse 'wall del <num>' to delete a number of blocks counted from the top.\nUse 'wall destroy' to destroy the entire wall to the ground."],
        ["pyramid",
            "Creates a pyramid with a given height.",
            "Use 'pyramid <height>' to build a pyramid. You can specify a <part> if needed.\nWhen given a minus height, the pyramid is created upside down."],
        ["cylinder",
            "Creates an cylinder with a given <height>.",
            "Use 'cylinder <height> <part>'."],
        ["set", 
            "Sets individual settings like width, height, length, part, block and center.",
            "Use 'set block <number>' or 'set width <number>', et cetera."],
        ["copy",
            "Copies an area between two marks in order to paste it somewhere else.",
            "Use the Diamond Axe to place two marks from a wall or building. Then type 'copy' to copy everything between those two marks.\nType 'help paste' to see help with pasting what you have copied."],
        ["paste",
            "Paste whatever you have copied between two marks and with the 'copy' command.",
            "You can either place a third mark to specify the exact location where you want the copied blocks to be pasted to.\nIf you don't provide a third mark, then the copied blocks will be pasted at the players current location."],
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
    marks.place(player.position(), false);
})




/**
 * Set marks while using the Wooden Axe. 
 */
 player.onItemInteracted(DIAMOND_AXE, function () {
    marks.place(player.position(), true);
})





/**
 * Places a mark in the world.
 */
 player.onChatCommandCore("mark", function(){
    marks.place(player.position(), false);   
      
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
        console.print(`Blocks copied!\nPlace a 3rd Mark and type 'paste' to paste copied blocks to that position.`);
    }
})



/**
 * Pastes the copied blocks to current position.
 */
player.onChat("paste", function () {
    if (Data.aMarks.length > 2) {
        builder.teleportTo(Data.aMarks[2]);
    }
    else {
        builder.teleportTo(player.position());
    }
    builder.paste();
})



/**
 * Summons a Wooden Axe to the players inventory
 */
player.onChat("wand", function () {
    mobs.give(mobs.target(LOCAL_PLAYER), WOODEN_AXE, 1);
    console.print(`You received item ID: ${console.colorize(WOODEN_AXE)} (Wooden Axe)`);

    mobs.give(mobs.target(LOCAL_PLAYER), DIAMOND_AXE, 1)
    console.print(`You received item ID: ${console.colorize(DIAMOND_AXE)} (Diamond Axe)`)
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

