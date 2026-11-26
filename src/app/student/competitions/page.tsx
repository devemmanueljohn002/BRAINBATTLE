'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
export default function StudentCompetitions(){const [items,setItems]=useState<any[]>([]),[error,setError]=useState('')
 useEffect(()=>{fetch('/api/competitions').then(async r=>{if(!r.ok)throw new Error('Unable to load competitions');setItems(await r.json())}).catch(e=>setError(e.message))},[])
 return <main className="portal-main"><p className="eyebrow">BRAINBATTLE · STUDENT ARENA</p><h1>Live competitions</h1><p className="mut">Open your assigned contestant screen when your competition is ready.</p>{error&&<p className="err">{error}</p>}{items.length===0?<p className="mut">No competitions have been scheduled yet.</p>:<div className="cards">{items.map(c=><article className="card" key={c.id}><h3>{c.name}</h3><p className="mut">{c.format.replaceAll('_',' ')} · {c.status}</p>{c.status==='LIVE'?<Link href={`/competition/contestant/${c.id}`}>Enter contestant screen →</Link>:<span className="mut">Waiting for competition to go live</span>}</article>)}</div>}</main>
}
