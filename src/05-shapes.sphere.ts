/******************************************************************************
 * 
 *  File: src/05-shapes.sphere.ts
 *  Description: Functions to initialise and build a sphere or elipsoid.
 * 
 ******************************************************************************/

namespace sphere {
    

    /**
     * 
     * @param radius The sphere's radius
     * @param part The part of the sphere to make (F, T, B, E, W, TN, TS, BN, BS, TNW, TNE, TSW, TSE, BNW, BNE, BSW, BSE)
     */
     export function build(sParams: string[]) {
        let startTimer = gameplay.timeQuery(GAME_TIME);
    
        if (shape.init(sParams)) {
            if(Data.oShape.nWidth > 0) {
                let amountOfBlocks = sphere(Data.oShape.pCenter, Data.nBuildBlock, Data.oShape.nWidth, Data.oShape.nHeight, Data.oShape.nLength, Data.oShape.bFilled, Data.oShape.sPart);
                let amountOfSeconds = (gameplay.timeQuery(GAME_TIME)-startTimer)/20
        
                console.print(`${amountOfBlocks} blocks added in ${amountOfSeconds} seconds.`);
                shape.reset();
            }
            else {
                console.error(`Please specify the radius of the sphere. For example: \\sphere 5`);
            }
        }
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
    function sphere(pCenter: Position, block: number, radiusX: number, radiusY: number, radiusZ: number, filled: boolean, part: string): number {
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
    
                    let distanceSq = shape.lengthSq3(xn, yn, zn);
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
                        if (shape.lengthSq3(nextXn, yn, zn) <= 1 && shape.lengthSq3(xn, nextYn, zn) <= 1 && shape.lengthSq3(xn, yn, nextZn) <= 1) {
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
}