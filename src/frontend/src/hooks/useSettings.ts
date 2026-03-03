import { useQuery } from "@tanstack/react-query";
import type { Settings } from "../apiClient";
import { useActor } from "./useActor";

export const DEFAULT_SETTINGS: Settings = {
  brandName: "SETE",
  pickupAddress: "Blaumaņa 34-2, Rīga",
  workHoursText: "P–Sv 12:00–22:00",
  deliveryNote: "Piegāde Rīgā. Precizēsim laiku pēc pasūtījuma.",
  minOrderCents: BigInt(0),
  currencySymbol: "€",
};

export function useSettings() {
  const { actor, isFetching } = useActor();

  const { data, isLoading, error } = useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) return DEFAULT_SETTINGS;
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    placeholderData: DEFAULT_SETTINGS,
  });

  return {
    settings: data ?? DEFAULT_SETTINGS,
    isLoading,
    error,
  };
}
