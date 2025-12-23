/**
 * Usuarios de prueba para el sistema Misincol
 * Estos usuarios deben existir en Supabase Auth y en la tabla perfiles
 */

export interface TestUser {
  username: string;
  password: string;
  email: string;
  role: 'superadmin' | 'leader' | 'member';
  teamId?: string;
  fullName?: string;
}

export const TEST_USERS: Record<string, TestUser> = {
  superadmin: {
    username: 'superadmin',
    password: 'superadmin123',
    email: 'superadmin@misincol.local',
    role: 'superadmin',
    fullName: 'Super Administrador'
  },
  liderBari: {
    username: 'lider-bari',
    password: 'lider123',
    email: 'lider-bari@misincol.local',
    role: 'leader',
    teamId: '11111111-1111-1111-1111-111111111111',
    fullName: 'Pepe (Líder Barí)'
  },
  liderKatios: {
    username: 'lider-katios',
    password: 'lider123',
    email: 'lider-katios@misincol.local',
    role: 'leader',
    teamId: '22222222-2222-2222-2222-222222222222',
    fullName: 'Carla (Líder Katíos)'
  }
};

/**
 * Obtener usuario de prueba por clave
 */
export function getTestUser(key: keyof typeof TEST_USERS): TestUser {
  return TEST_USERS[key];
}

/**
 * Obtener usuario de prueba por rol
 */
export function getTestUserByRole(role: TestUser['role']): TestUser | undefined {
  return Object.values(TEST_USERS).find(user => user.role === role);
}



