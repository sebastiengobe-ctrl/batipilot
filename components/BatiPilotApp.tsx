'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { modules } from '@/lib/modules';
import ProjectWorkspace from './ProjectWorkspace';
import TeamPlanningWorkspace from './TeamPlanningWorkspace';

type Any = Record<string, any>;
type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'COLLABORATOR' | 'CLIENT' | 'COMPANY';

const endpoints: Record<string, string> = {
  projects: 'projects',
  tasks: 'tasks',
  clients: 'clients',
  companies: 'companies',
  gantt: 'planning',
  site: 'observations',
  documents: 'documents',
  signatures: 'signatures',
  finance: 'budgets',
  reception: 'receptions',
  admin: 'users',
};

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  if (response.status === 401) {
    location.href = '/login';
    throw new Error('Session expirée');
  }
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Erreur API');
  return body;
}

const send = (url: string, method: string, body: Any) =>
  request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

export default function App() {
  const [user, setUser] = useState<Any | null>(null);
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState<Record<string, Any>>({});
  const [modal, setModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openProject, setOpenProject] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const me = await request('/api/me');
      setUser(me.user);
      const entries = await Promise.all(
        Object.entries(endpoints).map(async ([key, endpoint]) => [
          key,
          await request('/api/' + endpoint).catch(() => []),
        ]),
      );
      const dashboard = await request('/api/dashboard').catch(() => ({}));
      setData({ ...Object.fromEntries(entries), dashboard });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const role = (user?.role || 'COLLABORATOR') as Role;
  const allowed = useMemo(() => modules.filter((m) => m.roles.includes(role)), [role]);

  useEffect(() => {
    if (allowed.length && !allowed.some((m) => m.id === page)) setPage(allowed[0].id);
  }, [allowed, page]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal) return;
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget));
      await send('/api/' + endpoints[modal], 'POST', body);
      setModal(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function update(url: string, body: Any) {
    try {
      await send(url, 'PATCH', body);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (!user && loading) return <div className="bp53Loader">BatiPilot prépare votre espace…</div>;

  if (openProject) {
    return (
      <ProjectWorkspace
        projectId={openProject}
        onBack={() => {
          setOpenProject(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="bp53Shell">
      <aside className="bp53Side">
        <div className="bp53Brand">
          <img src="/logo.png" alt="BatiPilot" />
          <div><b>Bati<span>Pilot</span></b><small>VOS PROJETS, EN TOUTE MAÎTRISE</small></div>
        </div>
        <div className="bp53Org"><i>{user?.name?.slice(0, 1) || 'B'}</i><div><b>{user?.name}</b><small>{labelRole(role)}</small></div></div>
        <nav>{allowed.map((m) => <button key={m.id} className={page === m.id ? 'active' : ''} onClick={() => setPage(m.id)}><i>{m.icon}</i><span>{m.label}</span></button>)}</nav>
        <div className="bp53SideFoot"><button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/login'; }}>↪ Déconnexion</button><small>v5.4 · Espace sécurisé</small></div>
      </aside>

      <main className="bp53Main">
        <header className="bp53Header">
          <div><small>Cabinet BatiPilot / {modules.find((m) => m.id === page)?.label}</small><h1>{modules.find((m) => m.id === page)?.label}</h1></div>
          <div className="bp53HeaderActions">{endpoints[page] && page !== 'admin' && <button onClick={() => setModal(page)}>＋ Créer</button>}<button className="outline" onClick={load}>↻</button></div>
        </header>
        {error && <div className="bp53Error">{error}</div>}
        {loading ? <p>Actualisation…</p> : <Content page={page} data={data} update={update} onOpenProject={setOpenProject} />}
        {modal && <Modal type={modal} data={data} close={() => setModal(null)} submit={submit} />}
      </main>
    </div>
  );
}

function Content({ page, data, update, onOpenProject }: { page: string; data: Record<string, Any>; update: (u: string, b: Any) => void; onOpenProject: (id: string) => void }) {
  const rows = (data[page] || []) as Any[];
  if (page === 'dashboard') {
    const d = data.dashboard || {};
    return <><div className="bp53Kpis">{[['Projets', d.projects || 0, '▣'], ['Tâches ouvertes', d.tasks || 0, '✓'], ['Observations', d.observations || 0, '⚑'], ['À signer', d.signatures || 0, '✎']].map((x) => <article key={String(x[0])}><i>{x[2]}</i><div><small>{x[0]}</small><strong>{x[1]}</strong></div></article>)}</div><div className="bp53Grid"><Panel title="Projets récents"><Rows rows={((data.projects || []) as Any[]).slice(0, 5)} /></Panel><Panel title="Priorités"><Rows rows={((data.tasks || []) as Any[]).slice(0, 5)} /></Panel></div></>;
  }
  if (page === 'projects') {
    return <div className="bp53ProjectGrid">{rows.map((x) => <article className="bp53Project" key={x.id}><div className="bp53ProjectTop"><span>{x.status}</span><b>{x.progress || 0}%</b></div><h3>{x.name}</h3><p>{x.client?.name || 'Client à renseigner'} · {x.reference}</p><div className="bp53Progress"><i style={{ width: (x.progress || 0) + '%' }} /></div><footer><small>{x.address || 'Adresse à définir'}</small><button onClick={() => onOpenProject(x.id)}>Ouvrir →</button></footer></article>)}</div>;
  }
  if (page === 'tasks') {
    return <div className="bp53Kanban">{[['TODO', 'À faire'], ['IN_PROGRESS', 'En cours'], ['BLOCKED', 'Bloquées'], ['DONE', 'Terminées']].map(([status, label]) => <section key={status}><h3>{label}<em>{rows.filter((x) => x.status === status).length}</em></h3>{rows.filter((x) => x.status === status).map((x) => <article key={x.id}><b>{x.title}</b><small>{x.project?.name}</small><select value={x.status} onChange={(e) => update('/api/tasks/' + x.id, { status: e.target.value })}><option value="TODO">À faire</option><option value="IN_PROGRESS">En cours</option><option value="BLOCKED">Bloquée</option><option value="DONE">Terminée</option></select></article>)}</section>)}</div>;
  }
  if (page === 'gantt') return <Panel title="Planning Gantt global"><Rows rows={rows} /></Panel>;
  if (page === 'site') return <Panel title="Observations chantier"><Rows rows={rows} /></Panel>;
if (page === 'capacity') return <TeamPlanningWorkspace />;
  if (page === 'client') return <Panel title="Mes projets"><Rows rows={(data.projects || []) as Any[]} /></Panel>;
  if (page === 'consultations') return <Panel title="Consultations entreprises"><Rows rows={(data.companies || []) as Any[]} /></Panel>;
  return <Panel title={modules.find((m) => m.id === page)?.label || page}><Rows rows={rows} /></Panel>;
}

function Rows({ rows }: { rows: Any[] }) {
  return <div className="bp53Rows">{!rows.length && <p>Aucune donnée.</p>}{rows.map((x) => <div className="bp53Row" key={x.id}><div className="bp53RowIcon">{(x.name || x.title || x.email || '?').slice(0, 1)}</div><div><b>{x.name || x.title || x.label || x.email}</b><small>{[x.reference, x.project?.name, x.client?.name, x.trade, x.category, x.status].filter(Boolean).join(' · ')}</small></div><span>{x.progress !== undefined ? x.progress + '%' : x.status || ''}</span></div>)}</div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="bp53Panel"><header><h2>{title}</h2></header>{children}</section>; }
function labelRole(r: Role) { return ({ ADMIN: 'Administrateur', PROJECT_MANAGER: 'Chef de projet', COLLABORATOR: 'Collaborateur', CLIENT: 'Client', COMPANY: 'Entreprise' } as Record<Role, string>)[r]; }

function Modal({ type, data, close, submit }: { type: string; data: Record<string, Any>; close: () => void; submit: (e: FormEvent<HTMLFormElement>) => void }) {
  const projects = data.projects || [], clients = data.clients || [];
  const project = <label>Projet<select name="projectId" required>{projects.map((x: Any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>;
  return <div className="bp53Modal"><form onSubmit={submit}><div className="bp53ModalTitle"><div><small>NOUVEL ÉLÉMENT</small><h2>{modules.find((m) => m.id === type)?.label}</h2></div><button type="button" onClick={close}>×</button></div>{type === 'projects' && <><label>Nom du projet<input name="name" required /></label><label>Référence<input name="reference" required /></label><label>Adresse<input name="address" /></label><label>Client<select name="clientId"><option value="">Aucun</option>{clients.map((x: Any) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label></>}{type === 'tasks' && <>{project}<label>Titre<input name="title" required /></label><label>Échéance<input name="dueAt" type="date" /></label></>}{type === 'clients' && <><label>Nom<input name="name" required /></label><label>E-mail<input name="email" type="email" /></label><label>Téléphone<input name="phone" /></label></>}{type === 'companies' && <><label>Nom<input name="name" required /></label><label>Corps d’état<input name="trade" /></label><label>E-mail<input name="email" /></label></>}{type === 'gantt' && <>{project}<label>Activité<input name="title" required /></label><label>Début<input name="start" type="date" required /></label><label>Fin<input name="end" type="date" required /></label></>}{type === 'site' && <>{project}<label>Observation<input name="title" required /></label><label>Description<textarea name="description" /></label><label>Localisation<input name="location" /></label></>}{type === 'documents' && <>{project}<label>Nom<input name="name" required /></label><label>Catégorie<input name="category" required /></label></>}{type === 'signatures' && <>{project}<label>Titre<input name="title" required /></label><label>Signataires<textarea name="signers" defaultValue="[]" /></label></>}{type === 'finance' && <>{project}<label>Libellé<input name="label" required /></label><label>Catégorie<input name="category" required /></label><label>Budget<input name="budget" type="number" /></label></>}{type === 'reception' && <>{project}<label>Date<input name="date" type="date" required /></label><label>Statut<input name="status" defaultValue="PREPARATION" /></label></>}<footer><button type="button" className="outline" onClick={close}>Annuler</button><button>Enregistrer</button></footer></form></div>;
}
