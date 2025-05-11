import { SupabaseClient } from '@supabase/supabase-js';

// Función para actualizar el registro de company_users cuando un usuario completa su registro
export const updateCompanyUserRecord = async (supabase: SupabaseClient, user: any) => {
  try {
    // Buscar el registro de company_users por email
    const { data: userRecord, error: fetchError } = await supabase
      .from('company_users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (fetchError) {
      console.error('Error al buscar registro de usuario:', fetchError);
      return;
    }

    if (userRecord) {
      // Actualizar el registro con el user_id y activar el usuario
      const { error: updateError } = await supabase
        .from('company_users')
        .update({
          user_id: user.id,
          is_active: true,
        })
        .eq('id', userRecord.id);

      if (updateError) {
        console.error('Error al actualizar registro de usuario:', updateError);
      } else {
        console.log('Registro de usuario actualizado exitosamente');
      }
    } else {
      console.log('No se encontró un registro de usuario para actualizar');
    }
  } catch (error) {
    console.error('Error en updateCompanyUserRecord:', error);
  }
};

// Función para manejar el cambio de estado de la sesión
export const handleAuthStateChange = async (supabase: SupabaseClient, event: string, session: any) => {
  if (event === 'SIGNED_IN' && session?.user) {
    await updateCompanyUserRecord(supabase, session.user);
  }
}; 