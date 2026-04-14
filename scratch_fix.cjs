const fs = require('fs');

const files = [
  'src/pages/SignupPage.tsx',
  'src/pages/StudentDashboard.tsx',
  'src/pages/UploadHistoryPage.tsx',
  'src/pages/StudentGradesPage.tsx',
  'src/pages/LecturerDashboard.tsx',
  'src/pages/LecturerGradingPage.tsx',
  'src/pages/LecturerCoursesPage.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace auth.signOut() with signOut(auth)
  content = content.replace(/auth\.signOut\(\)/g, "signOut(auth)");
  
  // Ensure signOut is imported from firebase/auth
  if (!content.includes('signOut ') && !content.includes(', signOut')) {
    content = content.replace("import { onAuthStateChanged } from 'firebase/auth';", "import { onAuthStateChanged, signOut } from 'firebase/auth';");
    content = content.replace("import { createUserWithEmailAndPassword } from 'firebase/auth';", "import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';");
  }

  // Let's also enforce explicit navigation on the onClick buttons
  content = content.replace(/onClick=\{\(\) => signOut\(auth\)\}/g, "onClick={async () => { await signOut(auth); navigate('/login'); }}");

  fs.writeFileSync(file, content);
  console.log('Updated', file);
});
