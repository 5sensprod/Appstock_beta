import React from 'react'

const GridCell = ({ id, col, row, width, height, left, top, isSelected, onClick, content }) => {
  const styles = {
    position: 'absolute',
    width: `${width}%`,
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`,
    border: isSelected ? '2px solid #007bff' : '1px solid #ccc',
    backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.2)' : 'rgba(200, 200, 200, 0.2)',
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
      {content || 'Vide'}
    </div>
  )
}

export default GridCell
