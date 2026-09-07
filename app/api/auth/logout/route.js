import {cookies} from 'next/headers';
import {cookieOptions,SESSION_COOKIE} from '../../../lib/auth';

export const dynamic='force-dynamic';

export async function POST(){
 const jar=await cookies();
 jar.set(SESSION_COOKIE,'',{...cookieOptions,maxAge:0});
 return Response.json({ok:true});
}
