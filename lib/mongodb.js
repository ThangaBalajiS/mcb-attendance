import {MongoClient} from 'mongodb';

const uri=process.env.MONGODB_URI||'mongodb://127.0.0.1:27017';
const dbName=process.env.MONGODB_DB||'mcb_attendance';

export const DEFAULT_SHIFTS=[
 {id:'M',code:'M',name:'Morning',time:'6 AM – 9 AM',value:.5},
 {id:'F',code:'F',name:'Full',time:'9 AM – 6 PM',value:1},
 {id:'E',code:'E',name:'Evening',time:'6 PM – 9 PM',value:.5}
];

const globalCache=globalThis._mcbMongo??(globalThis._mcbMongo={});

function connect(){
 if(!globalCache.client)globalCache.client=new MongoClient(uri,{serverSelectionTimeoutMS:5000}).connect().catch(e=>{globalCache.client=null;throw e});
 return globalCache.client;
}

function ensureIndexes(db){
 if(!globalCache.indexes)globalCache.indexes=Promise.all([
  db.collection('employees').createIndex({id:1},{unique:true}),
  db.collection('shifts').createIndex({id:1},{unique:true}),
  db.collection('attendance').createIndex({id:1},{unique:true}),
  db.collection('attendance').createIndex({date:1,employeeId:1,shiftId:1},{unique:true})
 ]).catch(e=>{globalCache.indexes=null;throw e});
 return globalCache.indexes;
}

export async function getDb(){
 const client=await connect();
 const db=client.db(dbName);
 await ensureIndexes(db);
 return db;
}

export const noId={projection:{_id:0}};

export function fail(e){
 const duplicate=e?.code===11000;
 return Response.json({error:duplicate?'This record already exists.':(e?.message||'Database error')},{status:duplicate?409:500});
}
