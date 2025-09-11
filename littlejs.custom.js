// LittleJS Engine - MIT License - Copyright 2021 Frank Force
// https://github.com/KilledByAPixel/LittleJS

'use strict';

/** 
 * LittleJS - Release Mode
 * - This file is used for release builds in place of engineDebug.js
 * - Debug functionality is disabled to reduce size and increase performance
 */



let showWatermark = 0;
let debugKey = '';
const debug = 0;
const debugOverlay = 0;
const debugPhysics = 0;
const debugParticles = 0;
const debugRaycast = 0;
const debugGamepads = 0;
const debugMedals = 0;

// debug commands are automatically removed from the final build
function ASSERT          (){}
function debugInit       (){}
function debugUpdate     (){}
function debugRender     (){}
function debugRect       (){}
function debugPoly       (){}
function debugCircle     (){}
function debugPoint      (){}
function debugLine       (){}
function debugOverlap    (){}
function debugText       (){}
function debugClear      (){}
function debugScreenshot (){}
function debugSaveCanvas (){}
function debugSaveText   (){}
function debugSaveDataURL(){}
/**
 * LittleJS Utility Classes and Functions
 * - General purpose math library
 * - Vector2 - fast, simple, easy 2D vector class
 * - Color - holds a rgba color with some math functions
 * - Timer - tracks time automatically
 * - RandomGenerator - seeded random number generator
 * @namespace Utilities
 */



/** A shortcut to get Math.PI
 *  @type {number}
 *  @default Math.PI
 *  @memberof Utilities */
const PI = Math.PI;

/** Returns absolute value of value passed in
 *  @param {number} value
 *  @return {number}
 *  @memberof Utilities */
function abs(value) { return Math.abs(value); }

/** Returns lowest of two values passed in
 *  @param {number} valueA
 *  @param {number} valueB
 *  @return {number}
 *  @memberof Utilities */
function min(valueA, valueB) { return Math.min(valueA, valueB); }

/** Returns highest of two values passed in
 *  @param {number} valueA
 *  @param {number} valueB
 *  @return {number}
 *  @memberof Utilities */
function max(valueA, valueB) { return Math.max(valueA, valueB); }

/** Returns the sign of value passed in
 *  @param {number} value
 *  @return {number}
 *  @memberof Utilities */
function sign(value) { return Math.sign(value); }

/** Returns first parm modulo the second param, but adjusted so negative numbers work as expected
 *  @param {number} dividend
 *  @param {number} [divisor]
 *  @return {number}
 *  @memberof Utilities */
function mod(dividend, divisor=1) { return ((dividend % divisor) + divisor) % divisor; }

/** Clamps the value between max and min
 *  @param {number} value
 *  @param {number} [min]
 *  @param {number} [max]
 *  @return {number}
 *  @memberof Utilities */
function clamp(value, min=0, max=1) { return value < min ? min : value > max ? max : value; }

/** Returns what percentage the value is between valueA and valueB
 *  @param {number} value
 *  @param {number} valueA
 *  @param {number} valueB
 *  @return {number}
 *  @memberof Utilities */
function percent(value, valueA, valueB)
{ return (valueB-=valueA) ? clamp((value-valueA)/valueB) : 0; }

/** Linearly interpolates between values passed in using percent
 *  @param {number} percent
 *  @param {number} valueA
 *  @param {number} valueB
 *  @return {number}
 *  @memberof Utilities */
function lerp(percent, valueA, valueB) { return valueA + clamp(percent) * (valueB-valueA); }

/** Returns signed wrapped distance between the two values passed in
 *  @param {number} valueA
 *  @param {number} valueB
 *  @param {number} [wrapSize]
 *  @returns {number}
 *  @memberof Utilities */
function distanceWrap(valueA, valueB, wrapSize=1)
{ const d = (valueA - valueB) % wrapSize; return d*2 % wrapSize - d; }

/** Linearly interpolates between values passed in with wrapping
 *  @param {number} percent
 *  @param {number} valueA
 *  @param {number} valueB
 *  @param {number} [wrapSize]
 *  @returns {number}
 *  @memberof Utilities */
function lerpWrap(percent, valueA, valueB, wrapSize=1)
{ return valueB + clamp(percent) * distanceWrap(valueA, valueB, wrapSize); }

/** Returns signed wrapped distance between the two angles passed in
 *  @param {number} angleA
 *  @param {number} angleB
 *  @returns {number}
 *  @memberof Utilities */
function distanceAngle(angleA, angleB) { return distanceWrap(angleA, angleB, 2*PI); }

/** Linearly interpolates between the angles passed in with wrapping
 *  @param {number} percent
 *  @param {number} angleA
 *  @param {number} angleB
 *  @returns {number}
 *  @memberof Utilities */
function lerpAngle(percent, angleA, angleB) { return lerpWrap(percent, angleA, angleB, 2*PI); }

/** Applies smoothstep function to the percentage value
 *  @param {number} percent
 *  @return {number}
 *  @memberof Utilities */
function smoothStep(percent) { return percent * percent * (3 - 2 * percent); }

/** Returns the nearest power of two not less then the value
 *  @param {number} value
 *  @return {number}
 *  @memberof Utilities */
function nearestPowerOfTwo(value) { return 2**Math.ceil(Math.log2(value)); }

/** Returns true if two axis aligned bounding boxes are overlapping 
 *  @param {Vector2} posA          - Center of box A
 *  @param {Vector2} sizeA         - Size of box A
 *  @param {Vector2} posB          - Center of box B
 *  @param {Vector2} [sizeB=(0,0)] - Size of box B, a point if undefined
 *  @return {boolean}              - True if overlapping
 *  @memberof Utilities */
function isOverlapping(posA, sizeA, posB, sizeB=vec2())
{ 
    return abs(posA.x - posB.x)*2 < sizeA.x + sizeB.x 
        && abs(posA.y - posB.y)*2 < sizeA.y + sizeB.y;
}

/** Returns true if a line segment is intersecting an axis aligned box
 *  @param {Vector2} start - Start of raycast
 *  @param {Vector2} end   - End of raycast
 *  @param {Vector2} pos   - Center of box
 *  @param {Vector2} size  - Size of box
 *  @return {boolean}      - True if intersecting
 *  @memberof Utilities */
function isIntersecting(start, end, pos, size)
{
    // Liang-Barsky algorithm
    const boxMin = pos.subtract(size.scale(.5));
    const boxMax = boxMin.add(size);
    const delta = end.subtract(start);
    const a = start.subtract(boxMin);
    const b = start.subtract(boxMax);
    const p = [-delta.x, delta.x, -delta.y, delta.y];
    const q = [a.x, -b.x, a.y, -b.y];
    let tMin = 0, tMax = 1;
    for (let i = 4; i--;)
    {
        if (p[i])
        {
            const t = q[i] / p[i];
            if (p[i] < 0)
            {
                if (t > tMax) return false;
                tMin = max(t, tMin);
            }
            else
            {
                if (t < tMin) return false;
                tMax = min(t, tMax);
            }
        }
        else if (q[i] < 0)
            return false;
    }

    return true;
}

/** Returns an oscillating wave between 0 and amplitude with frequency of 1 Hz by default
 *  @param {number} [frequency] - Frequency of the wave in Hz
 *  @param {number} [amplitude] - Amplitude (max height) of the wave
 *  @param {number} [t=time]    - Value to use for time of the wave
 *  @return {number}            - Value waving between 0 and amplitude
 *  @memberof Utilities */
function wave(frequency=1, amplitude=1, t=time)
{ return amplitude/2 * (1 - Math.cos(t*frequency*2*PI)); }

/** Formats seconds to mm:ss style for display purposes 
 *  @param {number} t - time in seconds
 *  @return {string}
 *  @memberof Utilities */
function formatTime(t) { return (t/60|0) + ':' + (t%60<10?'0':'') + (t%60|0); }

///////////////////////////////////////////////////////////////////////////////

/** Random global functions
 *  @namespace Random */

/** Returns a random value between the two values passed in
 *  @param {number} [valueA]
 *  @param {number} [valueB]
 *  @return {number}
 *  @memberof Random */
function rand(valueA=1, valueB=0) { return valueB + Math.random() * (valueA-valueB); }

/** Returns a floored random value between the two values passed in
 *  The upper bound is exclusive. (If 2 is passed in, result will be 0 or 1)
 *  @param {number} valueA
 *  @param {number} [valueB]
 *  @return {number}
 *  @memberof Random */
function randInt(valueA, valueB=0) { return Math.floor(rand(valueA,valueB)); }

/** Randomly returns either -1 or 1
 *  @return {number}
 *  @memberof Random */
function randSign() { return randInt(2) * 2 - 1; }

/** Returns a random Vector2 with the passed in length
 *  @param {number} [length]
 *  @return {Vector2}
 *  @memberof Random */
function randVector(length=1) { return new Vector2().setAngle(rand(2*PI), length); }

/** Returns a random Vector2 within a circular shape
 *  @param {number} [radius]
 *  @param {number} [minRadius]
 *  @return {Vector2}
 *  @memberof Random */
function randInCircle(radius=1, minRadius=0)
{ return radius > 0 ? randVector(radius * rand(minRadius / radius, 1)**.5) : new Vector2; }

/** Returns a random color between the two passed in colors, combine components if linear
 *  @param {Color}   [colorA=(1,1,1,1)]
 *  @param {Color}   [colorB=(0,0,0,1)]
 *  @param {boolean} [linear]
 *  @return {Color}
 *  @memberof Random */
function randColor(colorA=new Color, colorB=new Color(0,0,0,1), linear=false)
{
    return linear ? colorA.lerp(colorB, rand()) : 
        new Color(rand(colorA.r,colorB.r), rand(colorA.g,colorB.g), rand(colorA.b,colorB.b), rand(colorA.a,colorB.a));
}

///////////////////////////////////////////////////////////////////////////////

/** 
 * Seeded random number generator
 * - Can be used to create a deterministic random number sequence
 * @example
 * let r = new RandomGenerator(123); // random number generator with seed 123
 * let a = r.float();                // random value between 0 and 1
 * let b = r.int(10);                // random integer between 0 and 9
 * r.seed = 123;                     // reset the seed
 * let c = r.float();                // the same value as a
 */
class RandomGenerator
{
    /** Create a random number generator with the seed passed in
     *  @param {number} seed - Starting seed */
    constructor(seed)
    {
        /** @property {number} - random seed */
        this.seed = seed;
    }

    /** Returns a seeded random value between the two values passed in
    *  @param {number} [valueA]
    *  @param {number} [valueB]
    *  @return {number} */
    float(valueA=1, valueB=0)
    {
        // xorshift algorithm
        this.seed ^= this.seed << 13; 
        this.seed ^= this.seed >>> 17; 
        this.seed ^= this.seed << 5;
        return valueB + (valueA - valueB) * ((this.seed >>> 0) / 2**32);
    }

    /** Returns a floored seeded random value the two values passed in
    *  @param {number} valueA
    *  @param {number} [valueB]
    *  @return {number} */
    int(valueA, valueB=0) { return Math.floor(this.float(valueA, valueB)); }

    /** Randomly returns either -1 or 1 deterministically
    *  @return {number} */
    sign() { return this.float() > .5 ? 1 : -1; }
}

///////////////////////////////////////////////////////////////////////////////

/** 
 * Create a 2d vector, can take another Vector2 to copy, 2 scalars, or 1 scalar
 * @param {Vector2|number} [x]
 * @param {number} [y]
 * @return {Vector2}
 * @example
 * let a = vec2(0, 1); // vector with coordinates (0, 1)
 * let b = vec2(a);    // copy a into b
 * a = vec2(5);        // set a to (5, 5)
 * b = vec2();         // set b to (0, 0)
 * @memberof Utilities
 */
function vec2(x=0, y)
{
    return typeof x == 'number' ? 
        new Vector2(x, y == undefined? x : y) : 
        new Vector2(x.x, x.y);
}

/** 
 * Check if object is a valid Vector2
 * @param {any} v
 * @return {boolean}
 * @memberof Utilities
 */
function isVector2(v) { return v instanceof Vector2; }

/** 
 * 2D Vector object with vector math library
 * - Functions do not change this so they can be chained together
 * @example
 * let a = new Vector2(2, 3); // vector with coordinates (2, 3)
 * let b = new Vector2;       // vector with coordinates (0, 0)
 * let c = vec2(4, 2);        // use the vec2 function to make a Vector2
 * let d = a.add(b).scale(5); // operators can be chained
 */
class Vector2
{
    /** Create a 2D vector with the x and y passed in, can also be created with vec2()
     *  @param {number} [x] - X axis location
     *  @param {number} [y] - Y axis location */
    constructor(x=0, y=0)
    {
        /** @property {number} - X axis location */
        this.x = x;
        /** @property {number} - Y axis location */
        this.y = y;
        ASSERT(this.isValid());
    }

    /** Sets values of this vector and returns self
     *  @param {number} [x] - X axis location
     *  @param {number} [y] - Y axis location
     *  @return {Vector2} */
    set(x=0, y=0)
    {
        this.x = x;
        this.y = y;
        ASSERT(this.isValid());
        return this;
    }

    /** Returns a new vector that is a copy of this
     *  @return {Vector2} */
    copy() { return new Vector2(this.x, this.y); }

    /** Returns a copy of this vector plus the vector passed in
     *  @param {Vector2} v - other vector
     *  @return {Vector2} */
    add(v)
    {
        ASSERT(isVector2(v));
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    /** Returns a copy of this vector minus the vector passed in
     *  @param {Vector2} v - other vector
     *  @return {Vector2} */
    subtract(v)
    {
        ASSERT(isVector2(v));
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    /** Returns a copy of this vector times the vector passed in
     *  @param {Vector2} v - other vector
     *  @return {Vector2} */
    multiply(v)
    {
        ASSERT(isVector2(v));
        return new Vector2(this.x * v.x, this.y * v.y);
    }

    /** Returns a copy of this vector divided by the vector passed in
     *  @param {Vector2} v - other vector
     *  @return {Vector2} */
    divide(v)
    {
        ASSERT(isVector2(v));
        return new Vector2(this.x / v.x, this.y / v.y);
    }

    /** Returns a copy of this vector scaled by the vector passed in
     *  @param {number} s - scale
     *  @return {Vector2} */
    scale(s)
    {
        ASSERT(!isVector2(s));
        return new Vector2(this.x * s, this.y * s);
    }

    /** Returns the length of this vector
     * @return {number} */
    length() { return this.lengthSquared()**.5; }

    /** Returns the length of this vector squared
     * @return {number} */
    lengthSquared() { return this.x**2 + this.y**2; }

    /** Returns the distance from this vector to vector passed in
     * @param {Vector2} v - other vector
     * @return {number} */
    distance(v)
    {
        ASSERT(isVector2(v));
        return this.distanceSquared(v)**.5;
    }

    /** Returns the distance squared from this vector to vector passed in
     * @param {Vector2} v - other vector
     * @return {number} */
    distanceSquared(v)
    {
        ASSERT(isVector2(v));
        return (this.x - v.x)**2 + (this.y - v.y)**2;
    }

    /** Returns a new vector in same direction as this one with the length passed in
     * @param {number} [length]
     * @return {Vector2} */
    normalize(length=1)
    {
        const l = this.length();
        return l ? this.scale(length/l) : new Vector2(0, length);
    }

    /** Returns a new vector clamped to length passed in
     * @param {number} [length]
     * @return {Vector2} */
    clampLength(length=1)
    {
        const l = this.length();
        return l > length ? this.scale(length/l) : this;
    }

    /** Returns the dot product of this and the vector passed in
     * @param {Vector2} v - other vector
     * @return {number} */
    dot(v)
    {
        ASSERT(isVector2(v));
        return this.x*v.x + this.y*v.y;
    }

    /** Returns the cross product of this and the vector passed in
     * @param {Vector2} v - other vector
     * @return {number} */
    cross(v)
    {
        ASSERT(isVector2(v));
        return this.x*v.y - this.y*v.x;
    }

    /** Returns the clockwise angle of this vector, up is angle 0
     * @return {number} */
    angle() { return Math.atan2(this.x, this.y); }

    /** Sets this vector with clockwise angle and length passed in
     * @param {number} [angle]
     * @param {number} [length]
     * @return {Vector2} */
    setAngle(angle=0, length=1) 
    {
        this.x = length*Math.sin(angle);
        this.y = length*Math.cos(angle);
        return this;
    }

    /** Returns copy of this vector rotated by the clockwise angle passed in
     * @param {number} angle
     * @return {Vector2} */
    rotate(angle)
    { 
        const c = Math.cos(-angle), s = Math.sin(-angle); 
        return new Vector2(this.x*c - this.y*s, this.x*s + this.y*c);
    }

    /** Set the integer direction of this vector, corresponding to multiples of 90 degree rotation (0-3)
     * @param {number} [direction]
     * @param {number} [length] */
    setDirection(direction, length=1)
    {
        direction = mod(direction, 4);
        ASSERT(direction==0 || direction==1 || direction==2 || direction==3);
        return vec2(direction%2 ? direction-1 ? -length : length : 0, 
            direction%2 ? 0 : direction ? -length : length);
    }

    /** Returns the integer direction of this vector, corresponding to multiples of 90 degree rotation (0-3)
     * @return {number} */
    direction()
    { return abs(this.x) > abs(this.y) ? this.x < 0 ? 3 : 1 : this.y < 0 ? 2 : 0; }

    /** Returns a copy of this vector that has been inverted
     * @return {Vector2} */
    invert() { return new Vector2(this.y, -this.x); }

    /** Returns a copy of this vector with each axis floored
     * @return {Vector2} */
    floor() { return new Vector2(Math.floor(this.x), Math.floor(this.y)); }

    /** Returns the area this vector covers as a rectangle
     * @return {number} */
    area() { return abs(this.x * this.y); }

    /** Returns a new vector that is p percent between this and the vector passed in
     * @param {Vector2} v - other vector
     * @param {number}  percent
     * @return {Vector2} */
    lerp(v, percent)
    {
        ASSERT(isVector2(v));
        return this.add(v.subtract(this).scale(clamp(percent)));
    }

    /** Returns true if this vector is within the bounds of an array size passed in
     * @param {Vector2} arraySize
     * @return {boolean} */
    arrayCheck(arraySize)
    {
        ASSERT(isVector2(arraySize));
        return this.x >= 0 && this.y >= 0 && this.x < arraySize.x && this.y < arraySize.y;
    }

    /** Returns this vector expressed as a string
     * @param {number} digits - precision to display
     * @return {string} */
    toString(digits=3) 
    {
        if (debug)
            return `(${(this.x<0?'':' ') + this.x.toFixed(digits)},${(this.y<0?'':' ') + this.y.toFixed(digits)} )`;
    }

    /** Checks if this is a valid vector
     * @return {boolean} */
    isValid()
    {
        return typeof this.x == 'number' && !isNaN(this.x)
            && typeof this.y == 'number' && !isNaN(this.y);
    }
}

///////////////////////////////////////////////////////////////////////////////

/** 
 * Create a color object with RGBA values, white by default
 * @param {number} [r=1] - red
 * @param {number} [g=1] - green
 * @param {number} [b=1] - blue
 * @param {number} [a=1] - alpha
 * @return {Color}
 * @memberof Utilities
 */
function rgb(r, g, b, a) { return new Color(r, g, b, a); }

/** 
 * Create a color object with HSLA values, white by default
 * @param {number} [h=0] - hue
 * @param {number} [s=0] - saturation
 * @param {number} [l=1] - lightness
 * @param {number} [a=1] - alpha
 * @return {Color}
 * @memberof Utilities
 */
function hsl(h, s, l, a) { return new Color().setHSLA(h, s, l, a); }

/** 
 * Check if object is a valid Color
 * @param {any} c
 * @return {boolean}
 * @memberof Utilities
 */
function isColor(c) { return c instanceof Color; }

/** 
 * Color object (red, green, blue, alpha) with some helpful functions
 * @example
 * let a = new Color;              // white
 * let b = new Color(1, 0, 0);     // red
 * let c = new Color(0, 0, 0, 0);  // transparent black
 * let d = rgb(0, 0, 1);           // blue using rgb color
 * let e = hsl(.3, 1, .5);         // green using hsl color
 */
class Color
{
    /** Create a color with the rgba components passed in, white by default
     *  @param {number} [r] - red
     *  @param {number} [g] - green
     *  @param {number} [b] - blue
     *  @param {number} [a] - alpha*/
    constructor(r=1, g=1, b=1, a=1)
    {
        /** @property {number} - Red */
        this.r = r;
        /** @property {number} - Green */
        this.g = g;
        /** @property {number} - Blue */
        this.b = b;
        /** @property {number} - Alpha */
        this.a = a;
        ASSERT(this.isValid());
    }

    /** Sets values of this color and returns self
     *  @param {number} [r] - red
     *  @param {number} [g] - green
     *  @param {number} [b] - blue
     *  @param {number} [a] - alpha
     *  @return {Color} */
    set(r=1, g=1, b=1, a=1)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        ASSERT(this.isValid());
        return this;
    }

    /** Returns a new color that is a copy of this
     * @return {Color} */
    copy() { return new Color(this.r, this.g, this.b, this.a); }

    /** Returns a copy of this color plus the color passed in
     * @param {Color} c - other color
     * @return {Color} */
    add(c)
    {
        ASSERT(isColor(c));
        return new Color(this.r+c.r, this.g+c.g, this.b+c.b, this.a+c.a);
    }

    /** Returns a copy of this color minus the color passed in
     * @param {Color} c - other color
     * @return {Color} */
    subtract(c)
    {
        ASSERT(isColor(c));
        return new Color(this.r-c.r, this.g-c.g, this.b-c.b, this.a-c.a);
    }

    /** Returns a copy of this color times the color passed in
     * @param {Color} c - other color
     * @return {Color} */
    multiply(c)
    {
        ASSERT(isColor(c));
        return new Color(this.r*c.r, this.g*c.g, this.b*c.b, this.a*c.a);
    }

    /** Returns a copy of this color divided by the color passed in
     * @param {Color} c - other color
     * @return {Color} */
    divide(c)
    {
        ASSERT(isColor(c));
        return new Color(this.r/c.r, this.g/c.g, this.b/c.b, this.a/c.a);
    }

    /** Returns a copy of this color scaled by the value passed in, alpha can be scaled separately
     * @param {number} scale
     * @param {number} [alphaScale=scale]
     * @return {Color} */
    scale(scale, alphaScale=scale) 
    { return new Color(this.r*scale, this.g*scale, this.b*scale, this.a*alphaScale); }

    /** Returns a copy of this color clamped to the valid range between 0 and 1
     * @return {Color} */
    clamp() { return new Color(clamp(this.r), clamp(this.g), clamp(this.b), clamp(this.a)); }

    /** Returns a new color that is p percent between this and the color passed in
     * @param {Color}  c - other color
     * @param {number} percent
     * @return {Color} */
    lerp(c, percent)
    {
        ASSERT(isColor(c));
        return this.add(c.subtract(this).scale(clamp(percent)));
    }

    /** Sets this color given a hue, saturation, lightness, and alpha
     * @param {number} [h] - hue
     * @param {number} [s] - saturation
     * @param {number} [l] - lightness
     * @param {number} [a] - alpha
     * @return {Color} */
    setHSLA(h=0, s=0, l=1, a=1)
    {
        h = mod(h,1);
        s = clamp(s);
        l = clamp(l);
        const q = l < .5 ? l*(1+s) : l+s-l*s, p = 2*l-q,
            f = (p, q, t)=>
                (t = mod(t,1))*6 < 1 ? p+(q-p)*6*t :
                t*2 < 1 ? q :
                t*3 < 2 ? p+(q-p)*(4-t*6) : p;
        this.r = f(p, q, h + 1/3);
        this.g = f(p, q, h);
        this.b = f(p, q, h - 1/3);
        this.a = a;
        ASSERT(this.isValid());
        return this;
    }

    /** Returns this color expressed in hsla format
     * @return {Array<number>} */
    HSLA()
    {
        const r = clamp(this.r);
        const g = clamp(this.g);
        const b = clamp(this.b);
        const a = clamp(this.a);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        
        let h = 0, s = 0;
        if (max != min)
        {
            let d = max - min;
            s = l > .5 ? d / (2 - max - min) : d / (max + min);
            if (r == max)
                h = (g - b) / d + (g < b ? 6 : 0);
            else if (g == max)
                h = (b - r) / d + 2;
            else if (b == max)
                h =  (r - g) / d + 4;
        }
        return [h / 6, s, l, a];
    }

    /** Returns a new color that has each component randomly adjusted
     * @param {number} [amount]
     * @param {number} [alphaAmount]
     * @return {Color} */
    mutate(amount=.05, alphaAmount=0) 
    {
        return new Color
        (
            this.r + rand(amount, -amount),
            this.g + rand(amount, -amount),
            this.b + rand(amount, -amount),
            this.a + rand(alphaAmount, -alphaAmount)
        ).clamp();
    }

    /** Returns this color expressed as a hex color code
     * @param {boolean} [useAlpha] - if alpha should be included in result
     * @return {string} */
    toString(useAlpha = true)      
    { 
        const toHex = (c)=> ((c=clamp(c)*255|0)<16 ? '0' : '') + c.toString(16);
        return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b) + (useAlpha ? toHex(this.a) : '');
    }
    
    /** Set this color from a hex code
     * @param {string} hex - html hex code
     * @return {Color} */
    setHex(hex)
    {
        ASSERT(typeof hex == 'string' && hex[0] == '#');
        ASSERT([4,5,7,9].includes(hex.length), 'Invalid hex');

        if (hex.length < 6)
        {
            const fromHex = (c)=> clamp(parseInt(hex[c],16)/15);
            this.r = fromHex(1);
            this.g = fromHex(2),
            this.b = fromHex(3);
            this.a = hex.length == 5 ? fromHex(4) : 1;
        }
        else
        {
            const fromHex = (c)=> clamp(parseInt(hex.slice(c,c+2),16)/255);
            this.r = fromHex(1);
            this.g = fromHex(3),
            this.b = fromHex(5);
            this.a = hex.length == 9 ? fromHex(7) : 1;
        }

        ASSERT(this.isValid());
        return this;
    }
    
    /** Returns this color expressed as 32 bit RGBA value
     * @return {number} */
    rgbaInt()  
    {
        const r = clamp(this.r)*255|0;
        const g = clamp(this.g)*255<<8;
        const b = clamp(this.b)*255<<16;
        const a = clamp(this.a)*255<<24;
        return r + g + b + a;
    }

    /** Checks if this is a valid color
     * @return {boolean} */
    isValid()
    {
        return typeof this.r == 'number' && !isNaN(this.r)
            && typeof this.g == 'number' && !isNaN(this.g)
            && typeof this.b == 'number' && !isNaN(this.b)
            && typeof this.a == 'number' && !isNaN(this.a);
    }
}

///////////////////////////////////////////////////////////////////////////////
// default colors

/** Color - White #ffffff
 *  @type {Color}
 *  @memberof Utilities */
const WHITE = rgb(); 

/** Color - Black #000000
 *  @type {Color}
 *  @memberof Utilities */
const BLACK = rgb(0,0,0);

/** Color - Gray #808080
 *  @type {Color}
 *  @memberof Utilities */
const GRAY = rgb(.5,.5,.5);

/** Color - Red #ff0000
 *  @type {Color}
 *  @memberof Utilities */
const RED = rgb(1,0,0);

/** Color - Orange #ff8000
 *  @type {Color}
 *  @memberof Utilities */
const ORANGE = rgb(1,.5,0);

/** Color - Yellow #ffff00
 *  @type {Color}
 *  @memberof Utilities */
const YELLOW = rgb(1,1,0);

/** Color - Green #00ff00
 *  @type {Color}
 *  @memberof Utilities */
const GREEN = rgb(0,1,0);

/** Color - Cyan #00ffff
 *  @type {Color}
 *  @memberof Utilities */
const CYAN = rgb(0,1,1);

/** Color - Blue #0000ff
 *  @type {Color}
 *  @memberof Utilities */
const BLUE = rgb(0,0,1);

/** Color - Purple #8000ff
 *  @type {Color}
 *  @memberof Utilities */
const PURPLE = rgb(.5,0,1);

/** Color - Magenta #ff00ff
 *  @type {Color}
 *  @memberof Utilities */
const MAGENTA = rgb(1,0,1);

///////////////////////////////////////////////////////////////////////////////

/**
 * Timer object tracks how long has passed since it was set
 * @example
 * let a = new Timer;    // creates a timer that is not set
 * a.set(3);             // sets the timer to 3 seconds
 *
 * let b = new Timer(1); // creates a timer with 1 second left
 * b.unset();            // unset the timer
 */
class Timer
{
    /** Create a timer object set time passed in
     *  @param {number} [timeLeft] - How much time left before the timer elapses in seconds */
    constructor(timeLeft) { this.time = timeLeft == undefined ? undefined : time + timeLeft; this.setTime = timeLeft; }

    /** Set the timer with seconds passed in
     *  @param {number} [timeLeft] - How much time left before the timer is elapsed in seconds */
    set(timeLeft=0) { this.time = time + timeLeft; this.setTime = timeLeft; }

    /** Unset the timer */
    unset() { this.time = undefined; }

    /** Returns true if set
     * @return {boolean} */
    isSet() { return this.time != undefined; }

    /** Returns true if set and has not elapsed
     * @return {boolean} */
    active() { return time < this.time; }

    /** Returns true if set and elapsed
     * @return {boolean} */
    elapsed() { return time >= this.time; }

    /** Get how long since elapsed, returns 0 if not set (returns negative if currently active)
     * @return {number} */
    get() { return this.isSet()? time - this.time : 0; }

    /** Get percentage elapsed based on time it was set to, returns 0 if not set
     * @return {number} */
    getPercent() { return this.isSet()? 1-percent(this.time - time, 0, this.setTime) : 0; }
    
    /** Returns this timer expressed as a string
     * @return {string} */
    toString() { if (debug) { return this.isSet() ? Math.abs(this.get()) + ' seconds ' + (this.get()<0 ? 'before' : 'after' ) : 'unset'; }}
    
    /** Get how long since elapsed, returns 0 if not set (returns negative if currently active)
     * @return {number} */
    valueOf()               { return this.get(); }
}
/**
 * LittleJS Engine Settings
 * - All settings for the engine are here
 * @namespace Settings
 */



///////////////////////////////////////////////////////////////////////////////
// Camera settings

/** Position of camera in world space
 *  @type {Vector2}
 *  @default Vector2()
 *  @memberof Settings */
let cameraPos = vec2();

/** Scale of camera in world space
 *  @type {number}
 *  @default
 *  @memberof Settings */
let cameraScale = 32;

///////////////////////////////////////////////////////////////////////////////
// Display settings

/** The max size of the canvas, centered if window is larger
 *  @type {Vector2}
 *  @default Vector2(1920,1080)
 *  @memberof Settings */
let canvasMaxSize = vec2(1920, 1080);

/** Fixed size of the canvas, if enabled canvas size never changes
 * - you may also need to set mainCanvasSize if using screen space coords in startup
 *  @type {Vector2}
 *  @default Vector2()
 *  @memberof Settings */
let canvasFixedSize = vec2();

/** Use nearest neighbor scaling algorithm for canvas for more pixelated look
 *  - Must be set before startup to take effect
 *  - If enabled sets css image-rendering:pixelated
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let canvasPixelated = true;

/** Disables texture filtering for crisper pixel art
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let tilesPixelated = true;

/** Default font used for text rendering
 *  @type {string}
 *  @default
 *  @memberof Settings */
let fontDefault = 'arial';

/** Enable to show the LittleJS splash screen be shown on startup
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let showSplashScreen = false;

/** Disables all rendering, audio, and input for servers
 *  - Must be set before startup to take effect
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let headlessMode = false;

///////////////////////////////////////////////////////////////////////////////
// WebGL settings

/** Enable webgl rendering, webgl can be disabled and removed from build (with some features disabled)
 *  - Must be set before startup to take effect
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let glEnable = false;

/** Fixes slow rendering in some browsers by not compositing the WebGL canvas
 *  - Must be set before startup to take effect
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let glOverlay = true;

///////////////////////////////////////////////////////////////////////////////
// Object settings

/** Enable physics solver for collisions between objects
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let enablePhysicsSolver = true;

/** Default object mass for collision calculations (how heavy objects are)
 *  @type {number}
 *  @default
 *  @memberof Settings */
let objectDefaultMass = 1;

/** How much to slow velocity by each frame (0-1)
 *  @type {number}
 *  @default
 *  @memberof Settings */
let objectDefaultDamping = 1;

/** How much to slow angular velocity each frame (0-1)
 *  @type {number}
 *  @default
 *  @memberof Settings */
let objectDefaultAngleDamping = 1;

/** How much to bounce when a collision occurs (0-1)
 *  @type {number}
 *  @default
 *  @memberof Settings */
let objectDefaultElasticity = 0;

/** How much to slow when touching (0-1)
 *  @type {number}
 *  @default
 *  @memberof Settings */
let objectDefaultFriction = .8;

/** Clamp max speed to avoid fast objects missing collisions
 *  @type {number}
 *  @default
 *  @memberof Settings */
let objectMaxSpeed = 1;

/** How much gravity to apply to objects along the Y axis, negative is down
 *  @type {number}
 *  @default
 *  @memberof Settings */
let gravity = 0;

///////////////////////////////////////////////////////////////////////////////
// Input settings

/** If true, the dpad input is also routed to the left analog stick (for better accessability)
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let gamepadDirectionEmulateStick = true;

/** If true the WASD keys are also routed to the direction keys (for better accessability)
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let inputWASDEmulateDirection = true;

/** True if touch input is enabled for mobile devices
 *  - Touch events will be routed to mouse events
 *  - Must be set before startup to take effect
 *  @type {boolean}
 *  @default
 *  @memberof Settings */
let touchInputEnable = true;

///////////////////////////////////////////////////////////////////////////////
// Setters for global variables

/** Set position of camera in world space
 *  @param {Vector2} pos
 *  @memberof Settings */
function setCameraPos(pos) { cameraPos = pos; }

/** Set scale of camera in world space
 *  @param {number} scale
 *  @memberof Settings */
function setCameraScale(scale) { cameraScale = scale; }

/** Set max size of the canvas
 *  @param {Vector2} size
 *  @memberof Settings */
function setCanvasMaxSize(size) { canvasMaxSize = size; }

/** Set fixed size of the canvas
 *  @param {Vector2} size
 *  @memberof Settings */
function setCanvasFixedSize(size) { canvasFixedSize = size; }

/** Use nearest neighbor scaling algorithm for canvas for more pixelated look
 *  @param {boolean} pixelated
 *  @memberof Settings */
function setCanvasPixelated(pixelated) { canvasPixelated = pixelated; }

/** Disables texture filtering for crisper pixel art
 *  @param {boolean} pixelated
 *  @memberof Settings */
function setTilesPixelated(pixelated) { tilesPixelated = pixelated; }

/** Set default font used for text rendering
 *  @param {string} font
 *  @memberof Settings */
function setFontDefault(font) { fontDefault = font; }

/** Set if the LittleJS splash screen be shown on startup
 *  @param {boolean} show
 *  @memberof Settings */
function setShowSplashScreen(show) { showSplashScreen = show; }

/** Set to disable rendering, audio, and input for servers
 *  @param {boolean} headless
 *  @memberof Settings */
function setHeadlessMode(headless) { headlessMode = headless; }

/** Set if webgl rendering is enabled
 *  @param {boolean} enable
 *  @memberof Settings */
function setGlEnable(enable) { glEnable = enable; }

/** Set to not composite the WebGL canvas
 *  @param {boolean} overlay
 *  @memberof Settings */
function setGlOverlay(overlay) { glOverlay = overlay; }

/** Set if collisions between objects are enabled
 *  @param {boolean} enable
 *  @memberof Settings */
function setEnablePhysicsSolver(enable) { enablePhysicsSolver = enable; }

/** Set default object mass for collision calculations
 *  @param {number} mass
 *  @memberof Settings */
function setObjectDefaultMass(mass) { objectDefaultMass = mass; }

/** Set how much to slow velocity by each frame
 *  @param {number} damp
 *  @memberof Settings */
function setObjectDefaultDamping(damp) { objectDefaultDamping = damp; }

/** Set how much to slow angular velocity each frame
 *  @param {number} damp
 *  @memberof Settings */
function setObjectDefaultAngleDamping(damp) { objectDefaultAngleDamping = damp; }

/** Set how much to bounce when a collision occur
 *  @param {number} elasticity
 *  @memberof Settings */
function setObjectDefaultElasticity(elasticity) { objectDefaultElasticity = elasticity; }

/** Set how much to slow when touching
 *  @param {number} friction
 *  @memberof Settings */
function setObjectDefaultFriction(friction) { objectDefaultFriction = friction; }

/** Set max speed to avoid fast objects missing collisions
 *  @param {number} speed
 *  @memberof Settings */
function setObjectMaxSpeed(speed) { objectMaxSpeed = speed; }

/** Set how much gravity to apply to objects along the Y axis
 *  @param {number} newGravity
 *  @memberof Settings */
function setGravity(newGravity) { gravity = newGravity; }

/** Set if the dpad input is also routed to the left analog stick
 *  @param {boolean} enable
 *  @memberof Settings */
function setGamepadDirectionEmulateStick(enable) { gamepadDirectionEmulateStick = enable; }

/** Set if true the WASD keys are also routed to the direction keys
 *  @param {boolean} enable
 *  @memberof Settings */
function setInputWASDEmulateDirection(enable) { inputWASDEmulateDirection = enable; }

/** Set if touch input is allowed
 *  @param {boolean} enable
 *  @memberof Settings */
function setTouchInputEnable(enable) { touchInputEnable = enable; }

/** Set transparency of touch gamepad overlay
 *  @param {number} alpha
 *  @memberof Settings */
function setTouchGamepadAlpha(alpha) { touchGamepadAlpha = alpha; }

/** Set if watermark with FPS should be shown
 *  @param {boolean} show
 *  @memberof Debug */
function setShowWatermark(show) { showWatermark = show; }

/** Set key code used to toggle debug mode, Esc by default
 *  @param {string} key
 *  @memberof Debug */
function setDebugKey(key) { debugKey = key; }
/** 
 * LittleJS Object System
 */



/** 
 * LittleJS Object Base Object Class
 * - Top level object class used by the engine
 * - Automatically adds self to object list
 * - Will be updated and rendered each frame
 * - Renders as a sprite from a tilesheet by default
 * - Can have color and additive color applied
 * - 2D Physics and collision system
 * - Sorted by renderOrder
 * - Objects can have children attached
 * - Parents are updated before children, and set child transform
 * - Call destroy() to get rid of objects
 *
 * The physics system used by objects is simple and fast with some caveats...
 * - Collision uses the axis aligned size, the object's rotation angle is only for rendering
 * - Objects are guaranteed to not intersect tile collision from physics
 * - If an object starts or is moved inside tile collision, it will not collide with that tile
 * - Collision for objects can be set to be solid to block other objects
 * - Objects may get pushed into overlapping other solid objects, if so they will push away
 * - Solid objects are more performance intensive and should be used sparingly
 * @example
 * // create an engine object, normally you would first extend the class with your own
 * const pos = vec2(2,3);
 * const object = new EngineObject(pos); 
 */
class EngineObject
{
    /** Create an engine object and adds it to the list of objects
     *  @param {Vector2}  [pos=(0,0)]       - World space position of the object
     *  @param {Vector2}  [size=(1,1)]      - World space size of the object
     *  @param {TileInfo} [tileInfo]        - Tile info to render object (undefined is untextured)
     *  @param {number}   [angle]           - Angle the object is rotated by
     *  @param {Color}    [color=(1,1,1,1)] - Color to apply to tile when rendered
     *  @param {number}   [renderOrder]     - Objects sorted by renderOrder before being rendered
     */
    constructor(pos=vec2(), size=vec2(1), tileInfo, angle=0, color=new Color, renderOrder=0)
    {
        // set passed in params
        ASSERT(isVector2(pos) && isVector2(size), 'ensure pos and size are vec2s');
        ASSERT(typeof tileInfo !== 'number' || !tileInfo, 'old style tile setup');

        /** @property {Vector2} - World space position of the object */
        this.pos = pos.copy();
        /** @property {Vector2} - World space width and height of the object */
        this.size = size;
        /** @property {Vector2} - Size of object used for drawing, uses size if not set */
        this.drawSize = undefined;
        /** @property {TileInfo} - Tile info to render object (undefined is untextured) */
        this.tileInfo = tileInfo;
        /** @property {number}  - Angle to rotate the object */
        this.angle = angle;
        /** @property {Color}   - Color to apply when rendered */
        this.color = color;
        /** @property {Color}   - Additive color to apply when rendered */
        this.additiveColor = undefined;
        /** @property {boolean} - Should it flip along y axis when rendered */
        this.mirror = false;

        // physical properties
        /** @property {number} [mass=objectDefaultMass]                 - How heavy the object is, static if 0 */
        this.mass         = objectDefaultMass;
        /** @property {number} [damping=objectDefaultDamping]           - How much to slow down velocity each frame (0-1) */
        this.damping      = objectDefaultDamping;
        /** @property {number} [angleDamping=objectDefaultAngleDamping] - How much to slow down rotation each frame (0-1) */
        this.angleDamping = objectDefaultAngleDamping;
        /** @property {number} [elasticity=objectDefaultElasticity]     - How bouncy the object is when colliding (0-1) */
        this.elasticity   = objectDefaultElasticity;
        /** @property {number} [friction=objectDefaultFriction]         - How much friction to apply when sliding (0-1) */
        this.friction     = objectDefaultFriction;
        /** @property {number}  - How much to scale gravity by for this object */
        this.gravityScale = 1;
        /** @property {number}  - Objects are sorted by render order */
        this.renderOrder = renderOrder;
        /** @property {Vector2} - Velocity of the object */
        this.velocity = vec2();
        /** @property {number}  - Angular velocity of the object */
        this.angleVelocity = 0;
        /** @property {number}  - Track when object was created  */
        this.spawnTime = time;
        /** @property {Array<EngineObject>}   - List of children of this object */
        this.children = [];
        /** @property {boolean}  - Limit object speed using linear or circular math */
        this.clampSpeedLinear = true;
        /** @property {EngineObject} - Object we are standing on, if any  */
        this.groundObject = undefined;

        // parent child system
        /** @property {EngineObject} - Parent of object if in local space  */
        this.parent = undefined;
        /** @property {Vector2}      - Local position if child */
        this.localPos = vec2();
        /** @property {number}       - Local angle if child  */
        this.localAngle = 0;

        // collision flags
        /** @property {boolean} - Object collides with the tile collision */
        this.collideTiles = false;
        /** @property {boolean} - Object collides with solid objects */
        this.collideSolidObjects = false;
        /** @property {boolean} - Object collides with and blocks other objects */
        this.isSolid = false;
        /** @property {boolean} - Object collides with raycasts */
        this.collideRaycast = false;

        // add to list of objects
        engineObjects.push(this);
    }
    
    /** Update the object transform, called automatically by engine even when paused */
    updateTransforms()
    {
        const parent = this.parent;
        if (parent)
        {
            // copy parent pos/angle
            const mirror = parent.getMirrorSign();
            this.pos = this.localPos.multiply(vec2(mirror,1)).rotate(parent.angle).add(parent.pos);
            this.angle = mirror*this.localAngle + parent.angle;
        }

        // update children
        for (const child of this.children)
            child.updateTransforms();
    }

    /** Update the object physics, called automatically by engine once each frame */
    update()
    {
        // child objects do not have physics
        if (this.parent)
            return;

        // limit max speed to prevent missing collisions
        if (this.clampSpeedLinear)
        {
            this.velocity.x = clamp(this.velocity.x, -objectMaxSpeed, objectMaxSpeed);
            this.velocity.y = clamp(this.velocity.y, -objectMaxSpeed, objectMaxSpeed);
        }
        else
        {
            const length2 = this.velocity.lengthSquared();
            if (length2 > objectMaxSpeed*objectMaxSpeed)
            {
                const s = objectMaxSpeed / length2**.5;
                this.velocity.x *= s;
                this.velocity.y *= s;
            }
        }

        // apply physics
        const oldPos = this.pos.copy();
        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;
        if (this.mass) // don't apply gravity to static objects
            this.velocity.y += gravity * this.gravityScale;
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        this.angle += this.angleVelocity *= this.angleDamping;

        // physics sanity checks
        ASSERT(this.angleDamping >= 0 && this.angleDamping <= 1);
        ASSERT(this.damping >= 0 && this.damping <= 1);
        if (!enablePhysicsSolver || !this.mass) // don't do collision for static objects
            return;

        const wasMovingDown = this.velocity.y < 0;
        if (this.groundObject)
        {
            // apply friction in local space of ground object
            const groundSpeed = this.groundObject != this && this.groundObject.velocity ? 
                this.groundObject.velocity.x : 0;
            this.velocity.x = groundSpeed + (this.velocity.x - groundSpeed) * this.friction;
            this.groundObject = undefined;
            //debugOverlay && debugPhysics && debugPoint(this.pos.subtract(vec2(0,this.size.y/2)), '#0f0');
        }

        if (this.collideSolidObjects)
        {
            // check collisions against solid objects
            const epsilon = .001; // necessary to push slightly outside of the collision
            for (const o of engineObjectsCollide)
            {
                // non solid objects don't collide with each other
                if (!this.isSolid && !o.isSolid || o.destroyed || o.parent || o == this)
                    continue;

                // check collision
                if (!isOverlapping(this.pos, this.size, o.pos, o.size))
                    continue;

                // notify objects of collision and check if should be resolved
                const collide1 = this.collideWithObject(o);
                const collide2 = o.collideWithObject(this);
                if (!collide1 || !collide2)
                    continue;

                if (isOverlapping(oldPos, this.size, o.pos, o.size))
                {
                    // if already was touching, try to push away
                    const deltaPos = oldPos.subtract(o.pos);
                    const length = deltaPos.length();
                    const pushAwayAccel = .001; // push away if already overlapping
                    const velocity = length < .01 ? randVector(pushAwayAccel) : deltaPos.scale(pushAwayAccel/length);
                    this.velocity = this.velocity.add(velocity);
                    if (o.mass) // push away if not fixed
                        o.velocity = o.velocity.subtract(velocity);
                        
                    debugOverlay && debugPhysics && debugOverlap(this.pos, this.size, o.pos, o.size, '#f00');
                    continue;
                }

                // check for collision
                const sizeBoth = this.size.add(o.size);
                const smallStepUp = (oldPos.y - o.pos.y)*2 > sizeBoth.y + gravity; // prefer to push up if small delta
                const isBlockedX = abs(oldPos.y - o.pos.y)*2 < sizeBoth.y;
                const isBlockedY = abs(oldPos.x - o.pos.x)*2 < sizeBoth.x;
                const elasticity = max(this.elasticity, o.elasticity);
                
                if (smallStepUp || isBlockedY || !isBlockedX) // resolve y collision
                {
                    // push outside object collision
                    this.pos.y = o.pos.y + (sizeBoth.y/2 + epsilon) * sign(oldPos.y - o.pos.y);
                    if (o.groundObject && wasMovingDown || !o.mass)
                    {
                        // set ground object if landed on something
                        if (wasMovingDown)
                            this.groundObject = o;

                        // bounce if other object is fixed or grounded
                        this.velocity.y *= -elasticity;
                    }
                    else if (o.mass)
                    {
                        // inelastic collision
                        const inelastic = (this.mass * this.velocity.y + o.mass * o.velocity.y) / (this.mass + o.mass);

                        // elastic collision
                        const elastic0 = this.velocity.y * (this.mass - o.mass) / (this.mass + o.mass)
                            + o.velocity.y * 2 * o.mass / (this.mass + o.mass);
                        const elastic1 = o.velocity.y * (o.mass - this.mass) / (this.mass + o.mass)
                            + this.velocity.y * 2 * this.mass / (this.mass + o.mass);

                        // lerp between elastic or inelastic based on elasticity
                        this.velocity.y = lerp(elasticity, inelastic, elastic0);
                        o.velocity.y = lerp(elasticity, inelastic, elastic1);
                    }
                }
                if (!smallStepUp && isBlockedX) // resolve x collision
                {
                    // push outside collision
                    this.pos.x = o.pos.x + (sizeBoth.x/2 + epsilon) * sign(oldPos.x - o.pos.x);
                    if (o.mass)
                    {
                        // inelastic collision
                        const inelastic = (this.mass * this.velocity.x + o.mass * o.velocity.x) / (this.mass + o.mass);

                        // elastic collision
                        const elastic0 = this.velocity.x * (this.mass - o.mass) / (this.mass + o.mass)
                            + o.velocity.x * 2 * o.mass / (this.mass + o.mass);
                        const elastic1 = o.velocity.x * (o.mass - this.mass) / (this.mass + o.mass)
                            + this.velocity.x * 2 * this.mass / (this.mass + o.mass);

                        // lerp between elastic or inelastic based on elasticity
                        this.velocity.x = lerp(elasticity, inelastic, elastic0);
                        o.velocity.x = lerp(elasticity, inelastic, elastic1);
                    }
                    else // bounce if other object is fixed
                        this.velocity.x *= -elasticity;
                }
                debugOverlay && debugPhysics && debugOverlap(this.pos, this.size, o.pos, o.size, '#f0f');
            }
        }
        if (this.collideTiles)
        {
            // check collision against tiles
            if (tileCollisionTest(this.pos, this.size, this))
            {
                // if already was stuck in collision, don't do anything
                // this should not happen unless something starts in collision
                if (!tileCollisionTest(oldPos, this.size, this))
                {
                    // test which side we bounced off (or both if a corner)
                    const isBlockedY = tileCollisionTest(vec2(oldPos.x, this.pos.y), this.size, this);
                    const isBlockedX = tileCollisionTest(vec2(this.pos.x, oldPos.y), this.size, this);
                    if (isBlockedY || !isBlockedX)
                    {
                        // bounce velocity
                        this.velocity.y *= -this.elasticity;

                        if (wasMovingDown)
                        {
                            // adjust position to slightly above nearest tile boundary
                            // this prevents gap between object and ground
                            const epsilon = .0001;
                            this.pos.y = (oldPos.y-this.size.y/2|0)+this.size.y/2+epsilon;

                            // set ground object to self for tile collision
                            // TODO: rework system so tile collision is its own object
                            this.groundObject = this;
                        }
                        else
                        {
                            // move to previous position
                            this.pos.y = oldPos.y;
                            this.groundObject = undefined; 
                        }
                    }
                    if (isBlockedX)
                    {
                        // move to previous position and bounce
                        this.pos.x = oldPos.x;
                        this.velocity.x *= -this.elasticity;
                    }
                    debugOverlay && debugPhysics && debugRect(this.pos, this.size, '#f00');
                }
            }
        }
    }
       
    /** Render the object, draws a tile by default, automatically called each frame, sorted by renderOrder */
    render()
    {
        // default object render
        drawTile(this.pos, this.drawSize || this.size, this.tileInfo, this.color, this.angle, this.mirror, this.additiveColor);
    }
    
    /** Destroy this object, destroy it's children, detach it's parent, and mark it for removal */
    destroy()
    { 
        if (this.destroyed)
            return;
        
        // disconnect from parent and destroy children
        this.destroyed = 1;
        this.parent && this.parent.removeChild(this);
        for (const child of this.children)
            child.destroy(child.parent = 0);
    }

    /** Convert from local space to world space
     *  @param {Vector2} pos - local space point */
    localToWorld(pos) { return this.pos.add(pos.rotate(this.angle)); }

    /** Convert from world space to local space
     *  @param {Vector2} pos - world space point */
    worldToLocal(pos) { return pos.subtract(this.pos).rotate(-this.angle); }

    /** Convert from local space to world space for a vector (rotation only)
     *  @param {Vector2} vec - local space vector */
    localToWorldVector(vec) { return vec.rotate(this.angle); }

    /** Convert from world space to local space for a vector (rotation only)
     *  @param {Vector2} vec - world space vector */
    worldToLocalVector(vec) { return vec.rotate(-this.angle); }
    
    /** Called to check if a tile collision should be resolved
     *  @param {number}  tileData - the value of the tile at the position
     *  @param {Vector2} pos      - tile where the collision occurred
     *  @return {boolean}         - true if the collision should be resolved */
    collideWithTile(tileData, pos)    { return tileData > 0; }

    /** Called to check if a object collision should be resolved
     *  @param {EngineObject} object - the object to test against
     *  @return {boolean}            - true if the collision should be resolved
     */
    collideWithObject(object)         { return true; }

    /** How long since the object was created
     *  @return {number} */
    getAliveTime()                    { return time - this.spawnTime; }

    /** Apply acceleration to this object (adjust velocity, not affected by mass)
     *  @param {Vector2} acceleration */
    applyAcceleration(acceleration)   { if (this.mass) this.velocity = this.velocity.add(acceleration); }

    /** Apply force to this object (adjust velocity, affected by mass)
     *  @param {Vector2} force */
    applyForce(force)	              { this.applyAcceleration(force.scale(1/this.mass)); }
    
    /** Get the direction of the mirror
     *  @return {number} -1 if this.mirror is true, or 1 if not mirrored */
    getMirrorSign() { return this.mirror ? -1 : 1; }

    /** Attaches a child to this with a given local transform
     *  @param {EngineObject} child
     *  @param {Vector2}      [localPos=(0,0)]
     *  @param {number}       [localAngle] */
    addChild(child, localPos=vec2(), localAngle=0)
    {
        ASSERT(!child.parent && !this.children.includes(child));
        this.children.push(child);
        child.parent = this;
        child.localPos = localPos.copy();
        child.localAngle = localAngle;
    }

    /** Removes a child from this one
     *  @param {EngineObject} child */
    removeChild(child)
    {
        ASSERT(child.parent == this && this.children.includes(child));
        this.children.splice(this.children.indexOf(child), 1);
        child.parent = 0;
    }

    /** Set how this object collides
     *  @param {boolean} [collideSolidObjects] - Does it collide with solid objects?
     *  @param {boolean} [isSolid]             - Does it collide with and block other objects? (expensive in large numbers)
     *  @param {boolean} [collideTiles]        - Does it collide with the tile collision?
     *  @param {boolean} [collideRaycast]      - Does it collide with raycasts? */
    setCollision(collideSolidObjects=true, isSolid=true, collideTiles=true, collideRaycast=true)
    {
        ASSERT(collideSolidObjects || !isSolid, 'solid objects must be set to collide');

        this.collideSolidObjects = collideSolidObjects;
        this.isSolid = isSolid;
        this.collideTiles = collideTiles;
        this.collideRaycast = collideRaycast;
    }

    /** Returns string containing info about this object for debugging
     *  @return {string} */
    toString()
    {
        if (debug)
        {
            let text = 'type = ' + this.constructor.name;
            if (this.pos.x || this.pos.y)
                text += '\npos = ' + this.pos;
            if (this.velocity.x || this.velocity.y)
                text += '\nvelocity = ' + this.velocity;
            if (this.size.x || this.size.y)
                text += '\nsize = ' + this.size;
            if (this.angle)
                text += '\nangle = ' + this.angle.toFixed(3);
            if (this.color)
                text += '\ncolor = ' + this.color;
            return text;
        }
    }

    /** Render debug info for this object  */
    renderDebugInfo()
    {
        if (debug)
        {
            // show object info for debugging
            const size = vec2(max(this.size.x, .2), max(this.size.y, .2));
            const color1 = rgb(this.collideTiles?1:0, this.collideSolidObjects?1:0, this.isSolid?1:0, this.parent?.2:.5);
            const color2 = this.parent ? rgb(1,1,1,.5) : rgb(0,0,0,.8);
            drawRect(this.pos, size, color1, this.angle, false);
            drawRect(this.pos, size.scale(.8), color2, this.angle, false);
            this.parent && drawLine(this.pos, this.parent.pos, .1, rgb(0,0,1,.5), false);
        }
    }
}
/** 
 * LittleJS Drawing System
 * - Hybrid system with both Canvas2D and WebGL available
 * - Super fast tile sheet rendering with WebGL
 * - Can apply rotation, mirror, color and additive color
 * - Font rendering system with built in engine font
 * - Many useful utility functions
 * 
 * LittleJS uses a hybrid rendering solution with the best of both Canvas2D and WebGL.
 * There are 3 canvas/contexts available to draw to...
 * mainCanvas - 2D background canvas, non WebGL stuff like tile layers are drawn here.
 * glCanvas - Used by the accelerated WebGL batch rendering system.
 * overlayCanvas - Another 2D canvas that appears on top of the other 2 canvases.
 * 
 * The WebGL rendering system is very fast with some caveats...
 * - Switching blend modes (additive) or textures causes another draw call which is expensive in excess
 * - Group additive rendering together using renderOrder to mitigate this issue
 * 
 * The LittleJS rendering solution is intentionally simple, feel free to adjust it for your needs!
 * @namespace Draw
 */



/** The primary 2D canvas visible to the user
 *  @type {HTMLCanvasElement}
 *  @memberof Draw */
let mainCanvas;

/** 2d context for mainCanvas
 *  @type {CanvasRenderingContext2D}
 *  @memberof Draw */
let mainContext;

/** A canvas that appears on top of everything the same size as mainCanvas
 *  @type {HTMLCanvasElement}
 *  @memberof Draw */
let overlayCanvas;

/** 2d context for overlayCanvas
 *  @type {CanvasRenderingContext2D}
 *  @memberof Draw */
let overlayContext;

/** The size of the main canvas (and other secondary canvases) 
 *  @type {Vector2}
 *  @memberof Draw */
let mainCanvasSize = vec2();

/** Array containing texture info for batch rendering system
 *  @type {Array<TextureInfo>}
 *  @memberof Draw */
let textureInfos = [];

// Keep track of how many draw calls there were each frame for debugging
let drawCount;

/** Texture Info - Stores info about each texture */
class TextureInfo
{
    /**
     * Create a TextureInfo, called automatically by the engine
     * @param {HTMLImageElement} image
     */
    constructor(image)
    {
        /** @property {HTMLImageElement} - image source */
        this.image = image;
        /** @property {Vector2} - size of the image */
        this.size = vec2(image.width, image.height);
        /** @property {WebGLTexture} - webgl texture */
        this.glTexture = glEnable && glCreateTexture(image);
    }
}

///////////////////////////////////////////////////////////////////////////////

/** Convert from screen to world space coordinates
 *  @param {Vector2} screenPos
 *  @return {Vector2}
 *  @memberof Draw */
function screenToWorld(screenPos)
{
    return new Vector2
    (
        (screenPos.x - mainCanvasSize.x/2 + .5) /  cameraScale + cameraPos.x,
        (screenPos.y - mainCanvasSize.y/2 + .5) / -cameraScale + cameraPos.y
    );
}

/** Convert from world to screen space coordinates
 *  @param {Vector2} worldPos
 *  @return {Vector2}
 *  @memberof Draw */
function worldToScreen(worldPos)
{
    return new Vector2
    (
        (worldPos.x - cameraPos.x) *  cameraScale + mainCanvasSize.x/2 - .5,
        (worldPos.y - cameraPos.y) * -cameraScale + mainCanvasSize.y/2 - .5
    );
}

/** Get the camera's visible area in world space
 *  @return {Vector2}
 *  @memberof Draw */
function getCameraSize() { return mainCanvasSize.scale(1/cameraScale); }

/** Draw text on main canvas in world space
 *  Automatically splits new lines into rows
 *  @param {string}  text
 *  @param {Vector2} pos
 *  @param {number}  [size]
 *  @param {Color}   [color=(1,1,1,1)]
 *  @param {number}  [lineWidth]
 *  @param {Color}   [lineColor=(0,0,0,1)]
 *  @param {CanvasTextAlign}  [textAlign='center']
 *  @param {string}  [font=fontDefault]
 *  @param {number}  [maxWidth]
 *  @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} [context=mainContext]
 *  @memberof Draw */
function drawText(text, pos, size=1, color, lineWidth=0, lineColor, textAlign, font, maxWidth, context=mainContext)
{
    drawTextScreen(text, worldToScreen(pos), size*cameraScale, color, lineWidth*cameraScale, lineColor, textAlign, font, maxWidth, context);
}

/** Draw text on overlay canvas in world space
 *  Automatically splits new lines into rows
 *  @param {string}  text
 *  @param {Vector2} pos
 *  @param {number}  [size]
 *  @param {Color}   [color=(1,1,1,1)]
 *  @param {number}  [lineWidth]
 *  @param {Color}   [lineColor=(0,0,0,1)]
 *  @param {CanvasTextAlign}  [textAlign='center']
 *  @param {string}  [font=fontDefault]
 *  @param {number}  [maxWidth]
 *  @memberof Draw */
function drawTextOverlay(text, pos, size=1, color, lineWidth=0, lineColor, textAlign, font, maxWidth)
{
    drawText(text, pos, size, color, lineWidth, lineColor, textAlign, font, maxWidth, overlayContext);
}

/** Draw text on overlay canvas in screen space
 *  Automatically splits new lines into rows
 *  @param {string}  text
 *  @param {Vector2} pos
 *  @param {number}  [size]
 *  @param {Color}   [color=(1,1,1,1)]
 *  @param {number}  [lineWidth]
 *  @param {Color}   [lineColor=(0,0,0,1)]
 *  @param {CanvasTextAlign}  [textAlign]
 *  @param {string}  [font=fontDefault]
 *  @param {number}  [maxWidth]
 *  @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} [context=overlayContext]
 *  @memberof Draw */
function drawTextScreen(text, pos, size=1, color=new Color, lineWidth=0, lineColor=new Color(0,0,0), textAlign='center', font=fontDefault, maxWidth=undefined, context=overlayContext)
{
    context.fillStyle = color.toString();
    context.lineWidth = lineWidth;
    context.strokeStyle = lineColor.toString();
    context.textAlign = textAlign;
    context.font = size + 'px '+ font;
    context.textBaseline = 'middle';
    context.lineJoin = 'round';

    pos = pos.copy();

    const lines = (text+'').split('\n');
    pos.y -= (lines.length-1) * size/2; // center text vertically
    lines.forEach(line=>
    {
        lineWidth && context.strokeText(line, pos.x, pos.y, maxWidth);
        context.fillText(line, pos.x, pos.y, maxWidth);
        pos.y += size;
    });
}

/** Enable normal or additive blend mode
 *  @param {boolean} [additive]
 *  @param {boolean} [useWebGL=glEnable]
 *  @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} [context=mainContext]
 *  @memberof Draw */
function setBlendMode(additive, useWebGL=glEnable, context)
{
    ASSERT(!context || !useWebGL, 'context only supported in canvas 2D mode');
    if (useWebGL)
        glAdditive = additive;
    else
    {
        if (!context)
            context = mainContext;
        context.globalCompositeOperation = additive ? 'lighter' : 'source-over';
    }
}

/** Combines all LittleJS canvases onto the main canvas and clears them
 *  This is necessary for things like saving a screenshot
 *  @memberof Draw */
function combineCanvases()
{
    // combine canvases
    glCopyToContext(mainContext, true);
    mainContext.drawImage(overlayCanvas, 0, 0);

    // clear canvases
    glClearCanvas();
    overlayCanvas.width |= 0;
}

///////////////////////////////////////////////////////////////////////////////

let engineFontImage;

/** 
 * Font Image Object - Draw text on a 2D canvas by using characters in an image
 * - 96 characters (from space to tilde) are stored in an image
 * - Uses a default 8x8 font if none is supplied
 * - You can also use fonts from the main tile sheet
 * @example
 * // use built in font
 * const font = new FontImage;
 * 
 * // draw text
 * font.drawTextScreen("LittleJS\nHello World!", vec2(200, 50));
 */
class FontImage
{
    /** Create an image font
     *  @param {HTMLImageElement} [image]    - Image for the font, if undefined default font is used
     *  @param {Vector2} [tileSize=(8,8)]    - Size of the font source tiles
     *  @param {Vector2} [paddingSize=(0,1)] - How much extra space to add between characters
     *  @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} [context=overlayContext] - context to draw to
     */
    constructor(image, tileSize=vec2(8), paddingSize=vec2(0,1), context=overlayContext)
    {
        // load default font image
        if (!engineFontImage)
            (engineFontImage = new Image).src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAYAQAAAAA9+x6JAAAAAnRSTlMAAHaTzTgAAAGiSURBVHjaZZABhxxBEIUf6ECLBdFY+Q0PMNgf0yCgsSAGZcT9sgIPtBWwIA5wgAPEoHUyJeeSlW+gjK+fegWwtROWpVQEyWh2npdpBmTUFVhb29RINgLIukoXr5LIAvYQ5ve+1FqWEMqNKTX3FAJHyQDRZvmKWubAACcv5z5Gtg2oyCWE+Yk/8JZQX1jTTCpKAFGIgza+dJCNBF2UskRlsgwitHbSV0QLgt9sTPtsRlvJjEr8C/FARWA2bJ/TtJ7lko34dNDn6usJUMzuErP89UUBJbWeozrwLLncXczd508deAjLWipLO4Q5XGPcJvPu92cNDaN0P5G1FL0nSOzddZOrJ6rNhbXGmeDvO3TF7DeJWl4bvaYQTNHCTeuqKZmbjHaSOFes+IX/+IhHrnAkXOAsfn24EM68XieIECoccD4KZLk/odiwzeo2rovYdhvb2HYFgyznJyDpYJdYOmfXgVdJTaUi4xA2uWYNYec9BLeqdl9EsoTw582mSFDX2DxVLbNt9U3YYoeatBad1c2Tj8t2akrjaIGJNywKB/7h75/gN3vCMSaadIUTAAAAAElFTkSuQmCC';

        this.image = image || engineFontImage;
        this.tileSize = tileSize;
        this.paddingSize = paddingSize;
        this.context = context;
    }

    /** Draw text in world space using the image font
     *  @param {string}  text
     *  @param {Vector2} pos
     *  @param {number}  [scale=.25]
     *  @param {boolean} [center]
     */
    drawText(text, pos, scale=1, center)
    {
        this.drawTextScreen(text, worldToScreen(pos).floor(), scale*cameraScale|0, center);
    }

    /** Draw text in screen space using the image font
     *  @param {string}  text
     *  @param {Vector2} pos
     *  @param {number}  [scale]
     *  @param {boolean} [center]
     */
    drawTextScreen(text, pos, scale=4, center)
    {
        const context = this.context;
        context.save();

        const size = this.tileSize;
        const drawSize = size.add(this.paddingSize).scale(scale);
        const cols = this.image.width / this.tileSize.x |0;
        (text+'').split('\n').forEach((line, i)=>
        {
            const centerOffset = center ? line.length * size.x * scale / 2 |0 : 0;
            for(let j=line.length; j--;)
            {
                // draw each character
                let charCode = line[j].charCodeAt(0);
                if (charCode < 32 || charCode > 127)
                    charCode = 127; // unknown character

                // get the character source location and draw it
                const tile = charCode - 32;
                const x = tile % cols;
                const y = tile / cols |0;
                const drawPos = pos.add(vec2(j,i).multiply(drawSize));
                context.drawImage(this.image, x * size.x, y * size.y, size.x, size.y, 
                    drawPos.x - centerOffset, drawPos.y, size.x * scale, size.y * scale);
            }
        });

        context.restore();
    }
}

///////////////////////////////////////////////////////////////////////////////
// Display functions

/** Returns true if fullscreen mode is active
 *  @return {boolean}
 *  @memberof Draw */
function isFullscreen() { return !!document.fullscreenElement; }

/** Toggle fullscreen mode
 *  @memberof Draw */
function toggleFullscreen()
{
    const rootElement = mainCanvas.parentElement;
    if (isFullscreen())
    {
        if (document.exitFullscreen)
            document.exitFullscreen();
    }
    else if (rootElement.requestFullscreen)
        rootElement.requestFullscreen();
}

/** Set the cursor style
 *  @param {string}  cursorStyle - CSS cursor style (auto, none, crosshair, etc)
 *  @memberof Draw */
function setCursor(cursorStyle = 'auto')
{
    const rootElement = mainCanvas.parentElement;
    rootElement.style.cursor = cursorStyle;
}
/** 
 * LittleJS Input System
 * - Tracks keyboard down, pressed, and released
 * - Tracks mouse buttons, position, and wheel
 * - Tracks multiple analog gamepads
 * - Touch input is handled as mouse input
 * - Virtual gamepad for touch devices
 * @namespace Input
 */



/** Returns true if device key is down
 *  @param {string|number} key
 *  @param {number} [device]
 *  @return {boolean}
 *  @memberof Input */
function keyIsDown(key, device=0)
{ 
    ASSERT(device > 0 || typeof key !== 'number' || key < 3, 'use code string for keyboard');
    return inputData[device] && !!(inputData[device][key] & 1); 
}

/** Returns true if device key was pressed this frame
 *  @param {string|number} key
 *  @param {number} [device]
 *  @return {boolean}
 *  @memberof Input */
function keyWasPressed(key, device=0)
{ 
    ASSERT(device > 0 || typeof key !== 'number' || key < 3, 'use code string for keyboard');
    return inputData[device] && !!(inputData[device][key] & 2); 
}

/** Returns true if device key was released this frame
 *  @param {string|number} key
 *  @param {number} [device]
 *  @return {boolean}
 *  @memberof Input */
function keyWasReleased(key, device=0)
{ 
    ASSERT(device > 0 || typeof key !== 'number' || key < 3, 'use code string for keyboard');
    return inputData[device] && !!(inputData[device][key] & 4);
}

/** Returns input vector from arrow keys or WASD if enabled
 *  @return {Vector2}
 *  @memberof Input */
function keyDirection(up='ArrowUp', down='ArrowDown', left='ArrowLeft', right='ArrowRight')
{
    const k = (key)=> keyIsDown(key) ? 1 : 0;
    return vec2(k(right) - k(left), k(up) - k(down));
}

/** Clears all input
 *  @memberof Input */
function clearInput() { inputData = [[]]; touchGamepadButtons = []; }

/** Returns true if mouse button is down
 *  @function
 *  @param {number} button
 *  @return {boolean}
 *  @memberof Input */
const mouseIsDown = keyIsDown;

/** Returns true if mouse button was pressed
 *  @function
 *  @param {number} button
 *  @return {boolean}
 *  @memberof Input */
const mouseWasPressed = keyWasPressed;

/** Returns true if mouse button was released
 *  @function
 *  @param {number} button
 *  @return {boolean}
 *  @memberof Input */
const mouseWasReleased = keyWasReleased;

/** Mouse pos in world space
 *  @type {Vector2}
 *  @memberof Input */
let mousePos = vec2();

/** Mouse pos in screen space
 *  @type {Vector2}
 *  @memberof Input */
let mousePosScreen = vec2();

/** Mouse wheel delta this frame
 *  @type {number}
 *  @memberof Input */
let mouseWheel = 0;

/** Returns true if user is using gamepad (has more recently pressed a gamepad button)
 *  @type {boolean}
 *  @memberof Input */
let isUsingGamepad = false;

/** Prevents input continuing to the default browser handling (true by default)
 *  @type {boolean}
 *  @memberof Input */
let inputPreventDefault = true;

/** Prevents input continuing to the default browser handling
 *  This is useful to disable for html menus so the browser can handle input normally
 *  @param {boolean} preventDefault
 *  @memberof Input */
function setInputPreventDefault(preventDefault) { inputPreventDefault = preventDefault; }

/** Returns true if gamepad button is down
 *  @param {number} button
 *  @param {number} [gamepad]
 *  @return {boolean}
 *  @memberof Input */
function gamepadIsDown(button, gamepad=0)
{ return keyIsDown(button, gamepad+1); }

/** Returns true if gamepad button was pressed
 *  @param {number} button
 *  @param {number} [gamepad]
 *  @return {boolean}
 *  @memberof Input */
function gamepadWasPressed(button, gamepad=0)
{ return keyWasPressed(button, gamepad+1); }

/** Returns true if gamepad button was released
 *  @param {number} button
 *  @param {number} [gamepad]
 *  @return {boolean}
 *  @memberof Input */
function gamepadWasReleased(button, gamepad=0)
{ return keyWasReleased(button, gamepad+1); }

/** Returns gamepad stick value
 *  @param {number} stick
 *  @param {number} [gamepad]
 *  @return {Vector2}
 *  @memberof Input */
function gamepadStick(stick,  gamepad=0)
{ return gamepadStickData[gamepad] ? gamepadStickData[gamepad][stick] || vec2() : vec2(); }

///////////////////////////////////////////////////////////////////////////////
// Input system functions called automatically by engine

// input is stored as a bit field for each key: 1 = isDown, 2 = wasPressed, 4 = wasReleased
// mouse and keyboard are stored together in device 0, gamepads are in devices > 0
let inputData = [[]];

function inputUpdate()
{
    if (headlessMode) return;

    // clear input when lost focus (prevent stuck keys)
    if(!(touchInputEnable && isTouchDevice) && !document.hasFocus())
        clearInput();

    // update mouse world space position
    mousePos = screenToWorld(mousePosScreen);
}

function inputUpdatePost()
{
    if (headlessMode) return;

    // clear input to prepare for next frame
    for (const deviceInputData of inputData)
    for (const i in deviceInputData)
        deviceInputData[i] &= 1;
    mouseWheel = 0;
}

function inputInit()
{
    if (headlessMode) return;

    onkeydown = (e)=>
    {
        if (!e.repeat)
        {
            isUsingGamepad = false;
            inputData[0][e.code] = 3;
            if (inputWASDEmulateDirection)
                inputData[0][remapKey(e.code)] = 3;
        }
    }

    onkeyup = (e)=>
    {
        inputData[0][e.code] = 4;
        if (inputWASDEmulateDirection)
            inputData[0][remapKey(e.code)] = 4;
    }

    // handle remapping wasd keys to directions
    function remapKey(c)
    {
        return inputWASDEmulateDirection ? 
            c == 'KeyW' ? 'ArrowUp' : 
            c == 'KeyS' ? 'ArrowDown' : 
            c == 'KeyA' ? 'ArrowLeft' : 
            c == 'KeyD' ? 'ArrowRight' : c : c;
    }
    
    // mouse event handlers
    onmousedown   = (e)=>
    {
        isUsingGamepad = false; 
        inputData[0][e.button] = 3; 
        mousePosScreen = mouseEventToScreen(e); 
        inputPreventDefault && e.button && e.preventDefault();
    }
    onmouseup     = (e)=> inputData[0][e.button] = inputData[0][e.button] & 2 | 4;
    onmousemove   = (e)=> mousePosScreen = mouseEventToScreen(e);
    onwheel       = (e)=> mouseWheel = e.ctrlKey ? 0 : sign(e.deltaY);
    oncontextmenu = (e)=> false; // prevent right click menu
    onblur        = (e) => clearInput(); // reset input when focus is lost

    // init touch input
    if (isTouchDevice && touchInputEnable)
        touchInputInit();
}

// convert a mouse or touch event position to screen space
function mouseEventToScreen(mousePos)
{
    const rect = mainCanvas.getBoundingClientRect();
    const px = percent(mousePos.x, rect.left, rect.right);
    const py = percent(mousePos.y, rect.top, rect.bottom);
    return vec2(px*mainCanvas.width, py*mainCanvas.height);
}

///////////////////////////////////////////////////////////////////////////////
// Touch input & virtual on screen gamepad

/** True if a touch device has been detected
 *  @memberof Input */
const isTouchDevice = !headlessMode && window.ontouchstart !== undefined;

// touch gamepad internal variables
let touchGamepadTimer = new Timer, touchGamepadButtons, touchGamepadStick;

// enable touch input mouse passthrough
function touchInputInit()
{
    // add non passive touch event listeners
    let handleTouch = handleTouchDefault;
    document.addEventListener('touchstart', (e) => handleTouch(e), { passive: false });
    document.addEventListener('touchmove',  (e) => handleTouch(e), { passive: false });
    document.addEventListener('touchend',   (e) => handleTouch(e), { passive: false });

    // override mouse events
    onmousedown = onmouseup = ()=> 0;

    // handle all touch events the same way
    let wasTouching;
    function handleTouchDefault(e)
    {
        // fix stalled audio requiring user interaction
        if (soundEnable && !headlessMode && audioContext && audioContext.state != 'running')
            audioContext.resume();

        // check if touching and pass to mouse events
        const touching = e.touches.length;
        const button = 0; // all touches are left mouse button
        if (touching)
        {
            // set event pos and pass it along
            const p = vec2(e.touches[0].clientX, e.touches[0].clientY);
            mousePosScreen = mouseEventToScreen(p);
            wasTouching ? isUsingGamepad = touchGamepadEnable : inputData[0][button] = 3;
        }
        else if (wasTouching)
            inputData[0][button] = inputData[0][button] & 2 | 4;

        // set was touching
        wasTouching = touching;

        // prevent default handling like copy and magnifier lens
        if (inputPreventDefault && document.hasFocus()) // allow document to get focus
            e.preventDefault();
        
        // must return true so the document will get focus
        return true;
    }
}

/** 
 * LittleJS Medal System
 * - Tracks and displays medals
 * - Saves medals to local storage
 * - Newgrounds integration
 * @namespace Medals
 */



// Engine internal variables not exposed to documentation
let medalsDisplayQueue = [], medalsSaveName, medalsDisplayTimeLast;

/**
 * LittleJS WebGL Interface
 * - All webgl used by the engine is wrapped up here
 * - For normal stuff you won't need to see or call anything in this file
 * - For advanced stuff there are helper functions to create shaders, textures, etc
 * - Can be disabled with glEnable to revert to 2D canvas rendering
 * - Batches sprite rendering on GPU for incredibly fast performance
 * - Sprite transform math is done in the shader where possible
 * - Supports shadertoy style post processing shaders
 * @namespace WebGL
 */



/** The WebGL canvas which appears above the main canvas and below the overlay canvas
 *  @type {HTMLCanvasElement}
 *  @memberof WebGL */
let glCanvas;

/** 2d context for glCanvas
 *  @type {WebGL2RenderingContext}
 *  @memberof WebGL */
let glContext;

/** Should webgl be setup with anti-aliasing? must be set before calling engineInit
 *  @type {boolean}
 *  @memberof WebGL */
let glAntialias = true;

// WebGL internal variables not exposed to documentation
let glShader, glActiveTexture, glArrayBuffer, glGeometryBuffer, glPositionData, glColorData, glInstanceCount, glAdditive, glBatchAdditive;

// WebGL internal constants 
const gl_MAX_INSTANCES = 1e4;
const gl_INDICES_PER_INSTANCE = 11;
const gl_INSTANCE_BYTE_STRIDE = gl_INDICES_PER_INSTANCE * 4;
const gl_INSTANCE_BUFFER_SIZE = gl_MAX_INSTANCES * gl_INSTANCE_BYTE_STRIDE;

/** 
 * LittleJS - The Tiny Fast JavaScript Game Engine
 * MIT License - Copyright 2021 Frank Force
 * 
 * Engine Features
 * - Object oriented system with base class engine object
 * - Base class object handles update, physics, collision, rendering, etc
 * - Engine helper classes and functions like Vector2, Color, and Timer
 * - Super fast rendering system for tile sheets
 * - Sound effects audio with zzfx and music with zzfxm
 * - Input processing system with gamepad and touchscreen support
 * - Tile layer rendering and collision system
 * - Particle effect system
 * - Medal system tracks and displays achievements
 * - Debug tools and debug rendering system
 * - Post processing effects
 * - Call engineInit() to start it up!
 * @namespace Engine
 */



/** Name of engine
 *  @type {string}
 *  @default
 *  @memberof Engine */
const engineName = 'LittleJS';

/** Version of engine
 *  @type {string}
 *  @default
 *  @memberof Engine */
const engineVersion = '1.11.13';

/** Frames per second to update
 *  @type {number}
 *  @default
 *  @memberof Engine */
const frameRate = 60;

/** How many seconds each frame lasts, engine uses a fixed time step
 *  @type {number}
 *  @default 1/60
 *  @memberof Engine */
const timeDelta = 1/frameRate;

/** Array containing all engine objects
 *  @type {Array<EngineObject>}
 *  @memberof Engine */
let engineObjects = [];

/** Array with only objects set to collide with other objects this frame (for optimization)
 *  @type {Array<EngineObject>}
 *  @memberof Engine */
let engineObjectsCollide = [];

/** Current update frame, used to calculate time
 *  @type {number}
 *  @memberof Engine */
let frame = 0;

/** Current engine time since start in seconds
 *  @type {number}
 *  @memberof Engine */
let time = 0;

/** Actual clock time since start in seconds (not affected by pause or frame rate clamping)
 *  @type {number}
 *  @memberof Engine */
let timeReal = 0;

/** Is the game paused? Causes time and objects to not be updated
 *  @type {boolean}
 *  @default false
 *  @memberof Engine */
let paused = false;

/** Set if game is paused
 *  @param {boolean} isPaused
 *  @memberof Engine */
function setPaused(isPaused) { paused = isPaused; }

// Frame time tracking
let frameTimeLastMS = 0, frameTimeBufferMS = 0, averageFPS = 0;

///////////////////////////////////////////////////////////////////////////////
// plugin hooks

const pluginUpdateList = [], pluginRenderList = [];

/** Add a new update function for a plugin
 *  @param {Function} [updateFunction]
 *  @param {Function} [renderFunction]
 *  @memberof Engine */
function engineAddPlugin(updateFunction, renderFunction)
{
    ASSERT(!pluginUpdateList.includes(updateFunction));
    ASSERT(!pluginRenderList.includes(renderFunction));
    updateFunction && pluginUpdateList.push(updateFunction);
    renderFunction && pluginRenderList.push(renderFunction);
}

///////////////////////////////////////////////////////////////////////////////
// Main engine functions

/** Startup LittleJS engine with your callback functions
 *  @param {Function|function():Promise} gameInit - Called once after the engine starts up
 *  @param {Function} gameUpdate - Called every frame before objects are updated
 *  @param {Function} gameUpdatePost - Called after physics and objects are updated, even when paused
 *  @param {Function} gameRender - Called before objects are rendered, for drawing the background
 *  @param {Function} gameRenderPost - Called after objects are rendered, useful for drawing UI
 *  @param {Array<string>} [imageSources=[]] - List of images to load
 *  @param {HTMLElement} [rootElement] - Root element to attach to, the document body by default
 *  @memberof Engine */
function engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, imageSources=[], rootElement=document.body)
{
    ASSERT(!mainContext, 'engine already initialized');
    ASSERT(Array.isArray(imageSources), 'pass in images as array');

    // allow passing in empty functions
    if (!gameInit)
        gameInit = ()=>{};
    if (!gameUpdate)
        gameUpdate = ()=>{};
    if (!gameUpdatePost)
        gameUpdatePost = ()=>{};
    if (!gameRender)
        gameRender = ()=>{};
    if (!gameRenderPost)
        gameRenderPost = ()=>{};

    // Called automatically by engine to setup render system
    function enginePreRender()
    {
        // save canvas size
        mainCanvasSize = vec2(mainCanvas.width, mainCanvas.height);

        // disable smoothing for pixel art
        overlayContext.imageSmoothingEnabled = 
            mainContext.imageSmoothingEnabled = !tilesPixelated;

        // setup gl rendering if enabled
        // glPreRender();
    }

    // internal update loop for engine
    function engineUpdate(frameTimeMS=0)
    {
        // update time keeping
        let frameTimeDeltaMS = frameTimeMS - frameTimeLastMS;
        frameTimeLastMS = frameTimeMS;
        if (debug || showWatermark)
            averageFPS = lerp(.05, averageFPS, 1e3/(frameTimeDeltaMS||1));
        const debugSpeedUp   = debug && keyIsDown('Equal'); // +
        const debugSpeedDown = debug && keyIsDown('Minus'); // -
        if (debug) // +/- to speed/slow time
            frameTimeDeltaMS *= debugSpeedUp ? 5 : debugSpeedDown ? .2 : 1;
        timeReal += frameTimeDeltaMS / 1e3;
        frameTimeBufferMS += paused ? 0 : frameTimeDeltaMS;
        if (!debugSpeedUp)
            frameTimeBufferMS = min(frameTimeBufferMS, 50); // clamp in case of slow framerate

        updateCanvas();

        if (paused)
        {
            // update object transforms even when paused
            for (const o of engineObjects)
                o.parent || o.updateTransforms();
            inputUpdate();
            pluginUpdateList.forEach(f=>f());
            debugUpdate();
            gameUpdatePost();
            inputUpdatePost();
        }
        else
        {
            // apply time delta smoothing, improves smoothness of framerate in some browsers
            let deltaSmooth = 0;
            if (frameTimeBufferMS < 0 && frameTimeBufferMS > -9)
            {
                // force at least one update each frame since it is waiting for refresh
                deltaSmooth = frameTimeBufferMS;
                frameTimeBufferMS = 0;
            }
            
            // update multiple frames if necessary in case of slow framerate
            for (;frameTimeBufferMS >= 0; frameTimeBufferMS -= 1e3 / frameRate)
            {
                // increment frame and update time
                time = frame++ / frameRate;

                // update game and objects
                inputUpdate();
                gameUpdate();
                pluginUpdateList.forEach(f=>f());
                engineObjectsUpdate();

                // do post update
                debugUpdate();
                gameUpdatePost();
                inputUpdatePost();
            }

            // add the time smoothing back in
            frameTimeBufferMS += deltaSmooth;
        }

        if (!headlessMode)
        {
            // render sort then render while removing destroyed objects
            enginePreRender();
            gameRender();
            engineObjects.sort((a,b)=> a.renderOrder - b.renderOrder);
            for (const o of engineObjects)
                o.destroyed || o.render();
            gameRenderPost();
            pluginRenderList.forEach(f=>f());
            debugRender();

            if (showWatermark)
            {
                // update fps
                overlayContext.textAlign = 'right';
                overlayContext.textBaseline = 'top';
                overlayContext.font = '1em monospace';
                overlayContext.fillStyle = '#000';
                const text = engineName + ' ' + 'v' + engineVersion + ' / ' 
                    + drawCount + ' / ' + engineObjects.length + ' / ' + averageFPS.toFixed(1)
                    + (glEnable ? ' GL' : ' 2D') ;
                overlayContext.fillText(text, mainCanvas.width-3, 3);
                overlayContext.fillStyle = '#fff';
                overlayContext.fillText(text, mainCanvas.width-2, 2);
                drawCount = 0;
            }
        }

        requestAnimationFrame(engineUpdate);
    }

    function updateCanvas()
    {
        if (headlessMode) return;
        
        if (canvasFixedSize.x)
        {
            // clear canvas and set fixed size
            mainCanvas.width  = canvasFixedSize.x;
            mainCanvas.height = canvasFixedSize.y;
            
            // fit to window by adding space on top or bottom if necessary
            const aspect = innerWidth / innerHeight;
            const fixedAspect = mainCanvas.width / mainCanvas.height;
            (glCanvas||mainCanvas).style.width = mainCanvas.style.width = overlayCanvas.style.width  = aspect < fixedAspect ? '100%' : '';
            (glCanvas||mainCanvas).style.height = mainCanvas.style.height = overlayCanvas.style.height = aspect < fixedAspect ? '' : '100%';
        }
        else
        {
            // clear canvas and set size to same as window
            mainCanvas.width  = min(innerWidth,  canvasMaxSize.x);
            mainCanvas.height = min(innerHeight, canvasMaxSize.y);
        }
        
        // clear overlay canvas and set size
        overlayCanvas.width  = mainCanvas.width;
        overlayCanvas.height = mainCanvas.height;

        // save canvas size
        mainCanvasSize = vec2(mainCanvas.width, mainCanvas.height);
    }

    function startEngine()
    {
        new Promise((resolve) => resolve(gameInit())).then(engineUpdate);
    }

    if (headlessMode)
    {
        startEngine();
        return;
    }

    // setup html
    const styleRoot = 
        'margin:0;overflow:hidden;' + // fill the window
        'width:100vw;height:100vh;' + // fill the window
        'display:flex;' +             // use flexbox
        'align-items:center;' +       // horizontal center
        'justify-content:center;' +   // vertical center
        'background:#000;' +          // set background color
        (canvasPixelated ? 'image-rendering:pixelated;' : '') + // pixel art
        'user-select:none;' +         // prevent hold to select
        '-webkit-user-select:none;' + // compatibility for ios
        (!touchInputEnable ? '' :     // no touch css settings
        'touch-action:none;' +        // prevent mobile pinch to resize
        '-webkit-touch-callout:none');// compatibility for ios
    rootElement.style.cssText = styleRoot;
    rootElement.appendChild(mainCanvas = document.createElement('canvas'));
    mainContext = mainCanvas.getContext('2d');

    // init stuff and start engine
    inputInit();
    debugInit();

    // create overlay canvas for hud to appear above gl canvas
    rootElement.appendChild(overlayCanvas = document.createElement('canvas'));
    overlayContext = overlayCanvas.getContext('2d');

    // set canvas style
    const styleCanvas = 'position:absolute'; // allow canvases to overlap
    mainCanvas.style.cssText = overlayCanvas.style.cssText = styleCanvas;
    if (glCanvas)
        glCanvas.style.cssText = styleCanvas;
    updateCanvas();
    
    // create promises for loading images
    const promises = imageSources.map((src, textureIndex)=>
        new Promise(resolve => 
        {
            const image = new Image;
            image.crossOrigin = 'anonymous';
            image.onerror = image.onload = ()=> 
            {
                textureInfos[textureIndex] = new TextureInfo(image);
                resolve();
            }
            image.src = src;
        })
    );

    if (!imageSources.length)
    {
        // no images to load
        promises.push(new Promise(resolve => 
        {
            textureInfos[0] = new TextureInfo(new Image);
            resolve();
        }));
    }

    // load all of the images
    Promise.all(promises).then(startEngine);
}

/** Update each engine object, remove destroyed objects, and update time
 *  @memberof Engine */
function engineObjectsUpdate()
{
    // get list of solid objects for physics optimization
    engineObjectsCollide = engineObjects.filter(o=>o.collideSolidObjects);

    // recursive object update
    function updateObject(o)
    {
        if (!o.destroyed)
        {
            o.update();
            for (const child of o.children)
                updateObject(child);
        }
    }
    for (const o of engineObjects)
    {
        // update top level objects
        if (!o.parent)
        {
            updateObject(o);
            o.updateTransforms();
        }
    }

    // remove destroyed objects
    engineObjects = engineObjects.filter(o=>!o.destroyed);
}

/** Destroy and remove all objects
 *  @memberof Engine */
function engineObjectsDestroy()
{
    for (const o of engineObjects)
        o.parent || o.destroy();
    engineObjects = engineObjects.filter(o=>!o.destroyed);
}

/** Collects all object within a given area
 *  @param {Vector2} [pos]                 - Center of test area, or undefined for all objects
 *  @param {Vector2|number} [size]         - Radius of circle if float, rectangle size if Vector2
 *  @param {Array<EngineObject>} [objects=engineObjects] - List of objects to check
 *  @return {Array<EngineObject>}                        - List of collected objects
 *  @memberof Engine */
function engineObjectsCollect(pos, size, objects=engineObjects)
{
    const collectedObjects = [];
    if (!pos) // all objects
    {
        for (const o of objects)
            collectedObjects.push(o);
    }
    else if (size instanceof Vector2)  // bounding box test
    {
        for (const o of objects)
            isOverlapping(pos, size, o.pos, o.size) && collectedObjects.push(o);
    }
    else  // circle test
    {
        const sizeSquared = size*size;
        for (const o of objects)
            pos.distanceSquared(o.pos) < sizeSquared && collectedObjects.push(o);
    }
    return collectedObjects;
}

/** Triggers a callback for each object within a given area
 *  @param {Vector2} [pos]                 - Center of test area, or undefined for all objects
 *  @param {Vector2|number} [size]         - Radius of circle if float, rectangle size if Vector2
 *  @param {Function} [callbackFunction]   - Calls this function on every object that passes the test
 *  @param {Array<EngineObject>} [objects=engineObjects] - List of objects to check
 *  @memberof Engine */
function engineObjectsCallback(pos, size, callbackFunction, objects=engineObjects)
{ engineObjectsCollect(pos, size, objects).forEach(o => callbackFunction(o)); }

/** Return a list of objects intersecting a ray
 *  @param {Vector2} start
 *  @param {Vector2} end
 *  @param {Array<EngineObject>} [objects=engineObjects] - List of objects to check
 *  @return {Array<EngineObject>} - List of objects hit
 *  @memberof Engine */
function engineObjectsRaycast(start, end, objects=engineObjects)
{
    const hitObjects = [];
    for (const o of objects)
    {
        if (o.collideRaycast && isIntersecting(start, end, o.pos, o.size))
        {
            debugRaycast && debugRect(o.pos, o.size, '#f00');
            hitObjects.push(o);
        }
    }

    debugRaycast && debugLine(start, end, hitObjects.length ? '#f00' : '#00f', .02);
    return hitObjects;
}
