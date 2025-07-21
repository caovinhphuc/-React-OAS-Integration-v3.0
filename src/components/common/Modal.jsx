// src/components/common/Modal.jsx
import { X as CloseIcon } from '@mui/icons-material';
import { Backdrop, Fade, Modal as MuiModal } from '@mui/material';
import styled from 'styled-components';
import Button from './Button';

const StyledModal = styled(MuiModal)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.background.paper};
  border-radius: ${(props) => props.theme.borderRadius.xl};
  box-shadow: ${(props) => props.theme.shadows['2xl']};
  outline: none;
  min-width: 320px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  @media (max-width: 768px) {
    margin: 16px;
    min-width: auto;
    width: calc(100vw - 32px);
  }

  ${(props) =>
    props.size === 'sm' &&
    `
    width: 400px;
  `}

  ${(props) =>
    props.size === 'md' &&
    `
    width: 600px;
  `}

  ${(props) =>
    props.size === 'lg' &&
    `
    width: 800px;
  `}

  ${(props) =>
    props.size === 'xl' &&
    `
    width: 1000px;
  `}

  ${(props) =>
    props.size === 'full' &&
    `
    width: 95vw;
    height: 95vh;
  `}
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: ${(props) =>
    props.showDivider ? `1px solid ${props.theme.colors.border.light}` : 'none'};
  padding-bottom: ${(props) => (props.showDivider ? '16px' : '0')};
  margin-bottom: ${(props) => (props.showDivider ? '24px' : '0')};

  h2 {
    margin: 0;
    font-size: ${(props) => props.theme.typography.fontSize['2xl']};
    font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
    color: ${(props) => props.theme.colors.text.primary};
  }

  @media (max-width: 768px) {
    padding: 16px 16px 0 16px;

    h2 {
      font-size: ${(props) => props.theme.typography.fontSize.xl};
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: ${(props) => props.theme.borderRadius.md};
  cursor: pointer;
  color: ${(props) => props.theme.colors.text.secondary};
  transition: ${(props) => props.theme.animations.transition.fast};

  &:hover {
    background: ${(props) => props.theme.colors.action.hover};
    color: ${(props) => props.theme.colors.text.primary};
  }

  &:focus {
    outline: 2px solid ${(props) => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const ModalBody = styled.div`
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: ${(props) =>
    props.showDivider ? `1px solid ${props.theme.colors.border.light}` : 'none'};
  margin-top: ${(props) => (props.showDivider ? '24px' : '0')};

  @media (max-width: 768px) {
    padding: 16px;
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const Modal = ({
  open = false,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  showHeaderDivider = true,
  showFooterDivider = true,
  footer,
  primaryAction,
  secondaryAction,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  ...props
}) => {
  const handleClose = (event, reason) => {
    if (!closeOnBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (!closeOnEscape && reason === 'escapeKeyDown') {
      return;
    }
    onClose?.(event, reason);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onClose?.(event, 'escapeKeyDown');
    }
  };

  return (
    <StyledModal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      className={className}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <Fade in={open}>
        <ModalContent size={size}>
          {(title || showCloseButton) && (
            <ModalHeader showDivider={showHeaderDivider}>
              {title && <h2>{title}</h2>}
              {showCloseButton && (
                <CloseButton onClick={(e) => onClose?.(e, 'closeButtonClick')}>
                  <CloseIcon />
                </CloseButton>
              )}
            </ModalHeader>
          )}

          <ModalBody>{children}</ModalBody>

          {(footer || primaryAction || secondaryAction) && (
            <ModalFooter showDivider={showFooterDivider}>
              {footer || (
                <>
                  {secondaryAction && (
                    <Button
                      variant="outline"
                      onClick={secondaryAction.onClick}
                      disabled={secondaryAction.disabled}
                      loading={secondaryAction.loading}
                    >
                      {secondaryAction.label || 'Hủy'}
                    </Button>
                  )}
                  {primaryAction && (
                    <Button
                      variant={primaryAction.variant || 'primary'}
                      onClick={primaryAction.onClick}
                      disabled={primaryAction.disabled}
                      loading={primaryAction.loading}
                    >
                      {primaryAction.label || 'Xác nhận'}
                    </Button>
                  )}
                </>
              )}
            </ModalFooter>
          )}
        </ModalContent>
      </Fade>
    </StyledModal>
  );
};

export default Modal;
