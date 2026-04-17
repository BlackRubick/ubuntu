import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';

const PatientDetailPage = () => {
  const { id } = useParams();
  const { data: patient, loading, error, request } = useApi(`/patients/${id}`, 'get');

  useEffect(() => {
    request();
    // eslint-disable-next-line
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 p-6">{error}</div>;
  if (!patient) return null;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Datos del paciente</h2>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-semibold">NSS:</span> {patient.nss}</div>
          <div><span className="font-semibold">Nombre:</span> {patient.nombres} {patient.primer_apellido} {patient.segundo_apellido}</div>
          <div><span className="font-semibold">Sexo:</span> {patient.sexo}</div>
          <div><span className="font-semibold">CURP:</span> {patient.curp}</div>
          <div><span className="font-semibold">Fecha de nacimiento:</span> {patient.fecha_nacimiento ? patient.fecha_nacimiento.split('T')[0] : ''}</div>
          <div><span className="font-semibold">Nacionalidad:</span> {patient.nacionalidad}</div>
          <div><span className="font-semibold">Estado nacimiento:</span> {patient.estado_nacimiento}</div>
          <div><span className="font-semibold">Estado residencia:</span> {patient.estado_residencia}</div>
          <div><span className="font-semibold">Municipio residencia:</span> {patient.municipio_residencia}</div>
          <div><span className="font-semibold">Localidad/Barrio:</span> {patient.localidad_residencia}</div>
          <div><span className="font-semibold">Estado civil:</span> {patient.estado_civil}</div>
          <div><span className="font-semibold">Domicilio:</span> {patient.domicilio}</div>
          <div><span className="font-semibold">Teléfono:</span> {patient.telefono}</div>
        </div>
      </Card>
    </div>
  );
};

export default PatientDetailPage;
