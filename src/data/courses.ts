import { Course } from "../types";

/**
 * ELITC Course Catalog Data
 * This is the source of truth for all training programs handled by the assistant.
 * Categories include: WSQ, AI & Digital, IPC, Foreign Workers, and Skills Improvement.
 */
export const ELITC_COURSES: Course[] = [
  // WSQ Courses
  {
    id: "A8DPSA",
    title: "Apply '8 Disciplines' Problem Solving Approach (Blended) SFw",
    synopsis: "Resolve issues and customer complaints using the systematic '8 Disciplines' approach to identify root causes and prevent recurring issues.",
    objectives: ["GCE 'O' Level or equivalent", "Basic knowledge of WSH requirements"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "5S",
    title: "Apply 5S Techniques in Manufacturing (Blended) SFw",
    synopsis: "Transform chaotic shop floors into precision-run environments using the globally recognized Japanese 5S methodology.",
    objectives: ["Basic knowledge of housekeeping concepts"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "5S-SE",
    title: "Apply 5S Techniques in Manufacturing (Synchronous E-Learning)",
    synopsis: "Acquire knowledge and skills needed to apply 5S procedures to your own job and work area through e-learning.",
    objectives: ["Basic computer literacy", "WPLN Level 3"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "AMT",
    title: "Apply Autonomous Maintenance Techniques",
    synopsis: "Perform autonomous maintenance activities on machines and equipment at the workplace to ensure operational efficiency.",
    objectives: ["Basic knowledge of manufacturing sector", "Basic WSH knowledge"],
    duration: "24 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "CPIT",
    title: "Apply Continuous Process Improvement Techniques (Blended) SFw",
    synopsis: "Learn to apply continuous process improvement techniques to drive incremental and breakthrough improvements at work.",
    objectives: ["Basic knowledge of manufacturing sector"],
    duration: "15 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "QS",
    title: "Apply Quality Systems (Blended) SFw",
    synopsis: "Practice skills and knowledge in quality systems to meet quality requirements and improve work quality.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "TW",
    title: "Apply Teamwork in the Workplace (Blended)",
    synopsis: "Practice the skills and knowledge in participating in work teams and apply them to the workplace.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "CGMITA",
    title: "Certificate in Generic Manufacturing Skills (Integration) - Training and Assessment",
    synopsis: "Two-day program specifically for foreign workers to prepare them for skills upgrading and R1 Work Permit eligibility.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "14.5 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "IAP",
    title: "Reduce Manpower Costs & Boost Skills (Integrated Assessment Pathway)",
    synopsis: "Nationally recognized qualification for foreign workers in the manufacturing sector to upgrade to R1 status.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "10.5 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "WSH",
    title: "Apply Workplace Safety and Health Policy (Blended) SFw",
    synopsis: "Understand and apply workplace safety and health policies to ensure a safe working environment in manufacturing.",
    objectives: ["Basic knowledge of manufacturing sector"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "DPI-L1",
    title: "Drive Productivity and Innovation - Level 1",
    synopsis: "Use appropriate methods to improve productivity and generate innovative ideas at the workplace.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "MFMEA",
    title: "Manage Failure Mode and Effect Analysis (Blended) SFw",
    synopsis: "Acquire knowledge and skills of FMEA systematically to uncover problems and the effects of failure.",
    objectives: ["Workplace Literacy (WPL) Level 6"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "MSPDATE",
    title: "Manage Statistical Processes and Data Analysis (Blended) SFw",
    synopsis: "Use engineering statistics and data analysis to solve problems and optimise process performance.",
    objectives: ["Workplace Literacy (WPL) Level 6"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "OARA",
    title: "Operate Augmented Reality (AR) Application Software",
    synopsis: "Gain knowledge and skills to operate AR application software to optimize productivity and efficiency.",
    objectives: ["Basic computer and digital literacy"],
    duration: "14.5 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "OEMD",
    title: "Operate Electrical Measurement Devices (Blended)",
    synopsis: "Acquire knowledge and skills in operating electrical measurement devices in manufacturing at work.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "PBPP",
    title: "Perform Basic Productivity Practices (Blended)",
    synopsis: "Use appropriate methods to improve productivity and prevent poor productivity practices at the workplace.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "PCP",
    title: "Perform Cleanroom Practices",
    synopsis: "Acquire the knowledge and skills required to perform cleanroom practices and contamination control.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "8 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "PSTCHO",
    title: "Perform Stock Control and Housekeeping Operations (Blended)",
    synopsis: "Maintain warehouse operations including stock taking and performing housekeeping for a safe environment.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "13.5 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "SWSH",
    title: "Supervise Workplace Safety & Health Practices (Blended) SFw",
    synopsis: "Plan WSH activities, implement safe work practices and maintain workplace risk control measures.",
    objectives: ["Workplace Literacy (WPL) Level 5"],
    duration: "24 Hours",
    category: "WSQ", targetAudience: []
  },
  {
    id: "UBHT",
    title: "Use Basic Hand Tools & Equipment (Blended)",
    synopsis: "Acquire knowledge and skills of handling basic hand tools and equipment in performing tasks.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "16 Hours",
    category: "WSQ", targetAudience: []
  },

  // AI & Digital
  {
    id: "MRWI",
    title: "Career Launchpad: Master Resume Writing & Interviews with AI",
    synopsis: "Master top job platforms and craft standout resumes with ChatGPT's assistance to ace your next interview.",
    objectives: ["Intermediate computer and digital literacy"],
    duration: "4 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "OPAI",
    title: "Optimizing Performance with AI: ChatGPT and Smart Decision-Making",
    synopsis: "Empower yourself with AI and ChatGPT to drive productivity and better data-driven decision-making.",
    objectives: ["Workplace Literacy (WPL) Level 6"],
    duration: "7 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "LFTAI",
    title: "Leading Forward: Thriving in the Age of AI",
    synopsis: "Equip yourself with the mindset and emotional intelligence needed to lead confident, future-ready teams in the AI era.",
    objectives: ["Workplace Literacy (WPL) Level 7"],
    duration: "7 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "CoPCN",
    title: "CoP in Computer Networking",
    synopsis: "Install, configure, and troubleshoot computer systems and set up a Wired Local Area Network (LAN).",
    objectives: ["Basic computer literacy"],
    duration: "16 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "CoPNS",
    title: "CoP in Network Security",
    synopsis: "Identify threats and vulnerabilities of computer systems and networks and recommend corrective actions.",
    objectives: ["Basic knowledge of computers and networking"],
    duration: "7 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "CoPNT",
    title: "CoP in Network Troubleshooting",
    synopsis: "Analyze network functionality and performance and troubleshoot common causes of performance problems.",
    objectives: ["Basic knowledge of computers and networking"],
    duration: "7 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "CoPWN",
    title: "CoP in Wireless Networking",
    synopsis: "Set up, test, maintain and troubleshoot Wireless Local Area Networks (WLAN) with diagnostic tools.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "16 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "DDT",
    title: "Digital Design Thinking",
    synopsis: "Learn the practical approach of design thinking in IoT and Digital Transformation projects.",
    objectives: ["Working professional"],
    duration: "16 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "EF",
    title: "Excel Fundamentals",
    synopsis: "Learn fundamental Excel skills necessary to efficiently manage, analyze, and report data.",
    objectives: ["Basic computer skills"],
    duration: "8 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "ISE",
    title: "ICDL Spreadsheets - Excel",
    synopsis: "Intensive course designed for learners aiming for ICDL certification in spreadsheets.",
    objectives: ["Basic computer skills"],
    duration: "8 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "IWS",
    title: "ICDL Workforce - Spreadsheets",
    synopsis: "Globally recognized credential proving your data management skills using spreadsheet software.",
    objectives: ["Basic computer skills"],
    duration: "16 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "I4ITM",
    title: "Industry 4.0 & IIoT for Manufacturing",
    synopsis: "Understand the revolutionary implications of Industry 4.0 and IIoT for businesses, economy, and the workforce.",
    objectives: ["Engineering background preferred"],
    duration: "16 Hours",
    category: "AI & Digital", targetAudience: []
  },
  {
    id: "IP",
    title: "Introduction to Programming",
    synopsis: "Equips participants with knowledge and skills on basic Python programming for data analytics and robotics.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "16 Hours",
    category: "AI & Digital", targetAudience: []
  },

  // IPC
  {
    id: "IPC-A-610",
    title: "IPC-A-610: Acceptability of Electronic Assemblies",
    synopsis: "The most widely used inspection standard in the electronics industry for end-product acceptance and reliability.",
    objectives: ["Electronics background"],
    duration: "To Enquire",
    category: "IPC", targetAudience: []
  },
  {
    id: "IPC-A-600",
    title: "IPC-A-600: Acceptability of Printed Boards",
    synopsis: "Master the quality and workmanship standards for circuit boards, essential for PCB manufacturers and assemblers.",
    objectives: ["Electronics background"],
    duration: "To Enquire",
    category: "IPC", targetAudience: []
  },
  {
    id: "IPC-WHMA-A-620",
    title: "IPC/WHMA-A-620: Cable and Wire Harness Assemblies",
    synopsis: "The first industry standard for cable and wire harness fabrication, installation, and acceptance.",
    objectives: ["None"],
    duration: "To Enquire",
    category: "IPC", targetAudience: []
  },
  {
    id: "IPC-J-STD-001",
    title: "IPC J-STD-001: Requirements for Soldered Assemblies",
    synopsis: "Master soldering skills and criteria for producing high-quality soldered interconnections.",
    objectives: ["Electronics background"],
    duration: "To Enquire",
    category: "IPC", targetAudience: []
  },
  {
    id: "IPC-7711",
    title: "IPC-7711/7721: Rework, Repair and Modification",
    synopsis: "Industry-approved techniques on through hole and surface mount rework, land, conductor and laminate repair.",
    objectives: ["Advanced soldering skills"],
    duration: "To Enquire",
    category: "IPC", targetAudience: []
  },
  {
    id: "HMP",
    title: "Hand-Soldering and Rework (including HMP)",
    synopsis: "In-depth review of HMP soldering fundamentals, proper soldering methods, equipment care, and ESD safety.",
    objectives: ["Some soldering experience"],
    duration: "15 Hours",
    category: "IPC", targetAudience: []
  },

  // Foreign Workers
  {
    id: "WPE-L1",
    title: "Workplace English for Foreign Workers (Level 1)",
    synopsis: "Improve basic English conversation and vocabulary for effective communication on the shop floor.",
    objectives: ["Little to no prior English knowledge"],
    duration: "18 Hours",
    category: "Foreign Workers", targetAudience: []
  },
  {
    id: "WPE-L2",
    title: "Workplace English for Foreign Workers (Level 2)",
    synopsis: "Improve the quality of English conversation and vocabulary, introducing words used on the shop floor.",
    objectives: ["Some basic knowledge of English"],
    duration: "18 Hours",
    category: "Foreign Workers", targetAudience: []
  },
  {
    id: "WPE-L3",
    title: "Workplace English for Foreign Workers (Level 3)",
    synopsis: "Enhance English conversational skills and reading comprehension for workplace memos and instructions.",
    objectives: ["Basic spoken English proficiency"],
    duration: "18 Hours",
    category: "Foreign Workers", targetAudience: []
  },
  {
    id: "WPE-L4",
    title: "Workplace English for Foreign Workers (Level 4)",
    synopsis: "Learn fundamentals in grammar, work-related vocabulary, and how to write messages and business letters.",
    objectives: ["Completed Level 3 or equivalent"],
    duration: "18 Hours",
    category: "Foreign Workers", targetAudience: []
  },
  {
    id: "WPE-L5",
    title: "Workplace English for Foreign Workers (Level 5)",
    synopsis: "Advanced level focusing on writing emails, business letters, Job Descriptions, and goal setting.",
    objectives: ["Completed Level 4 or equivalent"],
    duration: "18 Hours",
    category: "Foreign Workers", targetAudience: []
  },
  {
    id: "IE",
    title: "Industrial English for Engineers",
    synopsis: "Improve the ability of foreign engineers to converse confidently and write simple technical memos in English.",
    objectives: ["Basic English comprehension"],
    duration: "24 Hours",
    category: "Foreign Workers", targetAudience: []
  },
  {
    id: "PCEP",
    title: "Preparatory Course for English Proficiency",
    synopsis: "Improve reading, writing, speaking and listening skills to prepare for higher education programmes.",
    objectives: ["Workplace Literacy (WPL) Level 5"],
    duration: "24 Hours",
    category: "Foreign Workers", targetAudience: []
  },

  // Skills Improvement
  {
    id: "5SESG",
    title: "5S Practices for ESG in Action",
    synopsis: "Incorporate practical 5S approaches that align with Environmental, Social, and Governance (ESG) sustainability.",
    objectives: ["Workplace Literacy (WPL) Level 7"],
    duration: "7 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "AC",
    title: "Adapt to Change",
    synopsis: "Enhance consciousness on global trends and changes impacting the workplace to boost productivity and effectiveness.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "14 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "ABEM",
    title: "Apply Basic Engineering Mathematics at Work",
    synopsis: "Acquire knowledge and skills of Basic Engineering Mathematics to solve problems encountered at work.",
    objectives: ["GCE 'O' Level or equivalent"],
    duration: "21 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "ABPAS",
    title: "Apply Biomedical Products Assembly Skills",
    synopsis: "Perform biomedical product assembly using appropriate hand tools and measuring instruments.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "16 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "ACCDS",
    title: "Apply Control Circuits Diagnostic Skills",
    synopsis: "Carry out fault finding on control circuits systematically and safely.",
    objectives: ["Fundamental knowledge on electrical devices"],
    duration: "21 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "AECDS",
    title: "Apply Electronic Circuits Diagnostic Skills",
    synopsis: "Carry out fault finding on electronic circuits systematically and safely.",
    objectives: ["Fundamental knowledge on electronic devices"],
    duration: "21 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "AIW",
    title: "Apply Innovation in the Workplace",
    synopsis: "Generate and contribute innovative ideas at work to improve organizational performance.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "12 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "AMLPS",
    title: "Apply Management Level Planning Skills",
    synopsis: "Learn planning processes including working with different types of plans and approaches.",
    objectives: ["Workplace Literacy (WPL) Level 8"],
    duration: "16 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "APMS",
    title: "Apply Project Management Skills",
    synopsis: "Achieve successful completion of specific project goals within budget and according to specifications.",
    objectives: ["Workplace Literacy (WPL) Level 8"],
    duration: "24 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "BTS",
    title: "Basic Technical Skills",
    synopsis: "Covers basic manufacturing technology and industrial safety in the electronics industry.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "15 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "CS",
    title: "Coaching Skills",
    synopsis: "Learn how to prepare, demonstrate, and monitor skill practices for effective On-the-Job training.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "12 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "DIW-L1",
    title: "Diversity & Inclusivity in the Workplace",
    synopsis: "Acquire knowledge and abilities on creating an inclusive place to work and maintaining a positive outlook.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "14 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "EIMM",
    title: "Electrical Installation and Machine Maintenance",
    synopsis: "Knowledge on electrical installation and maintenance of electrical motor starters and control circuits.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "16 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "ELMNG",
    title: "Empowered Leadership: Mastering the New Gen Paradigm",
    synopsis: "Equip leaders with the mindset and strategies needed to foster innovation and growth in the modern workplace.",
    objectives: ["Managerial or supervisory position"],
    duration: "14 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "EDI",
    title: "Engineering Drawing Interpretation",
    synopsis: "Master basic engineering drawing concepts, dimensions, and tolerances including GD&T.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "16 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "FGMP",
    title: "Follow Good Manufacturing Practices",
    synopsis: "Follow guidelines that provide a system of processes and procedures to achieve quality products.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "7 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "IGDP",
    title: "Implement Good Documentation Practices",
    synopsis: "Comply with GMP requirements by following good documentation practices at the workplace.",
    objectives: ["GCE 'O' Level or equivalent"],
    duration: "7 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "IEW",
    title: "Interpretation of Electrical Wiring",
    synopsis: "Explains how to relate a wiring diagram to the installed hardware and interpret diagrams.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "8 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "SS",
    title: "Lead-Free Soldering Skills",
    synopsis: "Equipped with knowledge and skills of basic manual soldering conforming to acceptable standards.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "12 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "MPMDTE",
    title: "Manage Problems and Make Decision in a Technical Environment",
    synopsis: "Adopt systematic approaches in managing problems and making decisions using process improvement methodologies.",
    objectives: ["Workplace Literacy (WPL) Level 8"],
    duration: "18 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "MPI",
    title: "Manage Process Improvement",
    synopsis: "Adopt a systematic approach in improving a process through process mapping and redesign.",
    objectives: ["Workplace Literacy (WPL) Level 8"],
    duration: "18 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "OBMD",
    title: "Operate Basic Measuring Devices",
    synopsis: "Carry out preparation of work activities and select appropriate measurement procedures.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "12 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "PAMAD",
    title: "Perform Adjustment and Measurement on Automation Devices",
    synopsis: "Perform adjustment and measurement on switches, relays, sensors, and actuators.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "12 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "PLC-1",
    title: "Perform PLC Programming Part 1",
    synopsis: "Fundamental PLC training for creating simple programs without prior experience.",
    objectives: ["GCE 'N' Level or equivalent"],
    duration: "14 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "PLC-2",
    title: "Perform PLC Programming Part 2",
    synopsis: "Advanced PLC training focusing on applications in automated control systems.",
    objectives: ["Completed Part 1 or prior experience"],
    duration: "14 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "PWO",
    title: "Perform Warehouse Operations",
    synopsis: "Carry out receiving, picking, staging, and packing products to meet requirements.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "12 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "PDF",
    title: "Plumbing Design and Fundamentals",
    synopsis: "Knowledge and skills on pipe fitting, plumbing design, and safety precautions.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "8 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "PSP",
    title: "Public Speaking & Presentation",
    synopsis: "Deliver compelling, confident, and impactful presentations by mastering vocal variety and audience engagement.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "14 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "SLC",
    title: "Section Leader Course",
    synopsis: "Develop sophisticated leadership techniques to coordinate group activities and achieve company goals.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "16 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "SQC",
    title: "Statistical Quality Control",
    synopsis: "Equip staff with SQC tools to improve quality and reduce costs in manufacturing processes.",
    objectives: ["Workplace Literacy (WPL) Level 5"],
    duration: "16 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "SLNNG",
    title: "Strategic Leadership: Navigating the New Gen Landscape",
    synopsis: "Equip leaders with strategies to effectively navigate challenges presented by the new generation of employees.",
    objectives: ["Managerial or supervisory position"],
    duration: "14 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "SQP",
    title: "Supervise Quality Procedures",
    synopsis: "Acquire knowledge and skills in quality procedures and supervise quality control teams.",
    objectives: ["GCE 'O' Level or equivalent"],
    duration: "16 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "STW",
    title: "Supervise Teams at Work",
    synopsis: "Adopt a systematic approach to supervising work teams and making breakthrough improvements.",
    objectives: ["Workplace Literacy (WPL) Level 5"],
    duration: "15 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "TR",
    title: "Technical Report Writing & Presentation",
    synopsis: "Step-by-step guide to document and communicate technical messages with clarity and confidence.",
    objectives: ["Workplace Literacy (WPL) Level 4"],
    duration: "14 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "UHT",
    title: "Use Hand Tools",
    synopsis: "Usage of hand tools, handling faulty tools, and performing maintenance checks.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "12 Hours",
    category: "Skills Improvement", targetAudience: []
  },
  {
    id: "WASM",
    title: "Workplace Adaptability & Stress Management",
    synopsis: "Support new hires to manage work stress and develop adaptability skills in fast-paced environments.",
    objectives: ["Workplace Literacy (WPL) Level 3"],
    duration: "8 Hours",
    category: "Skills Improvement", targetAudience: []
  }
];

export const CATEGORY_MAP: Record<string, string> = {
  "WSQ Courses": "WSQ",
  "AI & Digital": "AI & Digital",
  "IPC Training": "IPC",
  "Foreign Workers": "Foreign Workers",
  "Skills Improvement": "Skills Improvement"
};
