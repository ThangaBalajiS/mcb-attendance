'use client';
import {createContext,useCallback,useContext,useMemo,useState} from 'react';
import {Check, X, Info, TriangleAlert} from 'lucide-react';

const ToastCtx=createContext(null);
const ICONS={success:Check,error:TriangleAlert,info:Info};

export function ToastProvider({children}){
 const [items,setItems]=useState([]);
 const dismiss=useCallback(id=>setItems(l=>l.filter(t=>t.id!==id)),[]);
 const push=useCallback((type,message)=>{
  const id=crypto.randomUUID();
  setItems(l=>[...l.slice(-3),{id,type,message}]);
  setTimeout(()=>dismiss(id),type==='error'?6000:3000);
 },[dismiss]);
 const toast=useMemo(()=>({
  success:m=>push('success',m),
  error:m=>push('error',m),
  info:m=>push('info',m)
 }),[push]);

 return <ToastCtx.Provider value={toast}>
  {children}
  <div className="toasts" role="status" aria-live="polite">
   {items.map(t=>{const I=ICONS[t.type]||Info;return (
    <div key={t.id} className={'toast '+t.type}>
     <I size={16} aria-hidden="true"/><span>{t.message}</span>
     <button onClick={()=>dismiss(t.id)} aria-label="Dismiss"><X size={14}/></button>
    </div>)})}
  </div>
 </ToastCtx.Provider>;
}

export const useToast=()=>useContext(ToastCtx);
