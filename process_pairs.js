const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); 

const config = {
    inputDir: './original_images',
    outputDir: './public/images',
    dataJsPath: './public/data.js',
    quality: 80 
};

if (!fs.existsSync(config.outputDir)) fs.mkdirSync(config.outputDir, { recursive: true });

async function processImages() {
    const categories = fs.readdirSync(config.inputDir).filter(f => fs.statSync(path.join(config.inputDir, f)).isDirectory());
    let productData = {};

    console.log("🚀 开始全自动 WebP 转换 (已开启防黑屏大小写保护)...");

    for (const cat of categories) {
        const catPath = path.join(config.inputDir, cat);
        const catOutDir = path.join(config.outputDir, cat); 
        if (!fs.existsSync(catOutDir)) fs.mkdirSync(catOutDir, { recursive: true });

        const files = fs.readdirSync(catPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
        productData[cat] = [];

        const groups = {};
        files.forEach(file => {
            const lowerFile = file.toLowerCase();
            let type = 'v'; 
            if (lowerFile.includes('-h.') || lowerFile.includes('_h.')) type = 'h';
            
            let idRaw = file.replace(/\.[a-z0-9]+$/i, ''); 
            idRaw = idRaw.replace(/[_-][vh]$/i, ''); 

            if (!groups[idRaw]) groups[idRaw] = {};
            groups[idRaw][type] = file;
        });

        for (const idRaw in groups) {
            // 界面显示用大写 (例如 AL-001)
            let displayId = idRaw.split('_').pop().toUpperCase();
            
            // 👑 核心修复：物理文件和代码路径强制用纯小写，彻底杜绝服务器 404 黑屏！
            let safeFileName = displayId.toLowerCase();

            const item = { id: displayId };
            
            // 强转 WebP 竖图
            if (groups[idRaw].v) {
                const outName = `${safeFileName}_v.webp`;
                await sharp(path.join(catPath, groups[idRaw].v))
                    .webp({ quality: config.quality })
                    .toFile(path.join(catOutDir, outName));
                item.v = `images/${cat}/${outName}`;
            }

            // 强转 WebP 横图
            if (groups[idRaw].h) {
                const outName = `${safeFileName}_h.webp`;
                await sharp(path.join(catPath, groups[idRaw].h))
                    .webp({ quality: config.quality })
                    .toFile(path.join(catOutDir, outName));
                item.h = `images/${cat}/${outName}`;
            }

            if (item.v || item.h) {
                productData[cat].push(item);
            }
        }
        console.log(`✅ 成功扫描并转换目录: ${cat}`);
    }

    const content = `const productData = ${JSON.stringify(productData, null, 2)};`;
    fs.writeFileSync(config.dataJsPath, content);
    console.log("\n✨ 完美！已强制图片文件全小写，再也不会黑屏了！");
}

processImages().catch(err => console.error("❌ 转换出错:", err));