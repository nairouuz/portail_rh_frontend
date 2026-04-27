export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  token?: string;
  departement?: string;
  salaire?: number;
  dateEmbauche?: string;
  adresse?: string;
  telephone?: string;
  dateNaissance?: string;
  cin?: string;
  nationalite?: string;
  situationFamiliale?: string;
  grade?: string;
}