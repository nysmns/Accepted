export type SimulatorProgram = {
  code: string;
  label: string;
  group: string;
  university: string;
  prompts: string[];
};

/** Representative practice prompts. Confirm current application formats with each institution. */
export const SIMULATOR_PROGRAMS: SimulatorProgram[] = [
  {
    code: 'queens_comm',
    label: "Queen's Smith Commerce",
    group: 'Business & Commerce',
    university: "Queen's University",
    prompts: [
      'Describe a time when you took initiative to solve an unexpected problem within a team. What was the outcome?',
      'What core value defines your leadership style, and how have you demonstrated it in your school involvement?',
    ],
  },
  {
    code: 'ivey',
    label: 'Western Ivey AEO',
    group: 'Business & Commerce',
    university: 'Western University',
    prompts: [
      'Tell us about a time you experienced a significant setback or failure. How did you adapt and what did you learn?',
      'What is one global business trend or challenge that fascinates you, and why?',
    ],
  },
  {
    code: 'schulich',
    label: 'York Schulich BBA',
    group: 'Business & Commerce',
    university: 'York University',
    prompts: [
      'How do you define ethical leadership when faced with conflicting group interests?',
      'Describe a project where you managed tight deadlines and resource constraints. What was your strategy?',
    ],
  },
  {
    code: 'rotman',
    label: 'UofT Rotman Commerce',
    group: 'Business & Commerce',
    university: 'University of Toronto',
    prompts: [
      'Describe a situation where you had to balance heavy conflicting commitments. How did you prioritize?',
      'What unique perspective or experience do you bring to our diverse student cohort?',
    ],
  },
  {
    code: 'laurier_bba',
    label: 'Laurier BBA (Co-op)',
    group: 'Business & Commerce',
    university: 'Wilfrid Laurier University',
    prompts: [
      'Detail your most meaningful extracurricular involvement and how it shaped your professional goals.',
      'Give an example of how you motivated a disengaged teammate during a group project.',
    ],
  },
  {
    code: 'mcmaster_ibh',
    label: 'McMaster IBH',
    group: 'Business & Commerce',
    university: 'McMaster University',
    prompts: [
      'How can business principles be effectively integrated with humanitarian or social goals?',
      'Describe a time you persuaded a group to adopt an unconventional approach.',
    ],
  },
  {
    code: 'waterloo_eng',
    label: 'Waterloo Engineering (AIF / Video)',
    group: 'Engineering & Computer Science',
    university: 'University of Waterloo',
    prompts: [
      'Engineering Problem Solving: Describe a complex technical or design challenge you tackled in a club or personal project. How did you troubleshoot failures?',
      'Why Waterloo Engineering? Beyond academics and co-op, what specific aspects of our ecosystem align with your career goals?',
    ],
  },
  {
    code: 'waterloo_cs',
    label: 'Waterloo Computer Science (AIF)',
    group: 'Engineering & Computer Science',
    university: 'University of Waterloo',
    prompts: [
      'Discuss a software project, algorithmic puzzle, or coding challenge that pushed your problem-solving limits.',
      'Why Computer Science at Waterloo? How do your extracurriculars and background prepare you for rigorous theoretical and practical CS?',
    ],
  },
  {
    code: 'uoft_eng',
    label: 'UofT St. George Engineering',
    group: 'Engineering & Computer Science',
    university: 'University of Toronto',
    prompts: [
      'U of T Engineering Video Prompt: Tell us about a time you had to learn a completely new skill or concept under strict time pressure.',
      'Describe a situation where an engineering or scientific solution had unintended consequences. How would you mitigate them?',
    ],
  },
  {
    code: 'mcmaster_eng',
    label: 'McMaster Engineering / iBioMed',
    group: 'Engineering & Computer Science',
    university: 'McMaster University',
    prompts: [
      'How do you handle constructive criticism when working in a high-stakes team environment?',
      'Describe an instance where you identified an inefficiency in your school or community and designed a practical solution.',
    ],
  },
  {
    code: 'queens_health',
    label: "Queen's Health Sciences",
    group: 'Health Sciences & Nursing',
    university: "Queen's University",
    prompts: [
      'Discuss a current ethical dilemma in healthcare delivery. What factors should decision-makers weigh first?',
      'What personal experience has most shaped your empathy and commitment to healthcare?',
    ],
  },
  {
    code: 'mac_health',
    label: 'McMaster Health Sciences (BHSc)',
    group: 'Health Sciences & Nursing',
    university: 'McMaster University',
    prompts: [
      'Describe a time when your perspective on a firmly held belief was challenged. How did you respond, and what changed?',
      'If you could allocate a multi-million dollar public health grant between preventative community wellness and advanced acute care hospital research, how would you divide it and why?',
    ],
  },
  {
    code: 'uoft_daniels',
    label: 'UofT Daniels Architecture (One Idea)',
    group: 'Arts, Design & Architecture',
    university: 'University of Toronto',
    prompts: [
      'Describe an architectural or spatial design issue in your local environment. Propose one concrete intervention to improve how people use that space.',
    ],
  },
  {
    code: 'tmu_creative',
    label: 'TMU Creative School / Architecture',
    group: 'Arts, Design & Architecture',
    university: 'Toronto Metropolitan University',
    prompts: [
      'Discuss a piece of media, design, or journalism that changed how you thought about an issue. What made its communication effective?',
    ],
  },
  {
    code: 'york_ampd',
    label: 'York AMPD (Film/Acting/Design)',
    group: 'Arts, Design & Architecture',
    university: 'York University',
    prompts: [
      'What artistic medium or storytelling form lets you express your perspective most effectively, and why?',
    ],
  },
  {
    code: 'carleton_comm',
    label: 'Carleton Commerce (BCom)',
    group: 'Business & Commerce',
    university: 'Carleton University',
    prompts: [
      'Describe your experience in a business-related context and what you learned from it.',
      'What do you think are the most important qualities for success in business, and how have you developed them?',
    ],
  },
  {
    code: 'carleton_journ',
    label: 'Carleton Journalism (BJ)',
    group: 'Business & Commerce',
    university: 'Carleton University',
    prompts: [
      'Why do you want to pursue a career in journalism, and how have your experiences prepared you for it?',
      'Describe a current issue in media or journalism that fascinates you and explain why.',
    ],
  },
  {
    code: 'carleton_bpapm',
    label: 'Carleton Public Affairs and Policy (BPAPM)',
    group: 'Business & Commerce',
    university: 'Carleton University',
    prompts: [
      'Describe a time you influenced change in a community or organization.',
      'What role should government or policy play in addressing a challenge you care about?',
    ],
  },
  {
    code: 'carleton_cosms',
    label: 'Carleton Communication and Media Studies (BCoMS)',
    group: 'Business & Commerce',
    university: 'Carleton University',
    prompts: [
      'Describe your experience in communications and what you hope to bring to the program.',
      'How has social media or digital media shaped the way you communicate and think?',
    ],
  },
  {
    code: 'carleton_bent',
    label: 'Carleton Entrepreneurship (BEnt)',
    group: 'Business & Commerce',
    university: 'Carleton University',
    prompts: [
      'Describe a project or idea you started to solve a real problem. What did you learn?',
      'What does innovation mean to you, and how have you practiced it?',
    ],
  },
  {
    code: 'carleton_cogsc',
    label: 'Carleton Cognitive Science (BCogSc)',
    group: 'Arts, Design & Architecture',
    university: 'Carleton University',
    prompts: [
      'Describe a time your perspective on how people think or learn changed. What caused it?',
      'How do you think technology will change the way humans learn or communicate?',
    ],
  },
  {
    code: 'carleton_bid',
    label: 'Carleton Industrial Design (BID)',
    group: 'Arts, Design & Architecture',
    university: 'Carleton University',
    prompts: [
      'Describe your experience in design and what draws you to industrial design.',
      'Design an object that would improve daily life for students. What would it do, and why?',
    ],
  },
  {
    code: 'carleton_bit',
    label: 'Carleton Information Technology (BIT)',
    group: 'Engineering & Computer Science',
    university: 'Carleton University',
    prompts: [
      'Describe a technology project you worked on and what you learned.',
      'How do you think artificial intelligence should be governed, and why?',
    ],
  },
  {
    code: 'carleton_bsw',
    label: 'Carleton Social Work (BSW)',
    group: 'Health Sciences & Nursing',
    university: 'Carleton University',
    prompts: [
      'Why do you want to study social work, and how have your experiences prepared you?',
      'Describe a time you supported someone facing a challenge. What did you learn?',
    ],
  },
  {
    code: 'carleton_nurs',
    label: 'Carleton Nursing (BScN, RN Prescribing)',
    group: 'Health Sciences & Nursing',
    university: 'Carleton University',
    prompts: [
      'Why do you want to pursue nursing, and what relevant experiences have you had?',
      'Describe a time you cared for someone who was unwell. What did it teach you?',
    ],
  },
  {
    code: 'uottawa_telfer',
    label: 'uOttawa Telfer Commerce (BCom)',
    group: 'Business & Commerce',
    university: 'University of Ottawa',
    prompts: [
      'Describe your most meaningful involvement and how it shaped your goals.',
      'What does responsible management mean to you, and how have you practiced it?',
    ],
  },
  {
    code: 'trent_sw',
    label: 'Trent–Swansea Law Dual Degree',
    group: 'Business & Commerce',
    university: 'Trent University',
    prompts: [
      'Why do you want to pursue a joint law and arts/business degree, and what makes you a strong fit?',
      'Describe a time your perspective on law, justice, or leadership changed. What caused it?',
    ],
  },
  {
    code: 'laurentian_arch',
    label: 'Laurentian Architectural Studies',
    group: 'Arts, Design & Architecture',
    university: 'Laurentian University',
    prompts: [
      'Describe a built environment you find interesting and propose one change to improve it.',
      'What draws you to architecture, and how have you explored design?',
    ],
  },
  {
    code: 'laurentian_sw',
    label: 'Laurentian Indigenous Social Work',
    group: 'Health Sciences & Nursing',
    university: 'Laurentian University',
    prompts: [
      'Why do you want to study Indigenous Social Work, and what experience have you had in Indigenous communities?',
      'Describe a time you worked with Indigenous peoples or communities. What did you learn?',
    ],
  },
];

export const PROGRAM_GROUPS = [
  'Business & Commerce',
  'Engineering & Computer Science',
  'Health Sciences & Nursing',
  'Arts, Design & Architecture',
] as const;

export function getSimulatorProgram(code: string): SimulatorProgram | undefined {
  return SIMULATOR_PROGRAMS.find((p) => p.code === code);
}
