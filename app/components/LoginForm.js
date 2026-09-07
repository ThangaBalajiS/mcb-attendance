'use client';
import {useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {Lock, TriangleAlert} from 'lucide-react';

const safeNext=value=>value&&value.startsWith('/')&&!value.startsWith('//')?value:'/roster';

export default function LoginForm(){
 const router=useRouter();
 const params=useSearchParams();
 const [password,setPassword]=useState('');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);

 async function submit(e){
  e.preventDefault();
  if(!password){setError('Enter the password.');return}
  setError('');setBusy(true);
  try{
   const res=await fetch('/api/auth/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({password})
   });
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.error||'Could not sign in.');
   router.replace(safeNext(params.get('next')));
   router.refresh();
  }catch(err){
   setError(err.message);
   setPassword('');
   setBusy(false);
  }
 }

 return <form className="logincard" onSubmit={submit}>
  <div className="loginbrand"><div className="brandmark">M</div><div><b>MCB</b><span>Attendance</span></div></div>
  <h1>Sign in</h1>
  <p>Enter the password to open the attendance system.</p>

  {error&&<div className="loginerror"><TriangleAlert size={15}/>{error}</div>}

  <label>Password
   <input type="password" value={password} autoFocus autoComplete="current-password"
    placeholder="••••••••" onChange={e=>{setPassword(e.target.value);setError('')}}/>
  </label>

  <button type="submit" className="btn primary" disabled={busy}>
   <Lock size={16}/>{busy?'Signing in…':'Sign in'}
  </button>
 </form>;
}
