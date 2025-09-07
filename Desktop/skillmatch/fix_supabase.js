#!/usr/bin/env node

/**
 * SkillMatch Supabase Connection Test Script
 * 
 * This script helps verify that your Supabase connection is working properly
 * and provides guidance on fixing common issues.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔧 SkillMatch Supabase Connection Test\n');

// Check environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  console.log('\nPlease add these to your .env file:');
  console.log('VITE_SUPABASE_URL=your_supabase_project_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`📡 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation "user_profiles" does not exist')) {
        console.log('\n💡 The user_profiles table doesn\'t exist. Please run the database_fixes.sql script in your Supabase SQL Editor.');
      } else if (error.message.includes('JWT')) {
        console.log('\n💡 Authentication issue. Check your Supabase credentials.');
      }
      
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
    
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n📋 Checking database tables...');
  
  const tables = ['user_profiles', 'applications', 'saved_jobs', 'jobs', 'companies'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        results[table] = { exists: false, error: error.message };
      } else {
        results[table] = { exists: true, count: data?.length || 0 };
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }
  
  // Display results
  for (const [table, result] of Object.entries(results)) {
    if (result.exists) {
      console.log(`✅ ${table} - exists`);
    } else {
      console.log(`❌ ${table} - missing (${result.error})`);
    }
  }
  
  return Object.values(results).every(r => r.exists);
}

async function checkColumns() {
  console.log('\n🔍 Checking user_profiles columns...');
  
  const requiredColumns = [
    'id', 'full_name', 'email', 'role', 'certifications', 
    'education', 'work_experience', 'skills', 'languages'
  ];
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Cannot check columns:', error.message);
      return false;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      
      for (const requiredCol of requiredColumns) {
        if (columns.includes(requiredCol)) {
          console.log(`✅ ${requiredCol}`);
        } else {
          console.log(`❌ ${requiredCol} - missing`);
        }
      }
      
      return requiredColumns.every(col => columns.includes(col));
    } else {
      console.log('ℹ️  No data in user_profiles table');
      return true;
    }
    
  } catch (err) {
    console.error('❌ Error checking columns:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting SkillMatch Supabase verification...\n');
  
  // Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n💡 Please fix the connection issues and run this script again.');
    process.exit(1);
  }
  
  // Check tables
  const tablesOk = await checkTables();
  
  // Check columns
  const columnsOk = await checkColumns();
  
  console.log('\n📊 Summary:');
  console.log(`Connection: ${connectionOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`Tables: ${tablesOk ? '✅ OK' : '❌ Missing'}`);
  console.log(`Columns: ${columnsOk ? '✅ OK' : '❌ Missing'}`);
  
  if (connectionOk && tablesOk && columnsOk) {
    console.log('\n🎉 Everything looks good! Your Supabase setup is ready.');
    console.log('You can now run your SkillMatch application.');
  } else {
    console.log('\n🔧 Please run the database_fixes.sql script in your Supabase SQL Editor to fix the issues.');
    console.log('Then run this script again to verify the fixes.');
  }
}

// Run the script
main().catch(err => {
  console.error('❌ Script failed:', err.message);
  process.exit(1);
});
