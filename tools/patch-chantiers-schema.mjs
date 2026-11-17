import fs from 'fs';
const f='prisma/schema.prisma';let s=fs.readFileSync(f,'utf8');
if(!/model Project \{[\s\S]*?\bprojectType\s+String/.test(s))s=s.replace('model Project {','model Project {\n  projectType String @default("NEW")');
if(!s.includes('milestoneStatuses ProjectMilestoneStatus[]'))s=s.replace('model Project {','model Project {\n  milestoneStatuses ProjectMilestoneStatus[]');
if(!s.includes('model ProjectMilestoneStatus {'))s+=`\nmodel ProjectMilestoneStatus {\n  id String @id @default(cuid())\n  projectId String\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  key String\n  status String @default("NOT_STARTED")\n  updatedAt DateTime @updatedAt\n  @@unique([projectId, key])\n  @@index([projectId, status])\n}\n`;
fs.writeFileSync(f,s,'utf8');console.log('Prisma schema patched');