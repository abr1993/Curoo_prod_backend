export interface CreateUserBody {
  email: string;
  phone?: string;
  role: 'PATIENT' | 'PROVIDER';
  display_name?: string; // optional, mainly for physicians
}

export interface UpdateUserBody {
  email?: string;
  phone?: string;
  role?: 'PATIENT' | 'PROVIDER';
  display_name?: string;
}
