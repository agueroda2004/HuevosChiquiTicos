export type Cage = {
  id: string;
  name: string;
  birds: number;
  active: boolean;
};

export type CreateCageInput = {
  name: string;
  birds: number;
  active: boolean;
};

export type UpdateCageInput = {
  id: string;
  name: string;
  active: boolean;
};
