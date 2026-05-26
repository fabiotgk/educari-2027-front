/** Tipos do recurso M35 / Polos EAD — espelham DistanceCenterResource e TutorResource do backend. */

export interface DistanceCenter {
  id: string;
  tenant_id: string;
  name: string;
  location: string | null;
  capacity: number | null;
  coordinator_user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface Tutor {
  id: string;
  tenant_id: string;
  distance_center_id: string;
  user_id: string | null;
  name: string;
  specialization: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
