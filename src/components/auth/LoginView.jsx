import React from 'react';
import MemberLoginView from './MemberLoginView';
import AdminLoginView from './AdminLoginView';

export default function LoginView({ defaultMode = 'member' }) {
  if (defaultMode === 'admin') {
    return <AdminLoginView />;
  }
  return <MemberLoginView />;
}
