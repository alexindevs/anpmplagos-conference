import { ExhibitorProfile } from "@/lib/api";

export interface ExhibitorDashboardModals {
  editProfile: boolean;
  addProduct: boolean;
  editProduct: string | null;
  addRepresentative: boolean;
  editRepresentative: string | null;
}

export const initialModalsState: ExhibitorDashboardModals = {
  editProfile: false,
  addProduct: false,
  editProduct: null,
  addRepresentative: false,
  editRepresentative: null,
};

export type ModalAction =
  | { type: "OPEN_EDIT_PROFILE" }
  | { type: "CLOSE_EDIT_PROFILE" }
  | { type: "OPEN_ADD_PRODUCT" }
  | { type: "CLOSE_ADD_PRODUCT" }
  | { type: "OPEN_EDIT_PRODUCT"; productId: string }
  | { type: "CLOSE_EDIT_PRODUCT" }
  | { type: "OPEN_ADD_REPRESENTATIVE" }
  | { type: "CLOSE_ADD_REPRESENTATIVE" }
  | { type: "OPEN_EDIT_REPRESENTATIVE"; repId: string }
  | { type: "CLOSE_EDIT_REPRESENTATIVE" }
  | { type: "CLOSE_ALL" };

export function modalsReducer(state: ExhibitorDashboardModals, action: ModalAction): ExhibitorDashboardModals {
  switch (action.type) {
    case "OPEN_EDIT_PROFILE":
      return { ...initialModalsState, editProfile: true };
    case "CLOSE_EDIT_PROFILE":
      return { ...state, editProfile: false };
    case "OPEN_ADD_PRODUCT":
      return { ...initialModalsState, addProduct: true };
    case "CLOSE_ADD_PRODUCT":
      return { ...state, addProduct: false };
    case "OPEN_EDIT_PRODUCT":
      return { ...initialModalsState, editProduct: action.productId };
    case "CLOSE_EDIT_PRODUCT":
      return { ...state, editProduct: null };
    case "OPEN_ADD_REPRESENTATIVE":
      return { ...initialModalsState, addRepresentative: true };
    case "CLOSE_ADD_REPRESENTATIVE":
      return { ...state, addRepresentative: false };
    case "OPEN_EDIT_REPRESENTATIVE":
      return { ...initialModalsState, editRepresentative: action.repId };
    case "CLOSE_EDIT_REPRESENTATIVE":
      return { ...state, editRepresentative: null };
    case "CLOSE_ALL":
      return initialModalsState;
    default:
      return state;
  }
}
