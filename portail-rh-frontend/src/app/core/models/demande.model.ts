export interface Demande {
  id: number;
  type: string;
  statut: string;
  dateCreation: string;
  dateDebut?: string;
  dateFin?: string;
  motif?: string;
  montant?: number;
  userId: number;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
}