const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const terms = ['Người mua', 'Khách hàng', 'đại lý', 'khách hàng', 'Đại lý', 'Khách hàng', 'người mua'];

function search(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            search(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (terms.some(term => line.includes(term))) {
                    console.log(`${filePath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    });
}

search(srcDir);
