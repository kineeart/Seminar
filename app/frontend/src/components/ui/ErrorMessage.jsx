import Button from './Button'

function ErrorMessage({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
      {onRetry ? <Button size="sm" onClick={onRetry}>Retry</Button> : null}
    </div>
  )
}

export default ErrorMessage
