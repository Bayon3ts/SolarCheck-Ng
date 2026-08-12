'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function updateInstallerProfile(installerId: string, dataToSave: any) {
  try {
    const supabase = createAdminClient();

    // Separate workflow from the rest of the payload.
    // The `workflow` column requires a dedicated migration. We save it
    // in a separate upsert so that if the column doesn't exist yet the
    // rest of the profile (business_hours, states_covered, website, etc.)
    // still saves successfully.
    const { workflow, ...coreData } = dataToSave;

    // Save all fields except workflow first
    const { error: coreError } = await supabase
      .from('installers')
      .update(coreData)
      .eq('id', installerId);

    if (coreError) {
      return { success: false, error: coreError.message || JSON.stringify(coreError) };
    }

    // Try to save workflow separately — silently ignore if column doesn't exist yet
    if (workflow !== undefined) {
      const { error: workflowError } = await supabase
        .from('installers')
        .update({ workflow })
        .eq('id', installerId);

      if (workflowError) {
        // Column not yet in DB — log but don't block the save
        console.warn('workflow column not ready yet:', workflowError.message);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' };
  }
}
