import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, AppSettings } from '../types';

export interface GeneratePdfOptions {
  download?: boolean;
  openInNewTab?: boolean;
}

export function generateMedicalPdf(
  patient: Patient,
  settings: AppSettings,
  options: GeneratePdfOptions = { download: true }
): { doc: jsPDF; blobUrl: string; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 15;

  // Colors
  const primaryColor = [26, 86, 160] as [number, number, number]; // Medical Deep Blue #1A56A0
  const darkText = [33, 37, 41] as [number, number, number];
  const mutedText = [100, 116, 139] as [number, number, number];
  const lightBg = [241, 245, 249] as [number, number, number];
  const borderGrey = [203, 213, 225] as [number, number, number];
  const accentRed = [220, 38, 38] as [number, number, number];

  // Helper for drawing section header
  const drawSectionHeader = (title: string, yPos: number): number => {
    // Check page break
    if (yPos > pageHeight - 35) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(240, 247, 255);
    doc.roundedRect(margin, yPos, contentWidth, 7.5, 1.5, 1.5, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos + 0.5, margin, yPos + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text(title.toUpperCase(), margin + 4, yPos + 5.2);

    return yPos + 11;
  };

  // Helper to print multiline text cleanly
  const drawParagraph = (label: string, text: string, yPos: number): number => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    if (label) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...primaryColor);
      doc.text(label, margin, yPos);
      yPos += 4.5;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkText);

    const lines = doc.splitTextToSize(text || 'No registrado', contentWidth);
    
    // Check if lines will overflow
    const requiredHeight = lines.length * 4;
    if (yPos + requiredHeight > pageHeight - 25) {
      // Print as much as fits then page break
      for (const line of lines) {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 20;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...darkText);
        }
        doc.text(line, margin, yPos);
        yPos += 4;
      }
      return yPos + 3;
    }

    doc.text(lines, margin, yPos);
    return yPos + lines.length * 4 + 3;
  };

  // ==========================================
  // 1. INSTITUTION & TOP MEDICAL HEADER
  // ==========================================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Institution / Clinic Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...primaryColor);
  doc.text(settings.institucionNombre || 'CENTRO MÉDICO DE ATENCIÓN Y ESPECIALIDADES', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  currentY += 4.5;
  doc.text('Departamento de Consulta Externa & Urgencias Médicas', margin, currentY);

  // Title Box
  currentY += 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'F');
  doc.setDrawColor(...borderGrey);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('INFORME DE ATENCIÓN MÉDICA', margin + contentWidth / 2, currentY + 5.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  const formattedEmission = new Date().toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(
    `FOLIO N°: MED-${patient.identificacion.slice(-4)}-${patient.id.slice(-4).toUpperCase()}  |  FECHA Y HORA DE EMISIÓN: ${formattedEmission}`,
    margin + contentWidth / 2,
    currentY + 9.5,
    { align: 'center' }
  );

  currentY += 16;

  // ==========================================
  // 2. PATIENT DEMOGRAPHICS TABLE
  // ==========================================
  currentY = drawSectionHeader('1. Información General del Paciente', currentY);

  const patientInfoData = [
    [
      { content: 'Nombre Completo:', styles: { fontStyle: 'bold', textColor: primaryColor } },
      { content: patient.nombre || 'No registrado' },
      { content: 'Documento (CC):', styles: { fontStyle: 'bold', textColor: primaryColor } },
      { content: patient.identificacion || 'No registrado' },
    ],
    [
      { content: 'Fecha Atención:', styles: { fontStyle: 'bold', textColor: primaryColor } },
      { content: patient.fechaAtencion || 'No especificada' },
      { content: 'Edad / Género:', styles: { fontStyle: 'bold', textColor: primaryColor } },
      { content: `${patient.edad || 'No especificada'} / ${patient.genero || 'No especificado'}` },
    ],
    [
      { content: 'Fecha Registro:', styles: { fontStyle: 'bold', textColor: primaryColor } },
      { content: new Date(patient.fechaCreacion).toLocaleDateString('es-CO') },
      { content: 'Nivel Urgencia:', styles: { fontStyle: 'bold', textColor: primaryColor } },
      {
        content: patient.iaNivelUrgencia || 'Evaluación Estándar',
        styles: {
          textColor: patient.iaNivelUrgencia === 'Alta' || patient.iaNivelUrgencia === 'Crítica' ? accentRed : darkText,
          fontStyle: 'bold',
        },
      },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: patientInfoData as any,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: darkText,
      lineColor: borderGrey,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 32, fillColor: [248, 250, 252] },
      1: { cellWidth: 58 },
      2: { cellWidth: 32, fillColor: [248, 250, 252] },
      3: { cellWidth: 'auto' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // ==========================================
  // 3. ANAMNESIS & CLINICAL REASONING
  // ==========================================
  currentY = drawSectionHeader('2. Anamnesis y Cuadro Clínico', currentY);

  currentY = drawParagraph('Motivo de Consulta:', patient.motivoConsulta, currentY);
  currentY = drawParagraph('Enfermedad Actual:', patient.enfermedadActual, currentY);

  if (patient.signosVitales) {
    currentY = drawParagraph('Signos Vitales y Examen Físico:', patient.signosVitales, currentY);
  }

  if (patient.antecedentes) {
    currentY = drawParagraph('Antecedentes Médicos Relevantes:', patient.antecedentes, currentY);
  }

  // ==========================================
  // 4. DIAGNÓSTICOS CIE-10 (TABLA ESTRUCTURADA)
  // ==========================================
  currentY = drawSectionHeader('3. Diagnósticos Clínicos (Clasificación CIE-10)', currentY);

  const cie10Rows =
    patient.iaDiagnosticosCIE10 && patient.iaDiagnosticosCIE10.length > 0
      ? patient.iaDiagnosticosCIE10.map((d) => [
          d.codigo,
          d.descripcion,
          d.tipo,
          d.justificacion || 'Correlación clínica directa con anamnesis.',
        ])
      : [['---', 'Sin diagnóstico CIE-10 registrado', '---', '---']];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Código CIE-10', 'Descripción del Diagnóstico', 'Tipo', 'Justificación Clínica']],
    body: cie10Rows,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 7.8,
      cellPadding: 2.2,
      textColor: darkText,
      lineColor: borderGrey,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold' },
      1: { cellWidth: 62 },
      2: { cellWidth: 26 },
      3: { cellWidth: 'auto' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // ==========================================
  // 5. ANÁLISIS CLÍNICO ESTRUCTURADO (IA / MÉDICO)
  // ==========================================
  currentY = drawSectionHeader('4. Análisis Clínico y Juicio Diagnóstico', currentY);

  if (patient.iaResumenEjecutivo) {
    // Executive summary highlight box
    doc.setFillColor(254, 243, 199); // Soft amber
    doc.roundedRect(margin, currentY, contentWidth, 10, 1.5, 1.5, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 10, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text('RESUMEN CLÍNICO:', margin + 3, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const summaryLines = doc.splitTextToSize(patient.iaResumenEjecutivo, contentWidth - 6);
    doc.text(summaryLines, margin + 3, currentY + 7.5);

    currentY += 13;
  }

  currentY = drawParagraph('', patient.iaAnalisis || 'Sin análisis clínico registrado.', currentY);

  // ==========================================
  // 6. PLAN DE MANEJO Y TRATAMIENTO
  // ==========================================
  currentY = drawSectionHeader('5. Plan de Manejo, Tratamiento y Conducta', currentY);

  currentY = drawParagraph('', patient.iaPlan || 'Sin plan registrado.', currentY);

  if (patient.iaRecomendaciones && patient.iaRecomendaciones.length > 0) {
    currentY = drawParagraph(
      'Recomendaciones Adicionales y Cuidados en Casa:',
      patient.iaRecomendaciones.map((r, i) => `• ${r}`).join('\n'),
      currentY
    );
  }

  // ==========================================
  // 7. FIRMA Y DATOS DEL PROFESIONAL
  // ==========================================
  // Ensure enough room for signature block on current page or new page
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 25;
  } else {
    currentY = Math.max(currentY + 5, pageHeight - 45);
  }

  doc.setDrawColor(...borderGrey);
  doc.setLineWidth(0.4);
  doc.line(margin + 20, currentY + 12, margin + 95, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkText);
  doc.text(settings.medicoNombre || 'Dr. Médico Tratante', margin + 57.5, currentY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text(settings.medicoEspecialidad || 'Médico Cirujano', margin + 57.5, currentY + 20, { align: 'center' });
  doc.text(settings.medicoRegistro || 'Registro Médico N° 00000', margin + 57.5, currentY + 24, { align: 'center' });

  // Verification Box / Stamp
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + contentWidth - 65, currentY, 65, 26, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderGrey);
  doc.roundedRect(margin + contentWidth - 65, currentY, 65, 26, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text('SELLO Y VALIDACIÓN INSTITUCIONAL', margin + contentWidth - 32.5, currentY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedText);
  doc.text('Documento Clínico Digital Autenticado', margin + contentWidth - 32.5, currentY + 9, { align: 'center' });
  doc.text(`Identificación: CC ${patient.identificacion}`, margin + contentWidth - 32.5, currentY + 13, { align: 'center' });
  doc.text(`Asistencia Diagnóstica IA Gemini`, margin + contentWidth - 32.5, currentY + 17, { align: 'center' });
  doc.text(`Válido para fines médicos y legales`, margin + contentWidth - 32.5, currentY + 21, { align: 'center' });

  // ==========================================
  // 8. PAGE FOOTER (PAGINATION & LEGAL NOTICE)
  // ==========================================
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...borderGrey);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedText);
    doc.text(
      'Este informe contiene información confidencial protegida por el secreto médico profesional. La asistencia clínica por IA debe ser ratificada por el profesional tratante.',
      margin,
      pageHeight - 6.5
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6.5, { align: 'right' });
  }

  const cleanName = (patient.nombre || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Informe_Medico_${patient.identificacion || 'CC'}_${cleanName}.pdf`;

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  if (options.download) {
    doc.save(filename);
  }

  if (options.openInNewTab) {
    window.open(blobUrl, '_blank');
  }

  return { doc, blobUrl, filename };
}
