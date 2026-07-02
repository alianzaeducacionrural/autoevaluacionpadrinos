/**
 * api.js — Capa de comunicación con el Web App de Google Apps Script.
 * La URL se lee de la variable de entorno `VITE_GAS_API_URL` (ver .env.example).
 */

const API_URL = import.meta.env.VITE_GAS_API_URL

function assertUrl() {
  if (!API_URL) {
    throw new Error(
      'VITE_GAS_API_URL no está configurada. Crea un archivo .env con la URL del Web App de Apps Script.',
    )
  }
}

// Escapa caracteres no-ASCII como \uXXXX para que el cuerpo del POST sea ASCII
// puro y no haya ambigüedad de codificación al llegar a Apps Script.
function safeJSON(data) {
  return JSON.stringify(data).replace(
    /[^\x00-\x7F]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`,
  )
}

/**
 * Envía una autoevaluación al Apps Script (doPost).
 * Usa Content-Type "text/plain" a propósito: evita el preflight OPTIONS de
 * CORS, que Apps Script no puede responder. El cuerpo sigue siendo JSON.
 */
export async function enviarAutoevaluacion(data) {
  assertUrl()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: safeJSON(data),
    redirect: 'follow',
  })
  if (!res.ok) {
    throw new Error(`Error de red al enviar (HTTP ${res.status}).`)
  }
  const json = await res.json()
  if (json.status !== 'ok') {
    throw new Error(json.message || 'El servidor rechazó el envío.')
  }
  return json
}

/**
 * Trae todas las respuestas registradas (doGet?action=list).
 * Devuelve un array de objetos con las llaves de `sheetHeaders`.
 */
export async function listarRespuestas() {
  assertUrl()
  const res = await fetch(`${API_URL}?action=list`, { redirect: 'follow' })
  if (!res.ok) {
    throw new Error(`Error de red al cargar (HTTP ${res.status}).`)
  }
  const json = await res.json()
  if (json.status !== 'ok') {
    throw new Error(json.message || 'El servidor devolvió un error.')
  }
  return json.data
}
