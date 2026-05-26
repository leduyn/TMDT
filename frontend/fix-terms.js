const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixTerminology(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Context-aware replacement
        if (line.match(/agency|agencies|ROLE_AGENCY|agencyName|selectedAgency/i)) {
            // This line is likely about Agency -> should be "Khách hàng"
            if (line.includes('Người mua')) {
                line = line.replace(/Người mua/g, 'Khách hàng');
                changed = true;
            }
            if (line.includes('NGƯỜI MUA')) {
                line = line.replace(/NGƯỜI MUA/g, 'KHÁCH HÀNG');
                changed = true;
            }
        }
        
        if (line.match(/customer|customers|ROLE_CUSTOMER|customerName|selectedCustomer/i)) {
            // This line is likely about Customer -> should be "Người mua"
            if (line.includes('Khách hàng')) {
                line = line.replace(/Khách hàng/g, 'Người mua');
                changed = true;
            }
            if (line.includes('KHÁCH HÀNG')) {
                line = line.replace(/KHÁCH HÀNG/g, 'NGƯỜI MUA');
                changed = true;
            }
        }
        
        lines[i] = line;
    }

    if (changed) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fixTerminology(filePath);
        }
    });
}

walk(srcDir);
