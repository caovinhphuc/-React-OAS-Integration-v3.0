// src/components/common/Button.jsx
import { CircularProgress } from '@mui/material';
import React from 'react';
import styled, { css } from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-family: ${(props) => props.theme.typography.fontFamily.primary};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${(props) => props.theme.animations.transition.fast};
  position: relative;
  text-decoration: none;
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary[500]}40;
  }

  // Size variants
  ${(props) =>
                    props.size === 'sm' &&
                    css`
      padding: 6px 12px;
      font-size: 0.75rem;
      line-height: 1.4;
      height: 32px;
    `}

  ${(props) =>
                    props.size === 'md' &&
                    css`
      padding: 8px 16px;
      font-size: 0.875rem;
      line-height: 1.4;
      height: 40px;
    `}

  ${(props) =>
                    props.size === 'lg' &&
                    css`
      padding: 10px 20px;
      font-size: 1rem;
      line-height: 1.5;
      height: 48px;
    `}

  ${(props) =>
                    props.size === 'xl' &&
                    css`
      padding: 12px 24px;
      font-size: 1.125rem;
      line-height: 1.5;
      height: 56px;
    `}

  // Variant styles
  ${(props) =>
                    props.variant === 'primary' &&
                    css`
      background: ${props.theme.colors.primary[500]};
      color: white;

      &:hover:not(:disabled) {
        background: ${props.theme.colors.primary[600]};
        transform: translateY(-1px);
        box-shadow: 0 4px 8px ${props.theme.colors.primary[500]}40;
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px ${props.theme.colors.primary[500]}40;
      }
    `}

  ${(props) =>
                    props.variant === 'secondary' &&
                    css`
      background: ${props.theme.colors.secondary[500]};
      color: white;

      &:hover:not(:disabled) {
        background: ${props.theme.colors.secondary[600]};
        transform: translateY(-1px);
        box-shadow: 0 4px 8px ${props.theme.colors.secondary[500]}40;
      }
    `}

  ${(props) =>
                    props.variant === 'outline' &&
                    css`
      background: transparent;
      color: ${props.theme.colors.primary[500]};
      border: 2px solid ${props.theme.colors.primary[500]};

      &:hover:not(:disabled) {
        background: ${props.theme.colors.primary[500]};
        color: white;
        transform: translateY(-1px);
      }
    `}

  ${(props) =>
                    props.variant === 'ghost' &&
                    css`
      background: transparent;
      color: ${props.theme.colors.text.primary};

      &:hover:not(:disabled) {
        background: ${props.theme.colors.action.hover};
        transform: translateY(-1px);
      }
    `}

  ${(props) =>
                    props.variant === 'success' &&
                    css`
      background: ${props.theme.colors.success[500]};
      color: white;

      &:hover:not(:disabled) {
        background: ${props.theme.colors.success[600]};
        transform: translateY(-1px);
        box-shadow: 0 4px 8px ${props.theme.colors.success[500]}40;
      }
    `}

  ${(props) =>
                    props.variant === 'warning' &&
                    css`
      background: ${props.theme.colors.warning[500]};
      color: white;

      &:hover:not(:disabled) {
        background: ${props.theme.colors.warning[600]};
        transform: translateY(-1px);
        box-shadow: 0 4px 8px ${props.theme.colors.warning[500]}40;
      }
    `}

  ${(props) =>
                    props.variant === 'error' &&
                    css`
      background: ${props.theme.colors.error[500]};
      color: white;

      &:hover:not(:disabled) {
        background: ${props.theme.colors.error[600]};
        transform: translateY(-1px);
        box-shadow: 0 4px 8px ${props.theme.colors.error[500]}40;
      }
    `}

  // Full width
  ${(props) =>
                    props.fullWidth &&
                    css`
      width: 100%;
    `}

  // Rounded variants
  ${(props) =>
                    props.rounded &&
                    css`
      border-radius: 50px;
    `}

  // Icon only
  ${(props) =>
                    props.iconOnly &&
                    css`
      width: ${props.size === 'sm'
                                        ? '32px'
                                        : props.size === 'lg'
                                                  ? '48px'
                                                  : props.size === 'xl'
                                                            ? '56px'
                                                            : '40px'};
      padding: 0;
    `}
`;

const LoadingSpinner = styled(CircularProgress)`
  && {
    color: currentColor;
    width: 16px !important;
    height: 16px !important;
  }
`;

const Button = React.forwardRef(
          (
                    {
                              children,
                              variant = 'primary',
                              size = 'md',
                              loading = false,
                              disabled = false,
                              fullWidth = false,
                              rounded = false,
                              iconOnly = false,
                              startIcon,
                              endIcon,
                              onClick,
                              type = 'button',
                              className,
                              ...props
                    },
                    ref,
          ) => {
                    const handleClick = (e) => {
                              if (loading || disabled) {
                                        e.preventDefault();
                                        return;
                              }
                              onClick?.(e);
                    };

                    return (
                              <StyledButton
                                        ref={ref}
                                        type={type}
                                        variant={variant}
                                        size={size}
                                        disabled={disabled || loading}
                                        fullWidth={fullWidth}
                                        rounded={rounded}
                                        iconOnly={iconOnly}
                                        onClick={handleClick}
                                        className={className}
                                        {...props}
                              >
                                        {loading ? (
                                                  <LoadingSpinner />
                                        ) : (
                                                  <>
                                                            {startIcon && <span>{startIcon}</span>}
                                                            {children && !iconOnly && <span>{children}</span>}
                                                            {endIcon && <span>{endIcon}</span>}
                                                  </>
                                        )}
                              </StyledButton>
                    );
          },
);

Button.displayName = 'Button';

export default Button;
