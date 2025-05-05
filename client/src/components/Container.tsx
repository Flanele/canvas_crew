import React from 'react';
import { cn } from '../lib/utils/cn';

interface Props {
  className?: string;
  maxWidth?: string; // например, "max-w-screen-md"
}

export const Container: React.FC<React.PropsWithChildren<Props>> = ({
  className,
  children,
  maxWidth = 'max-w-[1280px]',
}) => {
  return <div className={cn('mx-auto', maxWidth, className)}>{children}</div>;
};

