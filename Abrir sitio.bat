@echo off
REM Lanzador de "Songes para Noobs".
REM Sirve el sitio con un servidor local y lo abre en el navegador.
REM El servidor evita el modo file:// y sirve siempre la version actual de los archivos.

cd /d "%~dp0"

echo Iniciando Songes para Noobs...
echo.
echo Carpeta servida: %CD%
echo Se abrira el navegador en unos segundos.
echo NO cierres esta ventana mientras usas el sitio.
echo Para parar el servidor: cierra esta ventana o pulsa Ctrl+C.
echo.

REM Avisa si ya hay algo escuchando en el puerto (otro servidor viejo).
netstat -ano | findstr ":8765 " | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo ATENCION: ya hay un servidor en el puerto 8765.
  echo Puede ser una copia antigua del sitio. Cierralo antes de continuar,
  echo o el navegador abrira la version equivocada.
  echo.
  pause
  exit /b 1
)

REM Abre el navegador con un pequeno retardo, para dar tiempo al servidor.
start "" cmd /c "timeout /t 2 >nul & start "" http://127.0.0.1:8765/index.html"

python -m http.server 8765 --bind 127.0.0.1

pause

