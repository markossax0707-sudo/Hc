import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Filter,
  Search,
  FileText,
  Sparkles,
  Users,
  Settings,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Stethoscope,
  Info,
} from 'lucide-react';
import { Patient, PatientFilters, AppSettings } from './types';
import { PatientDB, SettingsService } from './services/storage';
import { generateMedicalPdf } from './services/pdfGenerator';
import { TopAppBar } from './components/TopAppBar';
import { PatientCard } from './components/PatientCard';
import { PatientFormScreen } from './components/PatientFormScreen';
import { PatientDetailView } from './components/PatientDetailView';
import { FilterBar } from './components/FilterBar';
import { SettingsModal } from './components/SettingsModal';
import { ContextMenu } from './components/ContextMenu';
import { PdfViewerModal } from './components/PdfViewerModal';
import { AndroidFrame } from './components/AndroidFrame';

export default function App() {
  // Navigation / View state
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(SettingsService.get());

  // Filters state
  const [filters, setFilters] = useState<PatientFilters>({
    fechaInicio: '',
    fechaFin: '',
    searchQuery: '',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(true);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextMenuPatient, setContextMenuPatient] = useState<Patient | null>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  // PDF Preview State
  const [pdfModalData, setPdfModalData] = useState<{
    isOpen: boolean;
    blobUrl: string | null;
    filename: string;
    patient: Patient | null;
  }>({
    isOpen: false,
    blobUrl: null,
    filename: '',
    patient: null,
  });

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load patients from DB on mount
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await PatientDB.getAll();
      setPatients(data);
    } catch (e) {
      console.error('Error loading patients:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Save or update settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    SettingsService.save(newSettings);
    setSettings(newSettings);
    showToast('Configuración guardada exitosamente', 'success');
  };

  // Toggle View Mode (Mobile Android Frame vs Responsive)
  const handleToggleViewMode = () => {
    const nextMode = settings.viewMode === 'mobile' ? 'responsive' : 'mobile';
    const updated = { ...settings, viewMode: nextMode };
    SettingsService.save(updated);
    setSettings(updated);
  };

  // Filtered patients list
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // 1. Date filter by fechaCreacion or fechaAtencion
      if (filters.fechaInicio) {
        const pDate = p.fechaCreacion ? p.fechaCreacion.split('T')[0] : p.fechaAtencion;
        if (pDate < filters.fechaInicio) return false;
      }
      if (filters.fechaFin) {
        const pDate = p.fechaCreacion ? p.fechaCreacion.split('T')[0] : p.fechaAtencion;
        if (pDate > filters.fechaFin) return false;
      }

      // 2. Search query filter (by name, CC or CIE-10 code)
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchName = p.nombre.toLowerCase().includes(q);
        const matchCC = p.identificacion.toLowerCase().includes(q);
        const matchDiag = p.iaDiagnosticosCIE10?.some(
          (d) =>
            d.codigo.toLowerCase().includes(q) ||
            d.descripcion.toLowerCase().includes(q)
        );
        if (!matchName && !matchCC && !matchDiag) return false;
      }

      return true;
    });
  }, [patients, filters]);

  // Active filters count
  const activeFilterCount =
    (filters.fechaInicio ? 1 : 0) + (filters.fechaFin ? 1 : 0);

  // Navigation handlers
  const handleOpenNewPatient = () => {
    setEditingPatient(null);
    setCurrentView('form');
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('detail');
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPatient(null);
    setEditingPatient(null);
  };

  // Save Patient handler (from Form)
  const handleSavePatient = async (patientToSave: Patient) => {
    try {
      const saved = await PatientDB.save(patientToSave);
      await loadPatients();
      showToast(
        `Paciente ${saved.nombre} guardado en la base de datos Room`,
        'success'
      );
      setSelectedPatient(saved);
      setCurrentView('detail');
    } catch (e: any) {
      console.error('Error saving patient:', e);
      showToast('Error al guardar el paciente en la base de datos', 'error');
    }
  };

  // Delete Patient handler
  const handleDeletePatient = async (id: string) => {
    try {
      await PatientDB.delete(id);
      await loadPatients();
      showToast('Registro de paciente eliminado', 'info');
      if (currentView === 'detail') {
        setCurrentView('list');
        setSelectedPatient(null);
      }
    } catch (e) {
      console.error('Error deleting patient:', e);
      showToast('Error al eliminar el registro', 'error');
    }
  };

  // Context Menu handler (Long-press / More)
  const handleOpenContextMenu = (patient: Patient) => {
    setContextMenuPatient(patient);
    setIsContextMenuOpen(true);
  };

  // Export to PDF handler
  const handleExportPdf = (patient: Patient) => {
    try {
      const { blobUrl, filename } = generateMedicalPdf(patient, settings, {
        download: true,
        openInNewTab: false,
      });

      setPdfModalData({
        isOpen: true,
        blobUrl,
        filename,
        patient,
      });

      showToast(`Informe PDF generado y descargado para ${patient.nombre}`, 'success');
    } catch (e: any) {
      console.error('Error al generar PDF:', e);
      showToast('Error al compilar el informe médico en PDF', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toastMessage.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-200" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Android Native Mockup Frame or Responsive Container */}
      <AndroidFrame
        settings={settings}
        onToggleViewMode={handleToggleViewMode}
        showFab={currentView === 'list'}
        onFabClick={handleOpenNewPatient}
      >
        {/* Top App Bar */}
        <TopAppBar
          title={
            currentView === 'list'
              ? 'Gestión de Pacientes'
              : currentView === 'form'
              ? editingPatient
                ? 'Editar Paciente'
                : 'Nuevo Paciente'
              : 'Historia Clínica'
          }
          subtitle={
            currentView === 'list'
              ? `${patients.length} pacientes registrados`
              : selectedPatient?.nombre
          }
          showBack={currentView !== 'list'}
          onBack={handleBackToList}
          showSearch={currentView === 'list'}
          searchQuery={filters.searchQuery}
          onSearchChange={(q) => setFilters({ ...filters, searchQuery: q })}
          isSearching={isSearching}
          onToggleSearch={() => {
            setIsSearching(!isSearching);
            if (isSearching) setFilters({ ...filters, searchQuery: '' });
          }}
          activeFilterCount={activeFilterCount}
          onOpenFilter={() => setShowFilterBar(!showFilterBar)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settings={settings}
          onToggleViewMode={handleToggleViewMode}
        />

        <div className="pt-4 pb-8">
          {/* VIEW 1: PATIENTS LIST */}
          {currentView === 'list' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Date Filter Bar */}
              {showFilterBar && (
                <FilterBar
                  filters={filters}
                  onFilterChange={(newFilters) => setFilters(newFilters)}
                  onResetFilters={() =>
                    setFilters({ fechaInicio: '', fechaFin: '', searchQuery: '' })
                  }
                  totalFiltered={filteredPatients.length}
                  totalAll={patients.length}
                />
              )}

              {/* Status Banner */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>
                    Pacientes Registrados ({filteredPatients.length} de {patients.length})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                  Mantén presionado para opciones rápidas
                </span>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="py-16 text-center text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="text-xs font-semibold">Cargando base de datos Room...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm my-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">
                    No se encontraron pacientes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    {filters.fechaInicio || filters.fechaFin || filters.searchQuery
                      ? 'No hay registros que coincidan con el rango de fechas o búsqueda especificado.'
                      : 'Comienza añadiendo un nuevo paciente con el botón flotante (+).'}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {(filters.fechaInicio || filters.fechaFin || filters.searchQuery) && (
                      <button
                        onClick={() =>
                          setFilters({ fechaInicio: '', fechaFin: '', searchQuery: '' })
                        }
                        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
                      >
                        Limpiar Filtros
                      </button>
                    )}
                    <button
                      onClick={handleOpenNewPatient}
                      className="text-xs font-bold text-white bg-[#1A56A0] hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Paciente</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Patient Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onSelect={handleSelectPatient}
                      onExportPdf={handleExportPdf}
                      onContextMenu={handleOpenContextMenu}
                      onEdit={handleEditPatient}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: PATIENT FORM (NEW / EDIT) */}
          {currentView === 'form' && (
            <PatientFormScreen
              initialPatient={editingPatient}
              onSave={handleSavePatient}
              onCancel={handleBackToList}
              onOpenSettings={() => setIsSettingsOpen(true)}
              settings={settings}
            />
          )}

          {/* VIEW 3: PATIENT DETAIL */}
          {currentView === 'detail' && selectedPatient && (
            <PatientDetailView
              patient={selectedPatient}
              onBack={handleBackToList}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
              onExportPdf={handleExportPdf}
              settings={settings}
            />
          )}
        </div>
      </AndroidFrame>

      {/* MODALS */}
      {/* 1. Context Menu on Long Press */}
      <ContextMenu
        isOpen={isContextMenuOpen}
        onClose={() => setIsContextMenuOpen(false)}
        patient={contextMenuPatient}
        onSelectPatient={handleSelectPatient}
        onEditPatient={handleEditPatient}
        onExportPdf={handleExportPdf}
        onDeletePatient={handleDeletePatient}
      />

      {/* 2. Settings Modal for API Key and Doctor Profile */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* 3. PDF Preview & Download Modal */}
      <PdfViewerModal
        isOpen={pdfModalData.isOpen}
        onClose={() => setPdfModalData({ ...pdfModalData, isOpen: false })}
        blobUrl={pdfModalData.blobUrl}
        filename={pdfModalData.filename}
        patient={pdfModalData.patient}
      />
    </div>
  );
}
