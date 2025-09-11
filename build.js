#!/usr/bin/env node

/** 
 * LittleJS Build System
 */

'use strict';

const PROGRAM_TITLE = 'Bichita the cat';
const PROGRAM_NAME = 'game';
const BUILD_FOLDER = 'build';
const USE_ROADROLLER = true; // enable for extra compression
const sourceFiles =
[
    'littlejs.custom.js',
    'game.js',
    // add your game's files here
];
const dataFiles =
[
    'sprites.webp',
    'grass.webp'
];

console.log(`Building ${PROGRAM_NAME}...`);
const startTime = Date.now();
const fs = require('node:fs');
const child_process = require('node:child_process');

// Polyfill structuredClone if running in older node versions
if (typeof structuredClone === 'undefined') {
    global.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}

// rebuild engine
//child_process.execSync(`npm run build`, { stdio: 'inherit' });

// remove old files and setup build folder
fs.rmSync(BUILD_FOLDER, { recursive: true, force: true });
fs.rmSync(`${PROGRAM_NAME}.zip`, { force: true });
fs.mkdirSync(BUILD_FOLDER);

// copy data files
for(const file of dataFiles)
    fs.copyFileSync(`${file}`, `${BUILD_FOLDER}/${file}`);

Build
(
    `${BUILD_FOLDER}/index.js`,
    sourceFiles,
    USE_ROADROLLER ? 
        [terserStep, roadrollerBuildStep, htmlBuildStep, zipBuildStep] :
        [terserStep, htmlBuildStep, zipBuildStep]
);

///////////////////////////////////////////////////////////////////////////////

// A single build with its own source files, build steps, and output file
// - each build step is a callback that accepts a single filename
function Build(outputFile, files=[], buildSteps=[])
{
    // copy files into a buffer
    let buffer = '';
    for (const file of files)
        buffer += fs.readFileSync(file) + '\n';

    // output file
    fs.writeFileSync(outputFile, buffer, {flag: 'w+'});

    // execute build steps in order
    for (const buildStep of buildSteps)
        buildStep(outputFile);
}

function terserStep(filename)
{
    console.log(`Running Terser...`);
    child_process.execSync(`npx terser ${filename} --compress toplevel=false,pure_getters=true,passes=2 --mangle reserved=['engineInit','Cat','Bichita','Mother','x','y','speed','type','isWalking','isDragging','isBichita','isMother','constructor','prototype'] --output ${filename}`, {stdio: 'inherit'});
};

function uglifyBuildStep(filename)
{
    console.log(`Running uglify...`);
    child_process.execSync(`npx uglify-js ${filename} -c -m -o ${filename}`, {stdio: 'inherit'});
};

function roadrollerBuildStep(filename)
{
    console.log(`Running roadroller...`);
    child_process.execSync(`npx roadroller ${filename} -o ${filename}`, {stdio: 'inherit'});
};

function htmlBuildStep(filename)
{
    console.log(`Building html...`);

    // create html file
    let buffer = '<!DOCTYPE html>';
    buffer += '<head>';
    buffer += `<title>${PROGRAM_TITLE}</title>`;
    buffer += '<link rel=icon type=image/png href=favicon.png>';
    buffer += '</head>';
    buffer += '<body>';
    buffer += '<script>';
    buffer += fs.readFileSync(filename) + '\n';
    buffer += '</script>';
    buffer += '</body>';

    // output html file
    fs.writeFileSync(`${BUILD_FOLDER}/index.html`, buffer, {flag: 'w+'});
};

function zipBuildStep(filename)
{
    console.log(`Zipping...`);
    
    const archiver = require('archiver');
    const output = fs.createWriteStream(`${PROGRAM_NAME}.zip`);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
        console.log('');
        console.log(`Build Completed in ${((Date.now() - startTime)/1e3).toFixed(2)} seconds!`);
        console.log(`ZIP archive created: ${archive.pointer()} bytes`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    // Add the build files to the zip
    archive.file(`${BUILD_FOLDER}/index.html`, { name: 'index.html' });
    for (const file of dataFiles) {
        archive.file(`${BUILD_FOLDER}/${file}`, { name: file });
    }

    archive.finalize();
};