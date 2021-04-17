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
    
        if (init(sParams)) {
            if(Data.Sphere.nWidth > 0) {
                let amountOfBlocks = sphere(Data.Sphere.pCenter, Data.nBuildBlock, Data.Sphere.nWidth, Data.Sphere.nHeight, Data.Sphere.nLength, Data.Sphere.bFilled, Data.Sphere.sPart);
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
     * 
     * @param sParams 
     * @returns true on success and false on failure.
     */
    function init(sParams: string[]): boolean {
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
                        setWidth(parseInt(sParams[i]));
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
    
        if (Data.Sphere.nLength == -1) {
            setLength(Data.Sphere.nWidth);
        }
    
        if (Data.Sphere.nHeight == -1) {
            setHeight(Data.Sphere.nWidth);
        }
    
        if (Data.aMarks.length == 1 ) {
            setCenter(marks.str2pos(Data.aMarks[0]));
        }
        else {
            setCenter(player.position());
        }
    
        return true;
    }
    
    


    /**
     * Resets the sphere values to default
     */
    function reset() {
            Data.Sphere.pCenter = pos(0,0,0);
            Data.Sphere.nWidth = -1;
            Data.Sphere.nHeight = -1;
            Data.Sphere.nLength = -1; 
            Data.Sphere.sPart = "F";
            Data.Sphere.bFilled = false;
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
    
                    let distanceSq = lengthSq(xn, yn, zn);
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
                        if (lengthSq(nextXn, yn, zn) <= 1 && lengthSq(xn, nextYn, zn) <= 1 && lengthSq(xn, yn, nextZn) <= 1) {
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
     * 
     * @param x 
     * @param y 
     * @param z 
     * @returns 
     */
    function lengthSq(x: number, y: number, z: number) {
        return (x * x) + (y * y) + (z * z)
    }
}