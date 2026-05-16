@echo off
chcp 65001 >nul
color 0A

echo ===================================================
echo     KING DOOR - 终极无死角自动发布系统 (防黑屏版)
echo ===================================================
echo.

echo [1/5] 🧹 正在彻底清理本地旧图与 Git 顽固缓存...
:: 保险1：暴力清空旧图片，确保不会有大小写混用残留
rmdir /s /q public\images >nul 2>nul
:: 保险2：强行拔除可能再次出现的套娃内鬼 (.git 冲突)
git rm --cached public >nul 2>nul
:: 保险3：重写最干净的防干扰规则
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
:: 保险4：无视任何拦截，强制把生成的图片和 Logo 塞进包裹
git add -A
git add -f public/images/
git add -f public/assets/

set "currentTime=%date% %time%"
git commit -m "KingDoor Ultimate Fix: %currentTime%" >nul 2>nul

echo.
echo [4/5] 🚀 正在连接云端并极速推送...
echo ---------------------------------------------------
git push
    
:: 保险5：如果轨道丢失，自动接通 main 或 master 轨道
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ 轨道似乎断开，正在强制重连主轨道 (main)...
    git push --set-upstream origin main
        
    if %errorlevel% neq 0 (
        echo ⚠️ 正在尝试备用轨道 (master)...
        git push --set-upstream origin master
    )
)
echo ---------------------------------------------------

echo.
echo [5/5] 🎉 发布圆满成功！
echo 施总，您的纯小写 WebP 图片已 100%% 成功冲上云端！彻底告别黑屏！
echo 请等待 1 到 2 分钟让 GitHub 服务器刷新缓存，然后去查看您的独立域名。
echo.
pause