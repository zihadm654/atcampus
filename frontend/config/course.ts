interface Course {
  code: string;
  name: string;
  skills: string[];
}

interface Faculty {
  name: string;
  courses: Course[];
}

interface School {
  name: string;
  faculties: Faculty[];
}

export const coursesData: { schools: School[] } = {
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
              name: "Intermediate Accounting - I",
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
              name: "Intermediate Accounting - II",
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
        {
          name: "Department of Marketing & International Business",
          courses: [
            { code: "MKT202", name: "Introduction to Marketing", skills: [] },
            { code: "MKT337", name: "Promotional Management", skills: [] },
            { code: "MKT344", name: "Consumer Behavior", skills: [] },
            { code: "MKT460", name: "Strategic Marketing", skills: [] },
            { code: "MKT470", name: "Marketing Research", skills: [] },
            { code: "MKT330", name: "Digital Marketing", skills: [] },
            { code: "MKT355", name: "Agricultural Marketing", skills: [] },
            { code: "MKT382", name: "International Marketing", skills: [] },
            { code: "MKT412", name: "Services Marketing", skills: [] },
            { code: "MKT417", name: "Export Import Management", skills: [] },
            { code: "MKT445", name: "Sales Management", skills: [] },
            { code: "MKT450", name: "Marketing Channels", skills: [] },
            { code: "MKT465", name: "Brand Management", skills: [] },
            { code: "MKT475", name: "Marketing Analytics", skills: [] },
          ],
        },
        {
          name: "Department of Management",
          courses: [
            {
              code: "BUS 135",
              name: "Applied Business Mathematics",
              skills: [],
            },
            { code: "BUS172", name: "Introduction to statistics", skills: [] },
            { code: "BUS 173", name: "Applied statistics", skills: [] },
            { code: "BUS 251", name: "Business Communication", skills: [] },
            { code: "BUS 498", name: "Internship", skills: [] },
            { code: "HRM 340", name: "Training and Development", skills: [] },
            { code: "HRM 360", name: "Planning and Staffing", skills: [] },
            {
              code: "HRM 370",
              name: "Leadership Theory and Practice",
              skills: [],
            },
            { code: "HRM 380", name: "Compensation", skills: [] },
            { code: "HRM 450", name: "Labor Management Relations", skills: [] },
            { code: "HRM 470", name: "Negotiations", skills: [] },
            { code: "MGT 212", name: "Organizational Management", skills: [] },
            {
              code: "MGT 314",
              name: "Operations & Supply Chain Management",
              skills: [],
            },
            { code: "MGT 321", name: "Organizational Behavior", skills: [] },
            { code: "MGT 351", name: "Human Resource Management", skills: [] },
            { code: "MGT 368", name: "Entrepreneurship", skills: [] },
            {
              code: "MGT 330",
              name: "Designing Effective Organizations",
              skills: [],
            },
            {
              code: "MGT 410",
              name: "Organizational Development and Change Management",
              skills: [],
            },
            { code: "MGT 489", name: "Strategic Management", skills: [] },
            { code: "MGT 490", name: "Project Management", skills: [] },
            {
              code: "MIS 107",
              name: "Information System & Computing",
              skills: [],
            },
            { code: "MIS 207", name: "E-Business", skills: [] },
            {
              code: "MIS210",
              name: "Concepts of Computer Programming",
              skills: [],
            },
            {
              code: "MIS310",
              name: "Database Systems for Business",
              skills: [],
            },
            {
              code: "MIS320",
              name: "Digital Enterprise Management",
              skills: [],
            },
            { code: "MIS410", name: "Business Intelligence", skills: [] },
            {
              code: "MIS450",
              name: "Data Communication and Networking for Business",
              skills: [],
            },
            { code: "MIS470", name: "Systems Analysis and Design", skills: [] },
            {
              code: "SCM310",
              name: "Logistics and Transportation",
              skills: [],
            },
            {
              code: "SCM 320",
              name: "Demand Planning and Fulfilment",
              skills: [],
            },
            { code: "MGT/SCM 360", name: "Services Management", skills: [] },
            {
              code: "SCM 450",
              name: "Global Procurement and Sourcing",
              skills: [],
            },
          ],
        },
        {
          name: "Department of Economics",
          courses: [
            {
              code: "Eco101",
              name: "introduction to Microeconomics",
              skills: [],
            },
            {
              code: "Eco 104",
              name: "principles of macroeconomics",
              skills: [],
            },
            { code: "Eco172", name: "introduction to statistic", skills: [] },
            { code: "Eco173", name: "applied statistic", skills: [] },
            {
              code: "Eco201",
              name: "Intermediate Microeconomics Theory",
              skills: [],
            },
            {
              code: "ECO204",
              name: "intermediate Macroeconomics theory",
              skills: [],
            },
            { code: "Eco372", name: "introduction to economics", skills: [] },
            { code: "Eco490", name: "senior seminer", skills: [] },
            { code: "Eco317", name: "money and banking", skills: [] },
            { code: "Eco328", name: "international economics", skills: [] },
            { code: "Eco349", name: "economy of Bangladesh", skills: [] },
            {
              code: "Eco354",
              name: "environmental & natural resources economics",
              skills: [],
            },
            {
              code: "Eco496",
              name: "History of Economics thought",
              skills: [],
            },
            { code: "Eco414", name: "Public Finance", skills: [] },
            { code: "Eco441", name: "labor Economics", skills: [] },
            { code: "Eco443", name: "health economics", skills: [] },
            { code: "Eco415", name: "economic development", skills: [] },
            { code: "Eco492", name: "special topic in economics", skills: [] },
          ],
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
              name: "Foundation Design Studio I- Artistic Development",
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
              name: "Foundation Design Studio II- Form and Composition",
              skills: [
                "Principles of form (balance, symmetry, proportion)",
                "Composition in space",
                "Visual hierarchy in design",
                "Spatial arrangement",
              ],
            },
            {
              code: "ARC 121",
              name: "Graphics I- Basic Drawing",
              skills: [
                "Orthographic projection",
                "Perspective drawing",
                "Line weights & shading",
                "Freehand sketching",
              ],
            },
            {
              code: "ARC 122",
              name: "Graphics II- Rendering",
              skills: [
                "Rendering techniques (pencil, ink, watercolor)",
                "Light & shadow representation",
                "Material texture rendering",
                "Presentation graphics",
              ],
            },
            {
              code: "ARC 123",
              name: "Graphics III- Digital Presentation",
              skills: [
                "AutoCAD basics",
                "Photoshop for architecture",
                "Digital rendering & visualization",
                "Presentation boards",
              ],
            },
            {
              code: "ARC 131",
              name: "Sources in Architecture I- Artistic Appreciation",
              skills: [
                "History of art & architecture",
                "Aesthetic principles",
                "Artistic critique",
                "Cultural symbolism in art",
              ],
            },
            {
              code: "ARC 132",
              name: "Sources in Architecture II- Introduction to Visual Studies, Word and Images",
              skills: [
                "Semiotics of images",
                "Relationship between words & visuals",
                "Visual culture analysis",
              ],
            },
            {
              code: "ARC 133:1",
              name: "Parameters in Design I- Aesthetic and Design",
              skills: [
                "Principles of aesthetics",
                "Proportion systems (Golden Ratio, Modulor)",
                "Color theory in architecture",
                "Design evaluation methods",
              ],
            },
            {
              code: "ARC 200",
              name: "Craft and Design- Observation and Documentation",
              skills: [
                "Physical model-making",
                "Material handling (wood, clay, paper)",
                "Observational sketching",
                "Documentation of form",
              ],
            },
            {
              code: "ARC 213",
              name: "Allied Design Studio- Dimension and Product",
              skills: [
                "Human scale & ergonomics",
                "Product design basics",
                "Prototyping methods",
                "Dimensional analysis",
              ],
            },
            {
              code: "ARC 214",
              name: "Architecture Design Studio I- Function and Analysis",
              skills: [
                "Functional zoning",
                "Space analysis",
                "Bubble diagrams",
                "Design problem-solving",
              ],
            },
            {
              code: "ARC 215",
              name: "Architecture Design Studio II- Simple Function",
              skills: [
                "Basic building layouts",
                "Circulation analysis",
                "Spatial programming",
                "Site response design",
              ],
            },
            {
              code: "ARC 241",
              name: "Architectural Heritage I- World I",
              skills: [
                "History of global, Indian, Bengal, Islamic, and modern architecture",
                "Conservation principles",
                "Cultural heritage studies",
                "Comparative architectural history",
              ],
            },
            {
              code: "ARC 242",
              name: "Architectural Heritage II- World II",
              skills: [
                "History of global, Indian, Bengal, Islamic, and modern architecture",
                "Conservation principles",
                "Cultural heritage studies",
                "Comparative architectural history",
              ],
            },
            {
              code: "ARC 251",
              name: "Introduction to Urban Design and Environmental Planning",
              skills: [
                "Urban morphology",
                "Land use planning",
                "Environmental impact assessment",
                "Sustainable city design",
              ],
            },
            {
              code: "ARC 261",
              name: "Environment and Building System I- Climate and Design",
              skills: [
                "Climate-responsive design",
                "Building physics (heat, light, sound)",
                "HVAC systems",
                "Energy-efficient design integration",
              ],
            },
            {
              code: "ARC 262",
              name: "Environment and Building System II- Building Physics",
              skills: [
                "Climate-responsive design",
                "Building physics (heat, light, sound)",
                "HVAC systems",
                "Energy-efficient design integration",
              ],
            },
            {
              code: "ARC 263",
              name: "Environment and Building System III- Building Services",
              skills: [
                "Climate-responsive design",
                "Building physics (heat, light, sound)",
                "HVAC systems",
                "Energy-efficient design integration",
              ],
            },
            {
              code: "ARC 264",
              name: "Environment and Building System IV- Design Integration",
              skills: [
                "Climate-responsive design",
                "Building physics (heat, light, sound)",
                "HVAC systems",
                "Energy-efficient design integration",
              ],
            },
            {
              code: "ARC 271",
              name: "Construction I- Materials",
              skills: [
                "Building materials (steel, concrete, timber)",
                "Construction technology",
                "Workshop-based construction skills",
                "Detailing & joinery",
              ],
            },
            {
              code: "ARC 272",
              name: "Construction II- Technology",
              skills: [
                "Building materials (steel, concrete, timber)",
                "Construction technology",
                "Workshop-based construction skills",
                "Detailing & joinery",
              ],
            },
            {
              code: "ARC 273",
              name: "Construction III- Workshop",
              skills: [
                "Building materials (steel, concrete, timber)",
                "Construction technology",
                "Workshop-based construction skills",
                "Detailing & joinery",
              ],
            },
            {
              code: "ARC 281",
              name: "Building Structures I: Basic Principles",
              skills: [
                "Structural systems (beam, truss, frame)",
                "Load transfer mechanisms",
                "Basic structural design",
                "Earthquake & wind load principles",
              ],
            },
            {
              code: "ARC 282",
              name: "Building Structures II",
              skills: [
                "Structural systems (beam, truss, frame)",
                "Load transfer mechanisms",
                "Basic structural design",
                "Earthquake & wind load principles",
              ],
            },
            {
              code: "ARC 283",
              name: "Building Structures III",
              skills: [
                "Structural systems (beam, truss, frame)",
                "Load transfer mechanisms",
                "Basic structural design",
                "Earthquake & wind load principles",
              ],
            },
            {
              code: "ARC 293",
              name: "Design-Related-Media",
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
              name: "Professional Studies Studio I- Form and Function",
              skills: [
                "Complex building functions",
                "Institutional & commercial design",
                "Project integration",
                "Design documentation",
              ],
            },
            {
              code: "ARC 317",
              name: "Professional Studies Studio II- Complex Function",
              skills: [
                "Complex building functions",
                "Institutional & commercial design",
                "Project integration",
                "Design documentation",
              ],
            },
            {
              code: "ARC 318",
              name: "Professional Studies Studio III- Complex Function",
              skills: [
                "Complex building functions",
                "Institutional & commercial design",
                "Project integration",
                "Design documentation",
              ],
            },
            {
              code: "ARC 324",
              name: "Graphics IV-Working Details",
              skills: [
                "Construction detailing",
                "Shop drawings",
                "Technical documentation",
                "Assembly drawings",
              ],
            },
            {
              code: "ARC 334",
              name: "Parameters in Design II- Theory and Methods",
              skills: [
                "Design thinking methods",
                "Research in architecture",
                "Criticism & evaluation techniques",
              ],
            },
            {
              code: "ARC 336",
              name: "Architecture and Urbanism- Space, Culture and Urban Design",
              skills: [
                "Urban sociology",
                "Space & society interaction",
                "Public realm design",
                "Cultural geography",
              ],
            },
            {
              code: "ARC 343",
              name: "Architectural Heritage III- India",
              skills: [
                "History of global, Indian, Bengal, Islamic, and modern architecture",
                "Conservation principles",
                "Cultural heritage studies",
                "Comparative architectural history",
              ],
            },
            {
              code: "ARC 344",
              name: "Architectural Heritage IV- Bengal",
              skills: [
                "History of global, Indian, Bengal, Islamic, and modern architecture",
                "Conservation principles",
                "Cultural heritage studies",
                "Comparative architectural history",
              ],
            },
            {
              code: "ARC 346",
              name: "Architectural Heritage V- Contemporary South and Southeast Asia",
              skills: [
                "History of global, Indian, Bengal, Islamic, and modern architecture",
                "Conservation principles",
                "Cultural heritage studies",
                "Comparative architectural history",
              ],
            },
            {
              code: "ARC 347",
              name: "Architectural Heritage VI- Islamic",
              skills: [
                "History of global, Indian, Bengal, Islamic, and modern architecture",
                "Conservation principles",
                "Cultural heritage studies",
                "Comparative architectural history",
              ],
            },
            {
              code: "ARC 348",
              name: "Built Heritage and Conservation",
              skills: [
                "History of global, Indian, Bengal, Islamic, and modern architecture",
                "Conservation principles",
                "Cultural heritage studies",
                "Comparative architectural history",
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
              code: "ARC 394",
              name: "Special Topic I (Technology, Environment or Science)",
              skills: [],
            },
            {
              code: "ARC 410",
              name: "Landscape Design Laboratory",
              skills: [
                "Landscape planning",
                "Plant selection & ecology",
                "Hardscape & softscape design",
              ],
            },
            {
              code: "ARC 418",
              name: "Design and Allied Studies Studio I",
              skills: [
                "Advanced design projects",
                "Multi-functional space planning",
                "Integration of technology in design",
              ],
            },
            {
              code: "ARC 419",
              name: "Design and Allied Studies Studio II",
              skills: [
                "Advanced design projects",
                "Multi-functional space planning",
                "Integration of technology in design",
              ],
            },
            {
              code: "ARC 436",
              name: "Buildings, Land, and Cultural Traditions- Diversity and Change",
              skills: [],
            },
            {
              code: "ARC 437",
              name: "Professional Practice, Ethics and Society",
              skills: [
                "Architectural codes & regulations",
                "Professional ethics",
                "Project delivery systems",
                "Client-architect relationships",
              ],
            },
            {
              code: "ARC 438",
              name: "Environmental Psychology",
              skills: [
                "Ecological design principles",
                "Bioclimatic architecture",
                "Environmental psychology",
              ],
            },
            {
              code: "ARC 439",
              name: "Management and Business Administration in Architecture",
              skills: [
                "Project management",
                "Architectural firm management",
                "Cost estimation",
                "Contract administration",
              ],
            },
            {
              code: "ARC 445",
              name: "Contemporary Design- Precedents and Analyses",
              skills: [],
            },
            {
              code: "ARC 452",
              name: "Land-Use, Infrastructure and Transport Planning",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 453",
              name: "Human Settlement- Policy and Planning",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 454",
              name: "Human Geography- Settlement and Development",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 455",
              name: "Advanced Urban Design and Planning Applications",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 456",
              name: "Rural Studies",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 457",
              name: "Urbanism and Local Context",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 458",
              name: "Residential Building Design",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 459",
              name: "Non-Residential Building Design",
              skills: [
                "Land use & transport planning",
                "Human settlement design",
                "Residential & non-residential building design",
                "Rural & urban development",
              ],
            },
            {
              code: "ARC 466",
              name: "Ecology and Bio-Climatic Design",
              skills: [
                "Ecological design principles",
                "Bioclimatic architecture",
                "Environmental psychology",
              ],
            },
            {
              code: "ARC 474",
              name: "Construction IV- Documents and Management",
              skills: [
                "Construction documentation",
                "Field surveying",
                "Measured drawings",
              ],
            },
            {
              code: "ARC 475",
              name: "Field Survey, Measured Drawing and Documentation",
              skills: [
                "Construction documentation",
                "Field surveying",
                "Measured drawings",
              ],
            },
            {
              code: "ARC 485",
              name: "Advanced Architectural Structure I",
              skills: [
                "Advanced load analysis",
                "Innovative structural systems",
                "Parametric structural design",
              ],
            },
            {
              code: "ARC 486",
              name: "Advanced Architectural Structure II",
              skills: [
                "Advanced load analysis",
                "Innovative structural systems",
                "Parametric structural design",
              ],
            },
            { code: "ARC 492", name: "Independent Study", skills: [] },
            {
              code: "ARC 495",
              name: "Special Topic II (Design, Theory or Settlement)",
              skills: [],
            },
            {
              code: "ARC 500",
              name: "Professional Internship (supervised training)",
              skills: [],
            },
            { code: "ARC 510", name: "Advanced Studies Studio I", skills: [] },
            {
              code: "ARC 519",
              name: "Advanced Studies Studio II- Thesis Project",
              skills: [],
            },
            {
              code: "ARC 535",
              name: "Parameters in Design III- Pedagogy and Discourse",
              skills: [],
            },
            {
              code: "ARC 576",
              name: "Building Automation and Hi-Tech Architecture",
              skills: [
                "Building automation",
                "Smart buildings",
                "Construction economics",
                "Safety & security systems",
              ],
            },
            {
              code: "ARC 577",
              name: "Building Systems Integration",
              skills: [
                "Building automation",
                "Smart buildings",
                "Construction economics",
                "Safety & security systems",
              ],
            },
            {
              code: "ARC 578",
              name: "Building Economics",
              skills: [
                "Building automation",
                "Smart buildings",
                "Construction economics",
                "Safety & security systems",
              ],
            },
            {
              code: "ARC 579",
              name: "Building Safety and Security",
              skills: [
                "Building automation",
                "Smart buildings",
                "Construction economics",
                "Safety & security systems",
              ],
            },
            {
              code: "ARC 596",
              name: "Thesis Documentation- Research and Development",
              skills: [
                "Research methodology in architecture",
                "Academic writing & documentation",
                "Seminar presentation skills",
                "Design thesis execution",
              ],
            },
            {
              code: "ARC 597",
              name: "Methods of Inquiry on Architecture, City and Environment",
              skills: [
                "Research methodology in architecture",
                "Academic writing & documentation",
                "Seminar presentation skills",
                "Design thesis execution",
              ],
            },
            {
              code: "ARC 598",
              name: "Seminar on Art, Architecture, Society and Culture",
              skills: [
                "Research methodology in architecture",
                "Academic writing & documentation",
                "Seminar presentation skills",
                "Design thesis execution",
              ],
            },
          ],
        },
        {
          name: "Department of Civil & Environmental Engineering",
          courses: [
            {
              code: "CEE 100",
              name: "Introduction to Civil & Environmental Engineering",
              skills: [],
            },
            {
              code: "CEE 110",
              name: "Computer-Aided Drawing (CAD) for Engineers",
              skills: [],
            },
            {
              code: "CEE 330",
              name: "Structural Analysis & Design I",
              skills: [
                "Structural analysis methods",
                "Beam and frame analysis",
                "Load calculation",
                "Structural design principles",
              ],
            },
            {
              code: "CEE 330L",
              name: "Structural Analysis & Design Lab",
              skills: [
                "Structural analysis software",
                "Experimental testing",
                "Data analysis",
                "Lab report writing",
              ],
            },
            {
              code: "CEE 331",
              name: "Structural Analysis & Design II",
              skills: [
                "Advanced structural analysis",
                "Matrix methods",
                "Indeterminate structures",
                "Computer analysis",
              ],
            },
            {
              code: "CEE 331L",
              name: "Structural Analysis & Design Lab (II)",
              skills: [
                "Advanced structural testing",
                "Computer modeling",
                "Design verification",
                "Technical documentation",
              ],
            },
            {
              code: "CEE 335",
              name: "Reinforced Concrete Design I",
              skills: [
                "Concrete properties",
                "Reinforcement design",
                "Beam design",
                "Slab design",
              ],
            },
            {
              code: "CEE 335L",
              name: "Reinforced Concrete Design Lab",
              skills: [
                "Concrete mixing and testing",
                "Reinforcement detailing",
                "Design calculations",
                "Construction practices",
              ],
            },
            {
              code: "CEE 430",
              name: "Reinforced Concrete Design II",
              skills: [
                "Advanced concrete design",
                "Column design",
                "Foundation design",
                "Seismic design",
              ],
            },
            {
              code: "CEE 240",
              name: "Intro to Soil Mechanics & Foundation Engineering",
              skills: [
                "Soil classification",
                "Soil testing",
                "Foundation design",
                "Bearing capacity analysis",
              ],
            },
            {
              code: "CEE 240L",
              name: "Soil Mechanics Lab",
              skills: [
                "Soil testing procedures",
                "Laboratory equipment use",
                "Data collection and analysis",
                "Soil report preparation",
              ],
            },
            {
              code: "CEE 340",
              name: "Advanced Foundation Engineering",
              skills: [
                "Deep foundation design",
                "Pile analysis",
                "Retaining structures",
                "Ground improvement",
              ],
            },
            {
              code: "CEE 250",
              name: "Intro to Transportation Engineering",
              skills: [
                "Traffic analysis",
                "Transportation planning",
                "Highway design",
                "Safety evaluation",
              ],
            },
            {
              code: "CEE 250L",
              name: "Transportation Engineering Lab",
              skills: [
                "Traffic data collection",
                "Surveying techniques",
                "Transportation software",
                "Lab report writing",
              ],
            },
            {
              code: "CEE 350",
              name: "Traffic Analysis & Design",
              skills: [
                "Traffic flow theory",
                "Capacity analysis",
                "Signal design",
                "Traffic simulation",
              ],
            },
            {
              code: "CEE 360",
              name: "Open‑Channel Hydraulics",
              skills: [
                "Open channel flow analysis",
                "Hydraulic design",
                "Flow measurement",
                "Energy principles",
              ],
            },
            {
              code: "CEE 360L",
              name: "Open‑Channel Hydraulics Lab",
              skills: [
                "Hydraulic experiments",
                "Flow measurement techniques",
                "Data analysis",
                "Lab report preparation",
              ],
            },
            {
              code: "CEE 460",
              name: "Groundwater Hydraulics",
              skills: [
                "Groundwater flow analysis",
                "Well hydraulics",
                "Aquifer testing",
                "Groundwater modeling",
              ],
            },
            {
              code: "CEE 370",
              name: "Water Supply & Treatment",
              skills: [
                "Water quality analysis",
                "Treatment processes",
                "Distribution systems",
                "Water treatment plant design",
              ],
            },
            {
              code: "CEE 370L",
              name: "Lab: Water Supply & Treatment",
              skills: [
                "Water quality testing",
                "Treatment process experiments",
                "Lab equipment operation",
                "Water analysis reporting",
              ],
            },
            {
              code: "CEE 373",
              name: "Sanitation & Wastewater Engineering",
              skills: [
                "Wastewater collection",
                "Treatment processes",
                "Sludge handling",
                "Wastewater treatment plant design",
              ],
            },
            {
              code: "CEE 373L",
              name: "Sanitation & Wastewater Engineering Lab",
              skills: [
                "Wastewater analysis",
                "Treatment process testing",
                "Lab procedures",
                "Environmental monitoring",
              ],
            },
            {
              code: "ENV 373",
              name: "Environmental Impact Assessment",
              skills: [
                "EIA procedures",
                "Environmental monitoring",
                "Impact analysis",
                "Mitigation strategies",
              ],
            },
            {
              code: "CEE 470",
              name: "Solid & Hazardous Waste Engineering",
              skills: [
                "Waste characterization",
                "Collection systems",
                "Treatment technologies",
                "Hazardous waste management",
              ],
            },
            {
              code: "CEE 499A",
              name: "Engineering Project I",
              skills: [
                "Project planning",
                "Design development",
                "Technical documentation",
                "Team collaboration",
              ],
            },
            {
              code: "CEE 499B",
              name: "Engineering Project II",
              skills: [
                "Project implementation",
                "Design optimization",
                "Quality control",
                "Project reporting",
              ],
            },
            {
              code: "CEE 499C",
              name: "Engineering Project III",
              skills: [
                "Project completion",
                "Performance evaluation",
                "Final documentation",
                "Presentation skills",
              ],
            },
            {
              code: "CEE 498",
              name: "Co‑op / Internship (mandatory, zero credit)",
              skills: [],
            },
            {
              code: "CEE 431",
              name: "Intro to Structural Dynamics",
              skills: [
                "Dynamic analysis",
                "Vibration analysis",
                "Response spectra",
                "Earthquake engineering",
              ],
            },
            {
              code: "CEE 432",
              name: "Composite Structures",
              skills: [
                "Composite materials",
                "Fiber-reinforced polymers",
                "Design principles",
                "Failure analysis",
              ],
            },
            {
              code: "CEE 433",
              name: "Finite Element Methods",
              skills: [
                "Finite element theory",
                "Modeling techniques",
                "Software applications",
                "Result interpretation",
              ],
            },
            {
              code: "CEE 434",
              name: "Advanced Reinforced Concrete Design",
              skills: [
                "Advanced concrete behavior",
                "Special design cases",
                "Code provisions",
                "Seismic design",
              ],
            },
            {
              code: "CEE 435",
              name: "Prestressed Concrete",
              skills: [
                "Prestressing methods",
                "Loss calculations",
                "Design of prestressed members",
                "Construction practices",
              ],
            },
            {
              code: "CEE 437",
              name: "Behavior & Design of Metal Structures",
              skills: [
                "Steel design principles",
                "Connection design",
                "Stability analysis",
                "Load combinations",
              ],
            },
            {
              code: "CEE 439",
              name: "Earthquake‑Resistant Design",
              skills: [
                "Seismic analysis",
                "Building codes",
                "Dynamic response",
                "Design for earthquake resistance",
              ],
            },
            {
              code: "CEE 441",
              name: "Advanced Geotechnical Engineering",
              skills: [
                "Advanced soil mechanics",
                "Foundation analysis",
                "Slope stability",
                "Geotechnical modeling",
              ],
            },
            {
              code: "CEE 442",
              name: "Earthen Dam & Slope Stability",
              skills: [
                "Dam design principles",
                "Slope analysis",
                "Stability assessment",
                "Risk evaluation",
              ],
            },
            {
              code: "CEE 443",
              name: "Earth Retaining Structures",
              skills: [
                "Retaining wall design",
                "Lateral earth pressure",
                "Stability analysis",
                "Construction methods",
              ],
            },
            {
              code: "CEE 444",
              name: "Advanced Soil Mechanics",
              skills: [
                "Advanced soil behavior",
                "Laboratory testing",
                "Numerical modeling",
                "Problem solving",
              ],
            },
            {
              code: "CEE 450",
              name: "Road & Traffic Safety Engineering",
              skills: [
                "Safety analysis",
                "Accident investigation",
                "Safety design",
                "Risk assessment",
              ],
            },
            {
              code: "CEE 452",
              name: "Pavement Analysis, Design & Construction",
              skills: [
                "Pavement materials",
                "Design methods",
                "Construction practices",
                "Performance evaluation",
              ],
            },
            {
              code: "CEE 454",
              name: "Advanced Traffic Engineering",
              skills: [
                "Traffic flow theory",
                "Intelligent transportation systems",
                "Traffic management",
                "Simulation modeling",
              ],
            },
            {
              code: "CEE 458",
              name: "Transportation Systems Engineering & Planning",
              skills: [
                "Transportation planning",
                "Systems analysis",
                "Network design",
                "Policy evaluation",
              ],
            },
            {
              code: "CEE 459",
              name: "Geometric Analysis & Design of Roads",
              skills: [
                "Road geometry",
                "Design standards",
                "Sight distance analysis",
                "Horizontal and vertical alignment",
              ],
            },
            {
              code: "CEE 463",
              name: "Integrated Water Resources Planning & Management",
              skills: [
                "Water resources planning",
                "Integrated management",
                "Policy development",
                "Sustainability assessment",
              ],
            },
            {
              code: "CEE 465",
              name: "River Engineering",
              skills: [
                "River hydraulics",
                "Sediment transport",
                "River training",
                "Flood control",
              ],
            },
            {
              code: "CEE 467",
              name: "Irrigation & Drainage Engineering",
              skills: [
                "Irrigation systems",
                "Drainage design",
                "Water management",
                "Agricultural water use",
              ],
            },
            {
              code: "CEE 473",
              name: "Coastal & Estuarine Analysis",
              skills: [
                "Coastal processes",
                "Wave mechanics",
                "Tidal analysis",
                "Coastal protection",
              ],
            },
            {
              code: "CEE 475",
              name: "Water Resources & Environmental Modeling",
              skills: [
                "Hydrological modeling",
                "Water quality modeling",
                "Software applications",
                "Model calibration",
              ],
            },
          ],
        },
        {
          name: "Department of Electrical & Computer Engineering",
          courses: [
            {
              code: "EEE 141 + CL",
              name: "Electrical Circuits I",
              skills: [
                "Basic circuit analysis",
                "Ohm's law",
                "Kirchhoff's laws",
                "Network theorems",
              ],
            },
            {
              code: "EEE 241 + CL",
              name: "Electrical Circuits II",
              skills: [
                "AC circuit analysis",
                "Phasor analysis",
                "Frequency response",
                "Three-phase circuits",
              ],
            },
            {
              code: "EEE 111 + CL",
              name: "Analog Electronics I",
              skills: [
                "Diode applications",
                "Transistor biasing",
                "Amplifier design",
                "Operational amplifiers",
              ],
            },
            {
              code: "EEE 211 + IL",
              name: "Digital Logic Design",
              skills: [
                "Boolean algebra",
                "Logic gate design",
                "Combinational circuits",
                "Sequential circuits",
              ],
            },
            {
              code: "EEE 311 + CL",
              name: "Analog Electronics II",
              skills: [
                "Advanced amplifier design",
                "Feedback amplifiers",
                "Oscillators",
                "Power amplifiers",
              ],
            },
            {
              code: "EEE 221",
              name: "Signals & Systems",
              skills: [
                "Signal classification",
                "Fourier analysis",
                "Laplace transforms",
                "System response",
              ],
            },
            {
              code: "EEE 361",
              name: "Electromagnetic Fields & Waves",
              skills: [
                "Electrostatics",
                "Magnetostatics",
                "Maxwell's equations",
                "Wave propagation",
              ],
            },
            {
              code: "EEE 342 + CL",
              name: "Control Engineering",
              skills: [
                "Control system modeling",
                "Transfer functions",
                "Stability analysis",
                "Controller design",
              ],
            },
            {
              code: "EEE 363 + CL",
              name: "Electrical Machines",
              skills: [
                "DC machines",
                "Transformers",
                "Induction motors",
                "Synchronous machines",
              ],
            },
            {
              code: "EEE 312",
              name: "Power Electronics",
              skills: [
                "Power semiconductor devices",
                "Rectifiers",
                "Inverters",
                "DC-DC converters",
              ],
            },
            {
              code: "EEE 362",
              name: "Power Systems",
              skills: [
                "Power generation",
                "Transmission lines",
                "Power distribution",
                "Load flow analysis",
              ],
            },
            {
              code: "EEE 321 + IL",
              name: "Introduction to Communication Systems",
              skills: [
                "Analog modulation",
                "Digital modulation",
                "Noise analysis",
                "Communication system design",
              ],
            },
            {
              code: "EEE 452",
              name: "Engineering Economics",
              skills: [
                "Cost analysis",
                "Investment evaluation",
                "Project planning",
                "Financial decision making",
              ],
            },
            {
              code: "EEE 299",
              name: "Junior Design Project (1 credit)",
              skills: [
                "Project planning",
                "Design implementation",
                "Technical documentation",
                "Team collaboration",
              ],
            },
            {
              code: "EEE 499A / 499B",
              name: "Senior Design I & II (1.5 credits each)",
              skills: [
                "Advanced project design",
                "System integration",
                "Prototype development",
                "Final presentation",
              ],
            },
            {
              code: "EEE 498 (or 498R)",
              name: "Co-Op / Internship / Directed Research (non-credit)",
              skills: [],
            },
            {
              code: "ENG 102",
              name: "English courses",
              skills: [
                "Academic writing basics",
                "Grammar & sentence structure",
                "Paragraph organization",
                "Clarity & coherence in writing",
              ],
            },
            {
              code: "ENG 103",
              name: "English courses",
              skills: [
                "Essay structure (intro, body, conclusion)",
                "Argument construction",
                "Revision & editing techniques",
                "Writing with evidence",
              ],
            },
            {
              code: "ENG 111",
              name: "English courses",
              skills: [
                "Speech organization",
                "Voice control & articulation",
                "Presentation skills",
                "Audience engagement",
              ],
            },
            { code: "ENG 115", name: "English courses", skills: [] },
            { code: "PHI 104", name: "Ethics", skills: [] },
            {
              code: "HIS 101 / 102",
              name: "Humanities & Social Sciences",
              skills: [],
            },
            {
              code: "SOC 101 / ANT 101 / ENV 203 / GEO 205",
              name: "Humanities & Social Sciences",
              skills: [],
            },
            {
              code: "POL 101 / 104",
              name: "Humanities & Social Sciences",
              skills: [],
            },
            {
              code: "ECO 101 / 104",
              name: "Humanities & Social Sciences",
              skills: [],
            },
            { code: "MAT 116", name: "Calculus & Linear Algebra", skills: [] },
            { code: "MAT 120", name: "Calculus & Linear Algebra", skills: [] },
            { code: "MAT 125", name: "Calculus & Linear Algebra", skills: [] },
            { code: "MAT 130", name: "Calculus & Linear Algebra", skills: [] },
            { code: "MAT 250", name: "Calculus & Linear Algebra", skills: [] },
            { code: "MAT 350", name: "Calculus & Linear Algebra", skills: [] },
            { code: "MAT 361", name: "Calculus & Linear Algebra", skills: [] },
            { code: "PHY 107+CL", name: "Science with Lab", skills: [] },
            { code: "PHY 108+CL", name: "Science with Lab", skills: [] },
            { code: "CHE 101+CL", name: "Science with Lab", skills: [] },
            { code: "BIO 103+CL", name: "Science with Lab", skills: [] },
            {
              code: "CSE 115 + CL",
              name: "Programming Language I",
              skills: [
                "Programming fundamentals",
                "Algorithm design",
                "Debugging techniques",
                "Code documentation",
              ],
            },
            {
              code: "ETE 131 + ETE131L",
              name: "Introduction to Telecommunication & Computer Engineering (lab)",
              skills: [
                "Basic electronics",
                "Circuit construction",
                "Measurement techniques",
                "Lab report writing",
              ],
            },
            {
              code: "ETE 132",
              name: "Computer Programming (with lab)",
              skills: [
                "Programming languages",
                "Data structures",
                "Software development",
                "Problem solving",
              ],
            },
            {
              code: "ETE 211",
              name: "Analog Electronics (with lab)",
              skills: [
                "Analog circuit design",
                "Amplifier analysis",
                "Filter design",
                "Oscillator circuits",
              ],
            },
            {
              code: "ETE 212",
              name: "Digital Logic Design (with lab)",
              skills: [
                "Digital circuit design",
                "Logic optimization",
                "FPGA programming",
                "Hardware description languages",
              ],
            },
            {
              code: "ETE 221",
              name: "Signals & Systems",
              skills: [
                "Signal processing",
                "System analysis",
                "Transform methods",
                "Filter design",
              ],
            },
            {
              code: "ETE 241",
              name: "Electrical Circuits I (with lab)",
              skills: [
                "Circuit analysis",
                "Measurement techniques",
                "Network theorems",
                "Experimental validation",
              ],
            },
            {
              code: "ETE 283",
              name: "Design Lab I",
              skills: [
                "Project design",
                "Prototype development",
                "Testing procedures",
                "Technical documentation",
              ],
            },
            {
              code: "ETE 311",
              name: "Digital Electronics & Pulse Techniques (lab)",
              skills: [
                "Digital circuit design",
                "Pulse circuit analysis",
                "Timing analysis",
                "Digital troubleshooting",
              ],
            },
            {
              code: "ETE 321",
              name: "Introduction to Communication Systems (lab)",
              skills: [
                "Communication system design",
                "Modulation techniques",
                "Signal analysis",
                "System testing",
              ],
            },
            {
              code: "ETE 331",
              name: "Data Communications & Computer Networks (lab)",
              skills: [
                "Network protocols",
                "Data transmission",
                "Network security",
                "Network troubleshooting",
              ],
            },
            {
              code: "ETE 332",
              name: "Microprocessors & Assembly Language (lab)",
              skills: [
                "Microprocessor architecture",
                "Assembly language programming",
                "Interface design",
                "Embedded systems",
              ],
            },
            {
              code: "ETE 341",
              name: "Electrical Circuits II (lab)",
              skills: [
                "AC circuit analysis",
                "Frequency response",
                "Power measurements",
                "Circuit simulation",
              ],
            },
            {
              code: "ETE 361",
              name: "Electromagnetic Field Theory",
              skills: [
                "Field theory",
                "Wave propagation",
                "Transmission lines",
                "Antenna theory",
              ],
            },
            {
              code: "ETE 383",
              name: "Design Lab II",
              skills: [
                "Advanced project design",
                "System integration",
                "Performance testing",
                "Design optimization",
              ],
            },
            {
              code: "ETE 411",
              name: "Semiconductor Devices & Technology",
              skills: [
                "Semiconductor physics",
                "Device operation",
                "Fabrication processes",
                "Device characterization",
              ],
            },
            {
              code: "ETE 412",
              name: "Introduction to VLSI (lab)",
              skills: [
                "VLSI design",
                "CMOS technology",
                "Layout design",
                "Simulation tools",
              ],
            },
            {
              code: "ETE 422",
              name: "Principles of Digital Communications",
              skills: [
                "Digital modulation",
                "Error correction",
                "Channel coding",
                "Receiver design",
              ],
            },
            {
              code: "ETE 423",
              name: "Telecom Networks",
              skills: [
                "Telecom protocols",
                "Network architecture",
                "Traffic analysis",
                "Network management",
              ],
            },
            {
              code: "ETE 424",
              name: "Mobile & Wireless Communications (lab)",
              skills: [
                "Wireless standards",
                "Mobile network design",
                "RF measurements",
                "Network optimization",
              ],
            },
            {
              code: "ETE 426",
              name: "Fiber Optic Communications (lab)",
              skills: [
                "Fiber optic principles",
                "Optical components",
                "Link design",
                "Performance testing",
              ],
            },
            {
              code: "ETE 471",
              name: "Digital Signal Processing (lab)",
              skills: [
                "DSP algorithms",
                "Filter design",
                "Spectral analysis",
                "Real-time processing",
              ],
            },
            {
              code: "ETE 481 / 482",
              name: "Advanced Comm Lab I & II",
              skills: [
                "Advanced communication systems",
                "System design",
                "Performance evaluation",
                "Research methodology",
              ],
            },
            {
              code: "ETE 498 / 499",
              name: "Senior Project/Internship (3 credits)",
              skills: [
                "Project management",
                "Research skills",
                "Technical presentation",
                "Professional development",
              ],
            },
            {
              code: "ETE 312",
              name: "Power Electronics",
              skills: [
                "Power converter design",
                "Switching devices",
                "Control techniques",
                "Power quality",
              ],
            },
            {
              code: "ETE 333",
              name: "Artificial Intelligence",
              skills: [
                "AI algorithms",
                "Machine learning",
                "Neural networks",
                "Expert systems",
              ],
            },
            {
              code: "ETE 334",
              name: "Internet & Web Technology",
              skills: [
                "Web development",
                "Internet protocols",
                "Database integration",
                "Web security",
              ],
            },
            {
              code: "ETE 406",
              name: "IP Telephony",
              skills: [
                "VoIP protocols",
                "Network design",
                "Quality of service",
                "System integration",
              ],
            },
            {
              code: "ETE 473",
              name: "Image Processing",
              skills: [
                "Image enhancement",
                "Pattern recognition",
                "Computer vision",
                "Image compression",
              ],
            },
            {
              code: "ETE 400",
              name: "Special Topics",
              skills: [],
            },
            {
              code: "CSE 115",
              name: "Computing Concepts + Lab",
              skills: [
                "Computing fundamentals",
                "Problem solving",
                "Algorithmic thinking",
                "Basic programming",
              ],
            },
            {
              code: "CSE 115L",
              name: "Computing Concepts + Lab",
              skills: [
                "Hands-on programming",
                "Debugging skills",
                "Software tools",
                "Lab practices",
              ],
            },
            {
              code: "CSE 135 + 135L",
              name: "Programming fundamentals",
              skills: [
                "Programming concepts",
                "Control structures",
                "Functions and procedures",
                "Data types",
              ],
            },
            {
              code: "CSE 173",
              name: "Discrete Math",
              skills: [
                "Mathematical logic",
                "Set theory",
                "Combinatorics",
                "Graph theory",
              ],
            },
            {
              code: "CSE 225 + IL",
              name: "Data Structures & Lab",
              skills: [
                "Data organization",
                "Algorithm complexity",
                "Tree structures",
                "Graph algorithms",
              ],
            },
            {
              code: "CSE 231 + IL",
              name: "Digital Logic",
              skills: [
                "Boolean algebra",
                "Combinational logic",
                "Sequential logic",
                "Digital design",
              ],
            },
            {
              code: "CSE 232",
              name: "Computer Organization & Design",
              skills: [
                "Computer architecture",
                "Processor design",
                "Memory hierarchy",
                "Input/output systems",
              ],
            },
            {
              code: "CSE 243 + 243L",
              name: "Electrical Circuits + Lab",
              skills: [
                "Circuit analysis",
                "Electronic components",
                "Measurement techniques",
                "Lab instrumentation",
              ],
            },
            {
              code: "CSE 253 + 253L",
              name: "Electronics I + Lab",
              skills: [
                "Basic electronics",
                "Diode circuits",
                "Transistor applications",
                "Amplifier design",
              ],
            },
            { code: "CSE  311", name: "CSE 311", skills: [] },
            { code: "CSE 323", name: "CSE 323", skills: [] },
            { code: "CSE 373", name: "CSE 373", skills: [] },
          ],
        },
        {
          name: "Department of Mathematics & Physics",
          courses: [
            {
              code: "Bus112",
              name: "Introduction to Business Mathematics",
              skills: [
                "Basic mathematical operations",
                "Percentage calculations",
                "Simple and compound interest",
                "Business applications",
              ],
            },
            {
              code: "MAT 116",
              name: "Pre-calculus",
              skills: [
                "Algebraic functions",
                "Trigonometric functions",
                "Exponential and logarithmic functions",
                "Graphing techniques",
              ],
            },
            {
              code: "MAT 120",
              name: "Calculus and Analytic Geometry- I",
              skills: [
                "Limits and continuity",
                "Differentiation techniques",
                "Applications of derivatives",
                "Graphing functions",
              ],
            },
            {
              code: "MAT 125",
              name: "Introduction to Linear Algebra",
              skills: [
                "Matrix operations",
                "Determinants",
                "Vector spaces",
                "Linear transformations",
              ],
            },
            {
              code: "MAT 130",
              name: "Calculus and Analytic Geometry II",
              skills: [
                "Integration techniques",
                "Applications of integration",
                "Sequences and series",
                "Parametric equations",
              ],
            },
            {
              code: "MAT240",
              name: "Calculus and Analytic Geometry III",
              skills: [
                "Multivariable calculus",
                "Partial derivatives",
                "Multiple integrals",
                "Vector calculus",
              ],
            },
            {
              code: "MAT250",
              name: "Calculus and Analytic Geometry IV",
              skills: [
                "Advanced integration techniques",
                "Differential equations",
                "Series solutions",
                "Special functions",
              ],
            },
            {
              code: "MAT350",
              name: "Engineering Mathematics",
              skills: [
                "Advanced calculus",
                "Differential equations",
                "Complex analysis",
                "Numerical methods",
              ],
            },
            {
              code: "MAT361",
              name: "Probability and Statistics",
              skills: [
                "Probability theory",
                "Statistical distributions",
                "Hypothesis testing",
                "Regression analysis",
              ],
            },
            {
              code: "MAT370",
              name: "Real Analysis",
              skills: [
                "Real number systems",
                "Sequences and series",
                "Continuity and differentiability",
                "Riemann integration",
              ],
            },
            {
              code: "MAT480",
              name: "Differential Equations",
              skills: [
                "First-order equations",
                "Second-order equations",
                "Systems of equations",
                "Laplace transforms",
              ],
            },
            {
              code: "MAT481",
              name: "Numerical Methods",
              skills: [
                "Numerical differentiation",
                "Numerical integration",
                "Root finding algorithms",
                "Numerical solutions of equations",
              ],
            },
            {
              code: "MAT482",
              name: "Complex Variables and Its Applications",
              skills: [
                "Complex numbers",
                "Analytic functions",
                "Complex integration",
                "Residue theorem",
              ],
            },
            {
              code: "MAT483",
              name: "Mathematical Control Theory and Applications",
              skills: [
                "Control systems",
                "State-space methods",
                "Stability analysis",
                "Optimal control",
              ],
            },
            {
              code: "MAT485",
              name: "Operations Research",
              skills: [
                "Linear programming",
                "Network analysis",
                "Queuing theory",
                "Decision analysis",
              ],
            },
            {
              code: "MAT490",
              name: "Advanced Engineering Mathematics",
              skills: [
                "Advanced differential equations",
                "Partial differential equations",
                "Fourier analysis",
                "Special functions",
              ],
            },
            {
              code: "MAT495",
              name: "Abstract Algebra",
              skills: [
                "Group theory",
                "Ring theory",
                "Field theory",
                "Galois theory",
              ],
            },
            {
              code: "PHY105",
              name: "Fundamentals of Physics",
              skills: [
                "Mechanics",
                "Thermodynamics",
                "Wave motion",
                "Basic laboratory techniques",
              ],
            },
            {
              code: "PHY105L",
              name: "Lab of Fundamentals of Physics",
              skills: [
                "Experimental techniques",
                "Data collection",
                "Error analysis",
                "Lab report writing",
              ],
            },
            {
              code: "PHY107",
              name: "General Physics I",
              skills: [
                "Classical mechanics",
                "Newton's laws",
                "Energy and momentum",
                "Rotational motion",
              ],
            },
            {
              code: "PHY107L",
              name: "Physics I Lab",
              skills: [
                "Mechanics experiments",
                "Measurement techniques",
                "Data analysis",
                "Scientific reporting",
              ],
            },
            {
              code: "PHY108",
              name: "General Physics II",
              skills: [
                "Electromagnetism",
                "Electric fields",
                "Magnetic fields",
                "Electromagnetic waves",
              ],
            },
            {
              code: "PHY108L",
              name: "General Physics II Lab",
              skills: [
                "Electricity experiments",
                "Magnetism experiments",
                "Circuit analysis",
                "Instrumentation",
              ],
            },
            {
              code: "PHY230",
              name: "Properties of Matter",
              skills: [
                "Elastic properties",
                "Thermal properties",
                "Mechanical properties",
                "Phase transitions",
              ],
            },
            {
              code: "PHY240",
              name: "Waves and Oscillations",
              skills: [
                "Simple harmonic motion",
                "Wave equations",
                "Interference and diffraction",
                "Standing waves",
              ],
            },
            {
              code: "PHY250",
              name: "Modern Physics I",
              skills: [
                "Special relativity",
                "Quantum mechanics basics",
                "Atomic structure",
                "Photoelectric effect",
              ],
            },
            {
              code: "PHY260",
              name: "Thermal Physics",
              skills: [
                "Kinetic theory",
                "Laws of thermodynamics",
                "Heat engines",
                "Statistical mechanics",
              ],
            },
            {
              code: "PHY335",
              name: "Electronic Circuits",
              skills: [
                "Diode circuits",
                "Transistor amplifiers",
                "Operational amplifiers",
                "Digital circuits",
              ],
            },
            {
              code: "PHY350",
              name: "Modern Physics II",
              skills: [
                "Nuclear physics",
                "Particle physics",
                "Quantum mechanics",
                "Solid state physics",
              ],
            },
            {
              code: "PHY360",
              name: "Computational Physics",
              skills: [
                "Numerical methods",
                "Simulation techniques",
                "Data analysis",
                "Programming for physics",
              ],
            },
            {
              code: "PHY370",
              name: "Biomedical Physics",
              skills: [
                "Medical imaging",
                "Radiation physics",
                "Biomechanics",
                "Medical instrumentation",
              ],
            },
            {
              code: "PHY380",
              name: "Nanotechnology",
              skills: [
                "Nanoscale physics",
                "Nanomaterials",
                "Nanofabrication",
                "Applications of nanotechnology",
              ],
            },
            {
              code: "BSC201",
              name: "Basic Science Support- Math and Physics",
              skills: [
                "Basic mathematics",
                "Fundamental physics",
                "Problem solving",
                "Scientific methods",
              ],
            },
            {
              code: "MAT140",
              name: "Introduction to Probability and Statistics for Engineers",
              skills: [
                "Probability distributions",
                "Statistical inference",
                "Hypothesis testing",
                "Regression analysis",
              ],
            },
            {
              code: "MAT230",
              name: "Linear and Vector Algebra for Engineers",
              skills: [
                "Matrix algebra",
                "Vector operations",
                "Eigenvalues and eigenvectors",
                "Linear transformations",
              ],
            },
            {
              code: "MAT260",
              name: "Differential Equations and Orthogonal Functions",
              skills: [
                "Ordinary differential equations",
                "Partial differential equations",
                "Orthogonal functions",
                "Boundary value problems",
              ],
            },
          ],
        },
        {
          name: "Department of Law",
          courses: [
            {
              code: "LAW 101",
              name: "Introduction to Legal System & Legal Processes (3 cr)",
              skills: [
                "Legal system overview",
                "Court structure",
                "Legal processes",
                "Sources of law",
              ],
            },
            {
              code: "LAW 201",
              name: "Constitutional Law of Bangladesh (4 cr)",
              skills: [
                "Constitutional principles",
                "Fundamental rights",
                "Government structure",
                "Judicial review",
              ],
            },
            {
              code: "LAW 107",
              name: "Law of Contract & Restitution (4 cr)",
              skills: [
                "Contract formation",
                "Contract terms",
                "Breach of contract",
                "Remedies for breach",
              ],
            },
            {
              code: "LAW 211",
              name: "Family & Property Law (4 cr)",
              skills: [
                "Marriage laws",
                "Divorce procedures",
                "Property rights",
                "Inheritance laws",
              ],
            },
            {
              code: "LAW 213",
              name: "Law of Crimes (4 cr)",
              skills: [
                "Criminal liability",
                "Types of crimes",
                "Defenses in criminal law",
                "Punishment and sentencing",
              ],
            },
            {
              code: "LAW 405",
              name: "Labour & Employment Law (3 cr)",
              skills: [
                "Employment contracts",
                "Workplace safety",
                "Labor disputes",
                "Collective bargaining",
              ],
            },
            {
              code: "LAW 417",
              name: "Banking & Foreign Exchange Law (3 cr)",
              skills: [
                "Banking regulations",
                "Foreign exchange controls",
                "Financial institutions law",
                "Monetary policy",
              ],
            },
            {
              code: "LAW 418",
              name: "Criminology & Penology (3 cr)",
              skills: [
                "Crime causation",
                "Criminal behavior",
                "Correctional systems",
                "Rehabilitation methods",
              ],
            },
            {
              code: "LAW 419",
              name: "International Criminal Law (3 cr)",
              skills: [
                "International crimes",
                "War crimes",
                "Genocide",
                "International tribunals",
              ],
            },
            {
              code: "LAW 420",
              name: "Medical Jurisprudence & Forensic Law (3 cr)",
              skills: [
                "Medical evidence",
                "Forensic science",
                "Expert testimony",
                "Medical malpractice",
              ],
            },
            {
              code: "LAW 418 (Alternate code)",
              name: "Legal Drafting (Civil & Criminal) & Conveyance (4 cr)",
              skills: [
                "Legal document drafting",
                "Contract preparation",
                "Conveyancing",
                "Legal writing",
              ],
            },
            {
              code: "LAW 419 (Alternate)",
              name: "Fiscal & Taxation Law (3 cr)",
              skills: [
                "Tax assessment",
                "Tax evasion",
                "Revenue collection",
                "Fiscal policy",
              ],
            },
            {
              code: "LAW 420 (Alternate)",
              name: "Clinical Legal Education & Community Legal Service (4 cr)",
              skills: [
                "Legal clinic practice",
                "Client counseling",
                "Community service",
                "Pro bono work",
              ],
            },
            {
              code: "LAW 421",
              name: "Public International Law (3 cr)",
              skills: [
                "International treaties",
                "State sovereignty",
                "Diplomatic law",
                "International organizations",
              ],
            },
            {
              code: "LAW 422",
              name: "Environmental Law & Policy of Bangladesh (3 cr)",
              skills: [
                "Environmental protection",
                "Pollution control",
                "Natural resources",
                "Sustainable development",
              ],
            },
            {
              code: "LAW 423",
              name: "Land Laws of Bangladesh (3 cr)",
              skills: [
                "Land ownership",
                "Land registration",
                "Tenancy laws",
                "Land disputes",
              ],
            },
            {
              code: "LAW 424",
              name: "Cyber, Media & Telecommunications Law (3 cr)",
              skills: [
                "Cybercrime",
                "Data protection",
                "Media regulation",
                "Telecommunications law",
              ],
            },
          ],
        },
        {
          name: "Department of History & Philosophy",
          courses: [
            {
              code: "HIS 101",
              name: "Bangladesh History & Culture",
              skills: [
                "Historical analysis",
                "Cultural studies",
                "Historical research",
                "Critical thinking",
              ],
            },
            {
              code: "PHI 101",
              name: "Introduction to Philosophy",
              skills: [
                "Philosophical reasoning",
                "Critical analysis",
                "Logical thinking",
                "Ethical reasoning",
              ],
            },
            {
              code: "PHI 104",
              name: "Introduction to Ethics",
              skills: [
                "Moral philosophy",
                "Ethical theories",
                "Applied ethics",
                "Moral reasoning",
              ],
            },
            {
              code: "PHI 270",
              name: "Philosophy of Science",
              skills: [
                "Scientific method",
                "Theory confirmation",
                "Scientific realism",
                "Philosophy of experimentation",
              ],
            },
            {
              code: "PHI 401",
              name: "Business Ethics",
              skills: [
                "Corporate responsibility",
                "Ethical decision making",
                "Professional ethics",
                "Stakeholder theory",
              ],
            },
            {
              code: "PSY 101",
              name: "Introduction to Psychology",
              skills: [
                "Psychological theories",
                "Research methods",
                "Behavioral analysis",
                "Critical thinking",
              ],
            },
            {
              code: "PSY 101L",
              name: "Introduction to Psychology Lab",
              skills: [
                "Experimental design",
                "Data collection",
                "Statistical analysis",
                "Lab report writing",
              ],
            },
            {
              code: "PSY 105",
              name: "Elements of Psychology",
              skills: [
                "Psychological concepts",
                "Human behavior",
                "Mental processes",
                "Psychological development",
              ],
            },
            {
              code: "PSY 205",
              name: "Introduction to World Religions",
              skills: [
                "Religious studies",
                "Comparative religion",
                "Cultural understanding",
                "Interfaith dialogue",
              ],
            },
          ],
        },
      ],
    },
  ],
};
