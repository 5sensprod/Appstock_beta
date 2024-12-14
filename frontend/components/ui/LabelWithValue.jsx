import React from 'react'
import PropTypes from 'prop-types'

const LabelWithValue = ({ label, value }) => {
  return (
    <label className="flex w-full justify-between text-sm font-medium text-gray-700">
      <span>{label}</span>
      <span className="text-sm text-gray-500">{value}</span>
    </label>
  )
}

LabelWithValue.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

export default LabelWithValue
