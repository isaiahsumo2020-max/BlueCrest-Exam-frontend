import { GradeRule, MarksEntry, Subject } from '../types';

export const DEFAULT_GRADE_RULES: GradeRule[] = [
  { grade: 'A',  minMarks: 80,  maxMarks: 100, gradePoint: 4.0, passStatus: 'pass' },
  { grade: 'B+', minMarks: 75,  maxMarks: 79,  gradePoint: 3.5, passStatus: 'pass' },
  { grade: 'B',  minMarks: 70,  maxMarks: 74,  gradePoint: 3.0, passStatus: 'pass' },
  { grade: 'C+', minMarks: 65,  maxMarks: 69,  gradePoint: 2.5, passStatus: 'pass' },
  { grade: 'C',  minMarks: 60,  maxMarks: 64,  gradePoint: 2.0, passStatus: 'pass' },
  { grade: 'D+', minMarks: 55,  maxMarks: 59,  gradePoint: 1.5, passStatus: 'pass' },
  { grade: 'D',  minMarks: 50,  maxMarks: 54,  gradePoint: 1.0, passStatus: 'pass' },
  { grade: 'F',  minMarks: 0,   maxMarks: 49,  gradePoint: 0.0, passStatus: 'fail' },
];

export function getGradeRule(percentage: number, rules: GradeRule[] = DEFAULT_GRADE_RULES): GradeRule {
  const clamped = Math.max(0, Math.min(100, percentage));
  return rules.find(r => clamped >= r.minMarks && clamped <= r.maxMarks) ?? rules[rules.length - 1];
}

export function computeTotal(components: Record<string, number>): number {
  return Object.values(components).reduce((s, v) => s + (Number(v) || 0), 0);
}

export function computePercentage(total: number, maxTotal: number): number {
  if (maxTotal === 0) return 0;
  return Math.round((total / maxTotal) * 100 * 100) / 100;
}

export function computeGPA(
  entries: MarksEntry[],
  subjects: Subject[]
): { gpa: number; totalCredits: number; earnedCredits: number } {
  let weightedPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  for (const entry of entries) {
    const subj = subjects.find(s => s.id === entry.subjectId);
    if (!subj) continue;
    totalCredits += subj.credits;
    weightedPoints += subj.credits * entry.gradePoint;
    if (entry.status === 'pass') earnedCredits += subj.credits;
  }

  const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
  return {
    gpa: Math.round(gpa * 100) / 100,
    totalCredits,
    earnedCredits,
  };
}

export function computeCGPA(sems: { gpa: number; credits: number }[]): number {
  const totalW = sems.reduce((s, x) => s + x.gpa * x.credits, 0);
  const totalC = sems.reduce((s, x) => s + x.credits, 0);
  if (totalC === 0) return 0;
  return Math.round((totalW / totalC) * 100) / 100;
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A':  return 'text-emerald-700 bg-emerald-50';
    case 'B+': return 'text-green-700 bg-green-50';
    case 'B':  return 'text-teal-700 bg-teal-50';
    case 'C+': return 'text-cyan-700 bg-cyan-50';
    case 'C':  return 'text-blue-700 bg-blue-50';
    case 'D+': return 'text-amber-700 bg-amber-50';
    case 'D':  return 'text-orange-700 bg-orange-50';
    case 'F':  return 'text-red-700 bg-red-50';
    default:   return 'text-gray-700 bg-gray-50';
  }
}
