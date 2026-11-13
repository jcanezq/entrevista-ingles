# Entrevista de inglés: web de práctica

Web estática para preparar la entrevista de ubicación de inglés por Google Meet (el
segundo paso después de EnglishScore). Entrena listening y speaking en sesiones
cortas desde el celular. No usa servidor ni cuentas, y **las grabaciones nunca salen
del dispositivo del estudiante**.

## Módulos

| Módulo | Qué entrena |
|---|---|
| Oído Meet | Entender la pregunta sin leerla, con acentos, velocidades y ruido de llamada |
| Responde | Bloques 1 y 2 (personal y experiencias): grabar, autoevaluarse y comparar con los modelos |
| Imágenes | Bloque 3: describir y especular sobre una foto en un minuto |
| Opinión | Bloque 4: argumentar en 90 segundos |
| Simulacro | La entrevista completa, en video, con repreguntas al azar |
| Frases, El día, Progreso | Consulta, lista de cotejo para Meet y resumen para enviar al guía |

## Probarla en la computadora

El micrófono y la cámara solo funcionan con `https` o en `localhost`:

```
cd D:\proyectos\entrevista-ingles
python -m http.server 8000
```

y abrir <http://localhost:8000>.

## Publicarla para el grupo

Cualquier hosting estático con https sirve, gratis:

- **Netlify:** arrastrar la carpeta a <https://app.netlify.com/drop>.
- **Vercel:** `npx vercel` dentro de la carpeta.
- **GitHub Pages:** subir la carpeta a un repositorio y activar Pages.

## Editar el contenido

Todo el contenido vive en `js/data.js`: preguntas, repreguntas, respuestas modelo,
frases, errores y fotos. **No cambies el `id` de una pregunta existente**, porque el
progreso guardado lo usa.

## Agregar las fotos del bloque 3

1. Busca la foto en <https://unsplash.com> o <https://www.pexels.com>; su licencia
   permite usarlas. En `js/data.js`, la lista `imagenes` dice qué buscar en cada `idea`.
2. Descárgala en tamaño mediano (unos 1200 px de ancho) y guárdala en `img/`, por
   ejemplo `img/i11.jpg`.
3. En `js/data.js` cambia `archivo: null` por `archivo: "i11.jpg"`.

Las fotos con `archivo: null` no aparecen en la práctica. Sin ninguna foto, el
simulacro se salta el bloque 3.

## Navegadores

Funciona en Chrome y Edge (computadora y Android) y en Safari de iOS 14.5 o
posterior. Las voces dependen del dispositivo: en Android se agregan más en
Ajustes → Texto a voz.
