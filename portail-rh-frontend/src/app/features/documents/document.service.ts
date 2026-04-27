import { Injectable } from '@angular/core';

export interface Document {
  id: number;
  employeId: number;
  employeNom: string;
  nom: string;
  type: string;
  taille: string;
  date: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE';
  fileData?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private storageKey = 'documents';

  getDocuments(): Document[] {
    const docs = localStorage.getItem(this.storageKey);
    return docs ? JSON.parse(docs) : [];
  }

  getDocumentsByEmploye(employeId: number): Document[] {
    const docs = this.getDocuments();
    return docs.filter(d => d.employeId === employeId);
  }

  getDocumentsEnAttente(): Document[] {
    const docs = this.getDocuments();
    return docs.filter(d => d.statut === 'EN_ATTENTE');
  }

  createDocument(doc: Document): void {
    const docs = this.getDocuments();
    docs.push(doc);
    localStorage.setItem(this.storageKey, JSON.stringify(docs));
  }

  updateDocumentStatut(id: number, statut: 'APPROUVE' | 'REFUSE'): void {
    const docs = this.getDocuments();
    const index = docs.findIndex(d => d.id === id);
    if (index !== -1) {
      docs[index].statut = statut;
      localStorage.setItem(this.storageKey, JSON.stringify(docs));
    }
  }

  deleteDocument(id: number): void {
    const docs = this.getDocuments();
    const filtered = docs.filter(d => d.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }
}