import React from 'react';
import CadastroSimples from '../components/common/CadastroSimples';

export default function Marcas() {
  return (
    <CadastroSimples 
      titulo="Gestão de Marcas" 
      labelItem="Marca" 
      endpoint="/marcas" 
    />
  );
}