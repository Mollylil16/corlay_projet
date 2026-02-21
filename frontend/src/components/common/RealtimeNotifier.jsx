import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-toastify';

/**
 * Composant invisible qui écoute les changements dans le Context
 * et affiche des notifications toast en temps réel
 */
const RealtimeNotifier = () => {
  const { alertes, commandes, bonsLivraison } = useApp();
  const prevAlertesCount = useRef(alertes.length);
  const prevCommandesStatuts = useRef(new Map());
  const prevBonsStatuts = useRef(new Map());
  const isFirstRender = useRef(true);

  // Notifier les nouvelles alertes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (alertes.length > prevAlertesCount.current) {
      const newAlerte = alertes[0]; // La plus récente
      
      // Choisir le type de toast selon la sévérité
      if (newAlerte.severite === 'critique') {
        toast.error(`${newAlerte.titre}: ${newAlerte.message}`, {
          autoClose: 8000,
        });
      } else if (newAlerte.severite === 'urgent') {
        toast.warning(`${newAlerte.titre}: ${newAlerte.message}`, {
          autoClose: 6000,
        });
      } else if (newAlerte.severite === 'attention') {
        toast.info(`${newAlerte.titre}: ${newAlerte.message}`, {
          autoClose: 5000,
        });
      }
    }
    
    prevAlertesCount.current = alertes.length;
  }, [alertes]);

  // Notifier les changements de statut des commandes
  useEffect(() => {
    if (isFirstRender.current) {
      // Initialiser la map au premier rendu
      commandes.forEach(cmd => {
        prevCommandesStatuts.current.set(cmd.id, cmd.statut);
      });
      return;
    }

    commandes.forEach(cmd => {
      const prevStatut = prevCommandesStatuts.current.get(cmd.id);
      
      if (prevStatut && prevStatut !== cmd.statut) {
        // Le statut a changé
        if (cmd.statut === 'validee') {
          toast.success(`Commande ${cmd.id} validée.`, { autoClose: 4000 });
        } else if (cmd.statut === 'en-transit') {
          toast.info(`Commande ${cmd.id} en transit.`, { autoClose: 4000 });
        } else if (cmd.statut === 'livree') {
          toast.success(`Commande ${cmd.id} livrée avec succès.`, { autoClose: 5000 });
        }
      }
      
      prevCommandesStatuts.current.set(cmd.id, cmd.statut);
    });
  }, [commandes]);

  // Notifier les changements de statut des bons de livraison
  useEffect(() => {
    if (isFirstRender.current) {
      bonsLivraison.forEach(bon => {
        prevBonsStatuts.current.set(bon.id, bon.statut);
      });
      return;
    }

    bonsLivraison.forEach(bon => {
      const prevStatut = prevBonsStatuts.current.get(bon.id);
      
      if (prevStatut && prevStatut !== bon.statut) {
        if (bon.statut === 'en-transit') {
          toast.info(`Bon de livraison ${bon.id} validé et en transit.`, { autoClose: 4000 });
        } else if (bon.statut === 'livré') {
          toast.success(`Bon de livraison ${bon.id} confirmé livré.`, { autoClose: 5000 });
        }
      }
      
      prevBonsStatuts.current.set(bon.id, bon.statut);
    });
  }, [bonsLivraison]);

  return null; // Ce composant ne rend rien
};

export default RealtimeNotifier;
