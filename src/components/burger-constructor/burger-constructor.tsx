import { FC, useMemo } from 'react';
import { useSelector } from '../../services/store';
import { selectConstructorItems } from '../../services/slices/constructorSlice';
import { BurgerConstructorUI } from '@ui';
import { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor: FC = () => {
  // Получаем данные из стора с значениями по умолчанию
  const constructorItems = useSelector(selectConstructorItems);

  // Гарантируем, что у нас всегда есть bun и ingredients
  const safeConstructorItems = {
    bun: constructorItems?.bun || null,
    ingredients: constructorItems?.ingredients || []
  };

  const orderRequest = false;
  const orderModalData = null;

  const onOrderClick = () => {
    if (!safeConstructorItems.bun || orderRequest) return;
  };

  const closeOrderModal = () => {};

  const price = useMemo(
    () =>
      (safeConstructorItems.bun ? safeConstructorItems.bun.price * 2 : 0) +
      safeConstructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [safeConstructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={safeConstructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};