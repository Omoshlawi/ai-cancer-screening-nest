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
  screenings: ['create', 'list', 'update', 'delete'],
  referrals: [
    'create',
    'list',
    'view-any',
    'update',
    'delete',
    'complete',
    'cancel',
  ],
  faq: ['create', 'update', 'delete'],
  faqTopic: ['create', 'update', 'delete'],
  healthFacility: ['create', 'update', 'delete'],
  healthFacilityType: ['create', 'update', 'delete'],
  dashboard: ['view'],
  followups: ['create', 'list', 'update', 'delete'],
});

const adminRole = adminPluginAcl.newRole({
  chp: ['create', 'delete', 'list', 'update'],
  clients: ['create', 'list', 'update', 'delete'],
  screenings: ['create', 'list', 'delete'],
  referrals: ['list', 'view-any', 'delete'],
  dashboard: ['view'],
  faq: ['create', 'delete', 'update'],
  faqTopic: ['create', 'delete', 'update'],
  healthFacility: ['create', 'delete', 'update'],
  healthFacilityType: ['create', 'delete', 'update'],
  followups: ['list', 'delete'],
  ...adminAc.statements,
});

const userRole = adminPluginAcl.newRole({
  chp: ['list'],
  clients: [],
  faq: [],
  faqTopic: [],
  healthFacility: [],
  healthFacilityType: [],
  ...userAc.statements,
});
const chpRole = adminPluginAcl.newRole({
  chp: ['list'],
  clients: ['create', 'list', 'update', 'delete'],
  screenings: ['create', 'list', 'update', 'delete'],
  referrals: ['create', 'list', 'update', 'delete', 'cancel'],
  faq: [],
  faqTopic: [],
  healthFacility: [],
  healthFacilityType: [],
  followups: ['create', 'list', 'update', 'delete'],

  ...userAc.statements,
});
const healthCareWorkerRole = adminPluginAcl.newRole({
  ...chpRole.statements,
  referrals: [...chpRole.statements.referrals, 'complete', 'view-any'],
});

export const adminPluginRoles = {
  ...adminDefaultRoles,
  admin: adminRole,
  user: userRole,
  chp: chpRole,
  hcw: healthCareWorkerRole,
};
