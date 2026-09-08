import {env} from "cloudflare:workers";
import {headers} from "next/headers";
export function db(){if(!env.DB)throw new Error("Database unavailable");return env.DB;}
export async function isOwner(){
 const config=env as unknown as {OWNER_USERNAME?:string;OWNER_PASSWORD?:string};
 if(!config.OWNER_USERNAME||!config.OWNER_PASSWORD)return false;
 const authorization=(await headers()).get("authorization")||"";
 if(!authorization.startsWith("Basic "))return false;
 let supplied:string;try{supplied=atob(authorization.slice(6))}catch{return false}
 const digest=async(value:string)=>new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)));
 const [a,b]=await Promise.all([digest(supplied),digest(config.OWNER_USERNAME+":"+config.OWNER_PASSWORD)]);
 let different=0;for(let i=0;i<a.length;i++)different|=a[i]^b[i];return different===0;
}
export async function guard(request:Request){if(request.method!=="GET"&&request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Permintaan tidak valid."},{status:403});if(!await isOwner())return Response.json({error:"Akses hanya untuk pemilik undangan."},{status:403});return null;}
export function failure(e:unknown){console.error("Wedding request failed",e instanceof Error?e.message:"Unknown error");return Response.json({error:"Data belum dapat dimuat atau disimpan. Silakan coba lagi."},{status:503});}
export function guestLink(name:string,id:string){const u=new URL((env as unknown as {SITE_ORIGIN:string}).SITE_ORIGIN);u.searchParams.set("to",name);u.searchParams.set("id",id);return u.toString();}
export const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
