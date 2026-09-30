import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

function png(size, pad = 0) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const radius = size * (pad ? 0.22 : 0.28);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const index = row + 1 + x * 4;
      const margin = pad ? size * 0.12 : 0;
      const insideMargin = x > margin && y > margin && x < size - margin && y < size - margin;
      const cx = x - size / 2;
      const cy = y - size / 2;
      const dot = cx * cx + cy * cy < radius * radius;
      const green = insideMargin || !pad;
      raw[index] = dot ? 255 : green ? 47 : 255;
      raw[index + 1] = dot ? 255 : green ? 125 : 253;
      raw[index + 2] = dot ? 255 : green ? 50 : 245;
      raw[index + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const dir = path.resolve("public/icons");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "icon-192.png"), png(192));
fs.writeFileSync(path.join(dir, "icon-512.png"), png(512));
fs.writeFileSync(path.join(dir, "icon-maskable-512.png"), png(512, 1));
fs.writeFileSync(path.join(dir, "apple-touch-icon.png"), png(180));
console.log("icons written");
