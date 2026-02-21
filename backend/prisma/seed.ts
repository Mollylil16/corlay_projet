import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashDispatch = await bcrypt.hash('dispatch123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@corlay.ci' },
    update: {},
    create: {
      id: 'user-1',
      email: 'admin@corlay.ci',
      passwordHash: hashAdmin,
      nom: 'Admin',
      prenom: 'Système',
      role: 'administrateur',
      telephone: '+225 07 00 00 00 01',
      actif: true,
      dateCreation: '2024-01-01',
    },
  });
  await prisma.user.upsert({
    where: { email: 'dispatcher@corlay.ci' },
    update: {},
    create: {
      id: 'user-2',
      email: 'dispatcher@corlay.ci',
      passwordHash: hashDispatch,
      nom: 'Diallo',
      prenom: 'Jean',
      role: 'dispatcher',
      telephone: '+225 07 00 00 00 02',
      actif: true,
      dateCreation: '2024-01-15',
    },
  });

  const hashTreso = await bcrypt.hash('treso123', 10);
  const hashFactu = await bcrypt.hash('factu123', 10);
  const hashDemo = await bcrypt.hash('demo123', 10); // Mot de passe commun pour tous les profils de test

  await prisma.user.upsert({
    where: { email: 'tresorerie@corlay.ci' },
    update: {},
    create: {
      id: 'user-tresorerie',
      email: 'tresorerie@corlay.ci',
      passwordHash: hashTreso,
      nom: 'Trésorerie',
      prenom: 'Finance',
      role: 'tresorerie',
      telephone: '+225 07 00 00 00 03',
      actif: true,
      dateCreation: '2024-01-20',
    },
  });
  await prisma.user.upsert({
    where: { email: 'facturation@corlay.ci' },
    update: {},
    create: {
      id: 'user-facturation',
      email: 'facturation@corlay.ci',
      passwordHash: hashFactu,
      nom: 'Facturation',
      prenom: 'Service',
      role: 'facturation',
      telephone: '+225 07 00 00 00 04',
      actif: true,
      dateCreation: '2024-01-20',
    },
  });

  // Profils supplémentaires pour tester chaque interface
  const extraUsers = [
    { email: 'directeur@corlay.ci', id: 'user-directeur', nom: 'Koné', prenom: 'Amadou', role: 'directeur' },
    { email: 'manager-commercial@corlay.ci', id: 'user-mgr-commercial', nom: 'Ouattara', prenom: 'Fatou', role: 'manager-commercial' },
    { email: 'manager-logistique@corlay.ci', id: 'user-mgr-logistique', nom: 'Bamba', prenom: 'Ibrahim', role: 'manager-logistique' },
    { email: 'agent-commercial@corlay.ci', id: 'user-agent-commercial', nom: 'Traoré', prenom: 'Aïcha', role: 'agent-commercial' },
    { email: 'agent-logistique@corlay.ci', id: 'user-agent-logistique', nom: 'Cissé', prenom: 'Moussa', role: 'agent-logistique' },
  ];
  for (const u of extraUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        passwordHash: hashDemo,
        nom: u.nom,
        prenom: u.prenom,
        role: u.role,
        telephone: '+225 07 00 00 00 00',
        actif: true,
        dateCreation: '2024-01-20',
      },
    });
  }

  // Aucune donnée métier fictive : pas de dépôts, cuves, transporteurs, commandes, BL.
  // En production, tout se crée via l'app (Créer un dépôt, Enregistrer un transporteur, etc.).
  // Seuls les comptes de connexion et les plans abonnements sont créés ici.

  const planFeatures = {
    free: JSON.stringify([
      { text: 'Maximum 2 utilisateurs', included: true },
      { text: 'Fonctionnalités de base', included: true },
      { text: 'Support par email', included: true },
      { text: 'Stockage : 1 GB', included: true },
      { text: 'Utilisateurs illimités', included: false },
      { text: 'Rapports avancés', included: false },
      { text: 'API Access', included: false },
      { text: 'Support prioritaire 24/7', included: false },
    ]),
    premium: JSON.stringify([
      { text: 'Utilisateurs illimités', included: true },
      { text: 'Toutes les fonctionnalités', included: true },
      { text: 'Rapports avancés et personnalisés', included: true },
      { text: 'Stockage : 100 GB', included: true },
      { text: 'API Access complet', included: true },
      { text: 'Support prioritaire 24/7', included: true },
      { text: 'Mises à jour en temps réel', included: true },
      { text: 'Formation incluse', included: true },
    ]),
    enterprise: JSON.stringify([
      { text: 'Tout du plan Premium', included: true },
      { text: 'Infrastructure dédiée', included: true },
      { text: 'SLA garantie 99.9%', included: true },
      { text: 'Stockage illimité', included: true },
      { text: 'Intégrations personnalisées', included: true },
      { text: 'Account manager dédié', included: true },
      { text: 'Formation sur site', included: true },
      { text: 'Contrat sur mesure', included: true },
    ]),
  };

  await prisma.plan.upsert({
    where: { id: 'free' },
    update: {},
    create: { id: 'free', name: 'Gratuit', price: 0, period: 'Toujours', color: 'gray', icon: 'shield', recommended: false, features: planFeatures.free },
  });
  await prisma.plan.upsert({
    where: { id: 'premium' },
    update: {},
    create: { id: 'premium', name: 'Premium', price: 50000, period: 'An', color: 'orange', icon: 'star', recommended: true, features: planFeatures.premium },
  });
  await prisma.plan.upsert({
    where: { id: 'enterprise' },
    update: {},
    create: { id: 'enterprise', name: 'Enterprise', price: null, period: 'Sur mesure', color: 'purple', icon: 'crown', recommended: false, features: planFeatures.enterprise },
  });

  console.log('Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
