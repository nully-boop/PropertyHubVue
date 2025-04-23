import { create } from 'zustand';
import { Property } from '@/types';

interface FavoriteState {
  favorites: number[];
  addFavorite: (propertyId: number) => void;
  removeFavorite: (propertyId: number) => void;
  isFavorite: (propertyId: number) => boolean;
}

interface UserState {
  user: { id: number; username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: boolean;
}

// Favorite properties store
export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  
  addFavorite: (propertyId: number) => {
    const { favorites } = get();
    const updatedFavorites = [...favorites, propertyId];
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    set({ favorites: updatedFavorites });
  },
  
  removeFavorite: (propertyId: number) => {
    const { favorites } = get();
    const updatedFavorites = favorites.filter(id => id !== propertyId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    set({ favorites: updatedFavorites });
  },
  
  isFavorite: (propertyId: number) => {
    const { favorites } = get();
    return favorites.includes(propertyId);
  }
}));

// User authentication store
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  
  login: async (username: string, password: string) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, just checking if username is "demo"
      if (username === 'demo' && password === 'demo123') {
        set({ 
          user: { id: 1, username: 'demo' },
          isLoggedIn: true
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  
  logout: () => {
    set({ user: null, isLoggedIn: false });
  }
}));

// Search state
interface SearchState {
  searchFilters: Record<string, any>;
  setSearchFilters: (filters: Record<string, any>) => void;
  clearSearchFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchFilters: {},
  
  setSearchFilters: (filters: Record<string, any>) => {
    set({ searchFilters: filters });
  },
  
  clearSearchFilters: () => {
    set({ searchFilters: {} });
  }
}));
