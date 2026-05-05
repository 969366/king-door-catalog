const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 文件夹路径配置
const inputBaseDir = path.join(__dirname, 'original_images');
const outputDir = path.join(__dirname, 'public', 'images');
const dataFile = path.join(__dirname, 'public', 'data.js');

if (!fs.existsSync(outputDir)) { 
    fs.mkdirSync(outputDir, { recursive: true }); 
}

const categories = ['cast-aluminum', 'offset-pivot', 'courtyard', 'pavilion'];
const finalData = {};

async function processAll() {
    console.log('🚀 启动智能增量引擎：开始扫描 KING DOOR 产品库...\n');

    for (const category of categories) {
        finalData[category] = [];
        const catPath = path.join(inputBaseDir, category);
        
        if (!fs.existsSync(catPath)) continue;

        const files = fs.readdirSync(catPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
        const productMap = {};

        // 识别与提取数据
        for (const file of files) {
            const match = file.match(/^(.*?)-(pure|effect)\.\w+$/i);
            if (match) {
                let idRaw = match[1].toUpperCase();
                const type = match[2].toLowerCase(); 
                
                let isNew = false;
                if (idRaw.startsWith('NEW-')) {
                    isNew = true;
                    idRaw = idRaw.replace('NEW-', ''); 
                }

                if (!productMap[idRaw]) productMap[idRaw] = { isNew: isNew };
                productMap[idRaw][type] = file;
            }
        }

        // 智能增量处理核心逻辑
        for (const [id, data] of Object.entries(productMap)) {
            if (data.pure && data.effect) {
                const pureOutput = `${category}-${id}-pure.webp`;
                const effectOutput = `${category}-${id}-effect.webp`;

                const pureOutputPath = path.join(outputDir, pureOutput);
                const effectOutputPath = path.join(outputDir, effectOutput);

                // 【核心改进】：检查目标图片是否已经存在
                if (fs.existsSync(pureOutputPath) && fs.existsSync(effectOutputPath)) {
                    // 如果存在，不执行耗时的 Sharp 压缩，直接闪电跳过
                    console.log(`⏩ 闪电跳过 (图片已存在): [${category}] ${id} ${data.isNew ? '(✨ 标记为新品)' : ''}`);
                } else {
                    // 如果不存在，说明是新加的图，执行压缩
                    try {
                        await sharp(path.join(catPath, data.pure))
                            .resize({ width: 1000, withoutEnlargement: true }) 
                            .webp({ quality: 80 })
                            .toFile(pureOutputPath);

                        await sharp(path.join(catPath, data.effect))
                            .resize({ width: 1000, withoutEnlargement: true }) 
                            .webp({ quality: 80 })
                            .toFile(effectOutputPath);

                        console.log(`✅ 成功压缩新图: [${category}] ${id} ${data.isNew ? '(✨ 新品)' : ''}`);
                    } catch (error) { 
                        console.error(`❌ 处理图片出错 ${id}:`, error); 
                    }
                }

                // 无论是否跳过压缩，都必须把最新数据写进网页里
                finalData[category].push({ 
                    id: id, 
                    pure: `images/${pureOutput}`, 
                    effect: `images/${effectOutput}`,
                    isNew: data.isNew 
                });
            } else {
                console.warn(`⚠️ 警告：产品 [${id}] 缺失纯底图或效果图，已跳过。`);
            }
        }

        // 依然保持新品自动置顶功能
        finalData[category].sort((a, b) => {
            if (a.isNew === b.isNew) return 0;
            return a.isNew ? -1 : 1;
        });
    }

    const jsContent = `const productData = ${JSON.stringify(finalData, null, 4)};`;
    fs.writeFileSync(dataFile, jsContent);
    
    console.log(`\n==========================================`);
    console.log(`🎉 增量更新瞬间完成！数据已注入网页。`);
    console.log(`==========================================\n`);
}

processAll();