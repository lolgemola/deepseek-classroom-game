import { database } from '@/lib/raw-db';
import { calculate, rounds } from '@/lib/game';
const json=(x:any,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
const fail=(message:string,status=400)=>json({error:message},status);
const token=()=>crypto.randomUUID();
export async function GET(req:Request) { try {
 const u=new URL(req.url), code=(u.searchParams.get('room')||'').toUpperCase(); const db=database();
 const room:any=await db.prepare('SELECT * FROM rooms WHERE code = ?').bind(code).first(); if(!room)return fail('Room not found. Check your code.',404);
 const isHost=u.searchParams.get('host')===room.host;
 const people=(await db.prepare('SELECT id,name,token FROM players WHERE room = ?').bind(code).all()).results as any[];
 const picks=(await db.prepare('SELECT player,round,option FROM choices WHERE room = ?').bind(code).all()).results as any[];
 const events=JSON.parse(room.events); const through=room.phase==='choosing'?room.round-1:room.phase==='lobby'?-1:room.round;
 const board=people.map(p=>{const own=Object.fromEntries(picks.filter(c=>c.player===p.id).map(c=>[c.round,c.option]));return {id:p.id,name:p.name,...calculate(own,events,through)}}).sort((a,b)=>b.score-a.score||b.cash-a.cash||a.name.localeCompare(b.name));
 const me=people.find(p=>p.token===u.searchParams.get('player')); const current=picks.find(c=>c.player===me?.id&&c.round===room.round);
 return json({room:code,phase:room.phase,round:room.round,version:room.version,host:isHost,players:board,submitted:picks.filter(c=>c.round===room.round).length,me:me?{...board.find(p=>p.id===me.id),choice:current?.option}:null,event:through===room.round&&through>=0?rounds[room.round].events[events[room.round]]:null});
 }catch(e){console.error(e);return fail('Game connection unavailable. Please retry.',503)} }
export async function POST(req:Request) {try {
 const b:any=await req.json(); const db=database();
 if(b.action==='create') {const host=token();const code=crypto.randomUUID().replaceAll('-','').slice(0,6).toUpperCase();const events=rounds.map(()=>crypto.getRandomValues(new Uint8Array(1))[0]%2);
 await db.prepare('INSERT INTO rooms (code,host,phase,round,version,events,created) VALUES (?,?,?,?,?,?,?)').bind(code,host,'lobby',0,0,JSON.stringify(events),Date.now()).run();return json({room:code,host});}
 const code=String(b.room||'').toUpperCase();const room:any=await db.prepare('SELECT * FROM rooms WHERE code = ?').bind(code).first();if(!room)return fail('Room not found.',404);
 if(b.action==='join') {if(room.phase!=='lobby')return fail('This game has started. Ask your presenter for the next room.');const name=String(b.name||'').trim().slice(0,24);if(!name)return fail('Enter a company name.');const id=token(),secret=token();
 const result=await db.prepare("INSERT INTO players (id,room,name,token) SELECT ?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE code=? AND phase='lobby')").bind(id,code,name,secret,code).run();if(!result.meta.changes)return fail('The game just started.');return json({player:secret});}
 if(b.action==='choose') {const p:any=await db.prepare('SELECT id FROM players WHERE room=? AND token=?').bind(code,b.player).first();if(!p)return fail('Please rejoin the room.',403);if(!Number.isInteger(b.option)||b.option<0||b.option>2)return fail('Invalid choice.');if(b.round!==room.round||room.phase!=='choosing')return fail('Choices are closed for this round.');
 const picks=(await db.prepare('SELECT round,option FROM choices WHERE room=? AND player=?').bind(code,p.id).all()).results as any[];if(calculate(Object.fromEntries(picks.map(c=>[c.round,c.option])),JSON.parse(room.events),room.round-1).failed)return fail('Your company is out of cash.');
 const result=await db.prepare("INSERT OR IGNORE INTO choices (room,player,round,option) SELECT ?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE code=? AND phase='choosing' AND round=?)").bind(code,p.id,room.round,b.option,code,room.round).run();if(!result.meta.changes)return fail('Your choice is already locked, or the round has closed.');return json({ok:true});}
 if(b.action==='advance') {if(b.host!==room.host)return fail('Presenter access required.',403);let phase=room.phase,round=room.round;if(phase==='lobby')phase='choosing';else if(phase==='choosing')phase='reveal';else if(phase==='reveal'){if(round===3)phase='finished';else {round++;phase='choosing';}}else return fail('This game is finished.');
 const result=await db.prepare('UPDATE rooms SET phase=?,round=?,version=version+1 WHERE code=? AND version=?').bind(phase,round,code,b.version).run();if(!result.meta.changes)return fail('The room changed. Refresh and retry.',409);return json({ok:true});}
 return fail('Unknown action.');
 }catch(e){console.error(e);return fail('Could not save. Please retry.',503)}}
