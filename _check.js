const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));

// Collect all function definitions
let allFuncs = new Set();
for (const file of jsFiles) {
    const content = fs.readFileSync('js/' + file, 'utf8');
    const funcDefs = content.matchAll(/(?:function\s+)(\w+)\s*\(/g);
    for (const m of funcDefs) allFuncs.add(m[1]);
}

// Check HTML for onclick calls that reference missing functions
const onclicks = html.matchAll(/onclick="([^"]+)"/g);
let missing = [];
for (const m of onclicks) {
    const call = m[1];
    const funcName = call.match(/^(\w+)\(/);
    if (funcName && !allFuncs.has(funcName[1])) {
        missing.push(funcName[1]);
    }
}
if (missing.length) console.log('Missing functions called from HTML:', [...new Set(missing)].join(', '));
else console.log('All HTML onclick functions found in JS files');

// Check for elements referenced in JS but missing from HTML
const idRefs = new Set();
for (const file of jsFiles) {
    const content = fs.readFileSync('js/' + file, 'utf8');
    const dollarRefs = content.matchAll(/\$\('([^']+)'\)/g);
    for (const m of dollarRefs) idRefs.add(m[1]);
}
const htmlIds = new Set();
const idMatches = html.matchAll(/id="([^"]+)"/g);
for (const m of idMatches) htmlIds.add(m[1]);

let missingIds = [];
for (const id of idRefs) {
    if (!htmlIds.has(id) && !id.startsWith('shp_') && !id.startsWith('txt_') && !id.startsWith('anno_') && !id.startsWith('bdg_') && !id.startsWith('dyn_') && !id.startsWith('ab_')) {
        missingIds.push(id);
    }
}
if (missingIds.length) console.log('IDs in JS but missing from HTML:', missingIds.join(', '));
else console.log('All JS-referenced IDs found in HTML');

// Check render functions exist
const renderFuncs = ['renderPatternGrid', 'renderBgGallery', 'renderGradStopEditor', 'renderShadowSceneGrid', 'renderCornerPresets', 'renderShadowPresets', 'renderSolidPresetsExtended', 'renderCategorizedBgGrid', 'renderLayoutGrid', 'renderTemplateGrid', 'renderTextList', 'renderPresets', 'renderLayerPanel', 'renderLabelPresets', 'renderBrandKit', 'renderArtboardNav'];
for (const fn of renderFuncs) {
    if (!allFuncs.has(fn)) console.log('MISSING render function:', fn);
}

console.log('\nTotal functions:', allFuncs.size);
console.log('Total JS files:', jsFiles.length);
console.log('Total HTML IDs:', htmlIds.size);
