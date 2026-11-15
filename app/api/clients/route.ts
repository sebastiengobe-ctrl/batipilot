import {db} from '@/lib/db';import {requireUser,fail} from '@/lib/auth';
export async function GET(){try{const u=await requireUser();return Response.json(await db.client.findMany({where:{organizationId:u.organizationId},orderBy:{name:'asc'}}))}catch(e){return fail(e)}}
export async function POST(req:Request){try{const u=await requireUser(),b=await req.json();return Response.json(await db.client.create({data:{name:b.name,email:b.email||null,phone:b.phone||null,address:b.address||null,organizationId:u.organizationId}}),{status:201})}catch(e){return fail(e)}}
