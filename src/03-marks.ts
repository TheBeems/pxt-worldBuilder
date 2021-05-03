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
    function show(pMark: Position, nMark?: number): void {
        if (nMark != undefined) {
            blocks.place(nMark, pMark);
        }
        else {
            blocks.place(Data.nMarkBlock, pMark);
        }
    }



    /**
     * Hides the mark
     * @param pMark 
     */
    function hide(pMark: Position): void {
        if (blocks.testForBlock(Data.nMarkBlock, pMark)) {
            blocks.place(AIR, pMark);
        }
        else {
            let pTorch = checkEditMark(pMark, true);
            blocks.place(AIR, pTorch);
        }
    }



    /**
     * Sets the mark in Data.aMarks and 
     * shows it in the world.
     * @param pMark 
     */
    function set(pMark: Position): void {
        Data.aMarks.push(pMark);
    }




    /**
     * Check where to place an EditMark. Function can also check
     * if there is already an EditMark set by searching for a Torch.
     * @param pMark 
     * @param bTorch 
     * @returns 
     */
     function checkEditMark(pMark: Position, bTorch?: boolean): Position {
        const pCheckpos = [
            pos(-1,0,0), pos(1,0,0),
            pos(0,0,-1), pos(0,0,1,),
            pos(0,-1,0), pos(0,1,0)
        ];

        // First check X, Z positions, if no blocks besides Air/Water, then mark block beneath player.
        for (let p of pCheckpos) {
            let pTorch = pMark.add(p);
            if (!bTorch) {
                if (blocks.testForBlock(AIR, pMark) == false && blocks.testForBlock(WATER, pMark) == false) {
                    console.debug(`Found a block at: ${pMark}`);
                    return pMark;
                }
            }
            else {
                if (blocks.testForBlock(0x1004c, pTorch)) {
                    return pTorch;
                }
                if (blocks.testForBlock(0x2004c, pTorch)) {
                    return pTorch;
                }
                if (blocks.testForBlock(0x3004c, pTorch)) {
                    return pTorch;
                }
                if (blocks.testForBlock(0x4004c, pTorch)) {
                    return pTorch;
                }
                if (blocks.testForBlock(0x0004c, pTorch)) {
                    return pTorch;
                }
            }
        }
        console.debug(`Nothing found...`);
        return world(0, 255, 0);
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
     export function place(pMark: Position, bEditMark?: boolean): void {
        let pFoundBlock = undefined;
        
        // If Editmark, then check blocks around player to place mark
        if (bEditMark) {
            const pCheckpos = [
                pos(-1,0,0), pos(1,0,0),
                pos(0,0,-1), pos(0,0,1,),
                pos(0,-1,0)
            ];

            // First check X, Z positions, if no blocks besides Air/Water, then mark block beneath player.
            for (let p of pCheckpos) {
                if (blocks.testForBlock(AIR, p) == false && blocks.testForBlock(WATER, p) == false) {
                    pFoundBlock = p;
                    break;
                }
            }
        }

        let pTorch = pMark;
        pMark = pFoundBlock != undefined ? pMark.add(pFoundBlock) : pMark;
        
        // Check if position is in Data.aMarks.
        let i = check(pMark)
        if ( i < 0) {
            set(pMark);
            
            // show mark in the world.
            if (Data.bShowMark) {
                if (pFoundBlock == undefined) {
                    show(pMark, undefined);
                }
                else {
                    let x = pFoundBlock.getValue(Axis.X);
                    let y = pFoundBlock.getValue(Axis.Y);
                    let z = pFoundBlock.getValue(Axis.Z);

                    if (x == -1) {
                        show(pTorch, 0x1004c); // East
                    }
                    else if (x == 1) {
                        show(pTorch, 0x2004c); // West
                    }
                    else if (z == -1) {
                        show(pTorch, 0x3004c); // South
                    }
                    else if (z == 1) {
                        show(pTorch, 0x4004c); // North
                    }
                    else if(y == -1) {
                        show(pTorch, 0x4c); // Up
                    }
                }
                
            }
            console.print (`Mark[${console.colorize(getLastIndex())}] has been set with pos(${console.colorize(pMark)})`); 
        }
        else {
            console.print (`§cPosition allready marked!`);
        }
    }
}