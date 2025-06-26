'use client';

export function RoleBasedGuard({ children, hasContent, currentRole, acceptRoles }) {
  if (typeof acceptRoles !== 'undefined' && !acceptRoles.includes(currentRole)) {
    return hasContent ? (
      <div>
         无权限访问
      </div>
    ) : null;
  }

  return <> {children} </>;
}
