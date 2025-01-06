// Fungsi untuk menormalkan string skill
const normalizeSkill = (skill: string): string => {
  return skill.trim()
    .replace(/\s+/g, ' ')  // Mengganti multiple spaces dengan single space
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Menghapus tanda baca
    .toLowerCase();
};

// Daftar skill mentah
const rawSkills = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift',
  'Kotlin', 'Scala', 'R', 'MATLAB', 'Dart', 'C++', 'C', 'Objective-C', 'Shell Script', 'Perl',
  'Haskell', 'Lua', 'Assembly', 'SQL', 'PL/SQL', 'Groovy', 'VB.NET', 'F#', 'COBOL', 'Fortran',
  
  // Frontend Development
  'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'HTML5', 'CSS3', 'Sass/SCSS', 'Tailwind CSS',
  'Material UI', 'Bootstrap', 'Responsive Design', 'Web Accessibility', 'Redux', 'Vuex', 'jQuery',
  'Webpack', 'Vite', 'Parcel', 'Gatsby', 'Nuxt.js', 'Ember.js', 'Web Components', 'PWA',
  'Semantic UI', 'Chakra UI', 'Ant Design', 'Styled Components', 'CSS Modules', 'Motion Design',
  'Three.js', 'WebGL', 'Canvas API', 'SVG Animation', 'CSS Animation', 'CSS Grid', 'Flexbox',
  'Web Performance', 'Cross-browser Compatibility', 'Mobile-First Design',
  
  // Backend Development
  'Node.js', 'Express.js', 'Django', 'Ruby on Rails', 'Spring Boot', 'Laravel', 'ASP.NET',
  'GraphQL', 'REST APIs', 'Microservices', 'FastAPI', 'Flask', 'NestJS', 'Strapi', 'Prisma',
  'TypeORM', 'Sequelize', 'Mongoose', 'Socket.IO', 'gRPC', 'Apache Kafka', 'RabbitMQ', 'Redis',
  'Elasticsearch', 'Nginx', 'Apache', 'WebSockets', 'OAuth', 'JWT', 'Passport.js',
  'API Security', 'Rate Limiting', 'Caching Strategies', 'Load Balancing', 'Service Discovery',
  'Message Queues', 'Event Sourcing', 'CQRS', 'Domain-Driven Design',
  
  // Database & Storage
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Firebase',
  'SQLite', 'Oracle', 'Microsoft SQL Server', 'Cassandra', 'DynamoDB', 'Neo4j',
  'MariaDB', 'CouchDB', 'Amazon S3', 'Google Cloud Storage', 'Azure Blob Storage',
  'Database Design', 'Data Modeling', 'Database Optimization', 'Database Migration',
  'Database Replication', 'Database Sharding', 'Database Backup', 'Database Security',
  
  // DevOps & Cloud
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Git',
  'GitHub Actions', 'GitLab CI', 'Terraform', 'Ansible', 'Puppet', 'Chef', 'Prometheus',
  'Grafana', 'ELK Stack', 'Datadog', 'New Relic', 'CloudFormation', 'Pulumi',
  'Vagrant', 'Helm', 'ArgoCD', 'Istio', 'Linux Administration', 'Shell Scripting',
  'Cloud Architecture', 'Serverless', 'Infrastructure as Code', 'Configuration Management',
  'Container Orchestration', 'Service Mesh', 'Cloud Security', 'Cost Optimization',
  
  // Mobile Development
  'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin',
  'Ionic', 'SwiftUI', 'Kotlin Multiplatform', 'Unity Mobile', 'PhoneGap', 'Cordova',
  'Mobile UI/UX', 'App Store Optimization', 'Mobile Analytics', 'Push Notifications',
  'Mobile Security', 'Mobile Testing', 'Mobile Performance', 'Mobile Accessibility',
  'Cross-platform Development', 'Native Development', 'Mobile Architecture',
  
  // UI/UX Design
  'Figma', 'Adobe XD', 'Sketch', 'User Research', 'Wireframing', 'Prototyping',
  'User Testing', 'Design Systems', 'Adobe Photoshop', 'Adobe Illustrator',
  'InVision', 'Principle', 'Zeplin', 'Abstract', 'Information Architecture',
  'Interaction Design', 'Visual Design', 'UX Writing', 'Usability Testing',
  'Design Thinking', 'User Journey Mapping', 'Persona Development', 'A/B Testing',
  'Accessibility Design', 'Color Theory', 'Typography', 'Brand Design',
  'Motion Design', 'Icon Design', 'Design Research', 'Design Strategy',
  
  // Project Management & Methodologies
  'Agile', 'Scrum', 'Kanban', 'Jira', 'Trello', 'Asana', 'Confluence',
  'Project Planning', 'Risk Management', 'Stakeholder Management', 'Team Leadership',
  'Technical Documentation', 'Process Optimization', 'Quality Assurance',
  'Sprint Planning', 'Backlog Management', 'Release Planning', 'Resource Management',
  'Budget Management', 'Time Management', 'Change Management', 'Conflict Resolution',
  'Team Building', 'Performance Management', 'Strategic Planning', 'OKR Management',
  'Project Estimation', 'Project Scheduling', 'Project Tracking', 'Project Reporting',
  
  // Data Science & Analytics
  'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision',
  'Data Analysis', 'Statistical Analysis', 'Data Visualization', 'Big Data',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter',
  'Power BI', 'Tableau', 'Data Mining', 'Predictive Analytics',
  'Data Warehousing', 'ETL', 'Data Modeling', 'Data Cleaning',
  'Feature Engineering', 'Model Deployment', 'Model Monitoring', 'A/B Testing',
  'Time Series Analysis', 'Regression Analysis', 'Classification', 'Clustering',
  
  // Security
  'Cybersecurity', 'Network Security', 'Information Security', 'Penetration Testing',
  'Security Auditing', 'Encryption', 'Authentication', 'Authorization',
  'Vulnerability Assessment', 'Security Compliance', 'Ethical Hacking',
  'Security Architecture', 'Security Operations', 'Incident Response',
  'Threat Modeling', 'Risk Assessment', 'Security Awareness', 'Security Tools',
  'Application Security', 'Cloud Security', 'Mobile Security', 'IoT Security',
  
  // Soft Skills & General
  'Communication', 'Problem Solving', 'Critical Thinking', 'Teamwork',
  'Time Management', 'Leadership', 'Adaptability', 'Creativity',
  'Attention to Detail', 'Analytical Skills', 'Presentation Skills',
  'Negotiation', 'Conflict Resolution', 'Decision Making', 'Emotional Intelligence',
  'Cultural Awareness', 'Remote Work', 'Self-motivation', 'Mentoring',
  'Public Speaking', 'Technical Writing', 'Research', 'Innovation',
  'Strategic Thinking', 'Business Acumen', 'Customer Service',
  
  // Business & Marketing
  'Digital Marketing', 'Content Marketing', 'SEO', 'Social Media Marketing',
  'Email Marketing', 'Marketing Analytics', 'Brand Management', 'Market Research',
  'Business Strategy', 'Business Analysis', 'Product Management', 'Product Strategy',
  'Growth Hacking', 'Conversion Optimization', 'Customer Experience',
  'Sales', 'Business Development', 'Account Management', 'Partnership Management',
  'Competitive Analysis', 'Market Analysis', 'Financial Analysis',
  
  // Industry Knowledge
  'E-commerce', 'Fintech', 'Healthcare', 'Education', 'Real Estate',
  'Manufacturing', 'Retail', 'Logistics', 'Telecommunications',
  'Media & Entertainment', 'Gaming', 'Travel & Hospitality',
  'Energy & Utilities', 'Agriculture', 'Construction',
  'Automotive', 'Aerospace', 'Pharmaceuticals', 'Biotechnology',
  
  // Emerging Technologies
  'Artificial Intelligence', 'Blockchain', 'Internet of Things',
  'Augmented Reality', 'Virtual Reality', 'Mixed Reality',
  'Quantum Computing', 'Edge Computing', '5G',
  'Robotics', 'Drones', '3D Printing', 'Nanotechnology',
  'Smart Cities', 'Digital Twins', 'Sustainable Technology',
  
  // Languages & Communication
  'Technical Writing', 'Business Writing', 'Content Creation',
  'Documentation', 'Translation', 'Localization',
  'Cross-cultural Communication', 'International Business',
  'Public Relations', 'Crisis Communication',
  
  // Quality & Testing
  'Quality Assurance', 'Quality Control', 'Test Automation',
  'Manual Testing', 'Performance Testing', 'Security Testing',
  'Unit Testing', 'Integration Testing', 'End-to-End Testing',
  'Test Planning', 'Test Strategy', 'Bug Tracking',
  'Test Documentation', 'Test Management', 'Continuous Testing'
];

// Menghilangkan duplikasi dengan menggunakan Map untuk menyimpan versi normal sebagai key
const skillMap = new Map<string, string>();
rawSkills.forEach(skill => {
  const normalizedSkill = normalizeSkill(skill);
  // Simpan versi asli jika belum ada, atau jika versi asli lebih pendek
  if (!skillMap.has(normalizedSkill) || skill.length < skillMap.get(normalizedSkill)!.length) {
    skillMap.set(normalizedSkill, skill);
  }
});

// Export daftar skill yang sudah dibersihkan dan diurutkan
export const SKILLS = Array.from(skillMap.values()).sort((a, b) => 
  a.toLowerCase().localeCompare(b.toLowerCase())
);