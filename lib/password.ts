import {randomBytes,scrypt as scryptCb,timingSafeEqual} from 'crypto';import {promisify} from 'util';const scrypt=promisify(scryptCb);
export async function hashPassword(p:string){const s=randomBytes(16);const k=await scrypt(p,s,64) as Buffer;return `scrypt$${s.toString('hex')}$${k.toString('hex')}`}
export async function verifyPassword(p:string,h:string){const [a,s,k]=h.split('$');if(a!=='scrypt'||!s||!k)return false;const x=await scrypt(p,Buffer.from(s,'hex'),64) as Buffer,e=Buffer.from(k,'hex');return x.length===e.length&&timingSafeEqual(x,e)}
