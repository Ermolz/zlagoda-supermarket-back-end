import bcrypt from 'bcrypt';

async function generateHashes() {
  const password = 'password123'; // тестовий пароль для всіх користувачів
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Generated hash for password "password123":');
  console.log(hashedPassword);
  
  // SQL для оновлення паролів
  console.log('\nSQL to update passwords:');
  console.log(`
UPDATE employee_auth SET password = '${hashedPassword}' WHERE id_employee IN ('E001', 'E002', 'E003', 'E004', 'E005');
  `);
}

generateHashes().catch(console.error); 