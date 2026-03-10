import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

interface DocumentItem {
  id: number;
  nom: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | string;
  taille?: string;
  uploadedAt: string;
  projetTitre?: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './documents.html',
  styleUrls: ['./documents.scss']
})
export class Documents implements OnInit {

  private http  = inject(HttpClient);
  private snack = inject(MatSnackBar);

  documents: DocumentItem[] = [];
  loading = true;

  private readonly demo: DocumentItem[] = [
    { id: 1, nom: 'Cahier des charges v2.pdf',     type: 'PDF',  taille: '1.2 Mo', uploadedAt: '2024-03-05', projetTitre: 'Plateforme e-learning IA' },
    { id: 2, nom: 'Rapport d\'avancement.docx',    type: 'DOCX', taille: '540 Ko', uploadedAt: '2024-02-28', projetTitre: 'Plateforme e-learning IA' },
    { id: 3, nom: 'Présentation soutenance.pptx', type: 'PPTX', taille: '3.8 Mo', uploadedAt: '2024-02-20', projetTitre: 'Plateforme e-learning IA' },
    { id: 4, nom: 'Planning Gantt.xlsx',           type: 'XLSX', taille: '210 Ko', uploadedAt: '2024-01-30', projetTitre: 'Application mobile santé' },
  ];

  ngOnInit(): void {
    this.http.get<DocumentItem[]>(`${environment.apiUrl}/documents/my`).subscribe({
      next:  d  => { this.documents = d; this.loading = false; },
      error: () => { this.documents = this.demo; this.loading = false; }
    });
  }

  getDocIcon(type: string): string {
    return { PDF: 'picture_as_pdf', DOCX: 'description', PPTX: 'slideshow', XLSX: 'table_chart' }[type] ?? 'insert_drive_file';
  }

  getDocColor(type: string): string {
    return { PDF: '#ef4444', DOCX: '#3b82f6', PPTX: '#f59e0b', XLSX: '#10b981' }[type] ?? '#64748b';
  }

  download(doc: DocumentItem): void {
    this.snack.open(`⬇ Téléchargement de ${doc.nom}...`, 'OK', { duration: 2500 });
  }
}
