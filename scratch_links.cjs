const fs = require('fs');

const files = [
  'src/pages/StudentDashboard.tsx',
  'src/pages/UploadHistoryPage.tsx',
  'src/pages/StudentGradesPage.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/label: 'My Courses', active: false, path: '#'/g, "label: 'My Courses', active: false, path: '/student-courses'");
  content = content.replace(/label: 'Profile', active: false, path: '#'/g, "label: 'Profile', active: false, path: '/student-profile'");
  fs.writeFileSync(file, content);
  console.log('Fixed links in', file);
});
