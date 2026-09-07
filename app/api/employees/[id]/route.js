import {getDb,noId,fail} from '../../../../lib/mongodb';

export const dynamic='force-dynamic';

export async function PUT(request,{params}){
 try{
  const {id:current}=await params;
  const body=await request.json();
  const name=String(body.name||'').trim(), id=String(body.id||'').trim(), salary=Number(body.salary);
  if(!name||!id||!Number.isFinite(salary))return Response.json({error:'Enter employee name, ID and salary.'},{status:400});
  const db=await getDb();
  const updated=await db.collection('employees').findOneAndUpdate({id:current},{$set:{id,name,salary}},{returnDocument:'after',...noId});
  if(!updated)return Response.json({error:'Employee not found.'},{status:404});
  if(id!==current)await db.collection('attendance').updateMany({employeeId:current},{$set:{employeeId:id}});
  return Response.json(updated);
 }catch(e){return fail(e)}
}

export async function DELETE(request,{params}){
 try{
  const {id}=await params;
  const db=await getDb();
  const {deletedCount}=await db.collection('employees').deleteOne({id});
  if(!deletedCount)return Response.json({error:'Employee not found.'},{status:404});
  return Response.json({id});
 }catch(e){return fail(e)}
}
