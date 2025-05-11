import { supabase } from '@/api/supabaseClient';

export type CompanyUser = {
  id: string;
  company_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  sap_employee_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const inviteUser = async (
  companyId: string,
  userData: {
    email: string;
    first_name: string;
    last_name: string;
    sap_employee_code?: string;
  }
) => {
  try {
    // First, send a magic link to the user's email
    const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
      email: userData.email,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          sap_employee_code: userData.sap_employee_code,
        }
      }
    });
    
    if (authError) throw authError;

    // Create a temporary user record that will be activated when they click the magic link
    const { data: userRecord, error: userError } = await supabase
      .from('company_users')
      .insert({
        company_id: companyId,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        sap_employee_code: userData.sap_employee_code,
        is_active: false, // Will be activated when they complete signup
      })
      .select()
      .single();

    if (userError) throw userError;

    return userRecord;
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

export const getCompanyUsers = async (companyId: string) => {
  try {
    const { data: users, error } = await supabase
      .from('company_users')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return users as CompanyUser[];
  } catch (error) {
    console.error('Error fetching company users:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const { error } = await supabase
      .from('company_users')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}; 