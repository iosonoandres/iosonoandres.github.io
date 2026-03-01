import React from 'react';

const NeonButton = ({
  as: Component = 'a',
  href = '#',
  type = 'button',
  variant = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const classes = `neon-button neon-button-${variant} ${className}`.trim();

  if (Component === 'button') {
    return (
      <button type={type} className={classes} {...rest}>
        <span>{children}</span>
      </button>
    );
  }

  return (
    <Component href={href} className={classes} {...rest}>
      <span>{children}</span>
    </Component>
  );
};

export default NeonButton;
