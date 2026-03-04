import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { Offer } from "../apiClient";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  offerId: string;
  offerName: string;
  offerPieces: number;
  offerPriceCents: number;
  imageUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Offer }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { offerId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_FROM_STORAGE"; payload: CartItem[] };

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalCents: number;
  addItem: (offer: Offer) => void;
  removeItem: (offerId: string) => void;
  updateQuantity: (offerId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (offerId: string) => boolean;
  getQuantity: (offerId: string) => number;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "sete_cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const offer = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.offerId === offer.id,
      );
      if (existingIndex >= 0) {
        const updatedItems = state.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
        return { items: updatedItems };
      }
      const newItem: CartItem = {
        offerId: offer.id,
        offerName: offer.name,
        offerPieces: Number(offer.pieces),
        offerPriceCents: Number(offer.priceCents),
        imageUrl: offer.imageUrl,
        quantity: 1,
      };
      return { items: [...state.items, newItem] };
    }
    case "REMOVE_ITEM": {
      return {
        items: state.items.filter((item) => item.offerId !== action.payload),
      };
    }
    case "UPDATE_QUANTITY": {
      const { offerId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.offerId !== offerId),
        };
      }
      return {
        items: state.items.map((item) =>
          item.offerId === offerId ? { ...item, quantity } : item,
        ),
      };
    }
    case "CLEAR_CART": {
      return { items: [] };
    }
    case "LOAD_FROM_STORAGE": {
      return { items: action.payload };
    }
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "LOAD_FROM_STORAGE", payload: parsed });
        }
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore write errors
    }
  }, [state.items]);

  const addItem = useCallback((offer: Offer) => {
    dispatch({ type: "ADD_ITEM", payload: offer });
  }, []);

  const removeItem = useCallback((offerId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: offerId });
  }, []);

  const updateQuantity = useCallback((offerId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { offerId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const isInCart = useCallback(
    (offerId: string) => state.items.some((item) => item.offerId === offerId),
    [state.items],
  );

  const getQuantity = useCallback(
    (offerId: string) =>
      state.items.find((item) => item.offerId === offerId)?.quantity ?? 0,
    [state.items],
  );

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = state.items.reduce(
    (sum, item) => sum + item.offerPriceCents * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalCents,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
