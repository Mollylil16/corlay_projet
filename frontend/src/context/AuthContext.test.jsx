import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth, ROLES, PERMISSIONS } from './AuthContext';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

function TestConsumer() {
  const { currentUser, hasPermission } = useAuth();
  return (
    <div>
      <span data-testid="role">{currentUser?.role ?? 'none'}</span>
      <span data-testid="has-valider-tresorerie">{String(hasPermission('valider-tresorerie'))}</span>
      <span data-testid="has-valider-facturation">{String(hasPermission('valider-facturation'))}</span>
      <span data-testid="has-all">{String(hasPermission('anything'))}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('ROLES et PERMISSIONS', () => {
    it('expose les rôles Trésorerie et Facturation', () => {
      expect(ROLES.TRESORERIE).toBe('tresorerie');
      expect(ROLES.FACTURATION).toBe('facturation');
    });

    it('Trésorerie a la permission valider-tresorerie', () => {
      expect(PERMISSIONS[ROLES.TRESORERIE]).toContain('valider-tresorerie');
    });

    it('Facturation a la permission valider-facturation', () => {
      expect(PERMISSIONS[ROLES.FACTURATION]).toContain('valider-facturation');
    });

    it('Admin a la permission "all"', () => {
      expect(PERMISSIONS[ROLES.ADMIN]).toContain('all');
    });
  });

  describe('hasPermission avec utilisateur connecté', () => {
    it('retourne true pour toute permission quand rôle est administrateur', async () => {
      localStorage.setItem(TOKEN_KEY, 'fake-token');
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({ id: '1', role: ROLES.ADMIN, nom: 'Admin', prenom: 'A' })
      );
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      await screen.findByTestId('role');
      expect(screen.getByTestId('has-all').textContent).toBe('true');
      expect(screen.getByTestId('has-valider-tresorerie').textContent).toBe('true');
    });

    it('retourne true pour valider-tresorerie quand rôle est tresorerie', async () => {
      localStorage.setItem(TOKEN_KEY, 'fake-token');
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({ id: '1', role: ROLES.TRESORERIE, nom: 'Tréso', prenom: 'T' })
      );
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      await screen.findByTestId('role');
      expect(screen.getByTestId('has-valider-tresorerie').textContent).toBe('true');
      expect(screen.getByTestId('has-valider-facturation').textContent).toBe('false');
    });

    it('retourne true pour valider-facturation quand rôle est facturation', async () => {
      localStorage.setItem(TOKEN_KEY, 'fake-token');
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({ id: '1', role: ROLES.FACTURATION, nom: 'Factu', prenom: 'F' })
      );
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      await screen.findByTestId('role');
      expect(screen.getByTestId('has-valider-facturation').textContent).toBe('true');
      expect(screen.getByTestId('has-valider-tresorerie').textContent).toBe('false');
    });
  });
});
