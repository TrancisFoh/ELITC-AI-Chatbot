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
    description: "Resolve issues and customer complaints using the systematic '8 Disciplines' approach to identify root causes and prevent recurring issues.",
    prerequisites: ["GCE 'O' Level or equivalent", "Basic knowledge of WSH requirements"],
    price: 0,
    duration: "16 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/apply-8-disciplines-problem-solving-approach-blended-sfw/",
    category: "WSQ"
  },
  {
    id: "5S",
    title: "Apply 5S Techniques in Manufacturing (Blended) SFw",
    description: "Transform chaotic shop floors into precision-run environments using the globally recognized Japanese 5S methodology.",
    prerequisites: ["Basic knowledge of housekeeping concepts"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-5s-techniques-in-manufacturing-blended-sfw/",
    category: "WSQ"
  },
  {
    id: "5S-SE",
    title: "Apply 5S Techniques in Manufacturing (Synchronous E-Learning)",
    description: "Acquire knowledge and skills needed to apply 5S procedures to your own job and work area through e-learning.",
    prerequisites: ["Basic computer literacy", "WPLN Level 3"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-5s-techniques-in-manufacturing-synchronous-e-learning/",
    category: "WSQ"
  },
  {
    id: "AMT",
    title: "Apply Autonomous Maintenance Techniques",
    description: "Perform autonomous maintenance activities on machines and equipment at the workplace to ensure operational efficiency.",
    prerequisites: ["Basic knowledge of manufacturing sector", "Basic WSH knowledge"],
    price: 0,
    duration: "24 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-autonomous-maintenance-techniques-classroom-asynchronous/",
    category: "WSQ"
  },
  {
    id: "CPIT",
    title: "Apply Continuous Process Improvement Techniques (Blended) SFw",
    description: "Learn to apply continuous process improvement techniques to drive incremental and breakthrough improvements at work.",
    prerequisites: ["Basic knowledge of manufacturing sector"],
    price: 0,
    duration: "15 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-continuous-process-improvement-techniques-blended-sfw/",
    category: "WSQ"
  },
  {
    id: "QS",
    title: "Apply Quality Systems (Blended) SFw",
    description: "Practice skills and knowledge in quality systems to meet quality requirements and improve work quality.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-quality-systems-blended-sfw/",
    category: "WSQ"
  },
  {
    id: "TW",
    title: "Apply Teamwork in the Workplace (Blended)",
    description: "Practice the skills and knowledge in participating in work teams and apply them to the workplace.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-teamwork-in-the-workplace-blended/",
    category: "WSQ"
  },
  {
    id: "CGMITA",
    title: "Certificate in Generic Manufacturing Skills (Integration) - Training and Assessment",
    description: "Two-day program specifically for foreign workers to prepare them for skills upgrading and R1 Work Permit eligibility.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "14.5 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/certificate-in-generic-manufacturing-skills-integration-training-and-assessment/",
    category: "WSQ"
  },
  {
    id: "IAP",
    title: "Reduce Manpower Costs & Boost Skills (Integrated Assessment Pathway)",
    description: "Nationally recognized qualification for foreign workers in the manufacturing sector to upgrade to R1 status.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "10.5 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/certificate-in-generic-manufacturing-skills-integration-integrated-assessment-pathway-iap/",
    category: "WSQ"
  },
  {
    id: "WSH",
    title: "Apply Workplace Safety and Health Policy (Blended) SFw",
    description: "Understand and apply workplace safety and health policies to ensure a safe working environment in manufacturing.",
    prerequisites: ["Basic knowledge of manufacturing sector"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-workplace-safety-and-health-policy-blended-sfw/",
    category: "WSQ"
  },
  {
    id: "DPI-L1",
    title: "Drive Productivity and Innovation - Level 1",
    description: "Use appropriate methods to improve productivity and generate innovative ideas at the workplace.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/drive-productivity-and-innovation-level-1-classroom-asynchronous/",
    category: "WSQ"
  },
  {
    id: "MFMEA",
    title: "Manage Failure Mode and Effect Analysis (Blended) SFw",
    description: "Acquire knowledge and skills of FMEA systematically to uncover problems and the effects of failure.",
    prerequisites: ["Workplace Literacy (WPL) Level 6"],
    price: 0,
    duration: "16 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/manage-failure-mode-and-effect-analysis-blended-sfw/",
    category: "WSQ"
  },
  {
    id: "MSPDATE",
    title: "Manage Statistical Processes and Data Analysis (Blended) SFw",
    description: "Use engineering statistics and data analysis to solve problems and optimise process performance.",
    prerequisites: ["Workplace Literacy (WPL) Level 6"],
    price: 0,
    duration: "16 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/manage-statistical-processes-and-data-analysis-in-a-technical-environment-blended-sfw/",
    category: "WSQ"
  },
  {
    id: "OARA",
    title: "Operate Augmented Reality (AR) Application Software",
    description: "Gain knowledge and skills to operate AR application software to optimize productivity and efficiency.",
    prerequisites: ["Basic computer and digital literacy"],
    price: 0,
    duration: "14.5 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/operate-augmented-reality-ar-application-software/",
    category: "WSQ"
  },
  {
    id: "OEMD",
    title: "Operate Electrical Measurement Devices (Blended)",
    description: "Acquire knowledge and skills in operating electrical measurement devices in manufacturing at work.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/operate-electrical-measurement-devices-blended/",
    category: "WSQ"
  },
  {
    id: "PBPP",
    title: "Perform Basic Productivity Practices (Blended)",
    description: "Use appropriate methods to improve productivity and prevent poor productivity practices at the workplace.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/perform-basic-productivity-practices-blended/",
    category: "WSQ"
  },
  {
    id: "PCP",
    title: "Perform Cleanroom Practices",
    description: "Acquire the knowledge and skills required to perform cleanroom practices and contamination control.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "8 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/perform-cleanroom-practices/",
    category: "WSQ"
  },
  {
    id: "PSTCHO",
    title: "Perform Stock Control and Housekeeping Operations (Blended)",
    description: "Maintain warehouse operations including stock taking and performing housekeeping for a safe environment.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "13.5 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/perform-stock-control-and-housekeeping-operations-blended/",
    category: "WSQ"
  },
  {
    id: "SWSH",
    title: "Supervise Workplace Safety & Health Practices (Blended) SFw",
    description: "Plan WSH activities, implement safe work practices and maintain workplace risk control measures.",
    prerequisites: ["Workplace Literacy (WPL) Level 5"],
    price: 0,
    duration: "24 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/supervise-workplace-safety-health-practices-blended-sfw/",
    category: "WSQ"
  },
  {
    id: "UBHT",
    title: "Use Basic Hand Tools & Equipment (Blended)",
    description: "Acquire knowledge and skills of handling basic hand tools and equipment in performing tasks.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/use-basic-hand-tools-equipment-blended/",
    category: "WSQ"
  },

  // AI & Digital
  {
    id: "MRWI",
    title: "Career Launchpad: Master Resume Writing & Interviews with AI",
    description: "Master top job platforms and craft standout resumes with ChatGPT's assistance to ace your next interview.",
    prerequisites: ["Intermediate computer and digital literacy"],
    price: 0,
    duration: "4 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/career-launchpad-master-resume-writing-interviews-with-chatgpt-synchronous-e-learning/",
    category: "AI & Digital"
  },
  {
    id: "OPAI",
    title: "Optimizing Performance with AI: ChatGPT and Smart Decision-Making",
    description: "Empower yourself with AI and ChatGPT to drive productivity and better data-driven decision-making.",
    prerequisites: ["Workplace Literacy (WPL) Level 6"],
    price: 0,
    duration: "7 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/optimizing-performance-with-ai-chatgpt-and-smart-decision-making-with-data-analysis-demystified/",
    category: "AI & Digital"
  },
  {
    id: "LFTAI",
    title: "Leading Forward: Thriving in the Age of AI",
    description: "Equip yourself with the mindset and emotional intelligence needed to lead confident, future-ready teams in the AI era.",
    prerequisites: ["Workplace Literacy (WPL) Level 7"],
    price: 0,
    duration: "7 Hours",
    level: "Advanced",
    url: "https://www.elitc.com/product/leading-forward-thriving-in-the-age-of-ai/",
    category: "AI & Digital"
  },
  {
    id: "CoPCN",
    title: "CoP in Computer Networking",
    description: "Install, configure, and troubleshoot computer systems and set up a Wired Local Area Network (LAN).",
    prerequisites: ["Basic computer literacy"],
    price: 0,
    duration: "16 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/cop-in-computer-networking/",
    category: "AI & Digital"
  },
  {
    id: "CoPNS",
    title: "CoP in Network Security",
    description: "Identify threats and vulnerabilities of computer systems and networks and recommend corrective actions.",
    prerequisites: ["Basic knowledge of computers and networking"],
    price: 0,
    duration: "7 Hours",
    level: "Advanced",
    url: "https://www.elitc.com/product/cop-in-network-security/",
    category: "AI & Digital"
  },
  {
    id: "CoPNT",
    title: "CoP in Network Troubleshooting",
    description: "Analyze network functionality and performance and troubleshoot common causes of performance problems.",
    prerequisites: ["Basic knowledge of computers and networking"],
    price: 0,
    duration: "7 Hours",
    level: "Advanced",
    url: "https://www.elitc.com/product/cop-in-network-troubleshooting/",
    category: "AI & Digital"
  },
  {
    id: "CoPWN",
    title: "CoP in Wireless Networking",
    description: "Set up, test, maintain and troubleshoot Wireless Local Area Networks (WLAN) with diagnostic tools.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/cop-in-wireless-networking/",
    category: "AI & Digital"
  },
  {
    id: "DDT",
    title: "Digital Design Thinking",
    description: "Learn the practical approach of design thinking in IoT and Digital Transformation projects.",
    prerequisites: ["Working professional"],
    price: 0,
    duration: "16 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/digital-design-thinking/",
    category: "AI & Digital"
  },
  {
    id: "EF",
    title: "Excel Fundamentals",
    description: "Learn fundamental Excel skills necessary to efficiently manage, analyze, and report data.",
    prerequisites: ["Basic computer skills"],
    price: 0,
    duration: "8 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/excel-fundamentals/",
    category: "AI & Digital"
  },
  {
    id: "ISE",
    title: "ICDL Spreadsheets - Excel",
    description: "Intensive course designed for learners aiming for ICDL certification in spreadsheets.",
    prerequisites: ["Basic computer skills"],
    price: 0,
    duration: "8 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/icdl-spreadsheets-excel/",
    category: "AI & Digital"
  },
  {
    id: "IWS",
    title: "ICDL Workforce - Spreadsheets",
    description: "Globally recognized credential proving your data management skills using spreadsheet software.",
    prerequisites: ["Basic computer skills"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/icdl-workforce-spreadsheets/",
    category: "AI & Digital"
  },
  {
    id: "I4ITM",
    title: "Industry 4.0 & IIoT for Manufacturing",
    description: "Understand the revolutionary implications of Industry 4.0 and IIoT for businesses, economy, and the workforce.",
    prerequisites: ["Engineering background preferred"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/industry-4-0-iiot-for-manufacturing/",
    category: "AI & Digital"
  },
  {
    id: "IP",
    title: "Introduction to Programming",
    description: "Equips participants with knowledge and skills on basic Python programming for data analytics and robotics.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "16 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/introduction-to-programming/",
    category: "AI & Digital"
  },

  // IPC
  {
    id: "IPC-A-610",
    title: "IPC-A-610: Acceptability of Electronic Assemblies",
    description: "The most widely used inspection standard in the electronics industry for end-product acceptance and reliability.",
    prerequisites: ["Electronics background"],
    price: 0,
    duration: "To Enquire",
    level: "Professional",
    url: "https://www.elitc.com/product/acceptability-of-electronic-assemblies/",
    category: "IPC"
  },
  {
    id: "IPC-A-600",
    title: "IPC-A-600: Acceptability of Printed Boards",
    description: "Master the quality and workmanship standards for circuit boards, essential for PCB manufacturers and assemblers.",
    prerequisites: ["Electronics background"],
    price: 0,
    duration: "To Enquire",
    level: "Professional",
    url: "https://www.elitc.com/product/acceptability-of-printed-boards/",
    category: "IPC"
  },
  {
    id: "IPC-WHMA-A-620",
    title: "IPC/WHMA-A-620: Cable and Wire Harness Assemblies",
    description: "The first industry standard for cable and wire harness fabrication, installation, and acceptance.",
    prerequisites: ["None"],
    price: 0,
    duration: "To Enquire",
    level: "Professional",
    url: "https://www.elitc.com/product/requirements-and-acceptance-for-cable-and-wire-harness-assemblies/",
    category: "IPC"
  },
  {
    id: "IPC-J-STD-001",
    title: "IPC J-STD-001: Requirements for Soldered Assemblies",
    description: "Master soldering skills and criteria for producing high-quality soldered interconnections.",
    prerequisites: ["Electronics background"],
    price: 0,
    duration: "To Enquire",
    level: "Professional",
    url: "https://www.elitc.com/product/requirements-for-soldered-electrical-and-electronic-assemblies/",
    category: "IPC"
  },
  {
    id: "IPC-7711",
    title: "IPC-7711/7721: Rework, Repair and Modification",
    description: "Industry-approved techniques on through hole and surface mount rework, land, conductor and laminate repair.",
    prerequisites: ["Advanced soldering skills"],
    price: 0,
    duration: "To Enquire",
    level: "Professional",
    url: "https://www.elitc.com/product/rework-of-electronic-assemblies-repair-and-modification-of-printed-boards-and-electronic-assemblies/",
    category: "IPC"
  },
  {
    id: "HMP",
    title: "Hand-Soldering and Rework (including HMP)",
    description: "In-depth review of HMP soldering fundamentals, proper soldering methods, equipment care, and ESD safety.",
    prerequisites: ["Some soldering experience"],
    price: 0,
    duration: "15 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/hand-soldering-and-rework-including-high-melting-point-hmp-soldering/",
    category: "IPC"
  },

  // Foreign Workers
  {
    id: "WPE-L1",
    title: "Workplace English for Foreign Workers (Level 1)",
    description: "Improve basic English conversation and vocabulary for effective communication on the shop floor.",
    prerequisites: ["Little to no prior English knowledge"],
    price: 0,
    duration: "18 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/workplace-english-for-foreign-workers-level-1/",
    category: "Foreign Workers"
  },
  {
    id: "WPE-L2",
    title: "Workplace English for Foreign Workers (Level 2)",
    description: "Improve the quality of English conversation and vocabulary, introducing words used on the shop floor.",
    prerequisites: ["Some basic knowledge of English"],
    price: 0,
    duration: "18 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/workplace-english-for-foreign-workers-level-2/",
    category: "Foreign Workers"
  },
  {
    id: "WPE-L3",
    title: "Workplace English for Foreign Workers (Level 3)",
    description: "Enhance English conversational skills and reading comprehension for workplace memos and instructions.",
    prerequisites: ["Basic spoken English proficiency"],
    price: 0,
    duration: "18 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/workplace-english-for-foreign-workers-level-3/",
    category: "Foreign Workers"
  },
  {
    id: "WPE-L4",
    title: "Workplace English for Foreign Workers (Level 4)",
    description: "Learn fundamentals in grammar, work-related vocabulary, and how to write messages and business letters.",
    prerequisites: ["Completed Level 3 or equivalent"],
    price: 0,
    duration: "18 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/workplace-english-for-foreign-workers-level-4/",
    category: "Foreign Workers"
  },
  {
    id: "WPE-L5",
    title: "Workplace English for Foreign Workers (Level 5)",
    description: "Advanced level focusing on writing emails, business letters, Job Descriptions, and goal setting.",
    prerequisites: ["Completed Level 4 or equivalent"],
    price: 0,
    duration: "18 Hours",
    level: "Advanced",
    url: "https://www.elitc.com/product/workplace-english-for-foreign-workers-level-5/",
    category: "Foreign Workers"
  },
  {
    id: "IE",
    title: "Industrial English for Engineers",
    description: "Improve the ability of foreign engineers to converse confidently and write simple technical memos in English.",
    prerequisites: ["Basic English comprehension"],
    price: 0,
    duration: "24 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/industrial-english-for-engineers/",
    category: "Foreign Workers"
  },
  {
    id: "PCEP",
    title: "Preparatory Course for English Proficiency",
    description: "Improve reading, writing, speaking and listening skills to prepare for higher education programmes.",
    prerequisites: ["Workplace Literacy (WPL) Level 5"],
    price: 0,
    duration: "24 Hours",
    level: "Advanced",
    url: "https://www.elitc.com/product/preparatory-course-for-english-proficiency/",
    category: "Foreign Workers"
  },

  // Skills Improvement
  {
    id: "5SESG",
    title: "5S Practices for ESG in Action",
    description: "Incorporate practical 5S approaches that align with Environmental, Social, and Governance (ESG) sustainability.",
    prerequisites: ["Workplace Literacy (WPL) Level 7"],
    price: 0,
    duration: "7 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/5s-practices-for-esg-in-action/",
    category: "Skills Improvement"
  },
  {
    id: "AC",
    title: "Adapt to Change",
    description: "Enhance consciousness on global trends and changes impacting the workplace to boost productivity and effectiveness.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "14 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/adapt-to-change/",
    category: "Skills Improvement"
  },
  {
    id: "ABEM",
    title: "Apply Basic Engineering Mathematics at Work",
    description: "Acquire knowledge and skills of Basic Engineering Mathematics to solve problems encountered at work.",
    prerequisites: ["GCE 'O' Level or equivalent"],
    price: 0,
    duration: "21 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-basic-engineering-mathematics-at-work/",
    category: "Skills Improvement"
  },
  {
    id: "ABPAS",
    title: "Apply Biomedical Products Assembly Skills",
    description: "Perform biomedical product assembly using appropriate hand tools and measuring instruments.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-biomedical-products-assembly-skills/",
    category: "Skills Improvement"
  },
  {
    id: "ACCDS",
    title: "Apply Control Circuits Diagnostic Skills",
    description: "Carry out fault finding on control circuits systematically and safely.",
    prerequisites: ["Fundamental knowledge on electrical devices"],
    price: 0,
    duration: "21 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/apply-control-circuits-diagnostic-skills/",
    category: "Skills Improvement"
  },
  {
    id: "AECDS",
    title: "Apply Electronic Circuits Diagnostic Skills",
    description: "Carry out fault finding on electronic circuits systematically and safely.",
    prerequisites: ["Fundamental knowledge on electronic devices"],
    price: 0,
    duration: "21 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/apply-electronic-circuits-diagnostic-skills/",
    category: "Skills Improvement"
  },
  {
    id: "AIW",
    title: "Apply Innovation in the Workplace",
    description: "Generate and contribute innovative ideas at work to improve organizational performance.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "12 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/apply-innovation-in-the-workplace/",
    category: "Skills Improvement"
  },
  {
    id: "AMLPS",
    title: "Apply Management Level Planning Skills",
    description: "Learn planning processes including working with different types of plans and approaches.",
    prerequisites: ["Workplace Literacy (WPL) Level 8"],
    price: 0,
    duration: "16 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/apply-management-level-planning-skills/",
    category: "Skills Improvement"
  },
  {
    id: "APMS",
    title: "Apply Project Management Skills",
    description: "Achieve successful completion of specific project goals within budget and according to specifications.",
    prerequisites: ["Workplace Literacy (WPL) Level 8"],
    price: 0,
    duration: "24 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/apply-project-management-skills/",
    category: "Skills Improvement"
  },
  {
    id: "BTS",
    title: "Basic Technical Skills",
    description: "Covers basic manufacturing technology and industrial safety in the electronics industry.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "15 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/basic-technical-skills/",
    category: "Skills Improvement"
  },
  {
    id: "CS",
    title: "Coaching Skills",
    description: "Learn how to prepare, demonstrate, and monitor skill practices for effective On-the-Job training.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "12 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/coaching-skills/",
    category: "Skills Improvement"
  },
  {
    id: "DIW-L1",
    title: "Diversity & Inclusivity in the Workplace",
    description: "Acquire knowledge and abilities on creating an inclusive place to work and maintaining a positive outlook.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "14 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/diversity-inclusivity-in-the-workplace-level-1/",
    category: "Skills Improvement"
  },
  {
    id: "EIMM",
    title: "Electrical Installation and Machine Maintenance",
    description: "Knowledge on electrical installation and maintenance of electrical motor starters and control circuits.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/electrical-installation-and-machine-maintenance/",
    category: "Skills Improvement"
  },
  {
    id: "ELMNG",
    title: "Empowered Leadership: Mastering the New Gen Paradigm",
    description: "Equip leaders with the mindset and strategies needed to foster innovation and growth in the modern workplace.",
    prerequisites: ["Managerial or supervisory position"],
    price: 0,
    duration: "14 Hours",
    level: "Advanced",
    url: "https://www.elitc.com/product/empowered-leadership-mastering-the-new-gen-paradigm/",
    category: "Skills Improvement"
  },
  {
    id: "EDI",
    title: "Engineering Drawing Interpretation",
    description: "Master basic engineering drawing concepts, dimensions, and tolerances including GD&T.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/engineering-drawing-interpretation/",
    category: "Skills Improvement"
  },
  {
    id: "FGMP",
    title: "Follow Good Manufacturing Practices",
    description: "Follow guidelines that provide a system of processes and procedures to achieve quality products.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "7 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/follow-good-manufacturing-practices/",
    category: "Skills Improvement"
  },
  {
    id: "IGDP",
    title: "Implement Good Documentation Practices",
    description: "Comply with GMP requirements by following good documentation practices at the workplace.",
    prerequisites: ["GCE 'O' Level or equivalent"],
    price: 0,
    duration: "7 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/implement-good-documentation-practices/",
    category: "Skills Improvement"
  },
  {
    id: "IEW",
    title: "Interpretation of Electrical Wiring",
    description: "Explains how to relate a wiring diagram to the installed hardware and interpret diagrams.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "8 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/interpretation-of-electrical-wiring/",
    category: "Skills Improvement"
  },
  {
    id: "SS",
    title: "Lead-Free Soldering Skills",
    description: "Equipped with knowledge and skills of basic manual soldering conforming to acceptable standards.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "12 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/lead-free-soldering-skills/",
    category: "Skills Improvement"
  },
  {
    id: "MPMDTE",
    title: "Manage Problems and Make Decision in a Technical Environment",
    description: "Adopt systematic approaches in managing problems and making decisions using process improvement methodologies.",
    prerequisites: ["Workplace Literacy (WPL) Level 8"],
    price: 0,
    duration: "18 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/manage-problems-and-make-decision-in-a-technical-environment/",
    category: "Skills Improvement"
  },
  {
    id: "MPI",
    title: "Manage Process Improvement",
    description: "Adopt a systematic approach in improving a process through process mapping and redesign.",
    prerequisites: ["Workplace Literacy (WPL) Level 8"],
    price: 0,
    duration: "18 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/manage-process-improvement/",
    category: "Skills Improvement"
  },
  {
    id: "OBMD",
    title: "Operate Basic Measuring Devices",
    description: "Carry out preparation of work activities and select appropriate measurement procedures.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "12 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/operate-basic-measuring-devices/",
    category: "Skills Improvement"
  },
  {
    id: "PAMAD",
    title: "Perform Adjustment and Measurement on Automation Devices",
    description: "Perform adjustment and measurement on switches, relays, sensors, and actuators.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "12 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/perform-adjustment-and-measurement-on-automation-devices/",
    category: "Skills Improvement"
  },
  {
    id: "PLC-1",
    title: "Perform PLC Programming Part 1",
    description: "Fundamental PLC training for creating simple programs without prior experience.",
    prerequisites: ["GCE 'N' Level or equivalent"],
    price: 0,
    duration: "14 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/perform-plc-programming-part-1-simple-plc-operations/",
    category: "Skills Improvement"
  },
  {
    id: "PLC-2",
    title: "Perform PLC Programming Part 2",
    description: "Advanced PLC training focusing on applications in automated control systems.",
    prerequisites: ["Completed Part 1 or prior experience"],
    price: 0,
    duration: "14 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/perform-plc-programming-part-2-plc-applications/",
    category: "Skills Improvement"
  },
  {
    id: "PWO",
    title: "Perform Warehouse Operations",
    description: "Carry out receiving, picking, staging, and packing products to meet requirements.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "12 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/perform-warehouse-operations/",
    category: "Skills Improvement"
  },
  {
    id: "PDF",
    title: "Plumbing Design and Fundamentals",
    description: "Knowledge and skills on pipe fitting, plumbing design, and safety precautions.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "8 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/plumbing-design-and-fundamentals/",
    category: "Skills Improvement"
  },
  {
    id: "PSP",
    title: "Public Speaking & Presentation",
    description: "Deliver compelling, confident, and impactful presentations by mastering vocal variety and audience engagement.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "14 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/public-speaking-presentation/",
    category: "Skills Improvement"
  },
  {
    id: "SLC",
    title: "Section Leader Course",
    description: "Develop sophisticated leadership techniques to coordinate group activities and achieve company goals.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "16 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/section-leader-course/",
    category: "Skills Improvement"
  },
  {
    id: "SQC",
    title: "Statistical Quality Control",
    description: "Equip staff with SQC tools to improve quality and reduce costs in manufacturing processes.",
    prerequisites: ["Workplace Literacy (WPL) Level 5"],
    price: 0,
    duration: "16 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/statistical-quality-control/",
    category: "Skills Improvement"
  },
  {
    id: "SLNNG",
    title: "Strategic Leadership: Navigating the New Gen Landscape",
    description: "Equip leaders with strategies to effectively navigate challenges presented by the new generation of employees.",
    prerequisites: ["Managerial or supervisory position"],
    price: 0,
    duration: "14 Hours",
    level: "Advanced",
    url: "https://www.elitc.com/product/strategic-leadership-navigating-the-new-gen-landscape/",
    category: "Skills Improvement"
  },
  {
    id: "SQP",
    title: "Supervise Quality Procedures",
    description: "Acquire knowledge and skills in quality procedures and supervise quality control teams.",
    prerequisites: ["GCE 'O' Level or equivalent"],
    price: 0,
    duration: "16 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/supervise-quality-procedures/",
    category: "Skills Improvement"
  },
  {
    id: "STW",
    title: "Supervise Teams at Work",
    description: "Adopt a systematic approach to supervising work teams and making breakthrough improvements.",
    prerequisites: ["Workplace Literacy (WPL) Level 5"],
    price: 0,
    duration: "15 Hours",
    level: "Professional",
    url: "https://www.elitc.com/product/supervise-teams-at-work/",
    category: "Skills Improvement"
  },
  {
    id: "TR",
    title: "Technical Report Writing & Presentation",
    description: "Step-by-step guide to document and communicate technical messages with clarity and confidence.",
    prerequisites: ["Workplace Literacy (WPL) Level 4"],
    price: 0,
    duration: "14 Hours",
    level: "Intermediate",
    url: "https://www.elitc.com/product/technical-report-writing-presentation/",
    category: "Skills Improvement"
  },
  {
    id: "UHT",
    title: "Use Hand Tools",
    description: "Usage of hand tools, handling faulty tools, and performing maintenance checks.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "12 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/use-hand-tools/",
    category: "Skills Improvement"
  },
  {
    id: "WASM",
    title: "Workplace Adaptability & Stress Management",
    description: "Support new hires to manage work stress and develop adaptability skills in fast-paced environments.",
    prerequisites: ["Workplace Literacy (WPL) Level 3"],
    price: 0,
    duration: "8 Hours",
    level: "Beginner",
    url: "https://www.elitc.com/product/workplace-adaptability-stress-management/",
    category: "Skills Improvement"
  }
];

export const CATEGORY_MAP: Record<string, string> = {
  "WSQ Courses": "WSQ",
  "AI & Digital": "AI & Digital",
  "IPC Training": "IPC",
  "Foreign Workers": "Foreign Workers",
  "Skills Improvement": "Skills Improvement"
};
