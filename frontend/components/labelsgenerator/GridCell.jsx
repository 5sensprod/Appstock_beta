const GridCell = ({
  id,
  width,
  height,
  left,
  top,
  isSelected,
  isLinkedAndSelected,
  linkedGroup = [],
  linkedByCsv,
  onClick,
  content = []
}) => {
  // Déterminer les états
  const isEmpty = content.length === 0
  const isLinked = linkedGroup.length > 0
  const isLinkedByCsv = linkedByCsv && linkedGroup.length > 1

  // Générer les styles dynamiquement
  const getBackgroundColor = () => {
    if (isLinkedAndSelected) {
      return isLinkedByCsv ? 'rgba(255, 204, 0, 0.7)' : 'rgba(255, 20, 147, 0.7)'
    }
    if (isLinkedByCsv) return 'rgba(255, 255, 0, 0.4)'
    if (isLinked) return 'rgba(255, 182, 193, 0.5)'
    if (isSelected) return 'rgba(0, 123, 255, 0.5)'
    if (isEmpty) return '#fff'
    return 'rgba(0, 123, 255, 0.2)'
  }

  const getBorderColor = () => {
    if (isLinked) return '2px solid rgba(255, 105, 180, 0.8)'
    if (isSelected) return '2px solid #007bff'
    return '1px solid #ccc'
  }

  const styles = {
    position: 'absolute',
    width: `${width}%`,
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`,
    border: getBorderColor(),
    backgroundColor: getBackgroundColor(),
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
      {/* Pas de contenu visible */}
    </div>
  )
}

export default GridCell
