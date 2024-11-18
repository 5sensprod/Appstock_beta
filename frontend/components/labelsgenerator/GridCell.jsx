import React from 'react'

const GridCell = ({ id, width, height, left, top, isSelected, onClick, content }) => {
  const isEmpty = !content // Une cellule est vide si `content` est falsy.

  const styles = {
    position: 'absolute',
    width: `${width}%`,
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`,
    border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
    backgroundColor: isSelected
      ? 'rgba(0, 123, 255, 0.5)' // Bleu clair pour la cellule sélectionnée
      : isEmpty
        ? 'rgba(220, 220, 220, 0.5)' // Gris clair pour les cellules vides
        : 'rgba(0, 123, 255, 0.2)', // Bleu léger pour les cellules avec contenu
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
    color: '#333',
    textAlign: 'center'
  }

  return (
    <div style={styles} onClick={() => onClick(id)} title={`Cell ${id}`}>
      {/* Pas de texte visible */}
    </div>
  )
}

export default GridCell
