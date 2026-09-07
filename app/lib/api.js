export async function api(path,options){
 let r;
 try{r=await fetch('/api'+path,{headers:{'Content-Type':'application/json'},...options})}
 catch{throw new Error('Cannot reach the server. Is it still running?')}
 const data=await r.json().catch(()=>null);
 if(!r.ok)throw new Error(data?.error||`Request failed (${r.status})`);
 return data;
}
