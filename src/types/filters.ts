export type FilterFieldType = 'text' | 'select' | 'date';

export interface FilterFieldOption {
  label: string;
  value: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  type: FilterFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FilterFieldOption[];
  clearable?: boolean;
  /** Para filtros de texto reactivos: mínimo de caracteres antes de aplicar el filtro. */
  minChars?: number;
}

export type FilterValues = Record<string, string>;
