/** Utilidades puras para la salida de voz de Orión. */
export const ORION_VOICE_GREETING = "Hola, soy Orión. ¿En qué parte de tu juego trabajamos hoy?";

const FEMININE_SPANISH_NAMES = /monica|paulina|elena|helena|luciana|sofia|sara|maria|maría|female|mujer/i;

export function compactVoiceReply(text: string, maxChars = 440): string {
  return text
    .replace(/```[\s\S]*?```/g, "He preparado un ejemplo de código en el chat.")
    .replace(/[`*_>#]/g, "")
    .replace(/\[[^\]]+\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxChars)
    .replace(/\s+[^.!?]*$/, "") || "No he podido preparar una respuesta de voz en este momento.";
}

export function pickFeminineSpanishVoice<T extends { lang: string; name: string }>(voices: T[]): T | null {
  const spanish = voices.filter(voice => /^es(?:-|_)/i.test(voice.lang));
  return spanish.find(voice => FEMININE_SPANISH_NAMES.test(voice.name)) ?? spanish[0] ?? null;
}
