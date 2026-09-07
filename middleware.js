import {NextResponse} from 'next/server';
import {verifySession,SESSION_COOKIE} from './app/lib/auth';

export async function middleware(request){
 const {pathname}=request.nextUrl;

 if(pathname.startsWith('/api/auth/'))return NextResponse.next();

 const signedIn=await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

 if(signedIn){
  if(pathname==='/login'){
   const url=request.nextUrl.clone();
   url.pathname='/roster';
   url.search='';
   return NextResponse.redirect(url);
  }
  return NextResponse.next();
 }

 if(pathname.startsWith('/api/'))return NextResponse.json({error:'Your session has expired. Please sign in again.'},{status:401});
 if(pathname==='/login')return NextResponse.next();

 const url=request.nextUrl.clone();
 url.pathname='/login';
 url.search='';
 if(pathname!=='/')url.searchParams.set('next',pathname);
 return NextResponse.redirect(url);
}

export const config={
 matcher:['/((?!_next/static|_next/image|favicon.ico).*)']
};
