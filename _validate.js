const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const stateJs = fs.readFileSync('js/state.js', 'utf8');
const advJs = fs.readFileSync('js/advanced-features.js', 'utf8');

const allJs = fs.readdirSync('js').map(f => fs.readFileSync('js/' + f, 'utf8')).join('\n');
let issues = [];
let m;

// 1. Check all onclick handlers have matching functions
const onclickRE = /onclick="([a-zA-Z_][a-zA-Z0-9_]*)\(/g;
while ((m = onclickRE.exec(html)) !== null) {
    const fn = m[1];
    if (!allJs.includes('function ' + fn)) {
        issues.push('Missing function: ' + fn);
    }
}

// 2. Check HTML IDs referenced in JS exist
const dollarRE = /\$\('([a-zA-Z0-9_-]+)'\)/g;
const htmlIds = new Set();
const idRE = /id=["']([a-zA-Z0-9_-]+)["']/g;
while ((m = idRE.exec(html)) !== null) htmlIds.add(m[1]);
const dynamicIds = ['msShadowOv', 'rulerH', 'rulerV', 'msGrid', 'gradStopSliders', 'bgFitRow', 'msNoiseOverlay', 'msVignetteOverlay'];
dynamicIds.forEach(id => htmlIds.add(id));

const missingIds = new Set();
while ((m = dollarRE.exec(allJs)) !== null) {
    if (!htmlIds.has(m[1])) missingIds.add(m[1]);
}
if (missingIds.size > 0) issues.push('IDs in JS but not in HTML: ' + [...missingIds].join(', '));

// 3. Count content
console.log('=== CONTENT COUNTS ===');
console.log('Canvas presets:', (html.match(/<option value="\d+x\d+"/g) || []).length);
console.log('Frame colors:', (html.match(/<option value="(#[a-f0-9]+|transparent)"/g) || []).length);

// 4. Check CSS files referenced in HTML
const cssFiles = ['variables.css', 'layout.css', 'components.css', 'frames.css', 'artboard.css', 'icons.css', 'modal.css', 'effects.css', 'responsive.css', 'themes.css', 'advanced.css'];
cssFiles.forEach(f => {
    if (!fs.existsSync('css/' + f)) issues.push('Missing CSS: css/' + f);
    else if (!html.includes(f)) issues.push('CSS not linked: ' + f);
});

// 5. Check JS files referenced in HTML
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
jsFiles.forEach(f => {
    if (!html.includes(f)) issues.push('JS not linked in HTML: ' + f);
});

// 6. Quick syntax check - look for obvious JS issues
jsFiles.forEach(f => {
    const content = fs.readFileSync('js/' + f, 'utf8');
    // Count braces
    const opens = (content.match(/\{/g) || []).length;
    const closes = (content.match(/\}/g) || []).length;
    if (opens !== closes) {
        issues.push('Brace mismatch in js/' + f + ': { = ' + opens + ', } = ' + closes);
    }
});

console.log('\n=== ISSUES ===');
if (issues.length === 0) {
    console.log('No issues found!');
} else {
    issues.forEach(i => console.log('ISSUE: ' + i));
}
console.log('\nTotal JS files:', jsFiles.length);
console.log('Total CSS files:', cssFiles.length);
