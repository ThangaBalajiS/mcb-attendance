'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';

const ConfirmCtx=createContext(null);

export function ConfirmProvider({children}){
 const [req,setReq]=useState(null);
 const acceptRef=useRef(null);
 const confirm=useCallback(opts=>new Promise(resolve=>setReq({...opts,resolve})),[]);

 const close=useCallback(value=>{setReq(r=>{r?.resolve(value);return null})},[]);

 useEffect(()=>{
  if(!req)return;
  acceptRef.current?.focus();
  const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close(false)}};
  window.addEventListener('keydown',onKey);
  return ()=>window.removeEventListener('keydown',onKey);
 },[req,close]);

 return <ConfirmCtx.Provider value={confirm}>
  {children}
  {req&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close(false)}}>
   <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
    <h3 id="confirm-title">{req.title}</h3>
    {req.body&&<p>{req.body}</p>}
    <div className="dialog-actions">
     <button className="btn ghost" onClick={()=>close(false)}>Cancel</button>
     <button ref={acceptRef} className={'btn '+(req.danger?'danger':'primary')} onClick={()=>close(true)}>{req.confirmLabel||'Confirm'}</button>
    </div>
   </div>
  </div>}
 </ConfirmCtx.Provider>;
}

export const useConfirm=()=>useContext(ConfirmCtx);
