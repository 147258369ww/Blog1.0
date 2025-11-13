const bcrypt = require('bcrypt');
const { User } = require('../src/models');

async function testPassword() {
  try {
    const user = await User.findOne({ where: { email: '2080676062@qq.com' } });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);
    console.log('Hash length:', user.password.length);
    
    const testPassword = '200509Wjm.';
    console.log('\nTesting password:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password valid:', isValid);
    
    // 测试不同的密码
    const passwords = ['200509Wjm.', '200509Wjm', '200509wjm.', 'admin123'];
    
    console.log('\nTesting different passwords:');
    for (const pwd of passwords) {
      const valid = await bcrypt.compare(pwd, user.password);
      console.log(`  "${pwd}": ${valid}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPassword();
