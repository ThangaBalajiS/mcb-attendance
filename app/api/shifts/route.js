import {getDb,noId,fail,DEFAULT_SHIFTS} from '../../../lib/mongodb';

export const dynamic='force-dynamic';

export async function GET(){
 try{
  const db=await getDb();
  const shifts=db.collection('shifts');
  if(await shifts.countDocuments({},{limit:1})===0)await shifts.insertMany(DEFAULT_SHIFTS.map(s=>({...s}))).catch(e=>{if(e?.code!==11000)throw e});
  return Response.json(await shifts.find({},noId).toArray());
 }catch(e){return fail(e)}
}

export async function POST(request){
 try{
  const body=await request.json();
  const code=String(body.code||'').trim().toUpperCase(), name=String(body.name||'').trim(), time=String(body.time||'').trim(), value=Number(body.value);
  if(!code||!name||!time||!Number.isFinite(value))return Response.json({error:'Complete shift details.'},{status:400});
  const shift={id:crypto.randomUUID(),code,name,time,value};
  const db=await getDb();
  await db.collection('shifts').insertOne({...shift});
  return Response.json(shift,{status:201});
 }catch(e){return fail(e)}
}
