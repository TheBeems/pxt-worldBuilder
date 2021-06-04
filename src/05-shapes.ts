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
     * function to use to build with.
     * @param sType The type of shape to build.
     * @param sParams The parameters to use for building.
     */
     export function build(sType: string, sParams: string[]) {
         // start a timer to see how long it took to build the shape
        let startTimer = gameplay.timeQuery(GAME_TIME);

        // the number of blocks used to build with
        let amountOfBlocks: number = 0;
    
        // first run init() in order to set all the different parameters (width, height, length, et cetera)
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
                
                // stop the timer and convert game time to seconds (20 game time is 1 second)
                let amountOfSeconds = (gameplay.timeQuery(GAME_TIME)-startTimer)/20
        
                console.print(`${amountOfBlocks} blocks added in ${amountOfSeconds} seconds.`);
                reset(); // reset all the parameters
            }
            else {
                switch(sType) {
                    case "sphere":
                        console.error(`Please specify the radius of the sphere. For example: sphere 5`);
                        break;

                    case "ellips":
                        console.error(`Please specify the radius of the ellips. For example: ellips 5 7 6`);
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
        
        // when there are no additional parameters given
        if (sParams.length == 0) {
            // need at least two marks for a wall or fill command
            if (Data.aMarks.length < 2) {
                console.print (`No marks to use.`);
                return false;
            }

            // determine the type of object to build
            switch (sType) {
                case "wall":
                    setHeight(1); // minimum height of wall
                    return true;
                
                case "fill":
                    // set the BlockID to fill with
                    Data.oShape.nBlockID = Data.nBuildBlock;
                    Data.oShape.nBlockData = 0;
                    return true;
                
                default:
                    return false;
            }
        }
        
        // loop through the amount of parameters
        for (let i = 0; i < sParams.length; i++) {
            if (isNaN(parseInt(sParams[i]))) {
                // arg is not a number.

                if( sType == "wall") {
                    // actions can be 'add', 'del' or 'destroy'
                    setAction(sParams[i]);
                }
                else {
                    // part can be 'T' (top), 'B' (bottom), 'E' (East), 'W' (West)
                    setPart(sParams[i]);
                }
            }
            else {
                // arg is a number.
                switch(n) {
                    case 0:
                        // if fill command, then first number is blockID
                        if (sType == "fill") {
                            Data.oShape.nBlockID = parseInt(sParams[i]);
                        }
                        else {
                            // if pyramid / wall, first number is the height
                            if (sType == "pyramid" || sType == "wall") {
                                setHeight(parseInt(sParams[i]));
                                setLength(1); // needed to start making pyramid, does nothing for pyramid or wall
                            } else { // for all other objects, first number is the width (X axis)
                                setWidth(parseInt(sParams[i]));
                            } 
                        }
                        
                        n++;
                        break;
                    
                    case 1:
                        // if fill command, then second number is blockData
                        if (sType == "fill") {
                            Data.oShape.nBlockData = parseInt(sParams[i]);
                        }
                        else { // for all other objects, second number is the height (Y axis)
                            setHeight(parseInt(sParams[i]));
                        };
                        n++;
                        break;
                    
                    case 2:
                        // third number is the length (Z axis)
                        setLength(parseInt(sParams[i]));
                        n++
                        break;
                }
            }
        }
    
        // used for sphere / ellips to set
        // height equal to width
        if (Data.oShape.nHeight == 0) {
            setHeight(Data.oShape.nWidth);
        }

        // used for sphere / ellips to set
        // length equal to width
        if (Data.oShape.nLength == 0) {
            setLength(Data.oShape.nWidth);
        }
    
        // if only 1 mark is set, then place
        // the center at mark position, otherwise 
        // use player position
        if (Data.aMarks.length == 1 ) {
            setCenter(marks.getFirst());
        }
        else if (sType == "pyramid" || sType == "sphere" || sType == "ellips" || sType == "cylinder") {
            setCenter(player.position());
        }
    
        return true;
    }




    /**
     * Get the length from x and z axis, squared
     * @param x 
     * @param z 
     * @returns 
     */
    function lengthSq2(x: number, z: number) {
        return (x * x) + (z * z)
    }




    /**
     * Get the length from x, y and z axis, square
     * @param x 
     * @param y 
     * @param z 
     * @returns 
     */
    function lengthSq3(x: number, y: number, z: number) {
        return (x * x) + (y * y) + (z * z)
    }




    /**
     * Calculate the amount of blocks of a cuboid region.
     * Used for wall and the fill commands.
     * @param pStart start position
     * @param pEnd end position
     * @param pHeight the height incease of a flat wall
     * @returns 
     */
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




    /**
     * Fills an area between two marks with blocks
     * @param nBlockID blockID to use (default: 2 - GRASS)
     * @param nBlockData blockData to use (default: 0)
     * @returns amount of blocks used
     */
    function fill(nBlockID: number, nBlockData: number): number {
        if (Data.aMarks.length > 1) {
            let pFrom = marks.getFirst();
            let pTo = marks.getLast();
            let nAffected: number = 0;

            nAffected = calcVolume(pFrom, pTo);

            if (nAffected > getMaxFillBlocks()) {
                let nCountFill = Math.abs(pFrom.getValue(Axis.Y) - pTo.getValue(Axis.Y));
                
                console.print(`The area is initially too big! You want to place ${nAffected} blocks.\nWill initiate the fill command a couple of times.`);
                
                // make temp To position with lowest Y-value
                let pToTmp = world(pTo.getValue(Axis.X), pFrom.getValue(Axis.Y) , pTo.getValue(Axis.Z));
                let pFromTmp = pFrom;

                // first calculate if the square exceeds max amount of blocks for fill command
                if (calcVolume(pFrom, pToTmp) < getMaxFillBlocks()) {
                    // loop through the height of the to be filled area
                    for (let i = 0; i <= nCountFill; i++) {
                        pFromTmp = world(pFrom.getValue(Axis.X), pFromTmp.getValue(Axis.Y) + 1, pFrom.getValue(Axis.Z));
                        pToTmp = world(pTo.getValue(Axis.X), pToTmp.getValue(Axis.Y) + 1, pTo.getValue(Axis.Z));

                        blocks.fill(
                            blocks.blockWithData(nBlockID, nBlockData), 
                            pFromTmp, pToTmp, 
                            FillOperation.Replace
                        );
                    }
                }
                else {
                    console.error(`Area is still to big!`);
                    return -1;
                }
            }
            else {
                blocks.fill(
                    blocks.blockWithData(nBlockID, nBlockData), 
                    pFrom, pTo, 
                    FillOperation.Replace
                );
            }
            
            let msg = `Filled pos(${console.colorize(pFrom)}) to pos(${console.colorize(pTo)}) with blockID: ${console.colorize(nBlockID)}`;
            if (nBlockID >= 65536) {
                console.print(msg); 
            }
            else {
                console.print(msg + `and blockData: ${console.colorize(nBlockData)}`)
            }

            // calculate the amount of blocks that fill op the region
            return calcVolume(pFrom, pTo);
        }
        // can't fill with only 1 mark, so return -1
        return -1;
    }




    /**
     * Function to create a sphere or ellipsiod in the world
     * @param pCenter the position which is the center of the sphere
     * @param nBlockID the blockID to use
     * @param radiusX the radius for the X-axis (East/West, e.g. width)
     * @param radiusY the radius for the Y-axis (Up/Down, e.g. height)
     * @param radiusZ the radius for the Z-Axis (North/South, e.g. length)
     * @param bFilled Filled if true, hollow by default.
     * @param sPart Specifies the part of the sphere to be build (top, bottom, west, east, north, south, etc.)
     * @returns 
     */
    // Code from: https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1762
    function ellipsoid(pCenter: Position, nBlockID: number, radiusX: number, radiusY: number, radiusZ: number, bFilled: boolean, sPart: string): number {
        let nAffected: number = 0;
    
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
    
                    if (!bFilled) {
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
                    if (sPart == "TSE" || sPart == "TS" || sPart == "E" || sPart == "T" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(x, y, z)));
                        ++nAffected;
                    }
                    if (sPart == "TSW" || sPart == "TS" || sPart == "W" || sPart == "T" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(-x, y, z)));
                        ++nAffected;
                    }
                    if (sPart == "TNE" || sPart == "TN" || sPart == "E" || sPart == "T" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(x, y, -z)));
                        ++nAffected;
                    }
                    if (sPart == "TNW" || sPart == "TN" || sPart == "W" || sPart == "T" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(-x, y, -z)));
                        ++nAffected;
                    }
                    // Bottom
                     if (sPart == "BSE" || sPart == "BS" || sPart == "E" || sPart == "B" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(x, -y, z)));
                        ++nAffected;
                    }
                    if (sPart == "BSE" || sPart == "BS" || sPart == "W" || sPart == "B" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(-x, -y, z)));
                        ++nAffected;
                    }
                    if (sPart == "BNE" || sPart == "BN" || sPart == "E" || sPart == "B" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(x, -y, -z)));
                        ++nAffected;
                    }
                    if (sPart == "BNW" || sPart == "BN" || sPart == "W" || sPart == "B" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(-x, -y, -z)));
                        ++nAffected;
                    }
                }
            }
        }
        return nAffected;
    }




    /**
     * Function to create a cylinder. When height is a negative number the
     * cylinder is build downwards.
     * @param pCenter the position which is the center of the cylinder
     * @param nBlockID the blockID to use
     * @param radiusX the radius for the X-axis (East/West, e.g. width)
     * @param nHeight the height of the cylinder
     * @param radiusZ the radius for the Z-Axis (North/South, e.g. length) 
     * @param bFilled Filled if true, hollow by default.
     * @param sPart Specifies the part of the sphere to be build (west, east, north, south)
     * @returns 
     * @link https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1668
     */ 
    function cylinder(pCenter: Position, nBlockID: number, radiusX: number, nHeight: number, radiusZ: number, bFilled: boolean, sPart: string): number {
        let nAffected: number = 0;
    
        pCenter = pCenter.toWorld();

        radiusX += 0.5;
        radiusZ += 0.5;

        if (nHeight == 0) {
            return 0;
        } else if (nHeight < 0) {
            // if height is negative, then build cylinder downwards from pCenter.
            pCenter = positions.add(pCenter, pos(0, nHeight, 0));
            nHeight = -nHeight; // make height a positive number.
        }

        // not sure if this is really needed?
        if (pCenter.getValue(Axis.Y) < getMinY()) {
            pCenter = world(pCenter.getValue(Axis.X), getMinY(), pCenter.getValue(Axis.Z));
        } else if (pCenter.getValue(Axis.Y) + nHeight - 1 > getMaxY()) {
            nHeight = getMaxY() - pCenter.getValue(Axis.Y) + 1;
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

                if (!bFilled) {
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
                for (let y = 0; y < nHeight; ++y) {
                    if (sPart == "SE" || sPart == "S" || sPart == "E" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(x, y, z)));
                        ++nAffected;
                    }
                    if (sPart == "SW" || sPart == "S" || sPart == "W" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(-x, y, z)));
                        ++nAffected;
                    }
                    if (sPart == "NE" || sPart == "N" || sPart == "E" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(x, y, -z)));
                        ++nAffected;
                    }
                    if (sPart == "NW" || sPart == "N" || sPart == "W" || sPart == "F") {
                        blocks.place(nBlockID, positions.add(pCenter, world(-x, y, -z)));
                        ++nAffected;
                    }
                }
            }
        }
        return nAffected;
    }




    /**
     * Creates a pyramid in the world. When size is a negative number, the
     * pyramid is build upsidedown.
     * @param pCenter the center position to build at
     * @param nBlockID blockID to build with
     * @param nSize size of pyramid
     * @param bFilled true if filled
     * @param sPart the part of the pyramid (north, south, east, west)
     * @return number of blocks changed
     * @link https://github.com/EngineHub/WorldEdit/blob/5aa81ff96efc661f051758c94e0d171c4ec40277/worldedit-core/src/main/java/com/sk89q/worldedit/EditSession.java#L1848
     */
     function pyramid(pCenter: Position, nBlockID: number, nSize: number, bFilled: boolean, sPart: string): number {
        let nAffected = 0;
        let bReverse: boolean = false
        let nHeight: number;

        // set height of the pyramid
        nSize > 0 ? nHeight = nSize : nHeight = -nSize - 1;

        // if size is negative, the pyramid is build upsidedown
        if (nSize < 0) {
            bReverse = true
            nSize = 0; // begin building with 1 block
        }

        for (let y = 0; y <= nHeight; ++y) {
            // build a normal pyramid
            if (!bReverse) {
                nSize--;
                for (let x = 0; x <= nSize; ++x) {
                    for (let z = 0; z <= nSize; ++z) {

                        if ((bFilled && z <= nSize && x <= nSize) || z == nSize || x == nSize) {

                            if (sPart == "SE" || sPart == "S" || sPart == "E" || sPart == "F") {
                                blocks.place(nBlockID, positions.add(pCenter, world(x, y, z)));
                                ++nAffected;
                            }
                            if (sPart == "SW" || sPart == "S" || sPart == "W" || sPart == "F") {
                                blocks.place(nBlockID, positions.add(pCenter, world(-x, y, z)));
                                ++nAffected;
                            }
                            if (sPart == "NE" || sPart == "N" || sPart == "E" || sPart == "F") {
                                blocks.place(nBlockID, positions.add(pCenter, world(x, y, -z)));
                                ++nAffected;
                            }
                            if (sPart == "NW" || sPart == "N" || sPart == "W" || sPart == "F") {
                                blocks.place(nBlockID, positions.add(pCenter, world(-x, y, -z)));
                                ++nAffected;
                            }
                        }
                    }
                }
            }
            else { // build a pyramid upsidedown
                // place 1 block at the center
                if (y == 0) {
                    blocks.place(nBlockID, positions.add(pCenter, world(0, y, 0)));
                    ++nAffected;
                }
                else { // continue making squares on top of eachother
                    nSize++;
                    for (let x = nSize; x >= 0; --x) {
                        for (let z = nSize; z >= 0; --z) {
                            
                            if ((bFilled && z <= nSize && x <= nSize) || z == nSize || x == nSize) {

                                if (sPart == "SE" || sPart == "S" || sPart == "E" || sPart == "F") {
                                blocks.place(nBlockID, positions.add(pCenter, world(x, y, z)));
                                ++nAffected;
                                }
                                if (sPart == "SW" || sPart == "S" || sPart == "W" || sPart == "F") {
                                    blocks.place(nBlockID, positions.add(pCenter, world(-x, y, z)));
                                    ++nAffected;
                                }
                                if (sPart == "NE" || sPart == "N" || sPart == "E" || sPart == "F") {
                                    blocks.place(nBlockID, positions.add(pCenter, world(x, y, -z)));
                                    ++nAffected;
                                }
                                if (sPart == "NW" || sPart == "N" || sPart == "W" || sPart == "F") {
                                    blocks.place(nBlockID, positions.add(pCenter, world(-x, y, -z)));
                                    ++nAffected;
                                }
                            }
                        }
                    }
                }   
            }
        }
        return nAffected;
    }




    /**
     * Makes a wall with a certain height.
     * @param nBlockID the blockID to make the wall with
     * @param nHeight height of the wall
     * @param sAction additional action for wall command
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

        // Remove the mark if shown, otherwise the search below won't give proper results.
        if (blocks.testForBlock(Data.nMarkBlock, pStart)) {
            blocks.place(AIR, pStart);
        }

        // use exponentional search to find the first AIR block in Y-direction.
        pCurWallHeight = pos(0, search.exponential(pStart, nMaxWallHeight, AIR), 0);

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