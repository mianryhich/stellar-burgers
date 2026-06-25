import { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

type TProtectedRouteProps = {
  onlyForAuth: boolean;
  isAuthenticated: boolean;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyForAuth,
  isAuthenticated
}) => {
  const location = useLocation();

  if (onlyForAuth && !isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (!onlyForAuth && isAuthenticated) {
    const from = (location.state as { from?: Location })?.from || {
      pathname: '/'
    };
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
