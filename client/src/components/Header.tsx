import { Link } from "react-router-dom";
import { Container } from "./Container";

export const Header = () => {
  return (
    <div className="bg-header-bg py-4">
      <Container>
        <Link className="px-2 text-light-text" to="/">
          CanvasCrew
        </Link>
      </Container>
    </div>
  );
};
