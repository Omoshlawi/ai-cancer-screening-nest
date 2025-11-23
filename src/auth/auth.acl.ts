import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  userAc,
  defaultStatements as defaultAdminStatements,
  defaultRoles as adminDefaultRoles,
} from 'better-auth/plugins/admin/access';

export const adminPluginAcl = createAccessControl({
  ...defaultAdminStatements,
  category: ['create', 'list', 'update', 'delete'],
});

const adminRole = adminPluginAcl.newRole({
  category: ['create', 'delete', 'list', 'update'],
  ...adminAc.statements,
});

const userRole = adminPluginAcl.newRole({
  category: ['list'],
  ...userAc.statements,
});

export const adminPluginRoles = {
  ...adminDefaultRoles,
  admin: adminRole,
  user: userRole,
};
