import React from 'react';
import useMagnetic from '../../hooks/useMagnetic';

const MagneticLink = ({ href, children, className = '', ...rest }) => {
  const { elementRef, onMouseMove, onMouseLeave } = useMagnetic();

  return (
    <a
      ref={elementRef}
      href={href}
      className={`magnetic-link ${className}`.trim()}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      {children}
    </a>
  );
};

export default MagneticLink;
