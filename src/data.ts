import raw from './generated/data.json';
import { validateAll, contentSchema, architectureSchema } from './schema.mjs';
import type { z } from 'zod';
const validated=validateAll(raw.content,raw.architectures);
export const content=validated.content as z.infer<typeof contentSchema>;
export const architectures=validated.architectures as z.infer<typeof architectureSchema>[];
export const layouts=raw.layouts as Record<string,{nodes:Record<string,{x:number;y:number;width:number;height:number}>;edges:Record<string,{points:{x:number;y:number}[];labelX:number;labelY:number}>;bounds:{width:number;height:number}}>;
export const architectureFor=(projectId:string)=>architectures.find(a=>a.projectId===projectId);
