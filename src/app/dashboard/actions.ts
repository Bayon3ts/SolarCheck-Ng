'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function updateInstallerProfile(installerId: string, dataToSave: any) {
  try {
    const supabase = createAdminClient();
    
    // Explicitly delete states_covered to prevent 400 errors, just in case
    if (dataToSave.states_covered) {
      delete dataToSave.states_covered;
    }

    const { error } = await supabase
      .from('installers')
      .update(dataToSave)
      .eq('id', installerId);

    if (error) {
      return { success: false, error: error.message || JSON.stringify(error) };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' };
  }
}
