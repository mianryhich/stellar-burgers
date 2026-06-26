import { FC } from 'react';
import { useSelector } from '../../services/store';
import { selectUser } from '../../services/slices/userSlice';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => {
  const user = useSelector(selectUser);
  return <AppHeaderUI userName={user?.name || ''} />;
};
