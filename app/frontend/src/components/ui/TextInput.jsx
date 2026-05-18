function TextInput({ label, error, className = '', ...props }) {
  return (
    <label className={['field', className].filter(Boolean).join(' ')}>
      {label ? <span>{label}</span> : null}
      <input className={error ? 'input input-error' : 'input'} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  )
}

export default TextInput
