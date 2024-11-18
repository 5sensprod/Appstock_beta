const GridCell = ({
  id,
  width,
  height,
  left,
  top,
  isSelected,
  isLinkedAndSelected,
  linkedGroup,
  onClick,
  content
}) => {
  const isEmpty = !content
  const isLinked = linkedGroup.length > 0

  const styles = {
    position: 'absolute',
    width: `${width}%`,
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`,
    border: isLinked
      ? '2px solid rgba(255, 105, 180, 0.8)' // Bordure rose pour les cellules liées
      : isSelected
        ? '2px solid #007bff' // Bordure bleue pour la cellule sélectionnée
        : '1px solid #ccc',
    backgroundColor: isLinkedAndSelected
      ? 'rgba(255, 20, 147, 0.7)' // Rose foncé pour les cellules liées et sélectionnées
      : isLinked
        ? 'rgba(255, 182, 193, 0.5)' // Rose clair pour les cellules liées
        : isSelected
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
