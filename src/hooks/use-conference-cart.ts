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

export const conferenceCartQueryKey = ["carts", "current", "conference"] as const;

export function useConferenceCart(enabled = true) {
  return useQuery({
    queryKey: conferenceCartQueryKey,
    queryFn: () => getCurrentCart("conference"),
    enabled,
  });
}

export function useAddConferenceCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddCartItemBody) => addCartItem({ ...body, cartKind: "conference" }),
    onSuccess: (cart: Cart) => {
      queryClient.setQueryData(conferenceCartQueryKey, cart);
      void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
    },
  });
}

export function useRemoveConferenceCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
    },
  });
}

export function useCheckoutConferenceCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => checkoutOrder("conference"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
    },
  });
}
