export type InputType = "voice" | "text";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: string;
  text: string;
  inputType: InputType;
  keywords: string[];
  tileIndex: number | null;
  status: SubmissionStatus;
  createdAt: string;
}

/** بيانات مطلوبة لإنشاء مشاركة جديدة قبل أن تُخزَّن */
export interface NewSubmissionInput {
  text: string;
  inputType: InputType;
}

export interface MosaicStats {
  totalSubmissions: number;
  approvedCount: number;
  pendingCount: number;
  totalWords: number;
  completionRatio: number; // 0..1
  gridSize: number; // عدد الأعمدة/الصفوف (شبكة مربعة)
  totalTiles: number;
  topKeywords: { word: string; count: number }[];
}
