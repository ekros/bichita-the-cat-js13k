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
        quantity: 300,
    },
    extreme: {
        quantity: 400,
    }
}
const INITIAL_SETUP = CAT_DENSITY_SETUPS.extreme;
const GAME_STATE = {
    RUNNING: 0,
    WIN: 1
};

// sprites
const sprites = {
    bichitaWalk: null,
    bichitaPosing: null,
    whiteCat: null,
    silverTabbyCat: null,
    grass: null
}

// sound effects
const sound_click = new Sound([1,.5]);

const catTypes = ["white", "silver-tabby"];

// Entities
class Cat {
    constructor(yPos, xPos, speed, type) {
        this.y = Math.floor(Math.random() * mainCanvasSize.y);
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
    }
}

// Data & state
let cats = [];
let gameState = GAME_STATE.RUNNING;

// pre-generated random numbers to boost performance
// TODO: remove to reduce size
const randomNumbers = [ 0.8377587611281054, 0.895644825815689, 0.7282852573832748, 0.12764483670871773, 0.3183297867143515, 0.040463505095796215, 0.07891408311528214, 0.36521139884661014, 0.09680334549550218, 0.49632420890222684, 0.3205900442935903, 0.09347560766622776, 0.12393311889538206, 0.9550948128253585, 0.9680699244638107, 0.735994070405263, 0.856529541773551, 0.2665684386492566, 0.9511296060029797, 0.10848327564095217, 0.6501136193202885, 0.0071658773769502915, 0.9163154722986251, 0.6717683378361625, 0.5824657475877555, 0.7363933931940456, 0.7120160608874744, 0.7070276430989539, 0.34467236442491966, 0.05117939498780166, 0.9857441976199985, 0.81719996056893, 0.8034044358760206, 0.8059531239797646, 0.6613463958290635, 0.7971746525956718, 0.5364459660102856, 0.2750684037708171, 0.4796718014218102, 0.06756462804846897, 0.09964447562076417, 0.6882339385224132, 0.31162213089640045, 0.08539246496063768, 0.6301947810251027, 0.4147078835561042, 0.7614997669879384, 0.31379603993143235, 0.32366725825496534, 0.8796203004349001, 0.5311901811680706, 0.1752693997925152, 0.35505914025829455, 0.8680129833763968, 0.029108466407449685, 0.2419043652055508, 0.29365914394285686, 0.5167095598433755, 0.6091479457014957, 0.33682242481151636, 0.19279312927828007, 0.2670458719334232, 0.3890758858137602, 0.5267420565358436, 0.3508797907454422, 0.5208905146562512, 0.6570981092475858, 0.2727830897702719, 0.3634880413000283, 0.5285591630222011, 0.37504848570354565, 0.12491905349867238, 0.06533866341427785, 0.39979546195582105, 0.36717798333425256, 0.2412387162445475, 0.008889601784322076, 0.34171383501568076, 0.5182879947000687, 0.6173438196389904, 0.9471479546573363, 0.49430800367685923, 0.9316984873462197, 0.5490446223544359, 0.3139693971853015, 0.44012220775365574, 0.8041021735737572, 0.3795585466297928, 0.6813449871841186, 0.6704798214539733, 0.20413031500686696, 0.9632404341606495, 0.9514166346187203, 0.35290257600938935, 0.13818640012984829, 0.7813853850804999, 0.4708995315674742, 0.24650580418410328, 0.8509999058676154, 0.07645701864928323 ];

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
}

const initSprites = () => {
    sprites.bichitaWalk = textureInfos[0].image;
    sprites.whiteCat = textureInfos[1].image;
    sprites.silverTabbyCat = textureInfos[2].image;
    sprites.bichitaPosing = textureInfos[3].image;
    sprites.bichitaDragging = textureInfos[4].image;
    sprites.grass = textureInfos[5].image;
}

const checkMouseCollisionWithBichita = pos => {
    const coords = worldToScreen(pos);
    let collided = false;
    const reversedCats = cats.reverse(); // the ones in the front go first
    reversedCats.forEach(rc => {
        if (rc.constructor.name === "Bichita" && Math.abs(rc.x - coords.x) < 20 && Math.abs(rc.y - coords.y) < 20) {
            console.log("match!")
            collided = true;
        }
    });
    return collided;
}

const checkMouseCollisionWithMother = pos => {
    let collided = false;
    if (cats.find(cat => cat.constructor.name === "Bichita" && cat.isDragging)) {
        const coords = worldToScreen(pos);
        const reversedCats = cats.reverse(); // the ones in the front go first
        reversedCats.forEach(rc => {
            if (rc.constructor.name === "Mother" && Math.abs(rc.x - coords.x) < 24 && Math.abs(rc.y - coords.y) < 24) {
                console.log("mother!")
                collided = true;
            }
        });
    }
    return collided;
}

const getCatImage = type => {
    const spriteMap = {
        "white": sprites.whiteCat,
        "silver-tabby": sprites.silverTabbyCat
    }
    return spriteMap[type];
}

const getBichitaInstance = () => {
    return cats.find(cat => cat.constructor.name === "Bichita");
}

const endScene = (finalPos) => {
    // remove all cats from scene except Bichita and her mother
    cats = cats.filter(cat => cat.constructor.name === "Bichita" || cat.constructor.name === "Mother");
    const coords = worldToScreen(finalPos);
    getBichitaInstance().x = coords.x;
    getBichitaInstance().y = coords.y;
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
             if (mouseWasPressed(0))
        {
            // play sound when mouse is pressed
            sound_click.play(mousePos);
    
            // detect click with Bichita
            console.log(mousePos)
            if (checkMouseCollisionWithBichita(mousePos)) {
                console.log("got bichita!")
                getBichitaInstance().startDragging();
            }
        }
        if (mouseWasReleased(0)) {
            // check if we are dropping near mother
            if (checkMouseCollisionWithMother(mousePos)) {
                console.log("WIN")
                gameState = GAME_STATE.WIN;
                endScene(mousePos);
            }
            getBichitaInstance().endDragging();
        }
        // update cat positions
        let randIndex = Math.floor(Math.random() * randomNumbers.length);
        cats.forEach(cat => {
            if (cat.isWalking) {
                cat.x += cat.speed;
                if (cat.x < 0 || cat.x > mainCanvasSize.x) {
                    cat.speed = -cat.speed;
                }
            }
            // small change of state change
            if (randomNumbers[randIndex] > 0.985) {
                cat.isWalking = !cat.isWalking;
            }
            randIndex += 1;
            if (randIndex >= randomNumbers.length) {
                randIndex = 0;
            }
        });
        break;
        case GAME_STATE.WIN:
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
            if (cat.speed < 0) {
                mainContext.scale(-1, 1);
                mainContext.drawImage(img, -cat.x - img.width, cat.y);
            } else {
                mainContext.drawImage(img, cat.x, cat.y);
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
    }
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['images/bichita-walk-1.webp', 'images/white-cat.webp', 'images/silver-tabby-cat.webp', 'images/bichita-posing.webp', 'images/dragging-cat.webp', 'images/grass.webp']);