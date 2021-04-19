/******************************************************************************
 * 
 *  File: src/05-shapes.ts
 *  Description:    Functions to initialise and build different shapes, like
 *                  sphere, elipsoids, pyramids, cylinders, etc.
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
        let amountOfBlocks: number;
    
        if (init(sType, sParams)) {
            if(Data.oShape.nWidth > 0 || Data.oShape.nHeight > 0) {
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
                    
                    default:
                        break;
                        
                }
                
                let amountOfSeconds = (gameplay.timeQuery(GAME_TIME)-startTimer)/20
        
                console.print(`${amountOfBlocks} blocks added in ${amountOfSeconds} seconds.`);
                reset();
            }
            else {
                console.error(`Please specify the radius of the sphere. For example: \\sphere 5`);
            }
        }
    }



    /**
     * Resets the sphere values to default
     */
    function reset() {
        Data.oShape.pCenter = pos(0,0,0);
        Data.oShape.nWidth = null;
        Data.oShape.nHeight = null;
        Data.oShape.nLength = null; 
        Data.oShape.sPart = "F";
        Data.oShape.bFilled = false;
    }

    /**
     * Initializing the shape to build.
     * @param sParams 
     * @returns true on success and false on failure.
     */
    function init(sType: string, sParams: string[]): boolean {
        let n: number = 0;
        
        if (sParams.length == 0) {
            if (Data.aMarks.length < 2) {
                console.print (`No marks to use.`);
                return false;
            }
            sParams = Data.aMarks;
            console.print (`Using marks to define the shape.`);
            return false;
        }
        
        for (let i = 0; i < sParams.length; i++) {
            if (isNaN(parseInt(sParams[i]))) {
                // arg is not a number.
                setPart(sParams[i]);
            }
            else {
                // arg is a number.
                switch(n) {
                    case 0:
                        if (sType == "pyramid") {
                            setHeight(parseInt(sParams[i]));
                        } else { 
                            setWidth(parseInt(sParams[i]))} 
                        n++;
                        break;
                    
                    case 1:
                        setHeight(parseInt(sParams[i]));
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
            setCenter(marks.str2pos(Data.aMarks[0]));
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
     function pyramid(pCenter: Position, block: number, size: number, filled: boolean, part: string): number {
        let affected = 0;

        let height = size;

        for (let y = 0; y <= height; ++y) {
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

        return affected;
    }

}