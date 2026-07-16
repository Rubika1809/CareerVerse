import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const WORKSPACE_DIR = "c:\\Users\\DELL USER\\Desktop\\CareerVerse";
const FRONTEND_DIR = path.join(WORKSPACE_DIR, "frontend");
const SCREENSHOTS_DIR = path.join(WORKSPACE_DIR, "screenshots");

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("Starting Vite dev server...");
  const viteProcess = spawn('cmd.exe', ['/c', 'npm run dev'], {
    cwd: FRONTEND_DIR,
    shell: true
  });

  viteProcess.stdout.on('data', (data) => {
    console.log(`[Vite Out]: ${data.toString().trim()}`);
  });

  viteProcess.stderr.on('data', (data) => {
    console.error(`[Vite Err]: ${data.toString().trim()}`);
  });

  // Wait 8 seconds for Vite to start up and bind to port 3000
  console.log("Waiting for Vite dev server to be ready...");
  await sleep(8000);

  console.log("Launching headless Google Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to http://localhost:3000/login...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    console.log("Clearing localStorage and seeding fresh data...");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle2' });

    // Login as Student
    console.log("Logging in as Student (student@careerverse.com)...");
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'student@careerverse.com');
    await page.type('input[type="password"]', 'student123');
    await page.click('button[type="submit"]');

    console.log("Waiting for dashboard redirect...");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.welcome-card');

    // Seed mock resume data and mock interview data in localStorage for Student
    console.log("Seeding student's resume and placement stats...");
    await page.evaluate(() => {
      // 1. Seed Resume
      const resumeData = {
        id: Date.now(),
        userId: 2,
        name: 'Rubika V',
        email: 'rubika.v@careerverse.com',
        phone: '+91-9876543210',
        education: 'B.E. in Computer Engineering\nVJTI Mumbai (CGPA: 8.4)',
        projects: 'CareerVerse placement preparation platform\nAI Resume Analyzer, Mock Interview Simulator',
        certifications: 'AWS Cloud Practitioner\nNPTEL Technical Writing',
        experience: 'Software Engineer Intern\nExample Tech Solutions (3 months)',
        score: 85,
        atsScore: 82,
        foundSkills: ['Java', 'JavaScript', 'React', 'SQL', 'HTML', 'CSS', 'Git'],
        missingSkills: ['Docker', 'AWS'],
        missingKeywords: ['Docker', 'Agile', 'CI/CD'],
        strengths: ['Valid contact info (Email/Phone)', 'Academic background is clearly defined', 'Technical projects section is well-documented'],
        weaknesses: ['Thin experience section', 'Missing Docker or CI/CD knowledge'],
        recommendations: ['Docker', 'AWS', 'CI/CD'],
        suggestions: ['Quantify achievements with metrics (e.g. performance improvements)', 'Include GitHub links'],
        analyzedAt: new Date().toISOString(),
      };
      localStorage.setItem('cv_db_resume', JSON.stringify([resumeData]));

      // 2. Seed Mock Interviews
      const interviewData = [
        {
          id: 101,
          userId: 2,
          company: 'TCS',
          role: 'System Engineer',
          score: 80,
          totalQuestions: 5,
          strengths: ['Good time management', 'Technical answers are well-formed'],
          improvements: ['Elaborate more on design patterns'],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 102,
          userId: 2,
          company: 'Infosys',
          role: 'Systems Associate',
          score: 84,
          totalQuestions: 5,
          strengths: ['Clear OOP concepts', 'Correct code explanation'],
          improvements: ['Include complexity analysis'],
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('cv_db_interviews', JSON.stringify(interviewData));

      // 3. Seed Aptitude Quiz Results
      const aptData = [
        {
          id: 201,
          userId: 2,
          category: 'Quantitative',
          score: 8,
          total: 10,
          correct: 8,
          incorrect: 2,
          unattempted: 0,
          timeTaken: 1200,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('cv_db_aptitude', JSON.stringify(aptData));

      // 4. Update Student stats
      const users = JSON.parse(localStorage.getItem('cv_db_users') || '[]');
      const studentIdx = users.findIndex(u => u.id === 2);
      if (studentIdx !== -1) {
        users[studentIdx].name = 'Rubika V';
        users[studentIdx].avatar = 'RV';
        users[studentIdx].resumeScore = 85;
        users[studentIdx].placementProgress = 78;
        localStorage.setItem('cv_db_users', JSON.stringify(users));
      }
    });

    // Reload page to reflect seeded stats on the dashboard
    console.log("Reloading Student Dashboard...");
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.welcome-card');
    await sleep(2000); // Wait for transition animations

    // Capture Student Dashboard
    console.log("Capturing Student Dashboard screenshot...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'student_dashboard.png') });

    // Navigate to Resume Analyzer
    console.log("Navigating to Resume Analyzer (/resume)...");
    await page.goto('http://localhost:3000/resume', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.resume-layout');
    await sleep(2000); // Wait for animations

    // Capture Resume Analyzer
    console.log("Capturing Resume Analyzer screenshot...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'resume_analyzer.png') });

    // Navigate to Mock Interview Configuration
    console.log("Navigating to Mock Interview (/interview)...");
    await page.goto('http://localhost:3000/interview', { waitUntil: 'networkidle2' });
    await page.waitForSelector('select');
    
    // Select TCS and start interview
    console.log("Starting a simulated mock interview...");
    await page.select('select', 'TCS');
    
    // Wait for the second select element (role dropdown) to appear in the DOM
    await page.waitForFunction(() => document.querySelectorAll('select').length > 1);
    
    console.log("Selecting role 'Software Engineer'...");
    await page.evaluate(() => {
      const roleSel = document.querySelectorAll('select')[1];
      if (roleSel) {
        roleSel.value = 'Software Engineer';
        roleSel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    await sleep(1000);
    await page.click('.btn-primary'); // Click Start Mock Interview
    await page.waitForSelector('.interview-header');
    await page.type('textarea', 'Virtual DOM is a lightweight virtual representation of the real DOM. React creates an in-memory cache of components, computes the differences (diffing algorithm), and then updates the browser\'s displayed DOM efficiently.');
    await sleep(2000);

    // Capture Mock Interview
    console.log("Capturing Mock Interview screenshot...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mock_interview.png') });

    // Log out and log in as Admin to capture Admin Dashboard
    console.log("Navigating to login to capture Admin view...");
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    console.log("Logging in as Admin (admin@careerverse.com)...");
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@careerverse.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    console.log("Waiting for Admin dashboard redirect...");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    await sleep(2500); // Wait for animations and charts

    // Capture Admin Dashboard
    console.log("Capturing Admin Dashboard screenshot...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_dashboard.png') });

    console.log("Screenshots captured successfully!");

  } catch (err) {
    console.error("Error during screenshot capture:", err);
  } finally {
    console.log("Closing browser...");
    await browser.close();

    console.log("Stopping Vite dev server...");
    viteProcess.kill('SIGINT');
    process.exit(0);
  }
}

main();
