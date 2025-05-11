import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    border: string;
    card: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DARK_MODE_KEY = 'patmos_dark_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'true');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem(DARK_MODE_KEY, newValue.toString());
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const colors = {
    background: isDarkMode ? '#121212' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#333333',
    primary: '#841584',
    secondary: isDarkMode ? '#a06ba5' : '#841584',
    border: isDarkMode ? '#333333' : '#f0f0f0',
    card: isDarkMode ? '#1e1e1e' : '#ffffff',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 