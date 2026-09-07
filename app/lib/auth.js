const enc=new TextEncoder();

export const SESSION_COOKIE='mcb_session';
export const SESSION_MAX_AGE=60*60*12;

const secret=()=>process.env.AUTH_SECRET||process.env.APP_PASSWORD||'';

const b64url=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

async function sign(payload){
 const key=await crypto.subtle.importKey('raw',enc.encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return b64url(await crypto.subtle.sign('HMAC',key,enc.encode(payload)));
}

function timingSafeEqual(a,b){
 if(a.length!==b.length)return false;
 let diff=0;
 for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
 return diff===0;
}

export async function createSession(){
 const expires=String(Date.now()+SESSION_MAX_AGE*1000);
 return `${expires}.${await sign(expires)}`;
}

export async function verifySession(token){
 if(!token||!secret())return false;
 const dot=token.indexOf('.');
 if(dot<1)return false;
 const payload=token.slice(0,dot),signature=token.slice(dot+1);
 if(!timingSafeEqual(signature,await sign(payload)))return false;
 const expires=Number(payload);
 return Number.isFinite(expires)&&expires>Date.now();
}

export function checkPassword(input){
 const expected=process.env.APP_PASSWORD||'';
 if(!expected)return false;
 return timingSafeEqual(String(input??''),expected);
}

export const cookieOptions={
 httpOnly:true,
 sameSite:'lax',
 path:'/',
 secure:process.env.NODE_ENV==='production'
};
