@echo off
REM Lanzador de "Songes para Noobs".
REM Abre el sitio en el navegador usando un servidor local, que evita los
REM problemas de cache y de acceso a archivos locales del modo file://.

cd /d "%~dp0"

echo Iniciando Songes para Noobs...
echo.
echo Se abrira una ventana con el servidor. NO la cierres mientras uses el sitio.
echo Para parar el servidor: cierra esa ventana o pulsa Ctrl+C.
echo.

start "" http://127.0.0.1:8765/index.html
python -m http.server 8765 --bind 127.0.0.1

pause
