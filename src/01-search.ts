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