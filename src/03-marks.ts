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