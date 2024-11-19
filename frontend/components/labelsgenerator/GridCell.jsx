const GridCell = ({
  id,
  width,
  height,
  left,
  top,
  isSelected,
  isLinkedAndSelected,
  linkedGroup,
  linkedByCsv,
  onClick,
  content
}) => {
  // Vérifier si le contenu est marqué comme contenu initial
  // const isInitialContent = content?.every((item) => item.isInitialContent)
  const isEmpty = !content || content.length === 0
  const isLinked = linkedGroup.length > 0

  const isLinkedByCsv = linkedByCsv && linkedGroup.length > 1 // Cellule liée via CSV et encore dans un groupe

  const styles = {
    position: 'absolute',
    width: `${width}%`,
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`,
    border: isLinked
      ? '2px solid rgba(255, 105, 180, 0.8)'
      : isSelected
        ? '2px solid #007bff'
        : '1px solid #ccc',
    backgroundColor: isLinkedAndSelected
      ? isLinkedByCsv
        ? 'rgba(255, 204, 0, 0.7)'
        : 'rgba(255, 20, 147, 0.7)'
      : isLinkedByCsv
        ? 'rgba(255, 255, 0, 0.4)'
        : isLinked
          ? 'rgba(255, 182, 193, 0.5)'
          : isSelected
            ? 'rgba(0, 123, 255, 0.5)'
            : isEmpty
              ? '#fff' // Fond blanc pour les cellules vides
              : 'rgba(0, 123, 255, 0.2)',
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
