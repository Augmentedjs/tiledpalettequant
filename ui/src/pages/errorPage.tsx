import { type FC } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/atomics/error";
import beaker from "../images/beaker.png";

const ErrorPage: FC<{ message?: string }> = ({ message }) => {
  return (
    <main>
      <figure className="logo">
        <img src={beaker} alt="error"/>
      </figure>
      <h1>Oops! Something went wrong.</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      {message && (
        <ErrorMessage message={message} />
      )}
      <Link to="/">
        Return to Home
      </Link>
    </main>
  );
};

export default ErrorPage;
