export type Ingredient = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  note: string;
  needsConfirmation: boolean;
  confirmed: boolean;
  unitPrice: number | null;
  alreadyHave: boolean;
  source: "ai" | "manual";
};
export type AnalysisResponse = {
  summary: string;
  items: Array<{
    name: string;
    quantity: number | null;
    unit: string;
    note: string;
    needs_confirmation: boolean;
  }>;
  questions: string[];
};
export type City = {
  name: string;
  lat: number;
  lng: number;
};
