const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputBaseDir = path.join(__dirname, 'original_images');
const outputDir = path.join(__dirname, 'public', 'images');
const dataFile = path.join(__dirname, 'public', 'data.js');

if (!fs.existsSync(outputDir)) { fs.mkdirSync(outputDir, { recursive: true }); }

// 对应您要求的分类名称
const categories = ['aluminum-door', 'pivot', 'driveway-gate', 'pergola'];
const finalData = {};

async function processAll() {
    console.log('🚀 正在为您优化 KING DOOR 无缝融合图册...');

    for (const category of categories) {
        finalData[category] = [];
        const catPath = path.join(inputBaseDir, category);
        if (!fs.existsSync(catPath)) continue;

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
            if (data.pure && data.effect) {
                const pureOutput = `${category}-${id}-pure.webp`;
                const effectOutput = `${category}-${id}-effect.webp`;
                
                // 保持原图 800*800 比例，仅转为 WebP 提升加载速度
                if (!fs.existsSync(path.join(outputDir, pureOutput))) {
                    await sharp(path.join(catPath, data.pure))
                        .webp({ quality: 90 })
                        .toFile(path.join(outputDir, pureOutput));
                }
                if (!fs.existsSync(path.join(outputDir, effectOutput))) {
                    await sharp(path.join(catPath, data.effect))
                        .webp({ quality: 90 })
                        .toFile(path.join(outputDir, effectOutput));
                }

                finalData[category].push({ id: id, pure: `images/${pureOutput}`, effect: `images/${effectOutput}`, isNew: data.isNew });
            }
        }
    }

    fs.writeFileSync(dataFile, `const productData = ${JSON.stringify(finalData, null, 4)};`);
    console.log(`🎉 资源处理完成！`);
}

processAll();