/** Ficha PPV-01 — patrullaje preventivo vecinal */

export type PpvTurno = {
  mañana: boolean;
  tarde: boolean;
  noche: boolean;
};

export type PpvModalidad = {
  a_pie: boolean;
  vehiculo: boolean;
  mixta: boolean;
};

export type PpvZona = {
  urbana: boolean;
  rural: boolean;
};

export type PpvHallazgoRow = {
  n: number;
  hallazgo: string;
  direccion_o_referencia: string | null;
  prioridad_a_m_b: string | null;
  foto_n: boolean;
  deriv: string | null;
  observacion: string | null;
};

export type PpvFormPayload = {
  institucion: string;
  unidad: string;
  documento: string;
  detalles_documento: {
    folio_n: string | null;
    codigo: string;
    version: string;
    clasificacion: string;
    comuna: string;
    tipo_registro: string;
    descripcion: string;
  };
  datos_generales_recorrido: {
    fecha: string | null;
    territorio_n: string | null;
    hora_inicio: string | null;
    hora_termino: string | null;
    sector_poblacion_villa: string | null;
    junta_de_vecinos: string | null;
    turno: PpvTurno;
    modalidad: PpvModalidad;
    zona: PpvZona;
    ruta_o_calles_recorridas: string | null;
    vehiculo_patente: string | null;
    inspectores_participantes: (string | null)[];
  };
  participacion_vecinal: {
    vecinos: {
      total: number | null;
      mujeres: number | null;
      hombres: number | null;
      mayores_de_60: number | null;
    };
    viviendas_visitadas: number | null;
    dirigente_participante: string | null;
    cargo_en_la_jjvv: string | null;
    telefono_contacto: string | null;
    material_entregado: {
      folletos: boolean;
      numeros_de_emergencia: boolean;
      invitacion_a_reunion: boolean;
      otro: boolean;
    };
  };
  preocupaciones_manifestadas_vecinos: Record<string, boolean>;
  checklist_hallazgos_espacio_publico: PpvHallazgoRow[];
  codigos_derivacion: Record<string, string>;
  coordinacion_con_carabineros_pdi: {
    se_informo_situacion: string | null;
    institucion_unidad: string | null;
    hora_del_aviso: string | null;
    medio_de_aviso: string | null;
    funcionario_que_recibe: string | null;
    motivo_del_aviso: string | null;
  };
  seguridad_del_equipo_en_terreno: {
    incidentes_durante_recorrido: Record<string, boolean>;
  };
  observaciones_generales: string | null;
  firmas_y_validacion: {
    inspector_responsable: string | null;
    dirigente_vecinal: string | null;
    vo_bo_coordinador: string | null;
    fecha_de_revision: string | null;
  };
};

export const PPV_DERIVACION: Record<string, string> = {
  TRA: 'Tránsito',
  ALU: 'Alumbrado público',
  ASE: 'Aseo y ornato',
  DOM: 'Obras municipales',
  MED: 'Medio ambiente',
  DID: 'DIDECO / área social',
};

export const PPV_PREOCUPACIONES: { key: string; label: string }[] = [
  { key: 'robo_en_vivienda', label: 'Robo en vivienda' },
  { key: 'robo_de_o_en_vehiculos', label: 'Robo de o en vehículos' },
  {
    key: 'consumo_de_alcohol_o_drogas_en_via_publica',
    label: 'Consumo de alcohol o drogas en vía pública',
  },
  { key: 'riñas_ruidos_o_desordenes', label: 'Riñas, ruidos o desórdenes' },
  { key: 'falta_de_iluminacion', label: 'Falta de iluminación' },
  {
    key: 'sitios_eriazos_o_casas_abandonadas',
    label: 'Sitios eriazos o casas abandonadas',
  },
  { key: 'perros_sueltos_o_jaurias', label: 'Perros sueltos o jaurías' },
  {
    key: 'velocidad_o_transito_peligroso',
    label: 'Velocidad o tránsito peligroso',
  },
  {
    key: 'abigeato_o_robo_en_predios_rural',
    label: 'Abigeato o robo en predios rurales',
  },
  {
    key: 'acoso_callejero_o_violencia_hacia_mujeres',
    label: 'Acoso callejero o violencia hacia mujeres',
  },
  { key: 'grupos_que_generan_temor', label: 'Grupos que generan temor' },
  { key: 'otro', label: 'Otro' },
];

const HALLAZGOS_CATALOG = [
  'Luminaria apagada o dañada',
  'Microbasural o residuos acumulados',
  'Sitio eriazo sin cierre o resguardo',
  'Escombros o cachureos en vía pública',
  'Vivienda o inmueble abandonado',
  'Vegetación que tapa visión o luz',
  'Vehículo abandonado en vía pública',
  'Rayados o daño a mobiliario urbano',
  'Plaza, paradero o área verde dañada',
  'Señalética o demarcación vial ausente',
  'Riesgo estructural o elemento peligroso',
  'Alarma o cámara vecinal inoperativa',
  'Otro',
  'Otro',
];

function emptyPreocupaciones(): Record<string, boolean> {
  return Object.fromEntries(PPV_PREOCUPACIONES.map((p) => [p.key, false]));
}

export function createEmptyPpvForm(): PpvFormPayload {
  return {
    institucion: 'MUNICIPALIDAD DE PARRAL',
    unidad: 'Unidad de Seguridad Pública y Vinculación Comunal',
    documento: 'FICHA DE PATRULLAJE PREVENTIVO',
    detalles_documento: {
      folio_n: null,
      codigo: 'PPV-01',
      version: '14-Oct. 2026',
      clasificacion: 'PUBLICA',
      comuna: 'Parral',
      tipo_registro: 'VECINAL',
      descripcion: 'Registro de recorrido territorial',
    },
    datos_generales_recorrido: {
      fecha: null,
      territorio_n: null,
      hora_inicio: null,
      hora_termino: null,
      sector_poblacion_villa: null,
      junta_de_vecinos: null,
      turno: { mañana: false, tarde: false, noche: false },
      modalidad: { a_pie: false, vehiculo: false, mixta: false },
      zona: { urbana: false, rural: false },
      ruta_o_calles_recorridas: null,
      vehiculo_patente: null,
      inspectores_participantes: [null, null, null, null],
    },
    participacion_vecinal: {
      vecinos: {
        total: null,
        mujeres: null,
        hombres: null,
        mayores_de_60: null,
      },
      viviendas_visitadas: null,
      dirigente_participante: null,
      cargo_en_la_jjvv: null,
      telefono_contacto: null,
      material_entregado: {
        folletos: false,
        numeros_de_emergencia: false,
        invitacion_a_reunion: false,
        otro: false,
      },
    },
    preocupaciones_manifestadas_vecinos: emptyPreocupaciones(),
    checklist_hallazgos_espacio_publico: HALLAZGOS_CATALOG.map(
      (hallazgo, i) => ({
        n: i + 1,
        hallazgo,
        direccion_o_referencia: null,
        prioridad_a_m_b: null,
        foto_n: false,
        deriv: null,
        observacion: null,
      }),
    ),
    codigos_derivacion: { ...PPV_DERIVACION },
    coordinacion_con_carabineros_pdi: {
      se_informo_situacion: null,
      institucion_unidad: null,
      hora_del_aviso: null,
      medio_de_aviso: null,
      funcionario_que_recibe: null,
      motivo_del_aviso: null,
    },
    seguridad_del_equipo_en_terreno: {
      incidentes_durante_recorrido: {
        ninguno: false,
        agresion_verbal: false,
        amenaza: false,
        ataque_de_perros: false,
        accidente: false,
        otro: false,
      },
    },
    observaciones_generales: null,
    firmas_y_validacion: {
      inspector_responsable: null,
      dirigente_vecinal: null,
      vo_bo_coordinador: null,
      fecha_de_revision: null,
    },
  };
}

export const PPV_STEPS = [
  { id: 'recorrido', title: 'Recorrido' },
  { id: 'vecinal', title: 'Vecinal' },
  { id: 'preocupaciones', title: 'Preocupaciones' },
  { id: 'hallazgos', title: 'Hallazgos' },
  { id: 'coordinacion', title: 'Coordinación' },
  { id: 'cierre', title: 'Cierre' },
] as const;

export type PreventivePatrolRow = {
  id: string;
  code: string;
  status: string;
  payload: PpvFormPayload;
  createdAt: string;
};
