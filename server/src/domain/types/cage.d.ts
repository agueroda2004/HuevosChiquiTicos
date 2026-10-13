export interface Cage {
  id: string;
  name: string;
  birds: number;
  active: boolean;
}

export interface CreateCageDTO {
  name: string;
  birds: number;
  active: boolean;
}

export interface UpdateCageDTO {
  name?: string;
  active?: boolean;
}
