'use client';
import {useCallback,useEffect,useState} from 'react';
import {api} from './api';

export function useStore(){
 const [employees,setEmployees]=useState([]);
 const [shifts,setShifts]=useState([]);
 const [attendance,setAttendance]=useState([]);
 const [ready,setReady]=useState(false);
 const [dbError,setDbError]=useState('');
 const [busy,setBusy]=useState(()=>new Set());

 const reload=useCallback(async()=>{
  try{
   const [e,s,a]=await Promise.all([api('/employees'),api('/shifts'),api('/attendance')]);
   setEmployees(e);setShifts(s);setAttendance(a);setDbError('');
  }catch(err){setDbError(err.message)}
  finally{setReady(true)}
 },[]);
 useEffect(()=>{reload()},[reload]);

 const run=useCallback(async(key,fn)=>{
  setBusy(s=>new Set(s).add(key));
  try{return await fn()}
  finally{setBusy(s=>{const n=new Set(s);n.delete(key);return n})}
 },[]);
 const isBusy=useCallback(k=>busy.has(k),[busy]);

 const toggleAttendance=useCallback((date,employeeId,shiftId)=>{
  const key=`att:${date}:${employeeId}:${shiftId}`;
  if(busy.has(key))return Promise.resolve();
  return run(key,async()=>{
   const existing=attendance.find(a=>a.date===date&&a.employeeId===employeeId&&a.shiftId===shiftId);
   if(existing){
    await api('/attendance/'+existing.id,{method:'DELETE'});
    setAttendance(l=>l.filter(a=>a.id!==existing.id));
    return {removed:true};
   }
   const row=await api('/attendance',{method:'POST',body:JSON.stringify({date,employeeId,shiftId})});
   setAttendance(l=>[...l,row]);
   return {removed:false};
  });
 },[attendance,busy,run]);

 const saveEmployee=useCallback((payload,editingId)=>run('emp:save',async()=>{
  if(editingId){
   const updated=await api('/employees/'+encodeURIComponent(editingId),{method:'PUT',body:JSON.stringify(payload)});
   setEmployees(l=>l.map(e=>e.id===editingId?updated:e).sort((a,b)=>a.name.localeCompare(b.name)));
   if(updated.id!==editingId)setAttendance(l=>l.map(a=>a.employeeId===editingId?{...a,employeeId:updated.id}:a));
   return updated;
  }
  const created=await api('/employees',{method:'POST',body:JSON.stringify(payload)});
  setEmployees(l=>[...l,created].sort((a,b)=>a.name.localeCompare(b.name)));
  return created;
 }),[run]);

 const deleteEmployee=useCallback(id=>run('emp:del:'+id,async()=>{
  await api('/employees/'+encodeURIComponent(id),{method:'DELETE'});
  setEmployees(l=>l.filter(e=>e.id!==id));
 }),[run]);

 const saveShift=useCallback((payload,editingId)=>run('shift:save',async()=>{
  if(editingId){
   const updated=await api('/shifts/'+encodeURIComponent(editingId),{method:'PUT',body:JSON.stringify(payload)});
   setShifts(l=>l.map(s=>s.id===editingId?updated:s));
   return updated;
  }
  const created=await api('/shifts',{method:'POST',body:JSON.stringify(payload)});
  setShifts(l=>[...l,created]);
  return created;
 }),[run]);

 const deleteShift=useCallback(id=>run('shift:del:'+id,async()=>{
  await api('/shifts/'+encodeURIComponent(id),{method:'DELETE'});
  setShifts(l=>l.filter(s=>s.id!==id));
 }),[run]);

 return {employees,shifts,attendance,ready,dbError,isBusy,reload,
  toggleAttendance,saveEmployee,deleteEmployee,saveShift,deleteShift};
}
