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
    }

    return (gameplay.timeQuery(GAME_TIME)-startTimer)/20;
}