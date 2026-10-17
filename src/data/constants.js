// Fixed option lists used by forms, filters and validation.
export const CATEGORIES = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Printer',
  'Phone',
  'Tablet',
  'Server',
  'Network device',
];

export const STATUSES = ['In use', 'In storage', 'Under repair', 'Retired'];

// CSS modifier used for each status colour (badges, dashboard bar, legend).
export const STATUS_CLASS = {
  'In use': 'in-use',
  'In storage': 'in-storage',
  'Under repair': 'under-repair',
  Retired: 'retired',
};

export const DEPARTMENTS = [
  'Engineering',
  'Finance',
  'Human Resources',
  'Marketing',
  'Operations',
  'Sales',
  'IT',
];

// Assets whose warranty ends within this many days are flagged on the dashboard.
export const WARRANTY_WARNING_DAYS = 90;

// Maximum lengths keep input sane and protect the UI layout.
export const MAX_LENGTH = {
  short: 60,
  notes: 500,
};
