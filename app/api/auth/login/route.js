import {cookies} from 'next/headers';
import {checkPassword,createSession,cookieOptions,SESSION_COOKIE,SESSION_MAX_AGE} from '../../../lib/auth';

export const dynamic='force-dynamic';

export async function POST(request){
 if(!process.env.APP_PASSWORD)
  return Response.json({error:'No password is configured on the server. Set APP_PASSWORD in .env.local.'},{status:500});

 const body=await request.json().catch(()=>null);
 if(!checkPassword(body?.password))
  return Response.json({error:'Incorrect password.'},{status:401});

 const jar=await cookies();
 jar.set(SESSION_COOKIE,await createSession(),{...cookieOptions,maxAge:SESSION_MAX_AGE});
 return Response.json({ok:true});
}
