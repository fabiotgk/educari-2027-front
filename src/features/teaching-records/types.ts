export interface TeachingRecord {
  id: string;
  tenant_id: string;
  class_diary_id: string;
  lesson_date: string;
  lesson_number_in_day: number;
  content_taught: string;
  methodology: string | null;
  observations: string | null;
  learning_expectations: string[] | null;
  recorded_by_user_id: string;
  is_substituted: boolean;
  substituted_for_record_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}
