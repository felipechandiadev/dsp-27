'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Button,
  Select,
  Stepper,
  TextField,
} from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import {
  createEmptyPpvForm,
  PPV_DERIVACION,
  PPV_PREOCUPACIONES,
  PPV_STEPS,
  type PpvFormPayload,
  type PpvHallazgoRow,
} from './ppv-form-types';
import './ppv-form.css';

function BoolChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`ppv-bool-chip${checked ? ' ppv-bool-chip--on' : ''}`}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      {label}
    </button>
  );
}

function parseNum(value: string): number | null {
  const t = value.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const PRIORIDAD_OPTS = [
  { id: 'A', label: 'A — Alta' },
  { id: 'M', label: 'M — Media' },
  { id: 'B', label: 'B — Baja' },
];

const DERIV_OPTS = [
  { id: '', label: 'Sin derivación' },
  ...Object.entries(PPV_DERIVACION).map(([id, label]) => ({
    id,
    label: `${id} — ${label}`,
  })),
];

type Props = {
  onSaved?: (code: string) => void;
  onCancel?: () => void;
};

export function PreventivePatrolForm({ onSaved, onCancel }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PpvFormPayload>(() => createEmptyPpvForm());
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const g = form.datos_generales_recorrido;
  const v = form.participacion_vecinal;

  function patchGeneral(
    patch: Partial<PpvFormPayload['datos_generales_recorrido']>,
  ) {
    setForm((prev) => ({
      ...prev,
      datos_generales_recorrido: { ...prev.datos_generales_recorrido, ...patch },
    }));
  }

  function patchVecinal(
    patch: Partial<PpvFormPayload['participacion_vecinal']>,
  ) {
    setForm((prev) => ({
      ...prev,
      participacion_vecinal: { ...prev.participacion_vecinal, ...patch },
    }));
  }

  function patchHallazgo(index: number, patch: Partial<PpvHallazgoRow>) {
    setForm((prev) => {
      const rows = [...prev.checklist_hallazgos_espacio_publico];
      rows[index] = { ...rows[index], ...patch };
      return { ...prev, checklist_hallazgos_espacio_publico: rows };
    });
  }

  async function submit() {
    if (!token) {
      setError('Sesión no disponible. Vuelve a iniciar sesión.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/preventive-patrols`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: form }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (data as { message?: string | string[] } | null)?.message;
        setError(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : 'No se pudo guardar la ficha',
        );
        return;
      }
      const code = (data as { code?: string })?.code ?? '';
      onSaved?.(code);
      router.refresh();
    } catch {
      setError('Error de red');
    } finally {
      setPending(false);
    }
  }

  const isLast = step >= PPV_STEPS.length - 1;

  return (
    <div className="ppv-form">
      <div className="ppv-form__meta">
        <strong>{form.documento}</strong>
        <br />
        {form.institucion} · {form.unidad}
        <br />
        {form.detalles_documento.codigo} · {form.detalles_documento.version} ·{' '}
        {form.detalles_documento.clasificacion}
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Stepper
        activeIndex={step}
        steps={[...PPV_STEPS]}
        allowClickCompletedSteps
        onCompletedStepClick={setStep}
        data-test-id="ppv-stepper"
        footer={
          <div className="ppv-actions">
            <div className="ppv-actions__nav">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Atrás
                </Button>
              ) : onCancel ? (
                <Button type="button" variant="outlined" onClick={onCancel}>
                  Cancelar
                </Button>
              ) : null}
            </div>
            <div className="ppv-actions__nav">
              {!isLast ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  disabled={pending}
                  onClick={() => void submit()}
                >
                  {pending ? 'Guardando…' : 'Guardar ficha'}
                </Button>
              )}
            </div>
          </div>
        }
      >
        {step === 0 ? (
          <div className="ppv-form__grid">
            <div className="ppv-form__grid ppv-form__grid--2">
              <TextField
                label="Fecha"
                type="date"
                value={g.fecha ?? ''}
                onChange={(e) =>
                  patchGeneral({ fecha: e.target.value || null })
                }
              />
              <TextField
                label="Territorio N°"
                value={g.territorio_n ?? ''}
                onChange={(e) =>
                  patchGeneral({ territorio_n: e.target.value || null })
                }
              />
              <TextField
                label="Hora inicio"
                type="time"
                value={g.hora_inicio ?? ''}
                onChange={(e) =>
                  patchGeneral({ hora_inicio: e.target.value || null })
                }
              />
              <TextField
                label="Hora término"
                type="time"
                value={g.hora_termino ?? ''}
                onChange={(e) =>
                  patchGeneral({ hora_termino: e.target.value || null })
                }
              />
            </div>
            <TextField
              label="Sector / población / villa"
              value={g.sector_poblacion_villa ?? ''}
              onChange={(e) =>
                patchGeneral({ sector_poblacion_villa: e.target.value || null })
              }
            />
            <TextField
              label="Junta de vecinos"
              value={g.junta_de_vecinos ?? ''}
              onChange={(e) =>
                patchGeneral({ junta_de_vecinos: e.target.value || null })
              }
            />
            <p className="ppv-form__section-title">Turno</p>
            <div className="ppv-bool-group">
              {(
                [
                  ['mañana', 'Mañana'],
                  ['tarde', 'Tarde'],
                  ['noche', 'Noche'],
                ] as const
              ).map(([key, label]) => (
                <BoolChip
                  key={key}
                  label={label}
                  checked={g.turno[key]}
                  onChange={(next) =>
                    patchGeneral({ turno: { ...g.turno, [key]: next } })
                  }
                />
              ))}
            </div>
            <p className="ppv-form__section-title">Modalidad</p>
            <div className="ppv-bool-group">
              {(
                [
                  ['a_pie', 'A pie'],
                  ['vehiculo', 'Vehículo'],
                  ['mixta', 'Mixta'],
                ] as const
              ).map(([key, label]) => (
                <BoolChip
                  key={key}
                  label={label}
                  checked={g.modalidad[key]}
                  onChange={(next) =>
                    patchGeneral({
                      modalidad: { ...g.modalidad, [key]: next },
                    })
                  }
                />
              ))}
            </div>
            <p className="ppv-form__section-title">Zona</p>
            <div className="ppv-bool-group">
              {(
                [
                  ['urbana', 'Urbana'],
                  ['rural', 'Rural'],
                ] as const
              ).map(([key, label]) => (
                <BoolChip
                  key={key}
                  label={label}
                  checked={g.zona[key]}
                  onChange={(next) =>
                    patchGeneral({ zona: { ...g.zona, [key]: next } })
                  }
                />
              ))}
            </div>
            <TextField
              label="Ruta o calles recorridas"
              value={g.ruta_o_calles_recorridas ?? ''}
              onChange={(e) =>
                patchGeneral({
                  ruta_o_calles_recorridas: e.target.value || null,
                })
              }
              rows={2}
            />
            <TextField
              label="Vehículo / patente"
              value={g.vehiculo_patente ?? ''}
              onChange={(e) =>
                patchGeneral({ vehiculo_patente: e.target.value || null })
              }
            />
            <p className="ppv-form__section-title">Inspectores participantes</p>
            <div className="ppv-form__grid ppv-form__grid--2">
              {g.inspectores_participantes.map((name, i) => (
                <TextField
                  key={i}
                  label={`Inspector ${i + 1}`}
                  value={name ?? ''}
                  onChange={(e) => {
                    const next = [...g.inspectores_participantes];
                    next[i] = e.target.value || null;
                    patchGeneral({ inspectores_participantes: next });
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="ppv-form__grid">
            <p className="ppv-form__section-title">Vecinos</p>
            <div className="ppv-form__grid ppv-form__grid--2">
              <TextField
                label="Total"
                type="number"
                value={v.vecinos.total == null ? '' : String(v.vecinos.total)}
                onChange={(e) =>
                  patchVecinal({
                    vecinos: {
                      ...v.vecinos,
                      total: parseNum(e.target.value),
                    },
                  })
                }
              />
              <TextField
                label="Mujeres"
                type="number"
                value={
                  v.vecinos.mujeres == null ? '' : String(v.vecinos.mujeres)
                }
                onChange={(e) =>
                  patchVecinal({
                    vecinos: {
                      ...v.vecinos,
                      mujeres: parseNum(e.target.value),
                    },
                  })
                }
              />
              <TextField
                label="Hombres"
                type="number"
                value={
                  v.vecinos.hombres == null ? '' : String(v.vecinos.hombres)
                }
                onChange={(e) =>
                  patchVecinal({
                    vecinos: {
                      ...v.vecinos,
                      hombres: parseNum(e.target.value),
                    },
                  })
                }
              />
              <TextField
                label="Mayores de 60"
                type="number"
                value={
                  v.vecinos.mayores_de_60 == null
                    ? ''
                    : String(v.vecinos.mayores_de_60)
                }
                onChange={(e) =>
                  patchVecinal({
                    vecinos: {
                      ...v.vecinos,
                      mayores_de_60: parseNum(e.target.value),
                    },
                  })
                }
              />
            </div>
            <TextField
              label="Viviendas visitadas"
              type="number"
              value={
                v.viviendas_visitadas == null
                  ? ''
                  : String(v.viviendas_visitadas)
              }
              onChange={(e) =>
                patchVecinal({
                  viviendas_visitadas: parseNum(e.target.value),
                })
              }
            />
            <TextField
              label="Dirigente participante"
              value={v.dirigente_participante ?? ''}
              onChange={(e) =>
                patchVecinal({
                  dirigente_participante: e.target.value || null,
                })
              }
            />
            <TextField
              label="Cargo en la JJ.VV."
              value={v.cargo_en_la_jjvv ?? ''}
              onChange={(e) =>
                patchVecinal({ cargo_en_la_jjvv: e.target.value || null })
              }
            />
            <TextField
              label="Teléfono de contacto"
              value={v.telefono_contacto ?? ''}
              onChange={(e) =>
                patchVecinal({ telefono_contacto: e.target.value || null })
              }
            />
            <p className="ppv-form__section-title">Material entregado</p>
            <div className="ppv-bool-group">
              {(
                [
                  ['folletos', 'Folletos'],
                  ['numeros_de_emergencia', 'Números de emergencia'],
                  ['invitacion_a_reunion', 'Invitación a reunión'],
                  ['otro', 'Otro'],
                ] as const
              ).map(([key, label]) => (
                <BoolChip
                  key={key}
                  label={label}
                  checked={v.material_entregado[key]}
                  onChange={(next) =>
                    patchVecinal({
                      material_entregado: {
                        ...v.material_entregado,
                        [key]: next,
                      },
                    })
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="ppv-form__grid">
            <p className="ppv-form__section-title">
              Preocupaciones manifestadas por vecinos
            </p>
            <div className="ppv-bool-group">
              {PPV_PREOCUPACIONES.map(({ key, label }) => (
                <BoolChip
                  key={key}
                  label={label}
                  checked={!!form.preocupaciones_manifestadas_vecinos[key]}
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      preocupaciones_manifestadas_vecinos: {
                        ...prev.preocupaciones_manifestadas_vecinos,
                        [key]: next,
                      },
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="ppv-form__grid">
            <p className="ppv-form__section-title">
              Checklist hallazgos espacio público
            </p>
            <p className="ppv-form__meta">
              Completa solo los hallazgos observados. Derivación:{' '}
              {Object.entries(PPV_DERIVACION)
                .map(([k, v]) => `${k}=${v}`)
                .join(' · ')}
            </p>
            {form.checklist_hallazgos_espacio_publico.map((row, index) => (
              <div key={row.n} className="ppv-hallazgo">
                <p className="ppv-hallazgo__title">
                  {row.n}. {row.hallazgo}
                </p>
                <TextField
                  label="Dirección o referencia"
                  value={row.direccion_o_referencia ?? ''}
                  onChange={(e) =>
                    patchHallazgo(index, {
                      direccion_o_referencia: e.target.value || null,
                    })
                  }
                />
                <div className="ppv-form__grid ppv-form__grid--2">
                  <Select
                    label="Prioridad"
                    options={PRIORIDAD_OPTS}
                    value={row.prioridad_a_m_b}
                    onChange={(id) =>
                      patchHallazgo(index, {
                        prioridad_a_m_b: id ? String(id) : null,
                      })
                    }
                    allowClear
                    placeholder="—"
                  />
                  <Select
                    label="Derivación"
                    options={DERIV_OPTS}
                    value={row.deriv ?? ''}
                    onChange={(id) =>
                      patchHallazgo(index, {
                        deriv: id ? String(id) : null,
                      })
                    }
                  />
                </div>
                <div className="ppv-bool-group">
                  <BoolChip
                    label="Foto"
                    checked={row.foto_n}
                    onChange={(next) => patchHallazgo(index, { foto_n: next })}
                  />
                </div>
                <TextField
                  label="Observación"
                  value={row.observacion ?? ''}
                  onChange={(e) =>
                    patchHallazgo(index, {
                      observacion: e.target.value || null,
                    })
                  }
                  rows={2}
                />
              </div>
            ))}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="ppv-form__grid">
            <p className="ppv-form__section-title">
              Coordinación con Carabineros / PDI
            </p>
            <Select
              label="¿Se informó situación?"
              options={[
                { id: 'si', label: 'Sí' },
                { id: 'no', label: 'No' },
              ]}
              value={form.coordinacion_con_carabineros_pdi.se_informo_situacion}
              onChange={(id) =>
                setForm((prev) => ({
                  ...prev,
                  coordinacion_con_carabineros_pdi: {
                    ...prev.coordinacion_con_carabineros_pdi,
                    se_informo_situacion: id ? String(id) : null,
                  },
                }))
              }
              allowClear
              placeholder="—"
            />
            <TextField
              label="Institución / unidad"
              value={
                form.coordinacion_con_carabineros_pdi.institucion_unidad ?? ''
              }
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  coordinacion_con_carabineros_pdi: {
                    ...prev.coordinacion_con_carabineros_pdi,
                    institucion_unidad: e.target.value || null,
                  },
                }))
              }
            />
            <div className="ppv-form__grid ppv-form__grid--2">
              <TextField
                label="Hora del aviso"
                type="time"
                value={form.coordinacion_con_carabineros_pdi.hora_del_aviso ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    coordinacion_con_carabineros_pdi: {
                      ...prev.coordinacion_con_carabineros_pdi,
                      hora_del_aviso: e.target.value || null,
                    },
                  }))
                }
              />
              <TextField
                label="Medio de aviso"
                value={
                  form.coordinacion_con_carabineros_pdi.medio_de_aviso ?? ''
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    coordinacion_con_carabineros_pdi: {
                      ...prev.coordinacion_con_carabineros_pdi,
                      medio_de_aviso: e.target.value || null,
                    },
                  }))
                }
              />
            </div>
            <TextField
              label="Funcionario que recibe"
              value={
                form.coordinacion_con_carabineros_pdi.funcionario_que_recibe ??
                ''
              }
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  coordinacion_con_carabineros_pdi: {
                    ...prev.coordinacion_con_carabineros_pdi,
                    funcionario_que_recibe: e.target.value || null,
                  },
                }))
              }
            />
            <TextField
              label="Motivo del aviso"
              value={form.coordinacion_con_carabineros_pdi.motivo_del_aviso ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  coordinacion_con_carabineros_pdi: {
                    ...prev.coordinacion_con_carabineros_pdi,
                    motivo_del_aviso: e.target.value || null,
                  },
                }))
              }
              rows={2}
            />
            <p className="ppv-form__section-title">
              Seguridad del equipo en terreno
            </p>
            <div className="ppv-bool-group">
              {(
                [
                  ['ninguno', 'Ninguno'],
                  ['agresion_verbal', 'Agresión verbal'],
                  ['amenaza', 'Amenaza'],
                  ['ataque_de_perros', 'Ataque de perros'],
                  ['accidente', 'Accidente'],
                  ['otro', 'Otro'],
                ] as const
              ).map(([key, label]) => (
                <BoolChip
                  key={key}
                  label={label}
                  checked={
                    !!form.seguridad_del_equipo_en_terreno
                      .incidentes_durante_recorrido[key]
                  }
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      seguridad_del_equipo_en_terreno: {
                        incidentes_durante_recorrido: {
                          ...prev.seguridad_del_equipo_en_terreno
                            .incidentes_durante_recorrido,
                          [key]: next,
                        },
                      },
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="ppv-form__grid">
            <TextField
              label="Observaciones generales"
              value={form.observaciones_generales ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  observaciones_generales: e.target.value || null,
                }))
              }
              rows={4}
            />
            <p className="ppv-form__section-title">Firmas y validación</p>
            <TextField
              label="Inspector responsable"
              value={form.firmas_y_validacion.inspector_responsable ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  firmas_y_validacion: {
                    ...prev.firmas_y_validacion,
                    inspector_responsable: e.target.value || null,
                  },
                }))
              }
            />
            <TextField
              label="Dirigente vecinal"
              value={form.firmas_y_validacion.dirigente_vecinal ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  firmas_y_validacion: {
                    ...prev.firmas_y_validacion,
                    dirigente_vecinal: e.target.value || null,
                  },
                }))
              }
            />
            <TextField
              label="V°B° coordinador"
              value={form.firmas_y_validacion.vo_bo_coordinador ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  firmas_y_validacion: {
                    ...prev.firmas_y_validacion,
                    vo_bo_coordinador: e.target.value || null,
                  },
                }))
              }
            />
            <TextField
              label="Fecha de revisión"
              type="date"
              value={form.firmas_y_validacion.fecha_de_revision ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  firmas_y_validacion: {
                    ...prev.firmas_y_validacion,
                    fecha_de_revision: e.target.value || null,
                  },
                }))
              }
            />
          </div>
        ) : null}
      </Stepper>
    </div>
  );
}
