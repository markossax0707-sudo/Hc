import { Patient, AppSettings, PatientFilters } from '../types';

const DB_NAME = 'ClinicaRoomDB';
const DB_VERSION = 1;
const STORE_PATIENTS = 'patients';
const STORAGE_KEY_SETTINGS = 'med_app_settings_v1';
const STORAGE_KEY_FALLBACK = 'med_app_patients_fallback_v1';

// Default initial settings
export const DEFAULT_SETTINGS: AppSettings = {
  customApiKey: '',
  medicoNombre: 'Dr. Alejandro Restrepo M.',
  medicoEspecialidad: 'Medicina Interna & Urgencias',
  medicoRegistro: 'R.M. 74829-COL',
  institucionNombre: 'Centro Médico Santa María',
  viewMode: 'responsive',
};

// Seed demo patients
const INITIAL_DEMO_PATIENTS: Patient[] = [
  {
    id: 'pat-101',
    nombre: 'Carlos Andrés Montoya Vélez',
    identificacion: '1020458921',
    motivoConsulta: 'Cefalea intensa y mareo de 2 días de evolución',
    enfermedadActual:
      'Paciente masculino de 48 años que consulta por cuadro clínico de 48 horas caracterizado por cefalea pulsátil holocraneana de intensidad 8/10, acompañada de fosfenos, tinitus ocasional y cifras tensionales elevadas tomadas en farmacia (165/95 mmHg). Niega déficit neurológico focal o pérdida de conciencia.',
    fechaAtencion: new Date().toISOString().split('T')[0],
    fechaCreacion: new Date(Date.now() - 3600000 * 2).toISOString(),
    edad: '48 años',
    genero: 'Masculino',
    antecedentes: 'Hipertensión arterial diagnosticada hace 3 años en tratamiento irregular con Losartán 50mg.',
    signosVitales: 'TA: 162/98 mmHg | FC: 82 lpm | FR: 18 rpm | SatO2: 97% | Temp: 36.6 °C',
    iaProcesada: true,
    iaResumenEjecutivo:
      'Crisis hipertensiva tipo urgencia en paciente con HTA no controlada, con cefalea secundaria sin signos de focalización inmediata.',
    iaAnalisis:
      'Paciente adulto con antecedente de hipertensión arterial mal adherida que se presenta con urgencia hipertensiva sintomática (cefalea de características hipertensivas, fosfenos). No se evidencian signos claros de daño agudo de órgano diana (fondo de ojo sin hemorragias evidentes, sin dolor torácico o disnea). Requiere descenso gradual de cifras tensionales y ajuste terapéutico integral.',
    iaPlan:
      '1. Conducta inmediata: Reposo en decúbito supino, administración de Captopril 25 mg VO o Amlodipino según protocolo.\n2. Exámenes complementarios: EKG de 12 derivaciones, creatinina sérica, BUN, ionograma, citoquímico de orina.\n3. Ajuste ambulatorio: Losartán 50mg cada 12h + Hidroclorotiazida 12.5mg/día. Diario de presiones arteriales.\n4. Signos de alarma: Dolor torácico opresivo, disnea, pérdida de fuerza motora, asimetría facial, cefalea ictal súbita.\n5. Control por consulta externa en 72 horas.',
    iaDiagnosticosCIE10: [
      {
        codigo: 'I10',
        descripcion: 'Hipertensión esencial (primaria)',
        tipo: 'Principal',
        justificacion: 'Cifras tensionales elevadas con repercusión sintomática en paciente con antecedente conocido.',
      },
      {
        codigo: 'R51',
        descripcion: 'Cefalea',
        tipo: 'Secundario',
        justificacion: 'Síntoma cardinal motivo de consulta.',
      },
    ],
    iaNivelUrgencia: 'Alta',
    iaRecomendaciones: [
      'Reducción estricta de sodio en la dieta (< 2g/día).',
      'Monitoreo ambulatorio de presión arterial por 7 días.',
      'Evitar automedicación con AINEs.',
    ],
    iaProcesadaEn: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'pat-102',
    nombre: 'Mariana Sofía Gómez Rincón',
    identificacion: '52894102',
    motivoConsulta: 'Tos seca persistente, odinofagia y fiebre de 38.3 °C',
    enfermedadActual:
      'Paciente femenina de 32 años con cuadro de 3 días caracterizado por odinofagia progresiva, rinorrea hialina, tos no productiva y sensación febril cuantificada en 38.3 °C. Refiere astenia y mialgias generalizadas.',
    fechaAtencion: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    fechaCreacion: new Date(Date.now() - 86400000).toISOString(),
    edad: '32 años',
    genero: 'Femenino',
    antecedentes: 'Rinitis alérgica estacional. No fuma.',
    signosVitales: 'TA: 115/75 mmHg | FC: 78 lpm | FR: 16 rpm | SatO2: 98% | Temp: 38.1 °C',
    iaProcesada: true,
    iaResumenEjecutivo:
      'Infección respiratoria aguda de vías superiores (Faringoamigdalitis / Rinofaringitis viral) de curso no complicado.',
    iaAnalisis:
      'Cuadro clínico compatible con infección respiratoria aguda de etiología predominantemente viral (Centor Score < 2). Mucosa faríngea hiperémica sin exudados purulentos, murmullo vesicular limpio sin sobreagregados. No requiere antibioticoterapia en el momento actual.',
    iaPlan:
      '1. Manejo sintomático: Acetaminofén 500mg-1g cada 6 a 8 horas VO según fiebre/dolor. Loratadina 10mg noche por 5 días.\n2. Medidas no farmacológicas: Abundante hidratación oral, lavados nasales con solución salina al 0.9%, reposo relativo.\n3. Signos de alarma para urgencias: Dificultad para respirar (disnea), estridor, fiebre > 39 °C persistente > 72 horas, intolerancia a la vía oral.',
    iaDiagnosticosCIE10: [
      {
        codigo: 'J00',
        descripcion: 'Rinofaringitis aguda (resfriado común)',
        tipo: 'Principal',
        justificacion: 'Síntomas nasales y faríngeos asociados a cuadro viral agudo.',
      },
      {
        codigo: 'J02.9',
        descripcion: 'Faringitis aguda, no especificada',
        tipo: 'Diferencial',
        justificacion: 'Marcada odinofagia e hiperemia de pilares.',
      },
    ],
    iaNivelUrgencia: 'Baja',
    iaRecomendaciones: [
      'Uso de mascarilla quirúrgica para evitar contagio intradomiciliario.',
      'Reposo en casa por 48 horas.',
    ],
    iaProcesadaEn: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'pat-103',
    nombre: 'Mateo Sebastián Morales Jaramillo',
    identificacion: '1098471203',
    motivoConsulta: 'Dolor abdominal cólico difuso y náuseas',
    enfermedadActual:
      'Paciente de 24 años consulta por dolor abdominal tipo cólico de inicio insidioso hace 12 horas, localizado en epigastrio y mesogastrio, asociado a 3 episodios de deposiciones diarreicas líquidas sin moco ni sangre, y dos vómitos de contenido alimentario.',
    fechaAtencion: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    fechaCreacion: new Date(Date.now() - 86400000 * 3).toISOString(),
    edad: '24 años',
    genero: 'Masculino',
    antecedentes: 'Ninguno relevante. Ingesta de alimentos fuera del hogar hace 18 horas.',
    signosVitales: 'TA: 110/70 mmHg | FC: 88 lpm | FR: 18 rpm | SatO2: 99% | Temp: 37.2 °C',
    iaProcesada: true,
    iaResumenEjecutivo:
      'Gastroenteritis aguda probablemente infecciosa de origen alimentario con deshidratación leve.',
    iaAnalisis:
      'Paciente joven con síndrome diarreico agudo y emesis secundario a probable toxiinfección alimentaria. Abdomen blando, depresible, ruidos hidroaéreos aumentados, sin signos de irritación peritoneal (Blumberg negativo). Deshidratación grado I.',
    iaPlan:
      '1. Rehidratación oral: Sales de Rehidratación Oral (SRO) 200 ml tras cada deposición líquida o vómito.\n2. Manejo de náuseas/vómito: Metoclopramida 10mg o Dimenhidrinato en caso de persistencia.\n3. Dieta astringente y fraccionada (arroz, manzana, pechuga hervida, caldos claros). Evitar lácteos y grasas.\n4. Signos de alarma: Deposiciones con sangre fresca, dolor focalizado en fosa ilíaca derecha, anuria > 8 horas.',
    iaDiagnosticosCIE10: [
      {
        codigo: 'A09',
        descripcion: 'Gastroenteritis y colitis de origen no especificado',
        tipo: 'Principal',
        justificacion: 'Cuadro agudo diarreico con vómito tras ingesta alimentaria.',
      },
      {
        codigo: 'E86',
        descripcion: 'Depleción del volumen (Deshidratación)',
        tipo: 'Secundario',
        justificacion: 'Pérdidas gastrointestinales activas.',
      },
    ],
    iaNivelUrgencia: 'Moderada',
    iaRecomendaciones: [
      'Lavado frecuente de manos con agua y jabón.',
      'SRO a libre demanda.',
    ],
    iaProcesadaEn: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// Open / initialize IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no disponible'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_PATIENTS)) {
        const store = db.createObjectStore(STORE_PATIENTS, { keyPath: 'id' });
        store.createIndex('identificacion', 'identificacion', { unique: false });
        store.createIndex('fechaAtencion', 'fechaAtencion', { unique: false });
        store.createIndex('fechaCreacion', 'fechaCreacion', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback LocalStorage handlers
function getPatientsFromLocalStorage(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FALLBACK);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function savePatientsToLocalStorage(patients: Patient[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FALLBACK, JSON.stringify(patients));
  } catch (e) {
    console.error('Error saving to localStorage fallback:', e);
  }
}

// Room Database Service API
export const PatientDB = {
  async getAll(): Promise<Patient[]> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PATIENTS, 'readonly');
        const store = tx.objectStore(STORE_PATIENTS);
        const req = store.getAll();
        req.onsuccess = () => {
          let list = (req.result as Patient[]) || [];
          if (list.length === 0) {
            // Seed default patients if DB is completely empty
            this.seedDefaults().then(() => resolve(INITIAL_DEMO_PATIENTS));
          } else {
            // Sort by fechaCreacion desc
            list.sort(
              (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
            );
            resolve(list);
          }
        };
        req.onerror = () => {
          const list = getPatientsFromLocalStorage();
          resolve(list.length > 0 ? list : INITIAL_DEMO_PATIENTS);
        };
      });
    } catch (e) {
      const list = getPatientsFromLocalStorage();
      if (list.length === 0) {
        savePatientsToLocalStorage(INITIAL_DEMO_PATIENTS);
        return INITIAL_DEMO_PATIENTS;
      }
      return list;
    }
  },

  async getById(id: string): Promise<Patient | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PATIENTS, 'readonly');
        const store = tx.objectStore(STORE_PATIENTS);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as Patient) || null);
        req.onerror = () => {
          const fallback = getPatientsFromLocalStorage().find((p) => p.id === id);
          resolve(fallback || null);
        };
      });
    } catch (e) {
      const fallback = getPatientsFromLocalStorage().find((p) => p.id === id);
      return fallback || null;
    }
  },

  async save(patient: Patient): Promise<Patient> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_PATIENTS, 'readwrite');
        const store = tx.objectStore(STORE_PATIENTS);
        const req = store.put(patient);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Fallback to localStorage on save:', e);
    }
    // Also sync localStorage
    const current = getPatientsFromLocalStorage();
    const idx = current.findIndex((p) => p.id === patient.id);
    if (idx >= 0) {
      current[idx] = patient;
    } else {
      current.unshift(patient);
    }
    savePatientsToLocalStorage(current);
    return patient;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_PATIENTS, 'readwrite');
        const store = tx.objectStore(STORE_PATIENTS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Fallback to localStorage on delete:', e);
    }
    const current = getPatientsFromLocalStorage().filter((p) => p.id !== id);
    savePatientsToLocalStorage(current);
    return true;
  },

  async seedDefaults(): Promise<void> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_PATIENTS, 'readwrite');
      const store = tx.objectStore(STORE_PATIENTS);
      for (const p of INITIAL_DEMO_PATIENTS) {
        store.put(p);
      }
    } catch (e) {
      savePatientsToLocalStorage(INITIAL_DEMO_PATIENTS);
    }
  },

  async filter(patients: Patient[], filters: PatientFilters): Promise<Patient[]> {
    return patients.filter((p) => {
      // Date range filtering on fechaAtencion or fechaCreacion
      if (filters.fechaInicio) {
        const creationDate = p.fechaCreacion ? p.fechaCreacion.split('T')[0] : p.fechaAtencion;
        if (creationDate < filters.fechaInicio) return false;
      }
      if (filters.fechaFin) {
        const creationDate = p.fechaCreacion ? p.fechaCreacion.split('T')[0] : p.fechaAtencion;
        if (creationDate > filters.fechaFin) return false;
      }

      // Search query filtering (by name or CC)
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchName = p.nombre.toLowerCase().includes(q);
        const matchCC = p.identificacion.toLowerCase().includes(q);
        const matchDiag = p.iaDiagnosticosCIE10?.some((d) =>
          d.codigo.toLowerCase().includes(q) || d.descripcion.toLowerCase().includes(q)
        );
        if (!matchName && !matchCC && !matchDiag) return false;
      }

      return true;
    });
  },
};

// Settings storage
export const SettingsService = {
  get(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  save(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },
};
