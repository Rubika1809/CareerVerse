// Mock data store simulating backend database
const DB_KEYS = {
  USERS: 'cv_db_users',
  CERTIFICATES: 'cv_db_certs',
  INTERVIEWS: 'cv_db_interviews',
  APTITUDE_RESULTS: 'cv_db_aptitude',
  RESUME: 'cv_db_resume',
};

const getDB = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};

const setDB = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Seed default admin
const seedDefaults = () => {
  const users = getDB(DB_KEYS.USERS);
  if (!users.find(u => u.email === 'admin@careerverse.com')) {
    users.push({
      id: 1,
      name: 'Admin User',
      email: 'admin@careerverse.com',
      password: 'admin123',
      role: 'ADMIN',
      college: 'CareerVerse HQ',
      branch: 'Administration',
      year: '',
      cgpa: '',
      phone: '+91-9000000000',
      avatar: 'AU',
      joinedAt: new Date().toISOString(),
    });
  }
  if (!users.find(u => u.email === 'student@careerverse.com')) {
    users.push({
      id: 2,
      name: 'Rubika V',
      email: 'student@careerverse.com',
      password: 'student123',
      role: 'STUDENT',
      college: 'Rathinam Global University',
      branch: 'Computer Engineering',
      year: '4th Year',
      cgpa: '8.4',
      phone: '+91-9876543210',
      avatar: 'RV',
      placementProgress: 65,
      resumeScore: 78,
      joinedAt: new Date().toISOString(),
    });
  }
  setDB(DB_KEYS.USERS, users);
};
seedDefaults();

// Simulate network delay
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

const generateToken = (userId) => `mock_jwt_${userId}_${Date.now()}`;

// ── Auth Service ─────────────────────────────────────────────
export const authService = {
  async login(email, password) {
    await delay(600);
    const users = getDB(DB_KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token: generateToken(user.id) };
  },

  async register(data) {
    await delay(700);
    const users = getDB(DB_KEYS.USERS);
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    const newUser = {
      id: Date.now(),
      ...data,
      role: data.role || 'STUDENT',
      avatar: data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      placementProgress: 0,
      resumeScore: 0,
      joinedAt: new Date().toISOString(),
    };
    users.push(newUser);
    setDB(DB_KEYS.USERS, users);
    const { password: _, ...safeUser } = newUser;
    return { user: safeUser, token: generateToken(newUser.id) };
  },

  async forgotPassword(email) {
    await delay(500);
    const users = getDB(DB_KEYS.USERS);
    if (!users.find(u => u.email === email)) {
      throw new Error('No account found with this email');
    }
    return { message: 'Password reset link sent to your email' };
  },
};

// ── Dashboard Service ─────────────────────────────────────────
export const dashboardService = {
  async getStats(userId) {
    await delay(500);
    const interviews = getDB(DB_KEYS.INTERVIEWS).filter(i => i.userId === userId);
    const certs = getDB(DB_KEYS.CERTIFICATES).filter(c => c.userId === userId);
    const aptResults = getDB(DB_KEYS.APTITUDE_RESULTS).filter(a => a.userId === userId);
    const resume = getDB(DB_KEYS.RESUME).find(r => r.userId === userId);

    return {
      totalInterviews: interviews.length,
      avgInterviewScore: interviews.length
        ? Math.round(interviews.reduce((s, i) => s + i.score, 0) / interviews.length)
        : 0,
      totalCertificates: certs.length,
      aptitudeAttempts: aptResults.length,
      resumeScore: resume?.score || 0,
      latestResume: resume || null,
      placementProgress: Math.min(
        Math.round(
          (interviews.length * 15 + certs.length * 10 + aptResults.length * 10 + (resume ? 20 : 0)) / 100 * 100
        ), 100
      ),
      recentActivity: [
        ...interviews.slice(-3).map(i => ({
          id: `interview-${i.id}`,
          type: 'interview',
          title: `Mock Interview – ${i.company}`,
          desc: `Score: ${i.score}%`,
          time: i.createdAt,
          icon: '🎯',
        })),
        ...aptResults.slice(-3).map(a => ({
          id: `apt-${a.id}`,
          type: 'aptitude',
          title: `Aptitude: ${a.category}`,
          desc: `Score: ${a.score}/${a.total}`,
          time: a.createdAt,
          icon: '📊',
        })),
        ...certs.slice(-2).map(c => ({
          id: `cert-${c.id}`,
          type: 'certificate',
          title: `Certificate Added`,
          desc: c.name,
          time: c.uploadedAt,
          icon: '🏅',
        })),
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6),
    };
  },
};

// ── Certificate Service ───────────────────────────────────────
export const certificateService = {
  async getAll(userId) {
    await delay(400);
    return getDB(DB_KEYS.CERTIFICATES).filter(c => c.userId === userId);
  },

  async upload(userId, data) {
    await delay(600);
    const certs = getDB(DB_KEYS.CERTIFICATES);
    const newCert = {
      id: Date.now(),
      userId,
      ...data,
      uploadedAt: new Date().toISOString(),
    };
    certs.push(newCert);
    setDB(DB_KEYS.CERTIFICATES, certs);
    return newCert;
  },

  async delete(userId, certId) {
    await delay(400);
    const certs = getDB(DB_KEYS.CERTIFICATES).filter(
      c => !(c.id === certId && c.userId === userId)
    );
    setDB(DB_KEYS.CERTIFICATES, certs);
    return { success: true };
  },
};

// ── Resume Service ─────────────────────────────────────────────
export const resumeService = {
  async analyze(userId, text) {
    await delay(1500); // simulate AI processing
    
    // Heuristic Parsers
    const extractName = (txt) => {
      const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (let line of lines.slice(0, 15)) {
        const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
        if (cleanLine.split(/\s+/).length >= 2 && cleanLine.split(/\s+/).length <= 4) {
          if (
            !/email|phone|github|linkedin|resume|curriculum|cv|portfolio|address|contact/i.test(line) &&
            !line.includes('@') &&
            !line.includes('http') &&
            !line.includes(':') &&
            !/\d/.test(line)
          ) {
            return line;
          }
        }
      }
      const nameMatch = txt.match(/(?:name|full\s*name)\s*:\s*([A-Za-z\s]+)/i);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }
      return "Not Found";
    };

    const extractEmail = (txt) => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const match = txt.match(emailRegex);
      return match ? match[0] : "Not Found";
    };

    const extractPhone = (txt) => {
      const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{1,4}[-.\s]?\d{10}/;
      const match = txt.match(phoneRegex);
      return match ? match[0].trim() : "Not Found";
    };

    const extractSection = (txt, sectionName, stopWords = []) => {
      const lines = txt.split('\n').map(l => l.trim());
      let inSection = false;
      const sectionLines = [];
      const sectionRegex = new RegExp(`^\\s*(?:${sectionName})\\s*$`, 'i');
      
      for (let line of lines) {
        if (sectionRegex.test(line) || (line.toLowerCase().includes(sectionName.toLowerCase()) && line.length < 30 && !line.includes(':'))) {
          inSection = true;
          continue;
        }
        if (inSection) {
          const isStopWord = stopWords.some(sw => {
            const swRegex = new RegExp(`^\\s*(?:${sw})\\s*$`, 'i');
            return swRegex.test(line) || (line.toLowerCase().includes(sw.toLowerCase()) && line.length < 25 && !line.includes(':'));
          });
          if (isStopWord) {
            break;
          }
          if (line) {
            sectionLines.push(line);
          }
        }
      }
      return sectionLines.length > 0 ? sectionLines.join('\n') : "Not Found";
    };

    const extractEducation = (txt) => {
      const sec = extractSection(txt, 'education', ['skills', 'experience', 'projects', 'certifications', 'work', 'employment', 'summary', 'about', 'contact', 'links']);
      if (sec !== "Not Found") return sec;

      const eduKeywords = ['university', 'college', 'school', 'institute', 'bachelor', 'b.tech', 'm.tech', 'b.e', 'degree', 'secondary', 'hsc', 'ssc', 'cgpa', 'gpa'];
      const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const matchedLines = lines.filter(line => 
        eduKeywords.some(kw => line.toLowerCase().includes(kw))
      );
      return matchedLines.length > 0 ? matchedLines.slice(0, 5).join('\n') : "Not Found";
    };

    const extractProjects = (txt) => {
      const sec = extractSection(txt, 'projects', ['education', 'skills', 'experience', 'work', 'certifications', 'summary', 'about', 'contact', 'links']);
      if (sec !== "Not Found") return sec;

      const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const matchedLines = [];
      let recording = false;
      for (let line of lines) {
        if (/project/i.test(line) && line.length < 50) {
          recording = true;
        }
        if (recording) {
          if (/education|skills|experience|work|certifications/i.test(line) && line.length < 25) {
            break;
          }
          matchedLines.push(line);
        }
      }
      return matchedLines.length > 0 ? matchedLines.slice(0, 10).join('\n') : "Not Found";
    };

    const extractCertifications = (txt) => {
      const sec = extractSection(txt, 'certifications', ['education', 'skills', 'experience', 'projects', 'summary', 'about', 'contact', 'links']);
      if (sec !== "Not Found") return sec;
      
      const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const matchedLines = lines.filter(line => 
        /certif|certificate|certified|credential/i.test(line) && line.length < 100
      );
      return matchedLines.length > 0 ? matchedLines.slice(0, 6).join('\n') : "Not Found";
    };

    const extractExperience = (txt) => {
      const sec = extractSection(txt, 'experience', ['education', 'skills', 'projects', 'certifications', 'summary', 'about', 'contact', 'links']);
      if (sec !== "Not Found") return sec;

      const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const matchedLines = [];
      let recording = false;
      for (let line of lines) {
        if (/experience|intern|employment|job|work/i.test(line) && line.length < 50) {
          recording = true;
        }
        if (recording) {
          if (/education|skills|projects|certifications/i.test(line) && line.length < 25) {
            break;
          }
          matchedLines.push(line);
        }
      }
      return matchedLines.length > 0 ? matchedLines.slice(0, 10).join('\n') : "Not Found";
    };

    // Skills Matching Repository
    const allSkills = [
      'Java', 'Python', 'JavaScript', 'C++', 'C', 'React', 'Node.js', 'Spring Boot',
      'MySQL', 'MongoDB', 'PostgreSQL', 'HTML', 'CSS', 'Git', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'Linux', 'REST API', 'GraphQL', 'TypeScript', 'Angular', 'Vue.js',
      'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'Operating Systems', 'Networking',
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
      'SQL', 'NoSQL', 'Redis', 'Kafka', 'Microservices', 'CI/CD', 'Jenkins', 'Maven',
      'Hibernate', 'JPA', 'Spring MVC', 'Agile', 'Scrum', 'Communication', 'Teamwork',
      'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'Django', 'Flask',
      'Express.js', 'Next.js', 'Spring Security', 'Oracle', 'Elasticsearch'
    ];

    const lowerText = text.toLowerCase();
    const foundSkills = allSkills.filter(s => {
      const regex = new RegExp(`\\b${s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(lowerText);
    });

    const lowercaseFound = foundSkills.map(s => s.toLowerCase());

    // Extract basic fields
    const name = extractName(text);
    const email = extractEmail(text);
    const phone = extractPhone(text);
    const education = extractEducation(text);
    const projects = extractProjects(text);
    const certifications = extractCertifications(text);
    const experience = extractExperience(text);

    // Compute dynamic scores
    let baseScore = 20;
    if (name !== 'Not Found') baseScore += 10;
    if (email !== 'Not Found') baseScore += 5;
    if (phone !== 'Not Found') baseScore += 5;
    if (education !== 'Not Found') baseScore += 15;
    if (projects !== 'Not Found') baseScore += 15;
    if (experience !== 'Not Found') baseScore += 10;
    if (certifications !== 'Not Found') baseScore += 10;

    const skillsPoints = Math.min(15, foundSkills.length * 1.5);
    const score = Math.max(35, Math.min(98, Math.round(baseScore + skillsPoints)));
    const atsScore = Math.max(30, Math.min(99, Math.round(score + (foundSkills.length > 5 ? 3 : -3) + (experience !== 'Not Found' ? 2 : -4))));

    // Personalized Recommendations Engine
    const recs = [];
    if (lowercaseFound.includes('java') && !lowercaseFound.includes('spring boot')) {
      recs.push('Spring Boot');
      recs.push('REST APIs');
    }
    if (lowercaseFound.includes('javascript') || lowercaseFound.includes('html') || lowercaseFound.includes('css')) {
      if (!lowercaseFound.includes('react')) recs.push('React.js');
      if (!lowercaseFound.includes('git')) recs.push('Git');
    }
    if (lowercaseFound.includes('python')) {
      if (!lowercaseFound.includes('machine learning')) recs.push('Machine Learning');
      if (!lowercaseFound.includes('pandas')) recs.push('Pandas');
    }
    if (lowercaseFound.includes('sql') || lowercaseFound.includes('mysql')) {
      if (!lowercaseFound.includes('postgresql') && !lowercaseFound.includes('mongodb')) {
        recs.push('MongoDB');
      }
    }
    // Fallbacks
    if (recs.length === 0) {
      if (!lowercaseFound.includes('git')) recs.push('Git');
      if (!lowercaseFound.includes('docker')) recs.push('Docker');
      if (!lowercaseFound.includes('aws')) recs.push('AWS');
    }
    const recommendations = recs.filter(r => !lowercaseFound.includes(r.toLowerCase())).slice(0, 4);

    // Missing Skills / Keywords
    const importantCoreSkills = ['Java', 'Python', 'JavaScript', 'SQL', 'React', 'Spring Boot', 'Git', 'HTML', 'CSS'];
    const missingSkills = importantCoreSkills.filter(s => !lowercaseFound.includes(s.toLowerCase()));

    const coreKeywords = ['Git', 'REST APIs', 'Data Structures', 'Algorithms', 'Agile', 'Docker', 'DBMS', 'OOP'];
    const missingKeywords = coreKeywords.filter(k => !lowercaseFound.includes(k.toLowerCase()));

    // Strengths & Weaknesses
    const strengths = [];
    if (email !== "Not Found") strengths.push("Valid contact information (Email/Phone) is correctly structured.");
    if (education !== "Not Found") strengths.push("Academic background and education details are clearly defined.");
    if (projects !== "Not Found") strengths.push("Technical projects section is well-documented to showcase hands-on experience.");
    if (experience !== "Not Found") strengths.push("Professional experience/internship records are present.");
    if (foundSkills.length >= 8) strengths.push(`Strong skills portfolio with ${foundSkills.length} key competencies detected.`);
    if (certifications !== "Not Found") strengths.push("Professional credentials and certifications are highlighted.");
    if (strengths.length === 0) strengths.push("Basic resume layout is present.");

    const weaknesses = [];
    if (education === 'Not Found') weaknesses.push("Missing Education details.");
    if (projects === 'Not Found') weaknesses.push("No technical projects listed.");
    if (experience === 'Not Found') weaknesses.push("No work experience or internships mentioned.");
    if (certifications === 'Not Found') weaknesses.push("No professional certifications found.");
    if (foundSkills.length < 4) weaknesses.push("Thin skills list; missing core industry technologies.");
    if (weaknesses.length === 0) weaknesses.push("No major weaknesses detected.");

    // General suggestions
    const suggestions = [];
    if (education === "Not Found") suggestions.push("Add an 'Education' section detailing your degree, college name, and graduation year.");
    if (projects === "Not Found") suggestions.push("Add a 'Projects' section highlighting 2-3 key technical projects with technologies used.");
    if (experience === "Not Found") suggestions.push("Consider adding internships, freelance work, or open-source contributions to build your experience section.");
    if (certifications === "Not Found") suggestions.push("Include professional certificates (e.g. AWS, Oracle, Google Cloud) to validate your skills.");
    if (foundSkills.length < 5) suggestions.push("Expand your skills section with more programming languages, frameworks, databases, and developer tools.");
    if (suggestions.length === 0) suggestions.push("Your resume has great coverage! Try adding quantifiable metrics to your project achievements (e.g. 'reduced latency by 20%').");

    const result = {
      id: Date.now(),
      userId,
      name,
      email,
      phone,
      education,
      projects,
      certifications,
      experience,
      score,
      atsScore,
      foundSkills,
      missingSkills,
      missingKeywords,
      strengths,
      weaknesses,
      recommendations,
      suggestions,
      analyzedAt: new Date().toISOString(),
    };

    // Update in local DBs
    const resumes = getDB(DB_KEYS.RESUME).filter(r => r.userId !== userId);
    resumes.push(result);
    setDB(DB_KEYS.RESUME, resumes);

    // Update User's base profile fields & resume score
    const users = getDB(DB_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].resumeScore = score;
      if (name !== "Not Found") users[userIndex].name = name;
      if (email !== "Not Found") users[userIndex].email = email;
      if (phone !== "Not Found") users[userIndex].phone = phone;
      setDB(DB_KEYS.USERS, users);
    }

    return result;
  },

  async getLatest(userId) {
    await delay(300);
    const resumes = getDB(DB_KEYS.RESUME).filter(r => r.userId === userId);
    return resumes.length ? resumes[resumes.length - 1] : null;
  },
};

// ── Interview Service ──────────────────────────────────────────
export const interviewService = {
  async saveResult(userId, data) {
    await delay(500);
    const interviews = getDB(DB_KEYS.INTERVIEWS);
    const result = {
      id: Date.now(),
      userId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    interviews.push(result);
    setDB(DB_KEYS.INTERVIEWS, interviews);
    return result;
  },

  async getAll(userId) {
    await delay(400);
    return getDB(DB_KEYS.INTERVIEWS).filter(i => i.userId === userId);
  },
};

// ── Aptitude Service ───────────────────────────────────────────
export const aptitudeService = {
  async saveResult(userId, data) {
    await delay(400);
    const results = getDB(DB_KEYS.APTITUDE_RESULTS);
    const result = {
      id: Date.now(),
      userId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    results.push(result);
    setDB(DB_KEYS.APTITUDE_RESULTS, results);
    return result;
  },

  async getAll(userId) {
    await delay(400);
    return getDB(DB_KEYS.APTITUDE_RESULTS).filter(r => r.userId === userId);
  },
};

// ── Admin Service ──────────────────────────────────────────────
export const adminService = {
  async getAllStudents() {
    await delay(500);
    return getDB(DB_KEYS.USERS)
      .filter(u => u.role === 'STUDENT')
      .map(({ password: _, ...u }) => u);
  },

  async deleteStudent(id) {
    await delay(400);
    const users = getDB(DB_KEYS.USERS).filter(u => u.id !== id);
    setDB(DB_KEYS.USERS, users);
    return { success: true };
  },

  async getStats() {
    await delay(500);
    const users = getDB(DB_KEYS.USERS);
    const students = users.filter(u => u.role === 'STUDENT');
    const interviews = getDB(DB_KEYS.INTERVIEWS);
    const certs = getDB(DB_KEYS.CERTIFICATES);
    const aptResults = getDB(DB_KEYS.APTITUDE_RESULTS);
    return {
      totalStudents: students.length,
      totalInterviews: interviews.length,
      totalCertificates: certs.length,
      totalAptitudeAttempts: aptResults.length,
      avgInterviewScore: interviews.length
        ? Math.round(interviews.reduce((s, i) => s + i.score, 0) / interviews.length)
        : 0,
      recentStudents: students.slice(-5).reverse(),
    };
  },
};
