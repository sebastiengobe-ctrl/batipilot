import { Role } from '@prisma/client';
export type Action='read'|'create'|'update'|'delete'|'publish'|'validate'|'sign'|'admin';
const matrix:Record<Role,ReadonlySet<Action>>={
 ADMIN:new Set(['read','create','update','delete','publish','validate','sign','admin']),
 PROJECT_MANAGER:new Set(['read','create','update','delete','publish','validate','sign']),
 COLLABORATOR:new Set(['read','create','update']),
 CLIENT:new Set(['read','validate','sign']),
 COMPANY:new Set(['read','create','update','sign'])
};
export function assertAction(role:Role, action:Action){ if(!matrix[role].has(action)) throw new Error('FORBIDDEN'); }
export function can(role:Role,action:Action){return matrix[role].has(action)}