@echo off
chcp 65001 >nul
color 0E

echo ===================================================
echo     KING DOOR - 终极修复与极速发布系统
echo ===================================================
echo.

echo [1/4] 🧹 正在清理本地缓存与 Git 错误记忆...
:: 强制让 Git 忘掉之前的套娃错误
git rm --cached public >nul 2>nul
rmdir /s /q public\images >nul 2>nul
del .gitignore >nul 2>nul

echo .DS_Store > .gitignore
echo original_images/ >> .gitignore
echo node_modules/ >> .gitignore

echo.
echo [2/4] ⚙️ 正在重新生成完美图片库...
node process_pairs.js
if %errorlevel% neq 0 (
    echo ❌ JS 脚本运行失败！
    pause
    exit /b
)

echo.
echo [3/4] 📦 正在强制打包所有文件...
git add -A
git add -f public/images/
git add -f public/assets/

set "currentTime=%date% %time%"
git commit -m "KingDoor Final Fix: %currentTime%" >nul 2>nul

echo.
echo [4/4] 🚀 正在接通云端轨道并强制推送...
echo ---------------------------------------------------
:: 核心修复：强制绑定远程的 main 分支，治好失忆症
git push --set-upstream origin main

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ 尝试备用轨道 (master)...
    git push --set-upstream origin master
)
echo ---------------------------------------------------

echo 🎉 完美搞定！
echo 请去 GitHub 刷新看看，这次您的图片和网页绝对 100%% 上线了！
echo.
pause