const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputBaseDir = path.join(__dirname, 'original_images');
const outputDir = path.join(__dirname, 'public', 'images');
const dataFile = path.join(__dirname, 'public', 'data.js');

if (!fs.existsSync(outputDir)) { fs.mkdirSync(outputDir, { recursive: true }); }

const categories = ['cast-aluminum', 'offset-pivot', 'courtyard', 'pavilion'];
const finalData = {};

async function processAll() {
    console.log('🚀 开始整理 KING DOOR 产品图册...');

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
                const purePath = path.join(outputDir, pureOutput);
                const effectPath = path.join(outputDir, effectOutput);

                // 仅压缩图片，不带任何水印文字
                if (!fs.existsSync(purePath)) {
                    await sharp(path.join(catPath, data.pure))
                        .resize(1000, 1000, { fit: 'contain', background: '#fff' })
                        .webp({ quality: 85 })
                        .toFile(purePath);
                }
                if (!fs.existsSync(effectPath)) {
                    await sharp(path.join(catPath, data.effect))
                        .resize({ width: 1000, withoutEnlargement: true })
                        .webp({ quality: 85 })
                        .toFile(effectPath);
                }

                finalData[category].push({ id: id, pure: `images/${pureOutput}`, effect: `images/${effectOutput}`, isNew: data.isNew });
            }
        }
        finalData[category].sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
    }

    fs.writeFileSync(dataFile, `const productData = ${JSON.stringify(finalData, null, 4)};`);
    console.log(`\n🎉 图册数据已全部更新！`);
}

processAll();