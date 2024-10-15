// components/NumericKeypad.js
const NumericKeypad = ({
  appendPin,
  clearPin
}) => {
  const numbers = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0'
  ]

  return (
    <div className="mt-4 grid grid-cols-3 gap-4">
      {numbers.map((number) => (
        <button
          key={number}
          type="button"
          className="rounded-md p-4"
          onClick={() => appendPin(number)}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        className="col-span-2 rounded-md p-4"
        onClick={clearPin}
      >
        Effacer
      </button>
    </div>
  )
}

export default NumericKeypad
