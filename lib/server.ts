import {validSession} from "./admin-link";
import {env} from "cloudflare:workers";
import {headers} from "next/headers";
export function db(){if(!env.DB)throw new Error("Database unavailable");return env.DB;}
export async function isOwner(){return validSession((await headers()).get("cookie"),(env as unknown as {ADMIN_LINK_KEY?:string}).ADMIN_LINK_KEY);}
export async function guard(request:Request){if(request.method!=="GET"&&request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Permintaan tidak valid."},{status:403});if(!await isOwner())return Response.json({error:"Akses hanya untuk pemilik undangan."},{status:403});return null;}
export function failure(e:unknown){console.error("Wedding request failed",e instanceof Error?e.message:"Unknown error");return Response.json({error:"Data belum dapat dimuat atau disimpan. Silakan coba lagi."},{status:503});}
export function guestLink(name:string,id:string){const u=new URL((env as unknown as {SITE_ORIGIN:string}).SITE_ORIGIN);u.searchParams.set("to",name);return u.toString();}
export const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
