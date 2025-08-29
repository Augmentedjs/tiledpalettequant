const ErrorMessage = (props: { message: string }) => {
  return (
    <div className="error-message">{props.message}</div>
  );
};

export default ErrorMessage;
