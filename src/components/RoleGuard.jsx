import React from 'react';
import useAuthStore from '../store/useAuthStore';

const RoleGuard = ({ roles, children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) return null;
  return children;
};

export default RoleGuard;
