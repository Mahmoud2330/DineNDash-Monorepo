import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import logoImage from '../assets/logo.png';

const LogoContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FBF4E3;
`;

const Logo = styled.img`
  width: 285px;
  height: auto;
  margin-top: -330px;
  animation: none;
  animation-fill-mode: forwards;

  &.spin {
    animation: spinLogo 3s ease-in-out;
  }

  @keyframes spinLogo {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(1800deg); /* 5 full rotations (360 * 5) */
    }
  }
`;

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Start spinning after 1 second
    const spinTimer = setTimeout(() => {
      const logo = document.getElementById('logo');
      logo.classList.add('spin');
    }, 1000);

    // Navigate to login after 6 seconds
    const navigationTimer = setTimeout(() => {
      navigate('/login');
    }, 6000);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <LogoContainer>
      <Logo
        id="logo"
        src={logoImage}
        alt="Dine N Dash Logo"
      />
    </LogoContainer>
  );
} 