import {getDb,noId,fail} from '../../../../lib/mongodb';

export const dynamic='force-dynamic';

export async function PUT(request,{params}){
 try{
  const {id}=await params;
  const body=await request.json();
  const code=String(body.code||'').trim().toUpperCase(), name=String(body.name||'').trim(), time=String(body.time||'').trim(), value=Number(body.value);
  if(!code||!name||!time||!Number.isFinite(value))return Response.json({error:'Complete shift details.'},{status:400});
  const db=await getDb();
  const updated=await db.collection('shifts').findOneAndUpdate({id},{$set:{code,name,time,value}},{returnDocument:'after',...noId});
  if(!updated)return Response.json({error:'Shift not found.'},{status:404});
  return Response.json(updated);
 }catch(e){return fail(e)}
}

export async function DELETE(request,{params}){
 try{
  const {id}=await params;
  const db=await getDb();
  const {deletedCount}=await db.collection('shifts').deleteOne({id});
  if(!deletedCount)return Response.json({error:'Shift not found.'},{status:404});
  return Response.json({id});
 }catch(e){return fail(e)}
}
