// Wystarczające polyfille dla fetch API, bez WebSockets
import { decode, encode } from "base64-arraybuffer";
import { TextDecoder, TextEncoder } from "text-encoding";

// Definicja globalnych funkcji
if (typeof global.btoa === "undefined") {
  global.btoa = (input) => {
    const buffer =
      typeof input === "string" ? new Buffer(input, "binary") : input;
    return buffer.toString("base64");
  };
}

if (typeof global.atob === "undefined") {
  global.atob = (input) => {
    return new Buffer(input, "base64").toString("binary");
  };
}

// Ustaw TextEncoder/TextDecoder
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// Dodaj funkcje kodowania/dekodowania base64 do arraybuffer
global.arrayBufferToBase64 = encode;
global.base64ToArrayBuffer = decode;

// Prosty mock dla crypto.getRandomValues, wymagany przez niektóre aplikacje
global.crypto = global.crypto || {};
global.crypto.getRandomValues =
  global.crypto.getRandomValues ||
  function (arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
