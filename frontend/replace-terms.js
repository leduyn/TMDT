const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
    { from: /khách hàng/g, to: 'người mua' },
    { from: /Khách hàng/g, to: 'Người mua' },
    { from: /KHÁCH HÀNG/g, to: 'NGƯỜI MUA' },
    { from: /đại lý/g, to: 'TEMP_KH' },
    { from: /Đại lý/g, to: 'TEMP_KH_CAP' },
    { from: /ĐẠI LÝ/g, to: 'TEMP_KH_ALLCAP' },
];

const finalPhase = [
    { from: /TEMP_KH_ALLCAP/g, to: 'KHÁCH HÀNG' },
    { from: /TEMP_KH_CAP/g, to: 'Khách hàng' },
    { from: /TEMP_KH/g, to: 'khách hàng' },
];

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;
            
            // Phase 1: Customer -> Buyer, Agency -> Temp
            replacements.forEach(r => {
                content = content.replace(r.from, r.to);
            });
            
            // Phase 2: Temp -> Customer
            finalPhase.forEach(r => {
                content = content.replace(r.from, r.to);
            });
            
            if (content !== original) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

walk(srcDir);
