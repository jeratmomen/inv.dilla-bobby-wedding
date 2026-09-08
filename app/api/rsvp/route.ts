import {db,failure,UUID} from "@/lib/server";
export async function POST(request:Request){try{
if(request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Permintaan tidak valid."},{status:403});
const raw=await request.text();if(raw.length>12000)return Response.json({error:"Ucapan terlalu panjang."},{status:400});const p=JSON.parse(raw);if(typeof p.name!=="string"||!p.name.trim()||p.name.length>160||!["Hadir","Tidak hadir","Masih ragu"].includes(p.attendance)||typeof p.message!=="string"||p.message.length>2000||typeof p.guestId!=="string")return Response.json({error:"Periksa nama, kehadiran, dan panjang ucapan (maksimal 2.000 karakter)."},{status:400});
let guestId:string|null=null,name=p.name.trim();if(p.guestId){if(!UUID.test(p.guestId))return Response.json({error:"Link undangan tidak valid."},{status:400});const guest=await db().prepare("SELECT id,name FROM guests WHERE id = ?").bind(p.guestId).first<{id:string;name:string}>();if(!guest)return Response.json({error:"Link undangan tidak ditemukan."},{status:400});guestId=guest.id;name=guest.name;}
const ip=request.headers.get("cf-connecting-ip");if(ip){const minute=Math.floor(Date.now()/60000);const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip+":"+minute));const key=Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");const rate=await db().prepare("INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count").bind(key,minute+2).first<{count:number}>();if(rate&&rate.count>15)return Response.json({error:"Terlalu banyak percobaan. Tunggu sebentar lalu coba kembali."},{status:429});await db().prepare("DELETE FROM rate_limits WHERE expires < ?").bind(minute).run();}
const cookie=request.headers.get("cookie")?.split(";").map(s=>s.trim()).find(s=>s.startsWith("wedding_reply="))?.slice(14);const replyId=guestId||(cookie&&UUID.test(cookie)?cookie:crypto.randomUUID());
await db().prepare("INSERT INTO replies (id,guest_id,name,attendance,message,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,attendance=excluded.attendance,message=excluded.message,updated_at=excluded.updated_at").bind(replyId,guestId,name,p.attendance,p.message.trim(),new Date().toISOString()).run();
return Response.json({ok:true},{headers:{"Set-Cookie":`wedding_reply=${replyId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`,"Cache-Control":"no-store"}});
}catch(e){return failure(e)}}

export async function GET(){try{
const messages=await db().prepare("SELECT name,message,updated_at FROM replies WHERE message <> '' ORDER BY updated_at DESC LIMIT 50").all();
const counts=await db().prepare("SELECT attendance,COUNT(*) AS total FROM replies GROUP BY attendance").all<{attendance:string;total:number}>();
const totals:Record<string,number>={};for(const r of counts.results)totals[r.attendance]=r.total;
return Response.json({wishes:messages.results,totals},{headers:{"Cache-Control":"no-store"}});
}catch(e){return failure(e)}}
