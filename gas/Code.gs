/**
 * Code.gs — Capa API del proyecto "Autoevaluación de Desempeño" (sección 6 del plan).
 *
 * Actúa como puente entre el frontend (React en GitHub Pages) y la hoja
 * `Respuestas` de Google Sheets. Sin autenticación (decisión explícita del equipo).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CÓMO PUBLICARLO
 * 1. Abre la hoja de cálculo y ve a Extensiones > Apps Script.
 * 2. Pega este archivo completo (reemplaza el contenido por defecto).
 * 3. Ejecuta una vez la función `setupHeaders` (menú ▶) para crear la hoja
 *    `Respuestas` con sus encabezados. Autoriza los permisos cuando lo pida.
 * 4. Deploy > New deployment > tipo "Web app":
 *      - Execute as: Me (tu cuenta)
 *      - Who has access: Anyone
 * 5. Copia la URL del Web App (/exec) en el `.env` del frontend
 *    como `VITE_GAS_API_URL` (Fase 5).
 * ─────────────────────────────────────────────────────────────────────────
 */

// ID de la hoja de cálculo (tomado del enlace compartido).
// openById funciona tanto para script vinculado como independiente.
var SPREADSHEET_ID = '1Cho6P23jLYT2-YXv6k_Yc7Nio_RFgMCd9_zpqxK5vwU';

// Nombre de la pestaña donde se guardan las respuestas (sección 5).
var SHEET_NAME = 'Respuestas';

/**
 * Encabezados de columna, en el orden exacto de la sección 5 del plan.
 * DEBEN coincidir con las llaves del JSON que envía el frontend
 * (ver `sheetHeaders` en src/config/formConfig.js — misma lista, misma fuente
 * de verdad). Si se agregan o quitan preguntas, actualiza AMBOS lugares y
 * vuelve a ejecutar `setupHeaders`.
 */
var HEADERS = [
  'id',
  'timestamp',
  'profesional',
  'fecha',
  // Compromiso y responsabilidad
  'cr1', 'cr2', 'cr3', 'cr4', 'cr5',
  // Comunicación y articulación
  'ca1', 'ca2', 'ca3',
  // Desarrollo profesional
  'dp1', 'dp2', 'dp3',
  // Trabajo en equipo y convivencia
  'te1', 'te2', 'te3',
  // Gestión con actores del territorio
  'gt1', 'gt2', 'gt3', 'gt4',
  // Preguntas de reflexión (texto abierto)
  'ref1', 'ref2', 'ref3', 'ref4',
  // Compromiso de mejoramiento (texto abierto)
  'compromiso', 'tres_palabras',
];

/**
 * Devuelve la hoja `Respuestas`, creándola si no existe.
 */
function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/**
 * Escribe (o reescribe) la fila de encabezados con el orden de `HEADERS`.
 * Ejecutar UNA VEZ manualmente antes de usar el formulario, o cada vez que
 * cambie la lista de preguntas. No borra las respuestas existentes.
 */
function setupHeaders() {
  var sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  SpreadsheetApp.flush();
  return 'Encabezados creados: ' + HEADERS.length + ' columnas en "' + SHEET_NAME + '".';
}

/**
 * Lee la fila de encabezados actual de la hoja. Si está vacía, la inicializa
 * con `HEADERS` para que el primer envío no falle.
 */
function getHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    setupHeaders();
  }
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/**
 * doPost — recibe el JSON del formulario, genera `id` y `timestamp` si no
 * vienen, y agrega una fila mapeando por nombre de encabezado (sección 6).
 *
 * Nota CORS: el frontend debe enviar el POST con Content-Type "text/plain"
 * para evitar el preflight OPTIONS (Apps Script no puede responderlo). El
 * cuerpo sigue siendo JSON y se parsea igual aquí.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (!data.id) {
      data.id = Utilities.getUuid();
    }
    data.timestamp = new Date();

    var sheet = getSheet_();
    var headers = getHeaders_(sheet);

    // Mapeo por nombre de columna: cada encabezado toma su valor del JSON.
    var row = headers.map(function (key) {
      return data[key] !== undefined && data[key] !== null ? data[key] : '';
    });

    sheet.appendRow(row);

    return jsonResponse_({ status: 'ok', id: data.id });
  } catch (err) {
    return jsonResponse_({ status: 'error', message: String(err) });
  }
}

/**
 * doGet — con ?action=list devuelve todas las filas de `Respuestas` como
 * array de objetos, usando la primera fila como llaves (sección 6).
 * Consumido por el panel /admin (Fase 6). Sin autenticación.
 */
function doGet(e) {
  try {
    var action = e && e.parameter ? e.parameter.action : null;

    if (action === 'list') {
      var sheet = getSheet_();
      var values = sheet.getDataRange().getValues();

      if (values.length < 2) {
        return jsonResponse_({ status: 'ok', data: [] });
      }

      var headers = values[0];
      var rows = values.slice(1).map(function (row) {
        var obj = {};
        headers.forEach(function (key, i) {
          obj[key] = row[i];
        });
        return obj;
      });

      return jsonResponse_({ status: 'ok', data: rows });
    }

    return jsonResponse_({ status: 'ok', message: 'API de Autoevaluación de Desempeño. Usa ?action=list.' });
  } catch (err) {
    return jsonResponse_({ status: 'error', message: String(err) });
  }
}

/**
 * Serializa un objeto como respuesta JSON.
 */
function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
