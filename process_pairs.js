const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputBaseDir = path.join(__dirname, 'original_images');
const outputDir = path.join(__dirname, 'public', 'images');
const dataFile = path.join(__dirname, 'public', 'data.js');

if (!fs.existsSync(outputDir)) { fs.mkdirSync(outputDir, { recursive: true }); }

async function processAll() {
    console.log('🚀 KING DOOR 智能同步系统启动...');

    // 1. 自动获取目录名字
    const categories = fs.readdirSync(inputBaseDir).filter(f => {
        return fs.statSync(path.join(inputBaseDir, f)).isDirectory();
    });

    const finalData = {};
    const currentUsedFiles = new Set(); // 用于记录当前正在使用的文件

    for (const category of categories) {
        finalData[category] = [];
        const catPath = path.join(inputBaseDir, category);
        const files = fs.readdirSync(catPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
        const productMap = {};

        for (const file of files) {
            const match = file.match(/^(.*?)-(pure|effect)\.\w+$/i);
            if (match) {
                let idRaw = match[1].toUpperCase();
                const type = match[2].toLowerCase(); 
                let isNew = idRaw.startsWith('NEW-');
                if (isNew) idRaw = idRaw.replace('NEW-', '');
                if (!productMap[idRaw]) productMap[idRaw] = { isNew: isNew };
                productMap[idRaw][type] = file;
            }
        }

        for (const [id, data] of Object.entries(productMap)) {
            if (data.pure) {
                const pureOutput = `${category}-${id}-pure.webp`;
                const effectOutput = data.effect ? `${category}-${id}-effect.webp` : null;
                
                currentUsedFiles.add(pureOutput);
                if (effectOutput) currentUsedFiles.add(effectOutput);

                // 处理图片
                await sharp(path.join(catPath, data.pure)).webp({ quality: 90 }).toFile(path.join(outputDir, pureOutput));
                if (data.effect) {
                    await sharp(path.join(catPath, data.effect)).webp({ quality: 90 }).toFile(path.join(outputDir, effectOutput));
                }

                finalData[category].push({ 
                    id: id, 
                    pure: `images/${pureOutput}`, 
                    effect: effectOutput ? `images/${effectOutput}` : `images/${pureOutput}`,
                    isNew: data.isNew 
                });
            }
        }
    }

    // 2. 自动清理空间：删除不在当前目录中的旧文件
    const existingFiles = fs.readdirSync(outputDir);
    let deletedCount = 0;
    existingFiles.forEach(file => {
        if (!currentUsedFiles.has(file)) {
            fs.unlinkSync(path.join(outputDir, file));
            deletedCount++;
        }
    });

    // 3. 写入数据
    fs.writeFileSync(dataFile, `const productData = ${JSON.stringify(finalData, null, 4)};`);
    console.log(`\n🎉 同步完成！`);
    console.log(`📂 已识别分类: ${categories.join(', ')}`);
    console.log(`🧹 已清理旧冗余图片: ${deletedCount} 张`);
}

processAll();