import { ValueTransformer } from 'typeorm';

/** pg's `numeric` type round-trips as a string through node-pg; this keeps it a number. */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseFloat(value),
};
