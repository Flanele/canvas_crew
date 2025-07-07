import { Link } from "react-router-dom";
import { Container } from "./Container";
import React from "react";
import { cn } from "../lib/utils/cn";

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn("bg-header-bg py-4", className)}>
      <Container>
        <Link className="px-2 text-light-text" to="/">
          CanvasCrew
        </Link>
      </Container>
    </div>
  );
};
