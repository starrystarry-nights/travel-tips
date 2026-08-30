// Remove JPEG EXIF/XMP/IPTC/comments without recompressing the image pixels.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
for (const path of process.argv.slice(2)) {
  const input = await readFile(path);
  if (input[0] !== 0xff || input[1] !== 0xd8) throw new Error('Expected JPEG: '+path);
  const meta = await sharp(input).metadata();
  if (meta.orientation && meta.orientation !== 1) throw new Error('Orientation must be preserved explicitly: '+path);
  const parts=[input.subarray(0,2)]; let i=2;
  while(i<input.length) {
    if(input[i]!==0xff) throw new Error('Invalid JPEG marker');
    const marker=input[i+1];
    if(marker===0xda || marker===0xd9) { parts.push(input.subarray(i)); break; }
    const length=input.readUInt16BE(i+2), end=i+2+length;
    if(![0xe1,0xed,0xfe].includes(marker)) parts.push(input.subarray(i,end));
    i=end;
  }
  const output=Buffer.concat(parts);
  const rawHash=async data=>createHash('sha256').update(await sharp(data).raw().toBuffer()).digest('hex');
  if(await rawHash(input)!==await rawHash(output)) throw new Error('Pixel mismatch: '+path);
  const clean=await sharp(output).metadata();
  if(clean.exif||clean.xmp||clean.iptc) throw new Error('Metadata remains: '+path);
  await writeFile(path,output);
  console.log(path+': metadata removed; decoded pixels unchanged');
}
