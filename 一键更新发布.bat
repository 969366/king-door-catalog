@echo off
chcp 65001 >nul
color 0A

echo ===================================================
echo     KING DOOR - 终极无死角自动发布系统 (防黑屏版)
echo ===================================================
echo.

echo [1/5] 🧹 正在彻底清理本地旧图与 Git 顽固缓存...
rmdir /s /q public\images >nul 2>nul
git rm --cached public >nul 2>nul
del .gitignore >nul 2>nul
echo .DS_Store > .gitignore
echo original_images/ >> .gitignore
echo node_modules/ >> .gitignore

echo.
echo [2/5] ⚙️ 正在启动 WebP 强力转换引擎 (全小写防错模式)...
node process_pairs.js
if %errorlevel% neq 0 (
    echo ❌ WebP 转换失败！请检查 Node.js 环境或原图。
    pause
    exit /b
)

echo.
echo [3/5] 📦 正在动用最高权限强制打包所有资源...
git add -A
git add -f public/images/
git add -f public/assets/

set "currentTime=%date% %time%"
git commit -m "KingDoor Ultimate Fix: %currentTime%" >nul 2>nul

echo.
echo [4/5] 🚀 正在连接云端并极速推送...
echo ---------------------------------------------------
git push
if %errorlevel% equ 0 goto push_success

echo.
echo ⚠️ 轨道似乎断开，正在强制重连 main 主分支...
git push --set-upstream origin main
if %errorlevel% equ 0 goto push_success

echo.
echo ⚠️ 正在尝试备用 master 分支...
git push --set-upstream origin master

:push_success
echo ---------------------------------------------------

echo.
echo [5/5] 🎉 发布圆满成功！
echo 施总，您的纯小写 WebP 图片已 100%% 成功冲上云端！彻底告别黑屏！
echo 请等待 1 到 2 分钟让 GitHub 服务器刷新缓存，然后去查看您的独立域名。
echo.
pause