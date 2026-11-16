'use client';

import { FormEvent, useEffect, useState } from 'react';

type A = Record<string, any>;

const definitions: Record<
  string,
  { title: string; field1: string; field2: string }
> = {
  estimates: {
    title: 'Estimations',
    field1: 'name',
    field2: 'scenario',
  },
  quantities: {
    title: 'Quantitatifs',
    field1: 'name',
    field2: 'level',
  },
  consultations: {
    title: 'Consultations',
    field1: 'lotId',
    field2: 'status',
  },
  offers: {
    title: 'Analyse des offres',
    field1: 'consultationId',
    field2: 'companyId',
  },
  fees: {
    title: 'Honoraires',
    field1: 'number',
    field2: 'amountHT',
  },
  gpa: {
    title: 'GPA',
    field1: 'title',
    field2: 'status',
  },
  orders: {
    title: 'Ordres de service',
    field1: 'number',
    field2: 'title',
  },
};

export default function V8Workbench({
  module,
  projectId,
}: {
  module: string;
  projectId: string;
}) {
  const [rows, setRows] = useState<A[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const definition = definitions[module];

  async function load() {
    setBusy(true);
    setError('');

    try {
      const response = await fetch(
        `/api/v8?module=${encodeURIComponent(module)}&projectId=${encodeURIComponent(projectId)}`,
        { cache: 'no-store' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, [module, projectId]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    const body: A = Object.fromEntries(
      new FormData(form)
    );

    body.module = module;
    body.projectId = projectId;

    setError('');

    try {
      const response = await fetch('/api/v8', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Erreur lors de la création'
        );
      }

      form.reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (!definition) {
    return (
      <div className="bp53Error">
        Module inconnu : {module}
      </div>
    );
  }

  return (
    <section className="bp53Panel">
      <header>
        <h2>{definition.title}</h2>
      </header>

      {error && (
        <div className="bp53Error">
          {error}
        </div>
      )}

      <form className="v8Quick" onSubmit={create}>
        <input
          name={definition.field1}
          placeholder={definition.field1}
          required
        />

        <input
          name={definition.field2}
          placeholder={definition.field2}
        />

        <button type="submit" disabled={busy}>
          {busy ? 'Enregistrement...' : 'Ajouter'}
        </button>
      </form>

      {busy && rows.length === 0 ? (
        <p>Chargement...</p>
      ) : (
        <div className="bp53Rows">
          {rows.length === 0 && (
            <p>Aucune donnée.</p>
          )}

          {rows.map((row) => (
            <div className="bp53Row" key={row.id}>
              <div>
                <b>
                  {row.name ||
                    row.title ||
                    row.number ||
                    row.status ||
                    row.id}
                </b>

                <small>
                  {[
                    row.version,
                    row.scenario,
                    row.status,
                    row.amountHT !== undefined
                      ? `${Number(row.amountHT).toLocaleString(
                          'fr-FR'
                        )} €`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}