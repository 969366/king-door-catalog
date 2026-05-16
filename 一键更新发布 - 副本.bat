@echo off
chcp 65001 >nul
color 0B

echo ===================================================
echo     KING DOOR - 洁癖版发布系统 (自动清理垃圾)
echo ===================================================
echo.

echo [1/4] 🧹 正在执行深度大扫除...
:: 1. 物理粉碎 public 里所有不相关的垃圾文件
del /q public\LICENSE >nul 2>nul
del /q public\README.md >nul 2>nul
del /q public\README.en.md >nul 2>nul
del /q public\data.json >nul 2>nul
del /q public\index.rar >nul 2>nul
del /q public\.gitignore >nul 2>nul

:: 2. 粉碎外层的误建文件
del /q "新建 文本文档.txt" >nul 2>nul

:: 3. 清空旧图片，准备重装
rmdir /s /q public\images >nul 2>nul

:: 4. 强制洗脑 Git，让它忘掉所有文件，等会重新扫描
git rm -r --cached . >nul 2>nul

:: 5. 写入最严谨的黑名单
echo .DS_Store > .gitignore
echo original_images/ >> .gitignore
echo node_modules/ >> .gitignore

echo.
echo [2/4] ⚙️ 正在重新生成完美图库...
node process_pairs.js

echo.
echo [3/4] 📦 正在精准打包 (只保留核心命脉)...
git add -A
:: 精确制导，强迫 Git 只认这几个大将
git add -f public/config.js
git add -f public/data.js
git add -f public/index.html
git add -f public/images/
git add -f public/assets/

git commit -m "KingDoor Clean Up & Final Deploy" >nul 2>nul

echo.
echo [4/4] 🚀 正在将纯净版强制覆盖至云端...
echo ---------------------------------------------------
git push -f origin main

if %errorlevel% neq 0 (
    echo ⚠️ 正在尝试 master 分支...
    git push -f origin master
)
echo ---------------------------------------------------

echo.
echo 🎉 大扫除与发布圆满完成！
echo 施总，您的 GitHub 仓库现在的垃圾已经被一扫而空！
echo 只剩下最核心的展厅代码、您的 config.js 指挥部，以及高清图片。
echo 等待 1 分钟后，去刷新您的专属域名 catalog.kaihuadoor.com 欣赏最终大作吧！
echo.
pause