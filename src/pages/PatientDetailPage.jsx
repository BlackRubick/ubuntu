import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[11px] text-gray-400 mb-0.5">{label}</span>
    <span className="text-sm text-gray-900">{value || '—'}</span>
  </div>
);

const PatientDetailPage = () => {
  const { id } = useParams();
  const { data: patient, loading, error, request } = useApi(`/patients/${id}`, 'get');

  useEffect(() => {
    request();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <LoadingSpinner /> Cargando paciente...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const nombreCompleto = `${patient.nombres || ''} ${patient.primer_apellido || ''} ${patient.segundo_apellido || ''}`.trim();
  const fechaNacimiento = patient.fecha_nacimiento
    ? patient.fecha_nacimiento.split('T')[0]
    : '';

  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Detalle del paciente</h1>
        <p className="text-sm text-gray-400">Información general y datos demográficos</p>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-5">

        {/* IDENTIDAD */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{nombreCompleto || 'Sin nombre'}</h2>
            <p className="text-sm text-gray-400 mt-0.5">NSS: {patient.nss || '—'}</p>
          </div>

          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: '#E6F1FB',
              color: '#0C447C',
            }}
          >
            {patient.sexo || '—'}
          </span>
        </div>

        {/* GRID INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* DATOS PERSONALES */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Datos personales
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field label="CURP" value={patient.curp} />
              <Field label="Fecha nacimiento" value={fechaNacimiento} />
              <Field label="Nacionalidad" value={patient.nacionalidad} />
              <Field label="Estado civil" value={patient.estado_civil} />
            </div>
          </div>

          {/* UBICACIÓN */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Ubicación
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Estado nacimiento" value={patient.estado_nacimiento} />
              <Field label="Estado residencia" value={patient.estado_residencia} />
              <Field label="Municipio" value={patient.municipio_residencia} />
              <Field label="Localidad" value={patient.localidad_residencia} />
            </div>
          </div>

        </div>

        {/* CONTACTO */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Contacto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Domicilio" value={patient.domicilio} />
            <Field label="Teléfono" value={patient.telefono} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDetailPage;