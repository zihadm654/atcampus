import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  STUDENT: ac.newRole({
    posts: ["create", "read", "update:own", "delete:own"],
    ...adminAc.statements,
  }),
  PROFESSOR: ac.newRole({
    posts: ["create", "read", "update:own", "delete:own"],
  }),
  INSTITUTION: ac.newRole({
    posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
    ...adminAc.statements,
  }),
  ORGANIZATION: ac.newRole({
    posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
    ...adminAc.statements,
  }),
};
