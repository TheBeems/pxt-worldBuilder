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