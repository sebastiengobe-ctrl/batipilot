'use client';
import {useState} from 'react';
export default function CalculatorWorkspace(){
 const [key,setKey]=useState(0);
 return <section className="calculatorShell">
  <header className="calculatorHeader"><div><small>Outil métier intégré</small><h2>Calculatrice travaux & estimation</h2><p>Programme, matériaux, relevé, bibliothèque de prix et estimation complète.</p></div><div><button onClick={()=>setKey(x=>x+1)}>Recharger</button><a href="/calculatrice-dg-construction.html" target="_blank" rel="noreferrer">Ouvrir plein écran</a></div></header>
  <iframe key={key} className="calculatorFrame" src="/calculatrice-dg-construction.html" title="Calculatrice DG Construction" />
 </section>
}