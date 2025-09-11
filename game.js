/*
    Bichita the Cat
    Created by Eric Ros for the 2025' js13kgames competition
*/

// show the LittleJS splash screen
setShowSplashScreen(false);
// setCanvasPixelated(true); // ? can be this useful? 

// constants
const CAT_DENSITY_SETUPS = {
    lowest: {
        quantity: 50,
    },
    low: {
        quantity: 100,
    },
    medium: {
        quantity: 200,
    },
    high: {
        quantity: 400,
    },
    extreme: {
        quantity: 800,
    }
}
const INITIAL_SETUP = CAT_DENSITY_SETUPS.high;
const GAME_STATE = {
    RUNNING: 0,
    WIN: 1
};

// sprites
const sprites = {};

// sound effects
const sound_click = new Sound([1,.5]);

const catTypes = ["white", "silver-tabby", "orange"];

// Entities
class Cat {
    constructor(yPos, xPos, speed, type) {
        this.y = Math.floor(Math.max(0, Math.random() * mainCanvasSize.y - 40)); // make sure there is no vertical overflow
        this.x = Math.floor(Math.random() * mainCanvasSize.x);
        this.speed = Math.random() < 0.5 ? -(Math.random() / 5) : Math.random() / 5;
        this.type = catTypes[Math.floor(Math.random() * catTypes.length)];
        this.isWalking = true;
    }
}

class Bichita extends Cat {
    constructor() {
        super();
        this.speed = 0.05;
        this.type = null;
        this.isDragging = false;
        this.isBichita = true;
    }
    startDragging() {
        this.isDragging = true;
    }
    endDragging() {
        this.isDragging = false;
    }
}

class Mother extends Cat {
    constructor() {
        super();
        this.type = null;
        this.isMother = true;
    }
}

// Data & state
let cats = [];
let gameState = GAME_STATE.RUNNING;
let catTalking; // { text, x, y }
let motherGaveGreetings = false;

const initCats = numberOfCats => {
    const bichitaIndex = Math.floor(Math.random() * numberOfCats);
    const motherIndex = Math.floor(Math.random() * numberOfCats); // ! TODO: potential index collision
    for (let i = 0; i < numberOfCats; i++) {
        if (i === bichitaIndex) {
            cats.push(new Bichita());
        } else if (i === motherIndex) {
            cats.push(new Mother());
        } else {
            cats.push(new Cat());
        }
    }
    // sort cats from back to front so they are rendered in the correct order
    cats.sort((a, b) => a.y < b.y ? -1 : 1);
    // workaround (bichita has lower height and the ilusion of depth is broken as it appears on front of other cats)
    // let's move it a bit to the bottom
    getBichitaInstance().y += 15;
}

const initSprites = () => {
    sprites.bichitaWalk = textureInfos[0].image;
    sprites.silverTabbyCat = textureInfos[1].image;
    sprites.bichitaPosing = textureInfos[2].image;
    sprites.bichitaDragging = textureInfos[3].image;
    sprites.grass = textureInfos[4].image;
    sprites.orangeCatWalk = textureInfos[5].image;
    sprites.orangeCatPosing = textureInfos[6].image;
    sprites.silverTabbyPosing = textureInfos[7].image;
    sprites.whiteCatWalk = textureInfos[8].image;
    sprites.whiteCatPosing = textureInfos[9].image;
}

const checkMouseCollisionWithBichita = pos => {
    const coords = worldToScreen(pos);
    let collided = false;
    const newCats = structuredClone(cats);
    const reversedCats = newCats.reverse(); // the ones in the front go first
    reversedCats.forEach(rc => {
        if (rc.isBichita && Math.abs(rc.x - coords.x) < 20 && Math.abs(rc.y - coords.y) < 20) {
            collided = true;
        }
    });
    return collided;
}

const checkMouseCollisionWithMother = pos => {
    let collided = false;
        const coords = worldToScreen(pos);
        const newCats = structuredClone(cats);
        const reversedCats = newCats.reverse(); // the ones in the front go first
        reversedCats.forEach(rc => {
            if (rc.isMother && Math.abs(rc.x - coords.x) < 24 && Math.abs(rc.y - coords.y) < 24) {
                collided = true;
            }
        });
    return collided;
}

const getCatImage = type => {
    const spriteMap = {
        "white": {
            walk: sprites.whiteCatWalk,
            posing: sprites.whiteCatPosing
        },
        "silver-tabby": { 
            walk: sprites.silverTabbyCat,
            posing: sprites.silverTabbyPosing,
        },
        "orange": {
            walk: sprites.orangeCatWalk,
            posing: sprites.orangeCatPosing
        }
    }
    return spriteMap[type];
}

const getBichitaInstance = () => {
    return cats.find(cat => cat.constructor.name === "Bichita");
}

const getMotherInstance = () => {
    return cats.find(cat => cat.constructor.name === "Mother");
}

const endScene = (finalPos) => {
    // remove all cats from scene except Bichita and her mother
    cats = cats.filter(cat => cat.constructor.name === "Bichita" || cat.constructor.name === "Mother");
    const coords = worldToScreen(finalPos);
    getBichitaInstance().x = coords.x;
    getBichitaInstance().y = coords.y;
}

const startCatTalking = (text, pos, ttl = 2000) => {
    catTalking = {
        text,
        pos,
        ttl
    };
    setTimeout(() => {
        catTalking = null;
    }, ttl);
}

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    mainCanvas.style.background = "white";
    initCats(INITIAL_SETUP.quantity);
    initSprites();
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    switch (gameState) {
        case GAME_STATE.RUNNING:
            if (!motherGaveGreetings) {
                // const mother = getMotherInstance();
                const pos = screenToWorld(vec2(getMotherInstance().x, getMotherInstance().y - 20));
                startCatTalking("Please, bring my baby back!", pos, 5000);
                motherGaveGreetings = true;
            }
            if (mouseWasPressed(0))
            {
                // play sound when mouse is pressed
                sound_click.play(mousePos);
        
                // detect click with Bichita
                if (checkMouseCollisionWithBichita(mousePos)) {
                    getBichitaInstance().startDragging();
                    startCatTalking("Meow!", mousePos);
                } else if (checkMouseCollisionWithMother(mousePos)) {
                    startCatTalking("Please, find Bichita.", mousePos);
                }
            }
            if (mouseWasReleased(0)) {
                // check if we are dropping near mother
                if (checkMouseCollisionWithMother(mousePos) && cats.find(cat => cat.constructor.name === "Bichita" && cat.isDragging)) {
                    gameState = GAME_STATE.WIN;
                    endScene(mousePos);
                }
                getBichitaInstance().endDragging();
            }
        // update cat positions
        cats.forEach(cat => {
            if (cat.isWalking) {
                cat.x += cat.speed;
                if (cat.x < 0 || cat.x > mainCanvasSize.x) {
                    cat.speed = -cat.speed;
                }
            }
            // small change of state change
            if (Math.random() < 0.001) {
                cat.isWalking = !cat.isWalking;
            }
        });
        break;
        case GAME_STATE.WIN:
            if (mouseWasPressed(0))
            {
                location.reload();                
            }
        break;
    }      
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    // render grass background
    const grass = sprites.grass;
    if (grass) {
        const pattern = mainContext.createPattern(grass, 'repeat');
        mainContext.fillStyle = pattern;
        mainContext.fillRect(0, 0, mainCanvasSize.x, mainCanvasSize.y);
    }

    // render cats
    cats.forEach(cat => {
        if (cat.constructor.name === "Bichita") {
            if (cat.isDragging) {
                const naturalWidth = sprites.bichitaWalk.width;
                const naturalHeight = sprites.bichitaWalk.height;
                const scaledWidth = naturalWidth * 0.7;
                const scaledHeight = naturalHeight * 0.7;
                
                mainContext.save();
                
                const coords = worldToScreen(mousePos);
                mainContext.drawImage(sprites.bichitaDragging, coords.x, coords.y, scaledWidth, scaledHeight);
                mainContext.restore();
            } else {
                const naturalWidth = sprites.bichitaWalk.width;
                const naturalHeight = sprites.bichitaWalk.height;
                const scaledWidth = naturalWidth * 0.7;
                const scaledHeight = naturalHeight * 0.7;
                
                mainContext.save();
                if (!cat.isWalking) {
                    mainContext.drawImage(sprites.bichitaPosing, cat.x, cat.y, scaledWidth, scaledHeight);
                } else if (cat.speed < 0) {
                    mainContext.scale(-1, 1);
                    mainContext.drawImage(sprites.bichitaWalk, -cat.x - scaledWidth, cat.y, scaledWidth, scaledHeight);
                } else {
                    mainContext.drawImage(sprites.bichitaWalk, cat.x, cat.y, scaledWidth, scaledHeight);
                }
                mainContext.restore();
            }
        } else if (cat.constructor.name === "Mother") {
            mainContext.save();
            if (cat.speed < 0) {
                mainContext.scale(-1, 1);
                mainContext.drawImage(sprites.bichitaWalk, -cat.x - sprites.bichitaWalk.width, cat.y);
            } else {
                mainContext.drawImage(sprites.bichitaWalk, cat.x, cat.y);
            }
            mainContext.restore();
        } else {
            const img = getCatImage(cat.type);
            mainContext.save();
            if (!cat.isWalking) {
                if (cat.speed < 0) {
                    mainContext.scale(-1, 1);
                    mainContext.drawImage(img.posing, -cat.x - img.posing.width, cat.y);
                } else {
                    mainContext.drawImage(img.posing, cat.x, cat.y);
                }
            } else if (cat.speed < 0) {
                mainContext.scale(-1, 1);
                mainContext.drawImage(img.walk, -cat.x - img.walk.width, cat.y);
            } else {
                mainContext.drawImage(img.walk, cat.x, cat.y);
            }
            mainContext.restore();
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // draw to overlay canvas for hud rendering
    drawTextScreen('Bichita the Cat', 
        vec2(40, mainCanvasSize.y - 10), 10,   // position, size
        hsl(0,0,1), 6, hsl(0,0,0));         // color, outline size and color
    // draw thank you message
    if (gameState === GAME_STATE.WIN) {
        const {x, y} = getBichitaInstance();
        drawTextScreen('Thank you!', 
        vec2(x, y - 20), 20,
        hsl(0,0,1), 6, hsl(0,0,0));  
        
        drawTextScreen('Click anywhere to play again', 
        vec2(200, 20), 20,
        hsl(0,100,1), 6, hsl(0,0,0));  
       
    }
    // draw cat talking
    if (catTalking) {
        const pos = worldToScreen(catTalking.pos);
        // float effect
        catTalking.pos.y += 0.001;
        drawTextScreen(catTalking.text,
            pos, 20,
            hsl(0,0,1), 6, hsl(0,0,0));
    }
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 
    [
        'images/bichita-walk-1.webp', 
        'images/silver-tabby-cat.webp', 
        'images/bichita-posing.webp', 
        'images/dragging-cat.webp', 
        'images/grass.webp',
        'images/orange-cat-walking.webp',
        'images/orange-cat-posing.webp',
        'images/silver-tabby-posing.webp',
        'images/black-white-walking.webp',
        'images/black-white-posing.webp',
    ]);