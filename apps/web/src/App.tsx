import './App.css'
import TableDocuments from './modules/documents/components/TableDocuments'

function App() {
  return (
    <main className="py-4 px-8">
      <h1 className="text-2xl font-semibold">
        {' '}
        Sistema de Registro y Gestión de Documentos Jurídicos
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Oficina de Representación del INM Guerrero
      </p>

      <TableDocuments />
    </main>
  )
}

export default App
