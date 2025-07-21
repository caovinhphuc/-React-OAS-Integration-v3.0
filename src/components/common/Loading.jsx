// src/components/common/Loading.jsx
import { CircularProgress } from '@mui/material';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xl};
  min-height: ${(props) => (props.fullHeight ? '100vh' : '200px')};

  ${(props) =>
    props.overlay &&
    `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: ${props.theme.zIndex.overlay};
  `}

  ${(props) =>
    props.inline &&
    `
    min-height: auto;
    padding: ${props.theme.spacing.md};
  `}
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

// Custom Spinner Components
const DefaultSpinner = styled.div`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border: 3px solid ${(props) => props.theme.colors.border.light};
  border-top: 3px solid ${(props) => props.theme.colors.primary[500]};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const DotsSpinner = styled.div`
  display: flex;
  gap: 4px;

  .dot {
    width: 8px;
    height: 8px;
    background: ${(props) => props.theme.colors.primary[500]};
    border-radius: 50%;
    animation: ${bounce} 1.4s ease-in-out infinite both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    &:nth-child(3) {
      animation-delay: 0s;
    }
  }
`;

const PulseSpinner = styled.div`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: ${(props) => props.theme.colors.primary[500]};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const RippleSpinner = styled.div`
  position: relative;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;

  div {
    position: absolute;
    border: 2px solid ${(props) => props.theme.colors.primary[500]};
    opacity: 1;
    border-radius: 50%;
    animation: ${keyframes`
      0% {
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      100% {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transform: translate(0, 0);
      }
    `} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;

    &:nth-child(2) {
      animation-delay: -0.5s;
    }
  }
`;

const LoadingText = styled.div`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.sm};

  ${(props) =>
    props.large &&
    `
    font-size: ${props.theme.typography.fontSize.base};
    margin-top: ${props.theme.spacing.md};
  `}
`;

const LoadingCard = styled.div`
  background: ${(props) => props.theme.colors.background.paper};
  border-radius: ${(props) => props.theme.borderRadius.xl};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.lg};
  text-align: center;
  min-width: 200px;
`;

const SkeletonLine = styled.div`
  height: ${(props) => props.height || '16px'};
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.colors.neutral[200]} 25%,
    ${(props) => props.theme.colors.neutral[100]} 50%,
    ${(props) => props.theme.colors.neutral[200]} 75%
  );
  background-size: 200% 100%;
  border-radius: ${(props) => props.theme.borderRadius.base};
  animation: ${keyframes`
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  `} 1.5s ease-in-out infinite;

  ${(props) => props.width && `width: ${props.width};`}
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const SkeletonContainer = styled.div`
  padding: ${(props) => props.theme.spacing.md};

  ${(props) =>
    props.card &&
    `
    background: ${props.theme.colors.background.paper};
    border-radius: ${props.theme.borderRadius.lg};
    box-shadow: ${props.theme.shadows.sm};
  `}
`;

const Loading = ({
  type = 'default', // default, dots, pulse, ripple, material, skeleton
  size = 40,
  text,
  overlay = false,
  fullHeight = false,
  inline = false,
  card = false,
  skeletonLines = 3,
  className,
  ...props
}) => {
  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <DotsSpinner>
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </DotsSpinner>
        );

      case 'pulse':
        return <PulseSpinner size={size} />;

      case 'ripple':
        return (
          <RippleSpinner size={size}>
            <div />
            <div />
          </RippleSpinner>
        );

      case 'material':
        return (
          <CircularProgress
            size={size}
            thickness={4}
            sx={{
              color: (theme) => theme.palette.primary.main,
            }}
          />
        );

      case 'skeleton':
        return (
          <SkeletonContainer card={card}>
            {Array.from({ length: skeletonLines }, (_, index) => (
              <SkeletonLine
                key={index}
                height="16px"
                width={index === skeletonLines - 1 ? '60%' : index === 0 ? '80%' : '100%'}
              />
            ))}
          </SkeletonContainer>
        );

      default:
        return <DefaultSpinner size={size} />;
    }
  };

  if (type === 'skeleton') {
    return renderSpinner();
  }

  const content = (
    <>
      <SpinnerContainer>{renderSpinner()}</SpinnerContainer>
      {text && <LoadingText large={size > 40}>{text}</LoadingText>}
    </>
  );

  if (card) {
    return (
      <LoadingContainer
        overlay={overlay}
        fullHeight={fullHeight}
        inline={inline}
        className={className}
        {...props}
      >
        <LoadingCard>{content}</LoadingCard>
      </LoadingContainer>
    );
  }

  return (
    <LoadingContainer
      overlay={overlay}
      fullHeight={fullHeight}
      inline={inline}
      className={className}
      {...props}
    >
      {content}
    </LoadingContainer>
  );
};

// Skeleton Components for specific use cases
export const TextSkeleton = ({ lines = 3, width = '100%' }) => (
  <SkeletonContainer>
    {Array.from({ length: lines }, (_, index) => (
      <SkeletonLine
        key={index}
        width={typeof width === 'object' ? width[index] || '100%' : width}
      />
    ))}
  </SkeletonContainer>
);

export const CardSkeleton = () => (
  <SkeletonContainer card>
    <SkeletonLine height="20px" width="60%" />
    <SkeletonLine height="14px" width="100%" />
    <SkeletonLine height="14px" width="80%" />
    <SkeletonLine height="14px" width="90%" />
  </SkeletonContainer>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <SkeletonContainer key={rowIndex}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <SkeletonLine key={colIndex} width={`${100 / columns}%`} height="14px" />
          ))}
        </div>
      </SkeletonContainer>
    ))}
  </div>
);

export default Loading;
