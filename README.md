# Songes para Noobs

**En línea: https://gpro180793.github.io/Songes_Para_Noobs/**

Guía rápida **en español** de los jefes de **Sueños (Songes)** de Dofus, adaptada de
[Songes pour les Noobs](https://volcasaurus.github.io/Songes_Pour_Les_Noobs/) de Volcasaurus.

Pensada para consultarla durante una run de Sueños cuando tienes prisa: omitimos los
detalles menores a propósito y ofrecemos **versiones cortas** para ir a lo esencial.

## Qué incluye

- **150 jefes** con nombre en español **y** francés (puedes buscar en cualquiera de los dos).
- **Información** del jefe, **mecánicas globales** y **consejos de estrategia**, traducidos del francés.
- **Barras de gestión**: Focus inmediato, Esquiva y Tanque (0–10), más la dificultad (0–10).
- **Hechizos** de cada jefe con nombre y descripción en español (vía DoFensive).
- Datos extra: familia, raza, mazmorra, nivel y nivel en Sueño.
- **Versión corta** conmutable y botón de **jefe al azar**.

## Búsqueda

Insensible a acentos y mayúsculas, y funciona en **español o francés**:

- `abraknido` o `abraknyde`
- `roble blando` o `chene mou`
- `anerice`

## Fuentes de datos

- **Textos y valoraciones** (Focus / Esquiva / Tanque, información, mecánicas, consejos):
  traducidos del francés desde [Songes pour les Noobs](https://github.com/Volcasaurus/Songes_Pour_Les_Noobs) (Volcasaurus).
- **Datos de monstruos y hechizos**: API pública de [DoFensive](https://dofensive.com/es)
  (`cdn.api.dofensive.com`), en español. Los IDs de monstruo coinciden 1:1 con los del sitio original.

## Estructura

```
index.html            Aplicación (una sola página)
css/style.css         Estilos
js/app.js             Búsqueda, ficha de jefe, versión corta
data/jefes.json       Los 150 jefes con todo el contenido (fuente legible)
data/jefes.js         Los mismos datos, incrustados como <script> para abrir sin servidor
assets/images/        Retratos de los jefes
assets/icons/         Iconos (información, mecánica, consejos, focus, esquiva, tanque)
assets/illustrations/ Ilustraciones de algunos combates
```

## Uso local

**Opción 1 — abrir directamente (lo más fácil):** haz doble clic en `index.html`.
Los datos van incrustados en `data/jefes.js`, así que funciona sin servidor.

**Opción 2 — con servidor local** (útil si vas a editar los datos):

```bash
python -m http.server 8765
# abre http://127.0.0.1:8765/
```

> Si ves *«Se ha producido un error al cargar los datos»*, comprueba que
> `data/jefes.js` está junto al `index.html`. Ese archivo es el que lleva los
> datos incrustados y es lo que permite abrir la página sin servidor.

## Aviso legal

Dofus y todos sus contenidos (imágenes, nombres, conceptos) son propiedad exclusiva
de **Ankama Games**. Los textos de estrategia provienen de la guía comunitaria
*Songes pour les Noobs* y los datos de monstruos de *DoFensive*.
