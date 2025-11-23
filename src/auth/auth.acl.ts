import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  userAc,
  defaultStatements as defaultAdminStatements,
  defaultRoles as adminDefaultRoles,
} from 'better-auth/plugins/admin/access';

export const adminPluginAcl = createAccessControl({
  ...defaultAdminStatements,
  chp: ['create', 'list', 'update', 'delete'],
  clients: ['create', 'list', 'update', 'delete'],
});

const adminRole = adminPluginAcl.newRole({
  chp: ['create', 'delete', 'list', 'update'],
  clients: ['list', 'update', 'delete'],
  ...adminAc.statements,
});

const userRole = adminPluginAcl.newRole({
  chp: ['list'],
  clients: [],
  ...userAc.statements,
});
const chpRole = adminPluginAcl.newRole({
  chp: ['list'],
  clients: ['create', 'list', 'update', 'delete'],
  ...userAc.statements,
});

export const adminPluginRoles = {
  ...adminDefaultRoles,
  admin: adminRole,
  user: userRole,
  chp: chpRole,
};
