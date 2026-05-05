@echo off
echo ==========================================
echo   KING DOOR 图册自动更新发布系统启动
echo ==========================================
echo [1/3] 正在压缩图片并生成网页数据...
node process_pairs.js
echo [2/3] 正在打包最新文件...
git add .
git commit -m "Auto update catalog"
echo [3/3] 正在推送到全球服务器 (Vercel)...
git push
echo ==========================================
echo   发布成功！海外客户现在已能看到最新产品。
echo ==========================================
pause