const fs = require('fs');
const path = require('path');

const enums = [
  'Role', 'UserStatus', 'VisitType', 'VisitStatus', 'Urgency', 'SpecimenType',
  'SampleCondition', 'SampleStatus', 'OrderStatus', 'TestCategory', 'ResultStatus',
  'ResultFlag', 'QCRule', 'ReferralStatus', 'DeliveryMethod', 'ReportStatus',
  'InvoiceStatus', 'PaymentMethod', 'NotificationType'
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/LENOVO/Desktop/LAB EMR/lab-emr/server/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const importRegex = /import\s+({[^}]+})\s+from\s+["']@prisma\/client["']/g;
  
  content = content.replace(importRegex, (match, p1) => {
    // p1 includes the braces
    const inner = p1.replace(/[{}]/g, '');
    const importedItems = inner.split(',').map(i => i.trim()).filter(i => i);
    
    const prismaImports = [];
    const sharedImports = [];
    
    importedItems.forEach(item => {
      const cleanItem = item.replace(/^type\s+/, '').trim();
      if (enums.includes(cleanItem)) {
        sharedImports.push(item);
      } else {
        prismaImports.push(item);
      }
    });

    let newImports = [];
    if (prismaImports.length > 0) {
      newImports.push(`import { ${prismaImports.join(', ')} } from "@prisma/client";`);
    }
    if (sharedImports.length > 0) {
      newImports.push(`import { ${sharedImports.join(', ')} } from "@lab-emr/shared/types";`);
    }

    if (newImports.length > 0) {
      changed = true;
      return newImports.join('\n');
    }
    return match;
  });

  // Also replace `allergies` logic in sampleGrouping or adminService if needed.
  // wait, the regex replacement covers enums.
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
