import { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Initial cart state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, size } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.id === product.id && item.size === size
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Item exists, increase quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // New item, add to cart
        newItems = [...state.items, { ...product, size, quantity: 1 }];
      }

      const newTotal = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const newItemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { productId, size } = action.payload;
      const newItems = state.items.filter(
        item => !(item.id === productId && item.size === size)
      );

      const newTotal = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const newItemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, size, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { productId, size }
        });
      }

      const newItems = state.items.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      );

      const newTotal = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const newItemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return initialState;

    case CART_ACTIONS.LOAD_CART: {
      const items = action.payload || [];
      const total = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const itemCount = items.reduce((count, item) => count + item.quantity, 0);

      return {
        ...state,
        items,
        total,
        itemCount
      };
    }

    default:
      return state;
  }
}

// Create context
const CartContext = createContext();

// Cart provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('aham-brahmasmi-cart');
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartItems });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      } finally {
        setIsInitialized(true);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem('aham-brahmasmi-cart', JSON.stringify(state.items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [state.items, isInitialized]);

  // Cart action functions
  const addToCart = (product, size = 'M') => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, size }
    });
  };

  const removeFromCart = (productId, size) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId, size }
    });
  };

  const updateQuantity = (productId, size, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, size, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (productId, size) => {
    const item = state.items.find(item => item.id === productId && item.size === size);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId, size) => {
    return state.items.some(item => item.id === productId && item.size === size);
  };

  // Calculate totals with tax and shipping
  const calculateTotals = () => {
    const subtotal = state.total;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const shipping = subtotal > 1499 ? 0 : 59; // Free shipping above 1499
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total
    };
  };

  const value = {
    // State
    items: state.items,
    itemCount: state.itemCount,
    total: state.total,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Utilities
    getItemQuantity,
    isInCart,
    calculateTotals
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;