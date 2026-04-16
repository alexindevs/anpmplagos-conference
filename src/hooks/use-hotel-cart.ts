"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  checkoutOrder,
  getCurrentCart,
  removeCartItem,
  type AddCartItemBody,
  type Cart,
} from "@/lib/api";

export const hotelCartQueryKey = ["carts", "current", "hotel"] as const;

export function useHotelCart(enabled = true) {
  return useQuery({
    queryKey: hotelCartQueryKey,
    queryFn: () => getCurrentCart("hotel"),
    enabled,
  });
}

export function useAddHotelCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<AddCartItemBody, "cartKind">) => addCartItem({ ...body, cartKind: "hotel" }),
    onSuccess: (cart: Cart) => {
      queryClient.setQueryData(hotelCartQueryKey, cart);
      void queryClient.invalidateQueries({ queryKey: hotelCartQueryKey });
    },
  });
}

export function useRemoveHotelCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hotelCartQueryKey });
    },
  });
}

export function useCheckoutHotelCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => checkoutOrder("hotel"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hotelCartQueryKey });
    },
  });
}
