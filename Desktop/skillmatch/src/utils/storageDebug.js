// Storage debugging utility
import { supabase } from '../lib/supabase';

export const debugStorage = {
  // List all buckets
  listBuckets: async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('Error listing buckets:', error);
        return { data: null, error };
      }
      console.log('Available storage buckets:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Error listing buckets:', err);
      return { data: null, error: err };
    }
  },

  // List files in a specific bucket
  listFiles: async (bucketName, folder = '') => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder);
      
      if (error) {
        console.error(`Error listing files in ${bucketName}:`, error);
        return { data: null, error };
      }
      console.log(`Files in ${bucketName}/${folder}:`, data);
      return { data, error: null };
    } catch (err) {
      console.error(`Error listing files in ${bucketName}:`, err);
      return { data: null, error: err };
    }
  },

  // Test file upload
  testUpload: async (file, bucketName, filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Test upload error:', error);
        return { data: null, error };
      }
      
      console.log('Test upload successful:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Test upload error:', err);
      return { data: null, error: err };
    }
  },

  // Get file URL
  getFileUrl: (bucketName, filePath) => {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log(`Public URL for ${bucketName}/${filePath}:`, data.publicUrl);
    return data.publicUrl;
  },

  // Check bucket policies
  checkBucketPolicies: async (bucketName) => {
    try {
      // This would require admin access, so we'll just log the attempt
      console.log(`Checking policies for bucket: ${bucketName}`);
      console.log('Note: Bucket policies can be checked in Supabase Dashboard > Storage');
      return { data: 'Check Supabase Dashboard for bucket policies', error: null };
    } catch (err) {
      console.error('Error checking bucket policies:', err);
      return { data: null, error: err };
    }
  }
};

// Debug function to run all checks
export const runStorageDebug = async () => {
  console.log('🔍 Running storage debug checks...');
  
  // List all buckets
  await debugStorage.listBuckets();
  
  // Check each expected bucket
  const expectedBuckets = ['user-resumes', 'user-portfolios', 'user-files', 'message-attachments', 'company-logos'];
  
  for (const bucket of expectedBuckets) {
    console.log(`\n📁 Checking bucket: ${bucket}`);
    await debugStorage.listFiles(bucket);
    await debugStorage.checkBucketPolicies(bucket);
  }
  
  console.log('\n✅ Storage debug complete!');
};
