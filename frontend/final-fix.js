const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Phase 1: End user "khách hàng" -> "người mua"
    // Use word boundaries or specific patterns to avoid over-replacing
    // Actually, at this point, most "Khách hàng" are already "Người mua" or meant to be "Khách hàng" (Agency).
    
    // Let's just fix the remaining "đại lý"
    content = content.replace(/đại lý/g, 'khách hàng');
    content = content.replace(/Đại lý/g, 'Khách hàng');
    content = content.replace(/ĐẠI LÝ/g, 'KHÁCH HÀNG');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
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
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            fix(filePath);
        }
    });
}

walk(srcDir);
