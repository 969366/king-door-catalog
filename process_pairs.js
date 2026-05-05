const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputBaseDir = path.join(__dirname, 'original_images');
const outputDir = path.join(__dirname, 'public', 'images');
const dataFile = path.join(__dirname, 'public', 'data.js');

if (!fs.existsSync(outputDir)) { fs.mkdirSync(outputDir, { recursive: true }); }

// 【关键修改点】这里的名字必须和您 original_images 下的文件夹名字一模一样
const categories = ['aluminum-door', 'pivot', 'driveway-gate', 'pergola'];
const finalData = {};

async function processAll() {
    console.log('🚀 开始全量同步 KING DOOR 产品数据...');

    for (const category of categories) {
        finalData[category] = [];
        const catPath = path.join(inputBaseDir, category);
        
        if (!fs.existsSync(catPath)) {
            console.log(`⚠️ 未找到文件夹: ${category}，已跳过。`);
            continue;
        }

        const files = fs.readdirSync(catPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
        const productMap = {};

        for (const file of files) {
            // 支持只有 pure 图，或者 pure+effect 成对的情况
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
            // 只要有 pure 图，就进行处理
            if (data.pure) {
                const pureOutput = `${category}-${id}-pure.webp`;
                const effectOutput = data.effect ? `${category}-${id}-effect.webp` : null;
                
                // 处理 Pure 图
                await sharp(path.join(catPath, data.pure))
                    .webp({ quality: 90 })
                    .toFile(path.join(outputDir, pureOutput));

                // 如果有 Effect 图，也处理
                if (data.effect) {
                    await sharp(path.join(catPath, data.effect))
                        .webp({ quality: 90 })
                        .toFile(path.join(outputDir, effectOutput));
                }

                finalData[category].push({ 
                    id: id, 
                    pure: `images/${pureOutput}`, 
                    effect: effectOutput ? `images/${effectOutput}` : `images/${pureOutput}`, // 如果没实景，点击切换还是原图
                    isNew: data.isNew 
                });
                console.log(`✅ 已同步: [${category}] - ${id}`);
            }
        }
    }

    fs.writeFileSync(dataFile, `const productData = ${JSON.stringify(finalData, null, 4)};`);
    console.log(`\n🎉 所有分类数据已更新成功！`);
}

processAll();