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

