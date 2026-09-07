'use client';
import {useState} from 'react';
import {Users, Clock3, Pencil, Trash2, Plus, Check, X} from 'lucide-react';
import {useToast} from './Toasts';
import {useConfirm} from './Confirm';
import {useStoreContext} from '../lib/StoreProvider';
import {money} from '../lib/format';

const EMPTY_EMP={name:'',id:'',salary:''};
const EMPTY_SHIFT={code:'',name:'',time:'',value:''};

export default function Settings(){
 const store=useStoreContext();
 const {employees,shifts}=store;
 const toast=useToast();
 const confirm=useConfirm();
 const [empForm,setEmpForm]=useState(EMPTY_EMP);
 const [editEmp,setEditEmp]=useState(null);
 const [empErr,setEmpErr]=useState({});
 const [shiftForm,setShiftForm]=useState(EMPTY_SHIFT);
 const [editShift,setEditShift]=useState(null);
 const [shiftErr,setShiftErr]=useState({});

 function resetEmp(){setEmpForm(EMPTY_EMP);setEditEmp(null);setEmpErr({})}
 function resetShift(){setShiftForm(EMPTY_SHIFT);setEditShift(null);setShiftErr({})}

 async function submitEmp(e){
  e.preventDefault();
  const name=empForm.name.trim(),id=empForm.id.trim(),salary=Number(empForm.salary);
  const errs={};
  if(!name)errs.name='Name is required.';
  if(!id)errs.id='ID is required.';
  else if(employees.some(x=>x.id===id&&x.id!==editEmp))errs.id='This ID is already in use.';
  if(empForm.salary===''||!Number.isFinite(salary)||salary<0)errs.salary='Enter a valid daily salary.';
  setEmpErr(errs);
  if(Object.keys(errs).length)return;
  try{
   await store.saveEmployee({name,id,salary},editEmp);
   toast.success(editEmp?`${name} updated.`:`${name} added.`);
   resetEmp();
  }catch(err){toast.error(err.message)}
 }

 async function removeEmp(emp){
  const ok=await confirm({title:`Delete ${emp.name}?`,body:'Their past attendance records stay in the database and will still appear in reports.',confirmLabel:'Delete',danger:true});
  if(!ok)return;
  try{await store.deleteEmployee(emp.id);if(editEmp===emp.id)resetEmp();toast.success(`${emp.name} deleted.`)}
  catch(err){toast.error(err.message)}
 }

 async function submitShift(e){
  e.preventDefault();
  const code=shiftForm.code.trim().toUpperCase(),name=shiftForm.name.trim(),time=shiftForm.time.trim(),value=Number(shiftForm.value);
  const errs={};
  if(!code)errs.code='Required.';
  if(!name)errs.name='Required.';
  if(!time)errs.time='Required.';
  if(shiftForm.value===''||!Number.isFinite(value)||value<0)errs.value='Enter a value.';
  setShiftErr(errs);
  if(Object.keys(errs).length)return;
  try{
   await store.saveShift({code,name,time,value},editShift);
   toast.success(editShift?`${code} shift updated.`:`${code} shift added.`);
   resetShift();
  }catch(err){toast.error(err.message)}
 }

 async function removeShift(s){
  const ok=await confirm({title:`Delete the ${s.code} shift?`,body:'Attendance already logged against this shift will no longer be counted in reports.',confirmLabel:'Delete',danger:true});
  if(!ok)return;
  try{await store.deleteShift(s.id);if(editShift===s.id)resetShift();toast.success(`${s.code} shift deleted.`)}
  catch(err){toast.error(err.message)}
 }

 const savingEmp=store.isBusy('emp:save'),savingShift=store.isBusy('shift:save');

 return <div className="settings">
  <div className="card">
   <div className="tablehead"><div>
    <h2><Users size={19}/> Employees</h2>
    <span>{employees.length?`${employees.length} on the roster`:'Add your team to get started'}</span>
   </div></div>

   <form className="formgrid" onSubmit={submitEmp} noValidate>
    <label className={empErr.name?'bad':''}>Name
     <input value={empForm.name} placeholder="e.g. Balaji" onChange={e=>setEmpForm({...empForm,name:e.target.value})}/>
     {empErr.name&&<small>{empErr.name}</small>}</label>
    <label className={empErr.id?'bad':''}>Employee ID
     <input value={empForm.id} placeholder="e.g. 1" onChange={e=>setEmpForm({...empForm,id:e.target.value})}/>
     {empErr.id&&<small>{empErr.id}</small>}</label>
    <label className={empErr.salary?'bad':''}>Salary per day
     <input type="number" min="0" step="1" value={empForm.salary} placeholder="e.g. 1000" onChange={e=>setEmpForm({...empForm,salary:e.target.value})}/>
     {empErr.salary&&<small>{empErr.salary}</small>}</label>
    <div className="formactions">
     <button type="submit" className="btn primary" disabled={savingEmp}>
      {editEmp?<Check size={16}/>:<Plus size={16}/>}{savingEmp?'Saving…':editEmp?'Update':'Add'}</button>
     {editEmp&&<button type="button" className="btn ghost" onClick={resetEmp}><X size={16}/>Cancel</button>}
    </div>
   </form>

   {employees.length?<div className="settingslist">
    {employees.map(e=><div key={e.id} className={editEmp===e.id?'editing':''}>
     <div><b>{e.name}</b><span>{e.id} · {money(e.salary)}/day</span></div>
     <div className="rowactions">
      <button onClick={()=>{setEditEmp(e.id);setEmpErr({});setEmpForm({name:e.name,id:e.id,salary:String(e.salary)})}} aria-label={`Edit ${e.name}`}><Pencil size={15}/></button>
      <button className="danger" onClick={()=>removeEmp(e)} disabled={store.isBusy('emp:del:'+e.id)} aria-label={`Delete ${e.name}`}><Trash2 size={15}/></button>
     </div>
    </div>)}
   </div>:<p className="empty">No employees yet.</p>}
  </div>

  <div className="card">
   <div className="tablehead"><div>
    <h2><Clock3 size={19}/> Shifts</h2>
    <span>Value is the fraction of a day’s salary each shift earns.</span>
   </div></div>

   <form className="formgrid shiftform" onSubmit={submitShift} noValidate>
    <label className={shiftErr.code?'bad':''}>Code
     <input value={shiftForm.code} placeholder="M" onChange={e=>setShiftForm({...shiftForm,code:e.target.value})}/>
     {shiftErr.code&&<small>{shiftErr.code}</small>}</label>
    <label className={shiftErr.name?'bad':''}>Name
     <input value={shiftForm.name} placeholder="Morning" onChange={e=>setShiftForm({...shiftForm,name:e.target.value})}/>
     {shiftErr.name&&<small>{shiftErr.name}</small>}</label>
    <label className={shiftErr.time?'bad':''}>Timing
     <input value={shiftForm.time} placeholder="6 AM – 9 AM" onChange={e=>setShiftForm({...shiftForm,time:e.target.value})}/>
     {shiftErr.time&&<small>{shiftErr.time}</small>}</label>
    <label className={shiftErr.value?'bad':''}>Value
     <input type="number" min="0" step="0.5" value={shiftForm.value} placeholder="0.5" onChange={e=>setShiftForm({...shiftForm,value:e.target.value})}/>
     {shiftErr.value&&<small>{shiftErr.value}</small>}</label>
    <div className="formactions">
     <button type="submit" className="btn primary" disabled={savingShift}>
      {editShift?<Check size={16}/>:<Plus size={16}/>}{savingShift?'Saving…':editShift?'Update':'Add'}</button>
     {editShift&&<button type="button" className="btn ghost" onClick={resetShift}><X size={16}/>Cancel</button>}
    </div>
   </form>

   {shifts.length?<div className="shiftcards">
    {shifts.map(s=><div key={s.id} className={editShift===s.id?'editing':''}>
     <div className="shiftcode">{s.code}</div>
     <div><b>{s.name}</b><span>{s.time}</span><small>Value {s.value}</small></div>
     <div className="rowactions">
      <button onClick={()=>{setEditShift(s.id);setShiftErr({});setShiftForm({code:s.code,name:s.name,time:s.time,value:String(s.value)})}} aria-label={`Edit ${s.code} shift`}><Pencil size={15}/></button>
      <button className="danger" onClick={()=>removeShift(s)} disabled={store.isBusy('shift:del:'+s.id)} aria-label={`Delete ${s.code} shift`}><Trash2 size={15}/></button>
     </div>
    </div>)}
   </div>:<p className="empty">No shifts yet.</p>}
  </div>
 </div>;
}
