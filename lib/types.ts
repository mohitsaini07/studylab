export type Topic = { title: string; description: string };
export type StudySet = {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  file_url: string;
  summary: string;
  topics: Topic[];
  page_count: number;
  status: "processing" | "ready" | "failed";
  error_message: string | null;
  created_at: string;
};
export type QuestionType = "mcq" | "short" | "long";
export type Question = {
  id: string;
  study_set_id: string;
  type: QuestionType;
  question: string;
  answer: string;
  options: string[] | null;
  topic: string | null;
  explanation: string | null;
  created_at: string;
};
export type Flashcard = {
  id: string;
  study_set_id: string;
  front: string;
  back: string;
  topic: string | null;
  created_at: string;
};
export type QuizAttempt = {
  id: string;
  user_id: string;
  study_set_id: string;
  score: number;
  total_questions: number;
  weak_topics: string[];
  created_at: string;
};
export type GeneratedStudySet = {
  title: string;
  summary: string;
  topics: Topic[];
  questions: Array<{
    type: QuestionType;
    question: string;
    answer: string;
    options?: string[];
    topic: string;
    explanation: string;
  }>;
  flashcards: Array<{ front: string; back: string; topic: string }>;
};
export type GenerationOptions = {
  summary: boolean;
  topics: boolean;
  questions: boolean;
  flashcards: boolean;
};
