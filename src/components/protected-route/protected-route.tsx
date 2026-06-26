import { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { selectIsAuthenticated } from '../../services/slices/userSlice';

type TProtectedRouteProps = {
  onlyForAuth: boolean;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({ onlyForAuth }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

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
