@echo off
chcp 65001 >nul
color 0E

echo ===================================================
echo      KING DOOR - 展厅全自动【白名单】发布系统
echo ===================================================
echo.

:: ==========================================
:: 第一步：智能重构黑名单 (自动屏蔽所有非核心文件)
:: ==========================================
echo [1/4] 🛡️ 正在启动雷达扫描，自动拉黑非必要文件...

:: 1. 核心逻辑：先忽略一切 (*)
echo * > .gitignore

:: 2. 强力白名单：只允许以下“必须件”通过 (前面加感叹号表示不忽略)
echo !index.html >> .gitignore
echo !config.js >> .gitignore
echo !data.js >> .gitignore
echo !package.json >> .gitignore
echo !package-lock.json >> .gitignore
echo !process_pairs.js >> .gitignore
echo !*.bat >> .gitignore
echo !.gitignore >> .gitignore
echo !public/ >> .gitignore
echo !assets/ >> .gitignore
echo !README.md >> .gitignore

:: 3. 强制 Git 刷新缓存，确保之前不小心传上去的垃圾现在立刻消失
git rm -r --cached . >nul 2>nul
echo ✅ 扫描完成：除展厅核心文件外，所有杂质已自动拦截。

echo.
:: ==========================================
:: 第二步：启动加工厂 (处理 original_images)
:: ==========================================
echo [2/4] ⚙️ 正在唤醒图片加工脚本更新数据...
echo ---------------------------------------------------
node process_pairs.js
echo ---------------------------------------------------
if %errorlevel% neq 0 (
    echo ❌ 图片处理出错！请检查 original_images 里的图片命名。
    pause
    exit /b
)
echo ✅ 加工完成：新图片已生成至 public 目录。

echo.
:: ==========================================
:: 第三步：打包同步
:: ==========================================
echo [3/4] 📦 正在准备上传最新的纯净版展厅...
git add .
set "currentTime=%date% %time%"
git commit -m "KingDoor Auto Guard Update: %currentTime%" >nul 2>nul

echo.
:: ==========================================
:: 第四步：推送云端
:: ==========================================
echo [4/4] 🚀 正在极速推送至云端...
echo ---------------------------------------------------
git push
echo ---------------------------------------------------
echo.

if %errorlevel% equ 0 (
    echo 🎉 大功告成！
    echo 🌐 您的线上展厅已更新。
    echo 🛡️ 刚才扫描到的所有冗余文件夹已被自动拉黑，未占用任何云端空间。
) else (
    echo ❌ 推送失败，请检查网络。
)

echo.
pause