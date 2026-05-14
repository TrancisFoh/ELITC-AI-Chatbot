import { Course } from "../types";

/**
 * ELITC Course Catalog Data
 */
export const ELITC_COURSES: Course[] = [
  {
    id: "A8DPSA",
    title: "Apply '8 Disciplines' Problem Solving Approach (Blended) SFw",
    category: "WSQ",
    duration: "16 Hours",
    synopsis: "Resolve issues and customer complaints using the systematic '8 Disciplines' approach to identify root causes and prevent recurring issues.",
    objectives: ["Identify root causes", "Prevent recurring issues"],
    targetAudience: ["Supervisors", "Managers"]
  },
  {
    id: "5S",
    title: "Apply 5S Techniques in Manufacturing (Blended) SFw",
    category: "WSQ",
    duration: "16 Hours",
    synopsis: "Transform chaotic shop floors into precision-run environments using the globally recognized Japanese 5S methodology.",
    objectives: ["Apply 5S procedures"],
    targetAudience: ["Manufacturing workers"]
  }
];

export const CATEGORY_MAP: Record<string, string> = {
  "WSQ Courses": "WSQ",
  "AI & Digital": "AI & Digital",
  "IPC Training": "IPC",
  "Foreign Workers": "Foreign Workers",
  "Skills Improvement": "Skills Improvement"
};
