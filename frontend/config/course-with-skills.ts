interface Course {
  code: string;
  name: string;
  skills?: string[];
}

interface Faculty {
  name: string;
  courses: Course[];
}

interface School {
  name: string;
  faculties: Faculty[];
}

export const coursesWithSkillsData: { schools: School[] } = {
  schools: [
    {
      name: "SBE (School of Business and Economic)",
      faculties: [
        {
          name: "Department of Accounting & Finance",
          courses: [
            {
              code: "ACT 201",
              name: "Introduction to Financial Accounting",
              skills: [
                "Double-entry bookkeeping",
                "Preparing financial statements (Balance Sheet, Income Statement, Cash Flow)",
                "Journal entries & ledgers",
                "Accrual vs. cash accounting",
                "Basic GAAP principles",
              ],
            },
            {
              code: "ACT 202",
              name: "Introduction to Managerial Accounting",
              skills: [
                "Cost classification (fixed, variable, direct, indirect)",
                "Budgeting & forecasting",
                "Break-even analysis",
                "Performance measurement",
                "Variance analysis",
              ],
            },
            {
              code: "ACT 310",
              name: "Intermediate Accounting I",
              skills: [
                "Advanced financial reporting",
                "Revenue recognition standards",
                "Accounting for assets (PPE, inventory, intangibles)",
                "Liabilities & contingencies",
                "Financial disclosures",
              ],
            },
            {
              code: "ACT 320",
              name: "Intermediate Accounting II",
              skills: [
                "Accounting for pensions & leases",
                "Income taxes (deferred tax, temporary differences)",
                "Equity method investments",
                "Consolidations basics",
                "Cash flow complexities",
              ],
            },
            {
              code: "ACT 360",
              name: "Advanced Managerial Accounting",
              skills: [
                "Strategic cost management",
                "Activity-based costing",
                "Balanced scorecard techniques",
                "Transfer pricing",
                "Advanced budgeting",
              ],
            },
            {
              code: "ACT 370",
              name: "Taxation",
              skills: [
                "Personal & corporate tax structures",
                "Tax planning & compliance",
                "VAT & indirect taxes",
                "Tax return preparation",
                "Tax law interpretation",
              ],
            },
            {
              code: "ACT 380",
              name: "Audit and Assurance",
              skills: [
                "Internal controls evaluation",
                "Audit risk & materiality",
                "Evidence gathering techniques",
                "Audit reporting",
                "Ethical standards in auditing",
              ],
            },
            {
              code: "ACT 410 / FIN 410",
              name: "Financial Statement Analysis",
              skills: [
                "Ratio analysis (liquidity, solvency, profitability)",
                "Trend & horizontal/vertical analysis",
                "Cash flow analysis",
                "Valuation techniques",
                "Credit analysis",
              ],
            },
            {
              code: "ACT 430",
              name: "Accounting Information Systems",
              skills: [
                "ERP systems (SAP, Oracle basics)",
                "Database management in accounting",
                "IT controls & auditing",
                "System documentation techniques",
                "Business process automation",
              ],
            },
            {
              code: "ACT 460",
              name: "Advanced Financial Accounting",
              skills: [
                "Business combinations & consolidations",
                "Foreign currency translation",
                "Partnership accounting",
                "Segment reporting",
                "Complex group structures",
              ],
            },
            {
              code: "FIN 254",
              name: "Introduction to Financial Management",
              skills: [
                "Time value of money",
                "Capital budgeting basics",
                "Cost of capital",
                "Risk-return trade-off",
                "Working capital management",
              ],
            },
            {
              code: "FIN 433",
              name: "Financial Markets & Institutions",
              skills: [
                "Capital markets vs. money markets",
                "Role of central banks",
                "Securities & trading mechanisms",
                "Regulatory frameworks",
                "Risk in financial institutions",
              ],
            },
            {
              code: "FIN 435",
              name: "Investment Theory",
              skills: [
                "Portfolio theory (Markowitz, CAPM)",
                "Efficient market hypothesis",
                "Asset pricing models",
                "Security valuation (stocks, bonds)",
                "Risk diversification",
              ],
            },
            {
              code: "FIN 440",
              name: "Corporate Finance",
              skills: [
                "Capital structure decisions",
                "Dividend policy",
                "Mergers & acquisitions",
                "Firm valuation",
                "Financing strategies",
              ],
            },
            {
              code: "FIN 444",
              name: "International Financial Management",
              skills: [
                "Foreign exchange markets",
                "Currency risk hedging (forwards, options, swaps)",
                "Cross-border investments",
                "Global capital budgeting",
                "Multinational financing",
              ],
            },
            {
              code: "FIN 455",
              name: "Financial Modeling Using Excel",
              skills: [
                "Excel financial functions (NPV, IRR, PMT)",
                "Sensitivity & scenario analysis",
                "Forecasting with spreadsheets",
                "Building valuation models",
                "Monte Carlo simulations",
              ],
            },
            {
              code: "FIN 464",
              name: "Bank Management",
              skills: [
                "Asset-liability management",
                "Credit risk analysis",
                "Liquidity management",
                "Basel accords compliance",
                "Interest rate risk",
              ],
            },
            {
              code: "FIN 470",
              name: "Insurance and Risk Management",
              skills: [
                "Types of insurance products",
                "Risk identification & measurement",
                "Underwriting principles",
                "Actuarial basics",
                "Claims management",
              ],
            },
            {
              code: "FIN 480",
              name: "Financial Derivatives",
              skills: [
                "Options, futures, forwards, swaps",
                "Hedging strategies",
                "Pricing models (Black-Scholes, binomial)",
                "Speculation vs. arbitrage",
                "Risk management using derivatives",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "SEPS (School of Engineering and Physical Science)",
      faculties: [
        {
          name: "Department of Architecture",
          courses: [],
        },
      ],
    },
    {
      name: "SEPS (School of Engineering and Physical Science)",
      faculties: [
        {
          name: "Department of Architecture",
          courses: [
            {
              code: "ARC 111",
              name: "Foundation Design Studio I (Artistic Development)",
              skills: [
                "Sketching fundamentals",
                "Creative visualization",
                "Artistic expression in design",
                "Hand-eye coordination in drawing",
                "Conceptual thinking",
              ],
            },
            {
              code: "ARC 112",
              name: "Foundation Design Studio II (Form & Composition)",
              skills: [
                "Principles of form (balance, symmetry, proportion)",
                "Composition in space",
                "Visual hierarchy in design",
                "Spatial arrangement",
              ],
            },
            {
              code: "ARC 121",
              name: "Graphics I (Basic Drawing)",
              skills: [
                "Orthographic projection",
                "Perspective drawing",
                "Line weights & shading",
                "Freehand sketching",
              ],
            },
            {
              code: "ARC 122",
              name: "Graphics II (Rendering)",
              skills: [
                "Rendering techniques (pencil, ink, watercolor)",
                "Light & shadow representation",
                "Material texture rendering",
                "Presentation graphics",
              ],
            },
            {
              code: "ARC 123",
              name: "Graphics III (Digital Presentation)",
              skills: [
                "AutoCAD basics",
                "Photoshop for architecture",
                "Digital rendering & visualization",
                "Presentation boards",
              ],
            },
            {
              code: "ARC 131",
              name: "Sources in Architecture I (Artistic Appreciation)",
              skills: [
                "History of art & architecture",
                "Aesthetic principles",
                "Artistic critique",
                "Cultural symbolism in art",
              ],
            },
            {
              code: "ARC 132",
              name: "Sources in Architecture II (Visual Studies)",
              skills: [
                "Semiotics of images",
                "Relationship between words & visuals",
                "Visual culture analysis",
              ],
            },
            {
              code: "ARC 133",
              name: "Parameters in Design I (Aesthetic & Design)",
              skills: [
                "Principles of aesthetics",
                "Proportion systems (Golden Ratio, Modulor)",
                "Color theory in architecture",
                "Design evaluation methods",
              ],
            },
            {
              code: "ARC 200",
              name: "Craft & Design (Observation & Documentation)",
              skills: [
                "Physical model-making",
                "Material handling (wood, clay, paper)",
                "Observational sketching",
                "Documentation of form",
              ],
            },
            {
              code: "ARC 213",
              name: "Allied Design Studio (Dimension & Product)",
              skills: [
                "Human scale & ergonomics",
                "Product design basics",
                "Prototyping methods",
                "Dimensional analysis",
              ],
            },
            {
              code: "ARC 214",
              name: "Architecture Design Studio I (Function & Analysis)",
              skills: [
                "Functional zoning",
                "Space analysis",
                "Bubble diagrams",
                "Design problem-solving",
              ],
            },
            {
              code: "ARC 215",
              name: "Architecture Design Studio II (Simple Function)",
              skills: [
                "Basic building layouts",
                "Circulation analysis",
                "Spatial programming",
                "Site response design",
              ],
            },
            {
              code: "ARC 241",
              name: "246 (Architectural Heritage I–VI)",
              skills: [
                "History of global, Indian, Bengal, Islamic, and modern architecture",
                "Conservation principles",
                "Cultural heritage studies",
                "Comparative architectural history",
              ],
            },
            {
              code: "ARC 251",
              name: "Urban Design & Environmental Planning",
              skills: [
                "Urban morphology",
                "Land use planning",
                "Environmental impact assessment",
                "Sustainable city design",
              ],
            },
            {
              code: "ARC 261",
              name: "264 (Environment & Building Systems I–IV)",
              skills: [
                "Climate-responsive design",
                "Building physics (heat, light, sound)",
                "HVAC systems",
                "Energy-efficient design integration",
              ],
            },
            {
              code: "ARC 271",
              name: "273 (Construction I–III)",
              skills: [
                "Building materials (steel, concrete, timber)",
                "Construction technology",
                "Workshop-based construction skills",
                "Detailing & joinery",
              ],
            },
            {
              code: "ARC 281",
              name: "283 (Building Structures I–III)",
              skills: [
                "Structural systems (beam, truss, frame)",
                "Load transfer mechanisms",
                "Basic structural design",
                "Earthquake & wind load principles",
              ],
            },
            {
              code: "ARC 293",
              name: "Design-Related Media",
              skills: [
                "Multimedia tools in architecture",
                "Animation basics",
                "Architectural photography",
                "3D modeling",
              ],
            },
            {
              code: "ARC 310",
              name: "Interior Design Studio",
              skills: [
                "Space planning for interiors",
                "Furniture design",
                "Lighting design",
                "Interior finishes",
              ],
            },
            {
              code: "ARC 316",
              name: "318 (Professional Studies Studio I–III)",
              skills: [
                "Complex building functions",
                "Institutional & commercial design",
                "Project integration",
                "Design documentation",
              ],
            },
            {
              code: "ARC 324",
              name: "Graphics IV (Working Details)",
              skills: [
                "Construction detailing",
                "Shop drawings",
                "Technical documentation",
                "Assembly drawings",
              ],
            },
            {
              code: "ARC 334",
              name: "Parameters in Design II (Theory & Methods)",
              skills: [
                "Design thinking methods",
                "Research in architecture",
                "Criticism & evaluation techniques",
              ],
            },
            {
              code: "ARC 336",
              name: "Architecture & Urbanism (Space, Culture, Urban Design)",
              skills: [
                "Urban sociology",
                "Space & society interaction",
                "Public realm design",
                "Cultural geography",
              ],
            },
            {
              code: "ARC 365",
              name: "Design for the Tropics",
              skills: [
                "Tropical architecture principles",
                "Passive cooling",
                "Sustainable design in hot-humid climates",
              ],
            },
            {
              code: "ARC 384",
              name: "Building Structures IV",
              skills: [
                "Advanced structural systems",
                "Shell & space-frame structures",
                "High-rise design basics",
              ],
            },
            {
              code: "ARC 410",
              name: "Landscape Design Lab",
              skills: [
                "Landscape planning",
                "Plant selection & ecology",
                "Hardscape & softscape design",
              ],
            },
            {
              code: "ARC 418",
              name: "419 (Design & Allied Studies Studio I–II)",
              skills: [
                "Advanced design projects",
                "Multi-functional space planning",
                "Integration of technology in design",
              ],
            },
            {
              code: "ARC 437",
              name: "Professional Practice, Ethics & Society",
              skills: [
                "Architectural codes & regulations",
                "Professional ethics",
                "Project delivery systems",
                "Client-architect relationships",
              ],
            },
            {
              code: "ARC 439",
              name: "Management & Business Administration in Architecture",
              skills: [
                "Project management",
                "Architectural firm management",
                "Cost estimation",
                "Contract administration",
              ],
            },
            {
              code: "ARC 452",
              name: "459 (Urban & Building Design Specializations)",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 466",
              name: "Ecology & Bio-Climatic Design",
              skills: [
                "Ecological design principles",
                "Bioclimatic architecture",
                "Environmental psychology",
              ],
            },
            {
              code: "ARC 474",
              name: "475 (Construction & Surveying)",
              skills: [
                "Construction documentation",
                "Field surveying",
                "Measured drawings",
              ],
            },
            {
              code: "ARC 485",
              name: "486 (Advanced Architectural Structures I–II)",
              skills: [
                "Advanced load analysis",
                "Innovative structural systems",
                "Parametric structural design",
              ],
            },
            {
              code: "ARC 576",
              name: "579 (Advanced Systems & Economics)",
              skills: [
                "Building automation",
                "Smart buildings",
                "Construction economics",
                "Safety & security systems",
              ],
            },
            {
              code: "ARC 596",
              name: "598 (Thesis, Research & Seminar)",
              skills: [
                "Research methodology in architecture",
                "Academic writing & documentation",
                "Seminar presentation skills",
                "Design thesis execution",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "School of Humanities & Social Science",
      faculties: [
        {
          name: "Department of English and others",
          courses: [],
        },
      ],
    },
    {
      name: "School of Humanities & Social Science",
      faculties: [
        {
          name: "Department of English",
          courses: [
            {
              code: "ENG 102",
              name: "Introduction to Composition",
              skills: [
                "Academic writing basics",
                "Grammar & sentence structure",
                "Paragraph organization",
                "Clarity & coherence in writing",
              ],
            },
            {
              code: "ENG 103",
              name: "Intermediate Composition",
              skills: [
                "Essay structure (intro, body, conclusion)",
                "Argument construction",
                "Revision & editing techniques",
                "Writing with evidence",
              ],
            },
            {
              code: "ENG 111",
              name: "Public Speaking",
              skills: [
                "Speech organization",
                "Voice control & articulation",
                "Presentation skills",
                "Audience engagement",
              ],
            },
            {
              code: "ENG 105",
              name: "Advanced Composition",
              skills: [
                "Argumentative essay writing",
                "Research paper development",
                "Critical analysis of sources",
                "Citation styles (APA, MLA, Chicago)",
              ],
            },
            {
              code: "ENG 210",
              name: "Introduction to Linguistics",
              skills: [
                "Phonetics & phonology basics",
                "Morphology & syntax",
                "Semantics & pragmatics",
                "Language structure analysis",
              ],
            },
            {
              code: "ENG 211",
              name: "Second Language Acquisition Theory",
              skills: [
                "Theories of language learning",
                "Bilingualism & multilingualism",
                "Learner errors & interlanguage",
                "Classroom application",
              ],
            },
            {
              code: "ENG 212",
              name: "History of the English Language",
              skills: [
                "Old, Middle, Modern English evolution",
                "Language contact & borrowing",
                "Sound changes & grammar shifts",
                "Standardization of English",
              ],
            },
            {
              code: "ENG 321",
              name: "Psycholinguistics",
              skills: [
                "Language acquisition & brain processes",
                "Speech perception & production",
                "Cognitive aspects of language",
                "Language disorders",
              ],
            },
            {
              code: "ENG 401",
              name: "Contrastive Grammar (English-Bengali)",
              skills: [
                "English vs. Bengali grammar comparison",
                "Translation techniques",
                "Cross-linguistic interference",
                "Language teaching implications",
              ],
            },
            {
              code: "ENG 406",
              name: "Discourse Analysis",
              skills: [
                "Cohesion & coherence in texts",
                "Conversation analysis",
                "Critical discourse analysis (CDA)",
                "Pragmatic functions in language",
              ],
            },
            {
              code: "ENG 416",
              name: "Stylistics",
              skills: [
                "Literary style analysis",
                "Figures of speech & stylistic devices",
                "Functional stylistics",
                "Register & tone in language",
              ],
            },
            {
              code: "ENG 426",
              name: "Generative Grammar",
              skills: [
                "Chomsky’s theories",
                "Phrase structure rules",
                "Transformational grammar",
                "Syntax tree construction",
              ],
            },
            {
              code: "ENG 208",
              name: "Introduction to Journalism",
              skills: [
                "News writing basics",
                "Reporting & interviewing",
                "Ethics in journalism",
                "Headline writing",
              ],
            },
            {
              code: "ENG 219",
              name: "European Classics in Translation",
              skills: [
                "Literary analysis of classics",
                "Comparative literature skills",
                "Themes & motifs in European works",
                "Translation studies basics",
              ],
            },
            {
              code: "ENG 222",
              name: "Survey of American Literature",
              skills: [
                "Major American writers & movements",
                "Literary interpretation",
                "Historical context in literature",
                "Critical analysis",
              ],
            },
            {
              code: "ENG 223",
              name: "Survey of British Literature",
              skills: [
                "British literary canon",
                "Poetry, prose & drama analysis",
                "Periodization of English literature",
                "Critical appreciation",
              ],
            },
            {
              code: "ENG 225",
              name: "Survey of South-Asian Literature in English",
              skills: [
                "Postcolonial literature studies",
                "Cultural identity in writing",
                "Themes of migration & nationalism",
                "Comparative South Asian authors",
              ],
            },
            {
              code: "ENG 230",
              name: "Introduction to Poetry",
              skills: [
                "Poetic devices (metaphor, simile, meter)",
                "Poem analysis",
                "Scansion & rhythm",
                "Interpretive reading",
              ],
            },
            {
              code: "ENG 301",
              name: "Poetry of the English Renaissance",
              skills: [
                "Renaissance literary themes",
                "Analysis of poets (Spenser, Milton, etc.)",
                "Historical context of poetry",
                "Classical influences",
              ],
            },
            {
              code: "ENG 304",
              name: "Elizabethan & Jacobean Drama (excl. Shakespeare)",
              skills: [
                "Drama analysis (Marlowe, Jonson)",
                "Stagecraft & performance context",
                "Themes & character analysis",
                "Literary criticism of plays",
              ],
            },
            {
              code: "ENG 318",
              name: "Materials Development Principles",
              skills: [
                "Creating teaching materials",
                "Task design for language learning",
                "Adaptation of texts",
                "Instructional resource evaluation",
              ],
            },
            {
              code: "ENG 334",
              name: "Syllabus Design",
              skills: [
                "Curriculum planning",
                "Language learning objectives",
                "Task sequencing",
                "Assessment design",
              ],
            },
            {
              code: "ENG 370",
              name: "Business Communication",
              skills: [
                "Professional email writing",
                "Report & memo writing",
                "Presentation skills",
                "Negotiation & persuasion",
              ],
            },
            {
              code: "ENG 450",
              name: "456 (Teaching Methods Courses)",
              skills: [
                "Lesson planning (450)",
                "Teaching reading strategies (451)",
                "Grammar pedagogy (452)",
                "Teaching writing & composition (453)",
                "Listening & speaking skills (454)",
                "Technology in teaching (455 – CALL)",
                "Testing & evaluation methods (456)",
              ],
            },
            {
              code: "ENG 491",
              name: "Teaching Practicum",
              skills: [
                "Classroom teaching practice",
                "Student assessment design",
                "Lesson delivery",
                "Reflective teaching",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "School of Humanities & Social Science",
      faculties: [
        {
          name: "Department of Political Science & Sociology",
          courses: [
            {
              code: "POL 101",
              name: "Introduction to Political Science",
              skills: [
                "Political theory basics",
                "State, power, authority concepts",
                "Forms of government",
                "Political ideologies",
              ],
            },
            {
              code: "POL 104",
              name: "Introduction to Good Governance",
              skills: [
                "Governance frameworks",
                "Accountability & transparency",
                "Anti-corruption measures",
                "Democratic practices",
              ],
            },
            {
              code: "POL 202",
              name: "Introduction to International Relations",
              skills: [
                "IR theories (realism, liberalism, constructivism)",
                "Global conflicts & cooperation",
                "International institutions (UN, WTO, NATO)",
                "Diplomacy basics",
              ],
            },
            {
              code: "INT 201",
              name: "Global Security Perspectives",
              skills: [
                "National & international security",
                "Cybersecurity issues",
                "Terrorism & conflict studies",
                "Peacebuilding strategies",
              ],
            },
            {
              code: "PAD 201",
              name: "Introduction to Public Administration",
              skills: [
                "Bureaucracy & administrative systems",
                "Policy-making process",
                "Public service management",
                "Administrative ethics",
              ],
            },
            {
              code: "SOC 101",
              name: "Introduction to Sociology",
              skills: [
                "Social institutions (family, religion, education)",
                "Culture & society",
                "Social stratification",
                "Sociological theories (Durkheim, Marx, Weber)",
              ],
            },
            {
              code: "SOC 103",
              name: "Introduction to Criminology",
              skills: [
                "Theories of crime",
                "Criminal justice system",
                "Juvenile delinquency",
                "Crime prevention policies",
              ],
            },
            {
              code: "SOC 201",
              name: "Gender Relationship Issues",
              skills: [
                "Gender roles & stereotypes",
                "Feminist theories",
                "Gender inequality in society",
                "Gender policy analysis",
              ],
            },
            {
              code: "TNM 201",
              name: "Television & New Media",
              skills: [
                "Media studies basics",
                "TV production techniques",
                "Digital media analysis",
                "Media & society impact",
              ],
            },
            {
              code: "WMS 201",
              name: "Gender & Development",
              skills: [
                "Gender mainstreaming",
                "Women empowerment strategies",
                "Development policy analysis",
                "Intersectionality studies",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "School of Humanities & Social Science",
      faculties: [
        {
          name: "Department of Law",
          courses: [
            {
              code: "LAW 101",
              name: "Legal System & Processes",
              skills: [
                "Structure of courts",
                "Sources of law",
                "Legal reasoning",
                "Case briefing",
              ],
            },
            {
              code: "LAW 201",
              name: "Constitutional Law of Bangladesh",
              skills: [
                "Constitutional principles",
                "Rights & liberties",
                "Judiciary & executive relations",
                "Amendments & reforms",
              ],
            },
            {
              code: "LAW 107",
              name: "Contract & Restitution Law",
              skills: [
                "Elements of a valid contract",
                "Breach of contract",
                "Restitution principles",
                "Legal remedies",
              ],
            },
            {
              code: "LAW 211",
              name: "Family & Property Law",
              skills: [
                "Marriage & divorce laws",
                "Inheritance rules",
                "Property rights",
                "Guardianship & custody",
              ],
            },
            {
              code: "LAW 213",
              name: "Law of Crimes",
              skills: [
                "Criminal liability principles",
                "Penal Code of Bangladesh",
                "Defenses in criminal law",
                "Sentencing",
              ],
            },
            {
              code: "LAW 405",
              name: "Labour & Employment Law",
              skills: [
                "Employment contracts",
                "Workers’ rights",
                "Trade unions & collective bargaining",
                "Dispute resolution",
              ],
            },
            {
              code: "LAW 417",
              name: "Banking & Foreign Exchange Law",
              skills: [
                "Banking regulations",
                "Central bank authority",
                "Foreign exchange rules",
                "Anti-money laundering laws",
              ],
            },
            {
              code: "LAW 418",
              name: "Criminology & Penology",
              skills: [
                "Crime causes & control",
                "Prison systems",
                "Rehabilitation approaches",
                "Criminal justice policy",
              ],
            },
            {
              code: "LAW 419",
              name: "International Criminal Law",
              skills: [
                "War crimes & genocide law",
                "ICC jurisdiction",
                "Crimes against humanity",
                "Extradition rules",
              ],
            },
            {
              code: "LAW 420",
              name: "Medical Jurisprudence & Forensic Law",
              skills: [
                "Medical negligence law",
                "Forensic evidence in trials",
                "Autopsy & toxicology basics",
                "Bioethics",
              ],
            },
            {
              code: "LAW 421",
              name: "Public International Law",
              skills: [
                "Treaty law",
                "State sovereignty & recognition",
                "Law of the sea",
                "Diplomatic relations law",
              ],
            },
            {
              code: "LAW 422",
              name: "Environmental Law & Policy",
              skills: [
                "Environmental protection frameworks",
                "Pollution control laws",
                "Sustainable development policies",
                "International environmental agreements",
              ],
            },
            {
              code: "LAW 423",
              name: "Land Laws of Bangladesh",
              skills: [
                "Land ownership rules",
                "Land registration",
                "Tenancy & lease law",
                "Dispute resolution",
              ],
            },
            {
              code: "LAW 424",
              name: "Cyber, Media & Telecommunications Law",
              skills: [
                "Cybercrime & digital evidence",
                "Privacy & data protection",
                "Media regulation",
                "Telecommunications licensing",
              ],
            },
          ],
        },
      ],
    },
    {
      name: "School of Humanities & Social Science",
      faculties: [
        {
          name: "Department of History & Philosophy",
          courses: [
            {
              code: "HIS 101",
              name: "Bangladesh History & Culture",
              skills: [
                "Historical timeline of Bangladesh",
                "Cultural traditions",
                "Liberation war studies",
                "Socio-cultural transformations",
              ],
            },
            {
              code: "PHI 101",
              name: "Introduction to Philosophy",
              skills: [
                "Fundamental philosophical questions",
                "Greek philosophy (Plato, Aristotle)",
                "Metaphysics & epistemology basics",
                "Ethical dilemmas",
              ],
            },
            {
              code: "PHI 104",
              name: "Introduction to Ethics",
              skills: [
                "Ethical theories (Kantian, utilitarian, virtue ethics)",
                "Applied ethics (business, medical, environmental)",
                "Moral reasoning",
                "Case-based ethical decision-making",
              ],
            },
            {
              code: "PHI 270",
              name: "Philosophy of Science",
              skills: [
                "Scientific method",
                "Demarcation of science vs. pseudoscience",
                "Theory-ladenness of observation",
                "Philosophy of physics & biology",
              ],
            },
            {
              code: "PHI 401",
              name: "Business Ethics",
              skills: [
                "Corporate social responsibility (CSR)",
                "Consumer rights",
                "Workplace ethics",
                "Ethical leadership",
              ],
            },
            {
              code: "PSY 101",
              name: "Introduction to Psychology",
              skills: [
                "Major psychology theories",
                "Perception & cognition",
                "Motivation & learning",
                "Behavioral science basics",
              ],
            },
            {
              code: "PSY 101L",
              name: "Psychology Lab",
              skills: [
                "Psychological experiments",
                "Research methods in psychology",
                "Data collection & analysis",
                "Lab report writing",
              ],
            },
            {
              code: "PSY 105",
              name: "Elements of Psychology",
              skills: [
                "History of psychology",
                "Research methods overview",
                "Biological & cognitive psychology basics",
                "Personality & emotion theories",
              ],
            },
            {
              code: "PSY 205",
              name: "Introduction to World Religions",
              skills: [
                "Hinduism, Buddhism, Christianity, Islam basics",
                "Comparative religious studies",
                "Rituals & practices",
                "Religion’s role in society",
              ],
            },
          ],
        },
      ],
    },
  ],
};
