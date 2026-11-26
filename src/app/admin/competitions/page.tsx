'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Competition = {id:string;name:string;format:string;status:string;contestantCount:number}
export default function CompetitionsPage(){
 const [items,setItems]=useState<Competition[]>([]),[name,setName]=useState(''),[format,setFormat]=useState('INTER_CLASS'),[message,setMessage]=useState(''),[busy,setBusy]=useState(false)
 async function load(){const r=await fetch('/api/competitions');if(r.ok)setItems(await r.json())}
 useEffect(()=>{load()},[])
 async function create(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{const r=await fetch('/api/competitions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,format})});const d=await r.json();if(!r.ok)throw new Error(d.error||d.detail||'Could not create competition');setName('');setMessage('Competition created. Open it to configure rounds and contestants.');await load()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 return <main className="portal-main"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}><div><p className="eyebrow">LIVE CHAMPIONSHIP</p><h1>Competitions</h1><p className="mut">Create and manage live school quiz competitions.</p></div><Link className="sec" href="/admin">← Dashboard</Link></div>
 <form className="card" onSubmit={create} style={{maxWidth:720,margin:'24px 0'}}><h3>Create competition</h3><div className="row"><input required minLength={3} placeholder="Competition name" value={name} onChange={e=>setName(e.target.value)} style={{flex:1,minWidth:220}}/><select value={format} onChange={e=>setFormat(e.target.value)}><option value="INTER_CLASS">Inter-class</option><option value="INDIVIDUAL">Individual</option><option value="HEAD_TO_HEAD">Head-to-head</option><option value="MULTI_CONTESTANT">Multi-contestant</option></select><button disabled={busy}>{busy?'Creating…':'Create'}</button></div>{message&&<p className="mut">{message}</p>}</form>
 <h2>Competition register</h2>{items.length===0?<p className="mut">No competitions created yet.</p>:<div className="card" style={{overflowX:'auto'}}><table><thead><tr><th>Competition</th><th>Format</th><th>Status</th><th>Contestants</th><th>Manage</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><b>{x.name}</b></td><td>{x.format.replaceAll('_',' ')}</td><td>{x.status}</td><td>{x.contestantCount}</td><td><Link href={`/admin/competitions/${x.id}`}>Open setup →</Link> · <Link href={`/control-room/${x.id}`}>Control room</Link> · <Link href={`/display/${x.id}`}>Display</Link></td></tr>)}</tbody></table></div>}</main>
}
