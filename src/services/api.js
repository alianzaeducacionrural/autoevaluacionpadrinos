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
    body: JSON.stringify(data),
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
