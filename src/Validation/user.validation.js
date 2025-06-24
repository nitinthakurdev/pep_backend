import { string, object } from 'yup';

export const RegistrationValidation = object({
  school_code: string().required('School code is a required field'),
  class: string().required('Class is a required field'),
  username: string().trim().required('Username is a required field').min(3, 'Username must be at least 3 characters long'),
  password: string().required('Password is a required field').min(6, 'Password must be at least 6 characters long').max(16),
  role: string().oneOf(['User', 'School', 'Admin'], 'Invalid role').required('Role is required'),
});
