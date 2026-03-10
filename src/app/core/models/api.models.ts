// ══════════════════════════════════════════════════════
// Modèles centraux — miroir exact des DTOs Spring Boot
// ══════════════════════════════════════════════════════

// ── Pagination ────────────────────────────────────────
export interface Page<T> {
  content:          T[];
  totalElements:    number;
  totalPages:       number;
  number:           number;   // page courante (0-based)
  size:             number;
  first:            boolean;
  last:             boolean;
}

// ── Erreur API ────────────────────────────────────────
export interface ApiError {
  timestamp: string;
  status:    number;
  error:     string;
  details?:  Record<string, string>;
}

// ── Auth ──────────────────────────────────────────────
export interface LoginRequest {
  email:    string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  nom:   string;
  role:  Role;
}

// ── User ──────────────────────────────────────────────
export type Role = 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';

export interface UserResponse {
  id:        number;
  nom:       string;
  email:     string;
  role:      Role;
  actif:     boolean;
  createdAt: string;
  updatedAt: string;
}
export interface UserRef {
  id:    number;
  nom:   string;
  email: string;
}

export interface CreateUserRequest {
  nom:      string;
  email:    string;
  password: string;
  role:     Role;
}

export interface UpdateUserStatusRequest {
  actif: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword:     string;
}

// ── Project ───────────────────────────────────────────
// ─── Enums ───
export type ProjectStatus = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'VALIDE' | 'REJETE';

// ─── DTOs (miroir exact des DTOs Spring Boot) ────
export interface ProjectResponse {
  id:           number;
  titre:        string;
  description:  string;
  technologies: string;
  status:       ProjectStatus;
  encadrant?:   { id: number; nom: string; email: string };
  team?:        { id: number; nom: string };
  createdAt:    string;
  updatedAt:    string;
}

// export interface ProjectResponse {
//   id:           number;
//   titre:        string;
//   description:  string;
//   technologies: string | null;
//   statut:       StatutProjet;
//   encadrant:    UserRef | null;
//   team:         TeamRef | null;
//   createdAt:    string;
//   updatedAt:    string;
// }

export interface ProjectRequest {
  titre:        string;
  description:  string;
  technologies?: string;
  encadrantId?: number;
  teamId?:      number;
}

export interface CreateProjectRequest {
  titre:        string;
  description?: string;
  technologies?: string;
  encadrantId?: number;
  teamId?:      number;
  status?:      ProjectStatus;
}

export interface ProjectUpdateRequest extends ProjectRequest {
  statut?: ProjectStatus;
}

// ── Team ──────────────────────────────────────────────
export interface TeamResponse {
  id:        number;
  nom:       string;
  members:   UserResponse[];
  createdAt: string;
}
export interface TeamRef {
  id:  number;
  nom: string;
}

// ── Document ──────────────────────────────────────────
export type DocumentType = 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'ZIP' | 'OTHER';

export interface DocumentResponse {
  id:           number;
  fileName:     string;
  filePath:     string;
  fileSize:     number;
  docType:      DocumentType;
  projectId:    number;
  projectTitre: string;
  studentId:    number;
  studentNom:   string;
  uploadedAt:   string;
}

// ── Stats ─────────────────────────────────────────────
// ───────────────────────────────────────────────
// Admin Dashboard Stats
// ───────────────────────────────────────────────
export interface AdminStats {
  totalUsers:      number;
  totalProjects:   number;
  totalStudents:   number;
  totalEncadrants: number;
  activeUsers:     number;

  activeProjects:  number;
  pendingProjects: number;
  closedProjects:  number;
  valideProjects:  number;
  rejeteProjects:  number;

  recentActivities: ActivityItem[];
}
// ───────────────────────────────────────────────
// Student Dashboard Stats
// ───────────────────────────────────────────────
export interface StudentStats {
  myProjects: {
    id:        number;
    titre:     string;
    statut:    ProjectStatus;
    updatedAt: string;
  }[];
  documents: {
    id:         number;
    nom:        string;
    type:       DocumentType;
    uploadedAt: string;
  }[];
  encadrant?: {
    id:         number;
    nom:        string;
    email:      string;
    specialite?: string;
  };
}
// ───────────────────────────────────────────────
// Encadrant Dashboard Stats
// ───────────────────────────────────────────────
export interface EncadrantStats {
  supervisedProjects: {
    id:        number;
    titre:     string;
    statut:    ProjectStatus;
    updatedAt: string;
  }[];
  followedStudents?: {
    id:     number;
    nom:    string;
    email:  string;
    projet: string;
  }[];
  pendingReviews: number;
}

// ── Audit ─────────────────────────────────────────────
export interface AuditLog {
  id:          number;
  action:      string;
  userId:      number | null;
  performedBy: number | null;
  details:     string;
  ipAddress:   string;
  createdAt:   string;
}

// ───────────────────────────────────────────────
// Activity (Journal d'activité)
// ───────────────────────────────────────────────
export interface ActivityItem {
  action: string;
  user: string;
  details?: string;
  timestamp: string;
}

