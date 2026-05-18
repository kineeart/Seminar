function Card({ children, variant = 'base', interactive = false, className = '', ...props }) {
  const classes = ['card-base', variant !== 'base' ? `card-${variant}` : '', interactive ? 'card-interactive' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes} {...props}>
      {children}
    </article>
  )
}

export default Card
