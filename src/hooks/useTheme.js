import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme } from '@/redux/features/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  return {
    mode,
    isDark: mode === 'dark',
    toggle: () => dispatch(toggleTheme()),
    setTheme: (theme) => dispatch(setTheme(theme)),
  };
};
