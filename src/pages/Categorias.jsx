import React from 'react';
import CadastroSimples from '../components/common/CadastroSimples';

export default function Categorias() {
  return (
    <CadastroSimples 
      titulo="Gestão de Categorias" 
      labelItem="Categoria" 
      endpoint="/categorias" 
    />
  );
}