import { Link } from 'react-router-dom'

function Button({ children, to, variant = 'primary', size = 'md', className = '', ...props }) {
  const variantClass = variant === 'ghost' ? 'ghost' : variant === 'danger' ? 'red' : variant === 'success' ? 'green' : ''
  const sizeClass = size === 'sm' ? 'btn-inline' : ''
  const classes = ['btn', variantClass, sizeClass, className].filter(Boolean).join(' ')

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} type={props.type || 'button'} {...props}>
      {children}
    </button>
  )
}

export default Button
