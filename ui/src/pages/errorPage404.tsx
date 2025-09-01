import { type FC } from "react";
import { Link } from "react-router-dom";
import beaker from "../images/beaker.png";

const ErrorPage: FC = () => {
  return (
    <main>
      <figure className="logo">
        <img src={beaker} alt="error" />
      </figure>
      <h1>Oops!</h1>
      <p>Sorry, we could not find what you were looking for.</p>
      <Link to="/">
        Return to Home
      </Link>
    </main>
  );
};

export default ErrorPage;
