import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable, of, throwError,
  shareReplay, catchError, retry, tap, timeout
} from 'rxjs';

// ══════════════════════════════════════════════════════
// DTO INTERFACES — alignées avec le backend Spring Boot
// ══════════════════════════════════════════════════════

export type StatutProjet = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'VALIDE';
export type AuditAction  =
  | 'USER_CREATED' | 'USER_DISABLED' | 'USER_ENABLED'
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED'
  | 'ROLE_CHANGED';

// ── Admin ─────────────────────────────────────────────
export interface AdminStats {
  totalUsers:       number;
  totalProjects:    number;
  totalStudents:    number;
  totalEncadrants:  number;
  activeProjects:   number;
  pendingProjects:  number;
  closedProjects:   number;
  recentActivities: ActivityItem[];
}

// ── Étudiant ──────────────────────────────────────────
export interface StudentStats {
  myProjects:  ProjectSummary[];
  encadrant:   EncadrantSummary | null;
  documents:   DocumentSummary[];
}

// ── Encadrant ─────────────────────────────────────────
export interface EncadrantStats {
  supervisedProjects: ProjectSummary[];
  followedStudents:   StudentSummary[];
  pendingReviews:     number;
}

// ── Entités partagées ─────────────────────────────────
export interface ProjectSummary {
  id:        number;
  titre:     string;
  statut:    StatutProjet;
  updatedAt: string;
}

export interface EncadrantSummary {
  id:         number;
  nom:        string;
  email:      string;
  specialite: string;
}

export interface DocumentSummary {
  id:         number;
  nom:        string;
  type:       'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | string;
  uploadedAt: string;
}

export interface StudentSummary {
  id:     number;
  nom:    string;
  email:  string;
  projet: string;
}

export interface ActivityItem {
  id:        number;
  action:    AuditAction | string;
  user:      string;
  details?:  string;
  timestamp: string;
}

// ══════════════════════════════════════════════════════
// DONNÉES DE DÉMO — utilisées si l'API n'est pas disponible
// ══════════════════════════════════════════════════════

const DEMO_ADMIN_STATS: AdminStats = {
  totalUsers:      142,
  totalProjects:    38,
  totalStudents:   120,
  totalEncadrants:  18,
  activeProjects:   24,
  pendingProjects:   7,
  closedProjects:    7,
  recentActivities: [
    { id: 1, action: 'USER_CREATED',  user: 'Admin',              details: 'Compte créé : yasmine@etu.ma',      timestamp: new Date(Date.now() - 5  * 60_000).toISOString() },
    { id: 2, action: 'LOGIN_SUCCESS', user: 'k.idrissi@uni.ma',   details: 'Connexion réussie',                 timestamp: new Date(Date.now() - 12 * 60_000).toISOString() },
    { id: 3, action: 'USER_DISABLED', user: 'Admin',              details: 'Compte désactivé : omar@etu.ma',    timestamp: new Date(Date.now() - 60 * 60_000).toISOString() },
    { id: 4, action: 'LOGIN_FAILED',  user: 'inconnu',            details: '3 tentatives échouées',             timestamp: new Date(Date.now() - 2  * 3_600_000).toISOString() },
    { id: 5, action: 'ROLE_CHANGED',  user: 'Admin',              details: 'Rôle → ENCADRANT : sara@etu.ma',   timestamp: new Date(Date.now() - 3  * 3_600_000).toISOString() },
  ],
};

const DEMO_STUDENT_STATS: StudentStats = {
  myProjects: [
    { id: 1, titre: 'Plateforme e-learning IA',  statut: 'EN_COURS',   updatedAt: '2024-03-10' },
    { id: 2, titre: 'Application mobile santé',  statut: 'EN_ATTENTE', updatedAt: '2024-03-08' },
  ],
  encadrant: {
    id: 1,
    nom: 'Prof. Karim Idrissi',
    email: 'k.idrissi@university.ma',
    specialite: 'Intelligence Artificielle',
  },
  documents: [
    { id: 1, nom: 'Cahier des charges v2.pdf',      type: 'PDF',  uploadedAt: '2024-03-05' },
    { id: 2, nom: 'Rapport d\'avancement.docx',     type: 'DOCX', uploadedAt: '2024-02-28' },
    { id: 3, nom: 'Présentation soutenance.pptx',  type: 'PPTX', uploadedAt: '2024-02-20' },
  ],
};

const DEMO_ENCADRANT_STATS: EncadrantStats = {
  supervisedProjects: [
    { id: 1, titre: 'Plateforme e-learning IA',       statut: 'EN_COURS',   updatedAt: '2024-03-10' },
    { id: 2, titre: 'Système de recommandation NLP',  statut: 'EN_ATTENTE', updatedAt: '2024-03-07' },
    { id: 3, titre: 'Dashboard analyse données',       statut: 'VALIDE',     updatedAt: '2024-02-28' },
    { id: 4, titre: 'Application mobile santé',        statut: 'EN_COURS',   updatedAt: '2024-02-25' },
  ],
  followedStudents: [
    { id: 1, nom: 'Yasmine Benhaddou', email: 'y.benhaddou@etu.ma', projet: 'Plateforme e-learning IA' },
    { id: 2, nom: 'Omar Zouheir',      email: 'o.zouheir@etu.ma',   projet: 'Système de recommandation NLP' },
    { id: 3, nom: 'Sara Alami',        email: 's.alami@etu.ma',      projet: 'Dashboard analyse données' },
    { id: 4, nom: 'Amine Benali',      email: 'a.benali@etu.ma',     projet: 'Application mobile santé' },
  ],
  pendingReviews: 2,
};

// ══════════════════════════════════════════════════════
// SERVICE
// ══════════════════════════════════════════════════════

/** Durée de vie du cache en millisecondes (1 minute) */
const CACHE_TTL_MS = 60_000;
/** Timeout HTTP en millisecondes */
const HTTP_TIMEOUT_MS = 8_000;
/** Nombre de tentatives en cas d'erreur réseau */
const RETRY_COUNT = 1;

@Injectable({ providedIn: 'root' })
export class StatsService {

  private readonly API = '/api/stats';

  // ── État interne ────────────────────────────────────
  /** true si le backend est inaccessible (mode démo activé) */
  readonly demoMode = signal(false);

  private cache: {
    admin?:     { data: AdminStats;    cachedAt: number };
    student?:   { data: StudentStats;  cachedAt: number };
    encadrant?: { data: EncadrantStats; cachedAt: number };
  } = {};

  constructor(private http: HttpClient) {}

  // ── API publique ────────────────────────────────────

  /**
   * Statistiques pour le dashboard ADMIN.
   * Utilise le cache si les données ont moins de CACHE_TTL_MS.
   * Retourne des données démo si l'API est indisponible.
   */
  getAdminStats(): Observable<AdminStats> {
    if (this.isCacheValid('admin')) {
      return of(this.cache.admin!.data);
    }

    return this.http
      .get<AdminStats>(`${this.API}/admin`)
      .pipe(
        timeout(HTTP_TIMEOUT_MS),
        retry(RETRY_COUNT),
        tap(data => this.setCache('admin', data)),
        catchError(err => this.handleError('admin', DEMO_ADMIN_STATS, err))
      );
  }

  /**
   * Statistiques pour le dashboard ÉTUDIANT.
   */
  getStudentStats(): Observable<StudentStats> {
    if (this.isCacheValid('student')) {
      return of(this.cache.student!.data);
    }

    return this.http
      .get<StudentStats>(`${this.API}/student`)
      .pipe(
        timeout(HTTP_TIMEOUT_MS),
        retry(RETRY_COUNT),
        tap(data => this.setCache('student', data)),
        catchError(err => this.handleError('student', DEMO_STUDENT_STATS, err))
      );
  }

  /**
   * Statistiques pour le dashboard ENCADRANT.
   */
  getEncadrantStats(): Observable<EncadrantStats> {
    if (this.isCacheValid('encadrant')) {
      return of(this.cache.encadrant!.data);
    }

    return this.http
      .get<EncadrantStats>(`${this.API}/encadrant`)
      .pipe(
        timeout(HTTP_TIMEOUT_MS),
        retry(RETRY_COUNT),
        tap(data => this.setCache('encadrant', data)),
        catchError(err => this.handleError('encadrant', DEMO_ENCADRANT_STATS, err))
      );
  }

  /**
   * Vide le cache (à appeler après une action qui modifie les stats,
   * ex: création d'un utilisateur).
   */
  invalidateCache(key?: 'admin' | 'student' | 'encadrant'): void {
    if (key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  }

  // ── Helpers privés ──────────────────────────────────

  private isCacheValid(key: 'admin' | 'student' | 'encadrant'): boolean {
    const entry = this.cache[key];
    if (!entry) return false;
    return Date.now() - entry.cachedAt < CACHE_TTL_MS;
  }

  private setCache(key: 'admin',     data: AdminStats):     void;
  private setCache(key: 'student',   data: StudentStats):   void;
  private setCache(key: 'encadrant', data: EncadrantStats): void;
  private setCache(key: string, data: any): void {
    (this.cache as any)[key] = { data, cachedAt: Date.now() };
  }

  /**
   * Gestion centralisée des erreurs HTTP.
   *
   * — 401 / 403 : on laisse remonter (géré par jwtInterceptor / router)
   * — Autres    : on active le mode démo et on retourne les données de fallback
   */
  private handleError<T>(
    key: string,
    fallback: T,
    err: HttpErrorResponse | unknown
  ): Observable<T> {

    const status = err instanceof HttpErrorResponse ? err.status : 0;

    // Erreurs d'authentification : on ne masque pas
    if (status === 401 || status === 403) {
      return throwError(() => err);
    }

    // API indisponible → mode démo
    console.warn(
      `[StatsService] API /stats/${key} indisponible (status=${status}). Mode démo activé.`
    );
    this.demoMode.set(true);
    return of(fallback);
  }
}
