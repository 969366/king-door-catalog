const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // 🌟 换成最强大的顶级图像引擎

console.log("\n=================================");
console.log("🚀 [KING DOOR] 顶级图像加工引擎启动...");
console.log("=================================");

const originalDir = './original_images';
const outputDir = './public/images';
const logoFile = './public/assets/watermark.png'; 
const dataFileJS = './public/data.js';
const dataFileJSON = './public/data.json';

// 检查原料仓库
if (!fs.existsSync(originalDir)) {
    console.log("❌ 致命错误：找不到 original_images 文件夹！");
    process.exit(1);
}
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

let hasWatermark = fs.existsSync(logoFile);
if (hasWatermark) {
    console.log("[系统] ✅ 成功加载水印文件...");
} else {
    console.log("[系统] ⚠️ 未找到水印，将生成纯净版...");
}

// 采用异步流水线，防卡死
(async () => {
    const productData = {};
    const categories = fs.readdirSync(originalDir);

    for (const category of categories) {
        const categoryPath = path.join(originalDir, category);
        if (!fs.statSync(categoryPath).isDirectory()) continue;

        console.log(`\n📂 正在读取产品系列: [${category}]`);
        const files = fs.readdirSync(categoryPath);
        const groups = {};
        let fileCount = 0;

        files.forEach(file => {
            if (!file.match(/\.(jpe?g|png|webp)$/i)) return;
            fileCount++;
            
            let id = '', type = '_v';
            const match = file.match(/(.+)(_v|_h|-v|-h)\.(jpe?g|png|webp)$/i);
            if (match) {
                id = match[1];
                type = match[2].toLowerCase().replace('-', '_');
            } else {
                const fallbackMatch = file.match(/(.+)\.(jpe?g|png|webp)$/i);
                if (fallbackMatch) id = fallbackMatch[1];
            }

            if (id) {
                const cleanId = id.toUpperCase().trim().replace(/^([A-Z]+)[-_\s]?(\d+.*)$/, '$1-$2');
                if (!groups[cleanId]) groups[cleanId] = {};
                if (!groups[cleanId][type]) groups[cleanId][type] = file;
            }
        });

        console.log(`   -> 发现 ${fileCount} 张图，开始引擎压制...`);
        productData[category] = [];
        const sortedIds = Object.keys(groups).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));

        for (const id of sortedIds) {
            const item = groups[id];
            if (!item._v && !item._h) continue;

            let vOut = null, hOut = null;

            // 引擎处理核心逻辑
            const processImg = async (srcFile, outName) => {
                try {
                    const inputPath = path.join(categoryPath, srcFile);
                    const outputPath = path.join(outputDir, outName);
                    
                    const image = sharp(inputPath);
                    const metadata = await image.metadata();

                    if (hasWatermark) {
                        // 动态计算水印尺寸 (原图宽度的 8%)
                        const wWidth = Math.max(Math.round(metadata.width * 0.08), 50); 
                        const watermarkImg = sharp(logoFile).resize(wWidth);
                        const wMeta = await watermarkImg.metadata();
                        const wBuffer = await watermarkImg.toBuffer();
                        
                        // 计算右下角位置 (留白 20px)
                        const x = Math.max(metadata.width - wMeta.width - 20, 0);
                        const y = Math.max(metadata.height - wMeta.height - 20, 0);

                        await image
                            .composite([{ input: wBuffer, top: y, left: x }])
                            .jpeg({ quality: 85 })
                            .toFile(outputPath);
                    } else {
                        // 无水印直接压缩输出
                        await image
                            .jpeg({ quality: 85 })
                            .toFile(outputPath);
                    }
                    return true;
                } catch (e) {
                    // 即使出错也不崩溃，只红字报告
                    console.log(`   ❌ [跳过] ${srcFile} 处理失败: ${e.message}`);
                    return false;
                }
            };

            if (item._v) {
                vOut = `${category}_${id}_v.jpg`;
                if (await processImg(item._v, vOut)) console.log(`   📸 [成功] ${vOut}`);
            }
            if (item._h) {
                hOut = `${category}_${id}_h.jpg`;
                if (await processImg(item._h, hOut)) console.log(`   📸 [成功] ${hOut}`);
            }

            productData[category].push({ id: id, v: `images/${vOut}`, h: hOut ? `images/${hOut}` : null });
        }
    }

    fs.writeFileSync(dataFileJS, `const productData = ${JSON.stringify(productData, null, 4)};`);
    fs.writeFileSync(dataFileJSON, JSON.stringify(productData, null, 2));

    console.log("\n=================================");
    console.log("✅ [KING DOOR] 所有图片加工完成！数据已同步。");
    console.log("=================================\n");
})();