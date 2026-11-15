import {db} from '@/lib/db';import {requireUser,fail} from '@/lib/auth';
export async function GET(){try{const u=await requireUser();return Response.json(await db.company.findMany({where:{organizationId:u.organizationId},orderBy:{name:'asc'}}))}catch(e){return fail(e)}}
export async function POST(req:Request){try{const u=await requireUser(),b=await req.json();return Response.json(await db.company.create({data:{name:b.name,trade:b.trade||null,email:b.email||null,phone:b.phone||null,organizationId:u.organizationId}}),{status:201})}catch(e){return fail(e)}}
