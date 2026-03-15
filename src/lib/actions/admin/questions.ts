'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteQuestions(ids: string[]) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('questions')
    .delete()
    .in('question_id', ids);

  if (!error) {
    revalidatePath('/admin/questions');
  }
  
  return { error };
}

export async function createQuestion(data: any) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('questions')
    .insert([data]);

  if (!error) {
    revalidatePath('/admin/questions');
  }
  
  return { error };
}
