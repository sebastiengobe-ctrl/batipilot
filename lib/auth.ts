import {cookies} from 'next/headers';import {createHash,randomBytes} from 'crypto';import {db} from './db';
const COOKIE='batipilot_session',hash=(v:string)=>createHash('sha256').update(v).digest('hex');
export async function currentUser(){const t=(await cookies()).get(COOKIE)?.value;if(!t)return null;const s=await db.session.findUnique({where:{tokenHash:hash(t)},include:{user:true}});return !s||s.expiresAt<new Date()||s.user.status!=='ACTIVE'?null:s.user}
export async function requireUser(){const u=await currentUser();if(!u)throw new Error('UNAUTHORIZED');return u}
export async function createSession(userId:string){const t=randomBytes(32).toString('base64url');const expiresAt=new Date(Date.now()+Number(process.env.SESSION_TTL_HOURS||8)*3600000);await db.session.create({data:{tokenHash:hash(t),userId,expiresAt}});(await cookies()).set(COOKIE,t,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires:expiresAt})}
export async function clearSession(){const c=await cookies(),t=c.get(COOKIE)?.value;if(t)await db.session.deleteMany({where:{tokenHash:hash(t)}});c.set(COOKIE,'',{path:'/',maxAge:0})}
export function fail(e:unknown){const m=e instanceof Error?e.message:'ERROR';return Response.json({error:m},{status:m==='UNAUTHORIZED'?401:m==='FORBIDDEN'?403:500})}
