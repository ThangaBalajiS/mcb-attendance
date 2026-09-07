import {getDb,noId,fail} from '../../../lib/mongodb';

export const dynamic='force-dynamic';

export async function GET(){
 try{
  const db=await getDb();
  const employees=await db.collection('employees').find({},noId).sort({name:1}).toArray();
  return Response.json(employees);
 }catch(e){return fail(e)}
}

export async function POST(request){
 try{
  const body=await request.json();
  const name=String(body.name||'').trim(), id=String(body.id||'').trim(), salary=Number(body.salary);
  if(!name||!id||!Number.isFinite(salary))return Response.json({error:'Enter employee name, ID and salary.'},{status:400});
  const employee={id,name,salary,active:true};
  const db=await getDb();
  await db.collection('employees').insertOne({...employee});
  return Response.json(employee,{status:201});
 }catch(e){return fail(e)}
}
