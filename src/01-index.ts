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







/**
 * Set marks while using the Wooden Axe. 
 */
player.onItemInteracted(WOODEN_AXE, function () {
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

