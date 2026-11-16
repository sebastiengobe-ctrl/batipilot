import { Prisma, PrismaClient } from '@prisma/client';
type DB=PrismaClient|Prisma.TransactionClient;
export async function audit(db:DB,input:{organizationId:string;userId?:string|null;action:string;entity:string;entityId?:string|null;oldValue?:unknown;newValue?:unknown}){
 const metadata=JSON.parse(JSON.stringify({oldValue:input.oldValue??null,newValue:input.newValue??null})) as Prisma.InputJsonValue;
 await db.auditLog.create({data:{organizationId:input.organizationId,userId:input.userId??null,action:input.action,entity:input.entity,entityId:input.entityId??null,metadata}})
}