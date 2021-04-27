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
     * @returns 
     */
    // Code from: https://en.wikipedia.org/wiki/Exponential_search
    export function exponential(pPos: Position, nSize: number, nBlockID: number): number {
        // nBlockID is found at first Y position
        if (blocks.testForBlock(nBlockID, positions.add(pPos, pos(0, 1, 0)))) {
            return pPos.getValue(Axis.Y);
        } 

        // Find range for binary search by repeated doubling
        let i = 1;
        while (i < nSize && !blocks.testForBlock(nBlockID, positions.add(pPos, pos(0, i, 0)))) {
            i *= 2;
        }
        
        // Call binary search for the found range
        return search.binary(pPos, i/2, Math.min(i, nSize - 1), nBlockID);
    }


    /**
     * Binary search compares the middle block and the block beneath it, to 
     * determine if the block is to be found above or beneath it. 
     * @param pPos position to start the search from
     * @param nDown the lower Y-value of the range
     * @param nUp the upper Y-value of the range
     * @param nBlockID the blockID to search
     * @returns 
     */
    // Code from: https://en.wikipedia.org/wiki/Binary_search_algorithm#Procedure
    export function binary(pPos: Position, nDown: number, nUp: number, nBlockID: number): number {
        if (nDown <= nUp) {
            let nMid = Math.floor((nDown + nUp) / 2);

            let midBlock = blocks.testForBlock(nBlockID, positions.add(pPos, pos(0, nMid, 0)));
            let midLowerBlock = blocks.testForBlock(nBlockID, positions.add(pPos, pos(0, nMid-1, 0)))

            // If the block is found at the middle itself
            if (midBlock && !midLowerBlock) {
                return nMid;
            }

            // If the block is both not found, the block should be found upwards
            if(!midBlock && !midLowerBlock) {
                return search.binary(pPos, nMid + 1, nUp, nBlockID);
            }

            // if the block is both found, the block should be found downwards
            return search.binary(pPos, nDown, nMid - 1, nBlockID);
        }
        console.error(`Block not found!`);
        return -1
    }
}