import { Routes, Route, useLocation } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';

import { AppHeader, Modal, IngredientDetails, OrderInfo } from '@components';
import { Preloader } from '@ui';

import { ProtectedRoute } from '@components';

const App = () => {
  // Временные данные для проверки роутинга
  // Позже их заменим на данные из стора
  const isIngredientsLoading = false;
  const ingredients = []; // пока пустой массив, чтобы не показывать ошибку
  const error = null;
  const isAuthChecked = true; // временно true, чтобы показать контент
  const isAuthenticated = true; // меняйте на true/false для проверки

  const location = useLocation();
  const background = location.state?.background as Location | undefined;

  const handleModalClose = () => {
    window.history.back();
  };

  // Если проверка авторизации не завершена - показываем прелоадер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  return (
    <div className={styles.app}>
      <AppHeader />

      {isIngredientsLoading ? (
        <Preloader />
      ) : error ? (
        <div className={`${styles.error} text text_type_main-medium pt-4`}>
          {error}
        </div>
      ) : (
        <>
          <Routes location={background || location}>
            {/* Публичные маршруты */}
            <Route path='/' element={<ConstructorPage />} />
            <Route path='/feed' element={<Feed />} />

            {/* Маршруты только для неавторизованных */}
            <Route
              element={
                <ProtectedRoute
                  onlyForAuth={false}
                  isAuthenticated={isAuthenticated}
                />
              }
            >
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password' element={<ResetPassword />} />
            </Route>

            {/* Маршруты только для авторизованных */}
            <Route
              element={
                <ProtectedRoute onlyForAuth isAuthenticated={isAuthenticated} />
              }
            >
              <Route path='/profile' element={<Profile />} />
              <Route path='/profile/orders' element={<ProfileOrders />} />
              <Route path='/profile/orders/:number' element={<OrderInfo />} />
            </Route>

            {/* Маршруты с динамическими параметрами (доступны всем) */}
            <Route path='/ingredients/:id' element={<IngredientDetails />} />
            <Route path='/feed/:number' element={<OrderInfo />} />

            {/* 404 */}
            <Route path='*' element={<NotFound404 />} />
          </Routes>

          {/* Модальные окна */}
          {background && (
            <Routes>
              <Route
                path='/ingredients/:id'
                element={
                  <Modal title='Детали ингредиента' onClose={handleModalClose}>
                    <IngredientDetails />
                  </Modal>
                }
              />
              <Route
                path='/feed/:number'
                element={
                  <Modal title='Детали заказа' onClose={handleModalClose}>
                    <OrderInfo />
                  </Modal>
                }
              />
              <Route
                element={
                  <ProtectedRoute
                    onlyForAuth
                    isAuthenticated={isAuthenticated}
                  />
                }
              >
                <Route
                  path='/profile/orders/:number'
                  element={
                    <Modal title='Детали заказа' onClose={handleModalClose}>
                      <OrderInfo />
                    </Modal>
                  }
                />
              </Route>
            </Routes>
          )}
        </>
      )}
    </div>
  );
};

export default App;
