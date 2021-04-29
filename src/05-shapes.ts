/******************************************************************************
 * 
 *  File: src/05-shapes.ts
 *  Description:    Functions to initialise and build different shapes, like
 *                  sphere, ellipsoids, pyramids, cylinders, etc.
 * 
 ******************************************************************************/

/**
 * Commands to builds shapes like sphere, ellipsoids, cylinders, pyramids 
 */
namespace shapes {
    

    /**
     * Build function to initialize the shape to be build and deciding which 
     * function to use to build it.
     * @param sType The type of shape to build.
     * @param sParams The parameters to use for building.
     */
     export function build(sType: string, sParams: string[]) {
        let startTimer = gameplay.timeQuery(GAME_TIME);
        let amountOfBlocks: number = 0;
    
        if (init(sType, sParams)) {
            if(Data.oShape.nWidth > 0 || Data.oShape.nHeight > 0 || Data.oShape.nLength > 0 || Data.oShape.sAction || sType == "fill") {
                switch (sType) {
                    case "sphere":
                    case "ellips":
                        amountOfBlocks = ellipsoid(Data.oShape.pCenter, Data.nBuildBlock, Data.oShape.nWidth, Data.oShape.nHeight, Data.oShape.nLength, Data.oShape.bFilled, Data.oShape.sPart);
                        break;
                    
                    case "cylinder":
                    case "cyl":
                        amountOfBlocks = cylinder(Data.oShape.pCenter, Data.nBuildBlock, Data.oShape.nWidth, Data.oShape.nHeight, Data.oShape.nLength, Data.oShape.bFilled, Data.oShape.sPart);
                        break;
                    
                    case "pyramid":
                        amountOfBlocks = pyramid(Data.oShape.pCenter, Data.nBuildBlock, Data.oShape.nHeight, Data.oShape.bFilled, Data.oShape.sPart);
                        break;
                    
                    case "wall":
                        amountOfBlocks = wall(Data.nBuildBlock, Data.oShape.nHeight, Data.oShape.sAction);
                        break;
                    
                    case "fill":
                        amountOfBlocks = fill(Data.oShape.nBlockID, Data.oShape.nBlockData);
                        break;
                    
                    default:
                        break;
                        
                }
                
                let amountOfSeconds = (gameplay.timeQuery(GAME_TIME)-startTimer)/20
        
                console.print(`${amountOfBlocks} blocks added in ${amountOfSeconds} seconds.`);
                reset();
            }
            else {
                switch(sType) {
                    case "sphere":
                        console.error(`Please specify the radius of the sphere. For example: \\sphere 5`);
                        break;

                    case "ellips":
                        break;
                    
                    default:
                        console.error(`Something went wrong.`);
                        break;
                }
            }
        }
    }



    /**
     * Resets the sphere values to default
     */
    function reset() {
        Data.oShape.pCenter = pos(0,0,0);
        Data.oShape.nWidth = 0;
        Data.oShape.nHeight = 0;
        Data.oShape.nLength = 0; 
        Data.oShape.sPart = "F";
        Data.oShape.bFilled = false;
        Data.oShape.nBlockID = 0;
        Data.oShape.nBlockData = 0;
        Data.oShape.sAction = "";
    }




    /**
     * Initializing the parameters of different types of shapes.
     * @param sType string which represents the type of the shape
     * @param sParams the paramters as strings in an array
     * @returns true/false
     */
    function init(sType: string, sParams: string[]): boolean {
        let n: number = 0; // iterate through the parameters that are numbers.
        
        if (sParams.length == 0) {
            if (Data.aMarks.length < 2) {
                console.print (`No marks to use.`);
                return false;
            }

            switch (sType) {
                case "wall":
                    setHeight(1);
                    return true;
                
                case "fill":
                    Data.oShape.nBlockID = Data.nBuildBlock;
                    Data.oShape.nBlockData = 0;
                    return true;
                
                default:
                    return false;
            }
        }
        
        for (let i = 0; i < sParams.length; i++) {
            if (isNaN(parseInt(sParams[i]))) {
                // arg is not a number.

                if( sType == "wall") {
                    setAction(sParams[i]);
                }
                else {
                    setPart(sParams[i]);
                }
            }
            else {
                // arg is a number.
                switch(n) {
                    case 0:
                        if (sType == "fill") {
                            Data.oShape.nBlockID = parseInt(sParams[i]);
                        }
                        else {
                            if (sType == "pyramid" || sType == "wall") {
                                setHeight(parseInt(sParams[i]));
                            } else { 
                                setWidth(parseInt(sParams[i]));
                            } 
                        }
                        
                        n++;
                        break;
                    
                    case 1:
                        if (sType == "fill") {
                            Data.oShape.nBlockData = parseInt(sParams[i]);
                        }
                        else {
                            setHeight(parseInt(sParams[i]));
                        };
                        n++;
                        break;
                    
                    case 2:
                        setLength(parseInt(sParams[i]));
                        n++
                        break;
                }
            }
        }
    
        if (Data.oShape.nLength == -1) {
            setLength(Data.oShape.nWidth);
        }
    
        if (Data.oShape.nHeight == -1) {
            setHeight(Data.oShape.nWidth);
        }
    
        if (Data.aMarks.length == 1 ) {
            setCenter(marks.getFirst());
        }
        else {
            setCenter(player.position());
        }
    
        return true;
    }


    function lengthSq2(x: number, z: number) {
        return (x * x) + (z * z)
    }
    function lengthSq3(x: number, y: number, z: number) {
        return (x * x) + (y * y) + (z * z)
    }

    function calcVolume(pStart: Position, pEnd: Position, pHeight?: number): number {
        // Variables needed for calculating the amount of blocks affected
        let x1 = pStart.getValue(Axis.X);
        let y1 = pStart.getValue(Axis.Y);
        let z1 = pStart.getValue(Axis.Z);

        let x2 = pEnd.getValue(Axis.X);
        let y2 = pEnd.getValue(Axis.Y);
        let z2 = pEnd.getValue(Axis.Z);

        // Calculate amount of blocks between two positions.
        // Add +1 for missing block. E.g. pos(18) - pos(15) = 3, 
        // but are actually four blocks: 18, 17, 16, 15
        let x = Math.abs(x1 - x2) + 1;
        let y = Math.abs(y1 - y2) + 1;
        let z = Math.abs(z1 - z2) + 1;
        
        return (pHeight == undefined) ? x * y * z : (x > z) ? x * pHeight : z * pHeight;
    }

    function fill(nBlockID: number, nBlockData: number): number {
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

            return calcVolume(pFrom, pTo);
        }
        return -1;
    }



    /**
     * Function to create the actual sphere in the world.
     * @param pCenter the position which is the center of the sphere
     * @param block the blockID to use
     * @param radiusX 
     * @param radiusY 
     * @param radiusZ 
     * @param filled Filled if true, hollow by default.
     * @param part Specifies the part of the sphere to be build (top, bottom, west, east, north, south, etc.)
     * @returns 
     */
    // Code from: https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1762
    function ellipsoid(pCenter: Position, block: number, radiusX: number, radiusY: number, radiusZ: number, filled: boolean, part: string): number {
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
    
                    let distanceSq = lengthSq3(xn, yn, zn);
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
                        if (lengthSq3(nextXn, yn, zn) <= 1 && lengthSq3(xn, nextYn, zn) <= 1 && lengthSq3(xn, yn, nextZn) <= 1) {
                            continue;
                        }
                    }
    
    
                    /**
                     * T = Top     N = North   W = West     F = Full 
                     * B = Bottom  S = South   E = East
                     * 
                     * North (negative Z)   West (negative X)   Down (negative Y)
                     * South (positive Z)   East (positive X)   Up (positive Y)
                     */
                    //Top
                    if (part == "TSE" || part == "TS" || part == "E" || part == "T" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, y, z)));
                        ++affected;
                    }
                    if (part == "TSW" || part == "TS" || part == "W" || part == "T" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                        ++affected;
                    }
                    if (part == "TNE" || part == "TN" || part == "E" || part == "T" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                        ++affected;
                    }
                    if (part == "TNW" || part == "TN" || part == "W" || part == "T" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                        ++affected;
                    }
                    // Bottom
                     if (part == "BSE" || part == "BS" || part == "E" || part == "B" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, -y, z)));
                        ++affected;
                    }
                    if (part == "BSE" || part == "BS" || part == "W" || part == "B" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, -y, z)));
                        ++affected;
                    }
                    if (part == "BNE" || part == "BN" || part == "E" || part == "B" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, -y, -z)));
                        ++affected;
                    }
                    if (part == "BNW" || part == "BN" || part == "W" || part == "B" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, -y, -z)));
                        ++affected;
                    }
                }
            }
        }
        return affected;
    }



    /**
     * Function to create the actual sphere in the world.
     * @param pCenter the position which is the center of the sphere
     * @param block the blockID to use
     * @param radiusX 
     * @param radiusY 
     * @param radiusZ 
     * @param filled Filled if true, hollow by default.
     * @param part Specifies the part of the sphere to be build (top, bottom, west, east, north, south, etc.)
     * @returns 
     */
    // Code from: https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1668
     function cylinder(pCenter: Position, block: number, radiusX: number, height: number, radiusZ: number, filled: boolean, part: string): number {
        let affected: number = 0;
    
        pCenter = pCenter.toWorld();

        radiusX += 0.5;
        radiusZ += 0.5;

        if (height == 0) {
            return 0;
        } else if (height < 0) {
            // if height is negative, then build cylinder downwards from pCenter.
            pCenter = positions.add(pCenter, pos(0, height, 0));
            height = -height; // make height a positive number.
        }

        // not sure if this is really needed?
        if (pCenter.getValue(Axis.Y) < getMinY()) {
            pCenter = world(pCenter.getValue(Axis.X), getMinY(), pCenter.getValue(Axis.Z));
        } else if (pCenter.getValue(Axis.Y) + height - 1 > getMaxY()) {
            height = getMaxY() - pCenter.getValue(Axis.Y) + 1;
        }

        const invRadiusX = 1 / radiusX;
        const invRadiusZ = 1 / radiusZ;

        const ceilRadiusX = Math.ceil(radiusX);
        const ceilRadiusZ = Math.ceil(radiusZ);

        let nextXn = 0;
        forX: for (let x = 0; x <= ceilRadiusX; ++x) {
            const xn = nextXn;
            nextXn = (x + 1) * invRadiusX;
            let nextZn = 0;
            forZ: for (let z = 0; z <= ceilRadiusZ; ++z) {
                const zn = nextZn;
                nextZn = (z + 1) * invRadiusZ;

                let distanceSq = lengthSq2(xn, zn);
                if (distanceSq > 1) {
                    if (z == 0) {
                        break forX;
                    }
                    break forZ;
                }

                if (!filled) {
                    if (lengthSq2(nextXn, zn) <= 1 && lengthSq2(xn, nextZn) <= 1) {
                        continue;
                    }
                }

                /**
                 * N = North   W = West     F = Full 
                 * S = South   E = East
                 * 
                 * North (negative Z)   West (negative X)   Down (negative Y)
                 * South (positive Z)   East (positive X)   Up (positive Y)
                 */
                for (let y = 0; y < height; ++y) {
                    if (part == "SE" || part == "S" || part == "E" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, y, z)));
                        ++affected;
                    }
                    if (part == "SW" || part == "S" || part == "W" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                        ++affected;
                    }
                    if (part == "NE" || part == "N" || part == "E" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                        ++affected;
                    }
                    if (part == "NW" || part == "N" || part == "W" || part == "F") {
                        blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                        ++affected;
                    }
                }
            }
        }
        return affected;
    }



    /**
     * Makes a pyramid.
     *
     * @param position a position
     * @param block a block
     * @param size size of pyramid
     * @param filled true if filled
     * @return number of blocks changed
     * @throws MaxChangedBlocksException thrown if too many blocks are changed
     */
    // Code from: https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1848
     function pyramid(pCenter: Position, block: number, size: number, filled: boolean, part: string): number {
        let affected = 0;
        let reverse: boolean = false
        let height: number;

        size > 0 ? height = size : height = -size - 1;

        if (size < 0) {
            reverse = true
            size = 0;
        }

        for (let y = 0; y <= height; ++y) {
            if (!reverse) {
                size--;
                for (let x = 0; x <= size; ++x) {
                    for (let z = 0; z <= size; ++z) {

                        if ((filled && z <= size && x <= size) || z == size || x == size) {

                            if (part == "SE" || part == "S" || part == "E" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(x, y, z)));
                                ++affected;
                            }
                            if (part == "SW" || part == "S" || part == "W" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                                ++affected;
                            }
                            if (part == "NE" || part == "N" || part == "E" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                                ++affected;
                            }
                            if (part == "NW" || part == "N" || part == "W" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                                ++affected;
                            }
                        }
                    }
                }
            }
            else {
                if (y == 0) {
                    blocks.place(block, positions.add(pCenter, world(0, y, 0)));
                    ++affected;
                }
                else {
                    size++;
                    for (let x = size; x >= 0; --x) {
                        for (let z = size; z >= 0; --z) {
                            
                            if ((filled && z <= size && x <= size) || z == size || x == size) {

                                if (part == "SE" || part == "S" || part == "E" || part == "F") {
                                blocks.place(block, positions.add(pCenter, world(x, y, z)));
                                ++affected;
                                }
                                if (part == "SW" || part == "S" || part == "W" || part == "F") {
                                    blocks.place(block, positions.add(pCenter, world(-x, y, z)));
                                    ++affected;
                                }
                                if (part == "NE" || part == "N" || part == "E" || part == "F") {
                                    blocks.place(block, positions.add(pCenter, world(x, y, -z)));
                                    ++affected;
                                }
                                if (part == "NW" || part == "N" || part == "W" || part == "F") {
                                    blocks.place(block, positions.add(pCenter, world(-x, y, -z)));
                                    ++affected;
                                }
                            }
                        }
                    }
                }   
            }
        }
        return affected;
    }


    /**
     * Makes a wall with a certain height.
     * @param block the block id to make the wall with
     * @param height height of the wall
     * @returns amount of blocks added
     */
     function wall(nBlockID: number, nHeight: number, sAction: string): number {
        let nAffected: number = 0;
        let nMaxWallHeight: number;
        let pCurWallHeight: Position;
        let pEnd: Position;
        let pStart: Position;
        let nStartY: number;
        let nCurY: number;

        const nWalls: number = Data.aMarks.length;
        const pNewWallHeight = pos(0, nHeight - 1, 0);
        const nNewY: number = pNewWallHeight.getValue(Axis.Y);

        // When there are less than two marks set, return 0.
        if (nWalls < 2) {
            console.error(`You need atleast two marks to build a wall.`)
            return 0;
        }

        pStart = marks.getFirst();
        nStartY = pStart.getValue(Axis.Y);
        nMaxWallHeight = getMaxY() - nStartY;
        // Return 0 if wall height exceeds maximum heightlimit.
        if ( nHeight > nMaxWallHeight) {
            console.error(`Wall height exceeds heightlimit of 255 blocks.\nMaximum height of the wall can be ${nMaxWallHeight} blocks.`);
            return 0;
        }

        // use exponentional search to find the first AIR block in Y-direction.
        pCurWallHeight = pos(0, search.exponential(pStart, nMaxWallHeight, AIR), 0);
        
        // if there is no wall yet, set pCurWallHeight to 0
        if (pCurWallHeight.getValue(Axis.Y) == nStartY) {
            pCurWallHeight = pos(0,0,0);
        }

        // Current wall Y-value.
        nCurY = pCurWallHeight.getValue(Axis.Y);
        
        // loop through the amount of walls to make.
        for (let i = 1; i < nWalls; ++i) {
            pEnd = Data.aMarks[i];
            // 
            let topStart = positions.add(pStart, pos(0, nCurY, 0)).toWorld();
            let topEnd = positions.add(pEnd, pos(0, nCurY, 0)).toWorld();

            if (sAction == "del") {
                shapes.line(AIR, topStart, topEnd, pos(0, -nHeight, 0));
            } 
            else if (sAction == "add"){
                shapes.line(nBlockID, topStart, topEnd, pNewWallHeight);
            }
            else if (sAction == "destroy") {
                // removes the current wall
                shapes.line(AIR, pStart, pEnd, pCurWallHeight);
            }
            else { 
                // If the to be created wall is lower then the 
                // current wall, then replace the excess with air blocks
                if((nCurY - nNewY) > 0) {
                    shapes.line(AIR, topStart, topEnd, pCurWallHeight);
                }
                else {
                    // If the wall to be created is higher then current, make the wall.
                    shapes.line(nBlockID, pStart, pEnd, pNewWallHeight); 
                }
            }             

            // Calculate the volume of blocks that have been added.
            nAffected += calcVolume(pStart, pEnd, nHeight);

            // Make the next wall.
            pStart = pEnd;
       }

       // Change calculation of affected blocks when there are two walls or more.
       if (nWalls > 2) {
           return nAffected - ((nWalls - 2) * nHeight);
       }
       else {
           return nAffected;
       }
    }
}