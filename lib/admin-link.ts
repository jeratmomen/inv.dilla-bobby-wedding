export async function equalSecret(a:string,b:string){
 const hash=async(v:string)=>new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)));
 const [x,y]=await Promise.all([hash(a),hash(b)]);let d=0;for(let i=0;i<x.length;i++)d|=x[i]^y[i];return d===0;
}

export async function sessionValue(key:string){
 const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("wedding-admin-session:"+key));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
}

export async function validSession(cookie:string|null,key?:string){
 if(!key||key.length<32)return false;
 const value=(cookie||"").split(";").map(v=>v.trim()).find(v=>v.startsWith("__Host-wedding_admin="))?.slice("__Host-wedding_admin=".length)||"";
 return equalSecret(value,await sessionValue(key));
}

export async function adminAccess(request:Request,key?:string):Promise<Response|null>{
 const url=new URL(request.url);
 const privateHeaders={"Cache-Control":"no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"};

 if(url.pathname==="/dilla-bobby/admin"||url.pathname==="/dilla-bobby/admin/"){
 return new Response(`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard Undangan</title><body><p id="status">Membuka dashboard…</p><script>
 const key=new URLSearchParams(location.hash.slice(1)).get('key');history.replaceState(null,'','/dilla-bobby/admin/');
 if(!key){document.getElementById('status').textContent='Buka link admin rahasia lengkap milikmu.'}
 else fetch('/api/admin-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})}).then(r=>{if(!r.ok)throw Error();location.replace('/dilla-bobby/owner/')}).catch(()=>document.getElementById('status').textContent='Link admin tidak valid atau belum diaktifkan.');
 </script></body></html>`,{headers:{...privateHeaders,"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"}});
 }

 if(url.pathname==="/api/admin-session"||url.pathname==="/api/admin-session/"){
 if(request.method!=="POST"||request.headers.get("origin")!==url.origin)return new Response("Permintaan tidak valid",{status:403,headers:privateHeaders});
 if(!key||key.length<32)return new Response("Atur ADMIN_LINK_KEY (minimal 32 karakter).",{status:503,headers:privateHeaders});
 let supplied="";try{const text=await request.text();if(text.length>2048)throw Error();supplied=JSON.parse(text).key;if(typeof supplied!=="string")throw Error()}catch{return new Response("Permintaan tidak valid",{status:400,headers:privateHeaders})}
 if(!await equalSecret(supplied,key))return new Response("Link tidak valid",{status:403,headers:privateHeaders});
 return Response.json({ok:true},{headers:{...privateHeaders,"Set-Cookie":`__Host-wedding_admin=${await sessionValue(key)}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=604800`}});
 }

 if(
   url.pathname==="/dilla-bobby/owner"||
   url.pathname.startsWith("/dilla-bobby/owner/")||
   url.pathname.startsWith("/api/owner/")
 ){
 if(!await validSession(request.headers.get("cookie"),key))return new Response("Buka dashboard melalui link admin rahasia milikmu.",{status:403,headers:privateHeaders});
 }

 return null;
}
