import React, { useState } from 'react'
import { useInstance } from '../../context/InstanceContext'

const TemplateManager = () => {
  const { saveTemplate, loadTemplate, templates } = useInstance()
  const [templateName, setTemplateName] = useState('')

  const handleSaveTemplate = () => {
    console.log('Bouton Enregistrer le template cliqué') // Log pour vérifier le déclenchement
    if (templateName.trim()) {
      saveTemplate(templateName)
      setTemplateName('')
      alert(`Template "${templateName}" enregistré avec succès !`)
    }
  }
  console.log('Propriétés du contexte Instance:', { saveTemplate, loadTemplate, templates })

  return (
    <div>
      <input
        type="text"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        placeholder="Nom du template"
      />
      <button onClick={handleSaveTemplate}>Enregistrer le template</button>
      <div>
        <h3>Templates existants :</h3>
        {templates && Object.keys(templates).length > 0 ? (
          Object.keys(templates).map((name) => (
            <button key={name} onClick={() => loadTemplate(name)}>
              {name}
            </button>
          ))
        ) : (
          <p>Aucun template disponible</p>
        )}
      </div>
    </div>
  )
}

export default TemplateManager
