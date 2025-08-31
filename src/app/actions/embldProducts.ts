'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function likeProduct(productId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log('likeProduct called with productId:', productId, 'user:', user?.id);

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Check if already liked
  const { data: existingLike, error: checkError } = await supabase
    .from('product_likes')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle();

  console.log('Existing like check:', { existingLike, checkError });

  if (existingLike) {
    // Unlike - Use transaction for atomicity
    console.log('Attempting to unlike...');
    
    const { error: deleteError } = await supabase
      .from('product_likes')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.log('Unlike error:', deleteError);
      return { success: false, error: deleteError.message };
    }

    // Decrement like count
    const { error: rpcError } = await supabase.rpc('decrement_product_like_count', { product_id: productId });
    
    if (rpcError) {
      console.log('RPC decrement error:', rpcError);
      // Rollback by re-inserting the like
      await supabase
        .from('product_likes')
        .insert({ product_id: productId, user_id: user.id });
      return { success: false, error: 'Failed to update like count' };
    }

    revalidatePath(`/embld-products/${productId}`);
    revalidatePath('/embld-products');
    return { success: true, liked: false };
  } else {
    // Like - Use transaction for atomicity
    console.log('Attempting to like...');
    
    const { error: insertError } = await supabase
      .from('product_likes')
      .insert({ product_id: productId, user_id: user.id });

    if (insertError) {
      console.log('Like insert error:', insertError);
      return { success: false, error: insertError.message };
    }

    // Increment like count
    const { error: rpcError } = await supabase.rpc('increment_product_like_count', { product_id: productId });
    
    if (rpcError) {
      console.log('RPC increment error:', rpcError);
      // Rollback by deleting the like
      await supabase
        .from('product_likes')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);
      return { success: false, error: 'Failed to update like count' };
    }

    revalidatePath(`/embld-products/${productId}`);
    revalidatePath('/embld-products');
    return { success: true, liked: true };
  }
}

export async function addComment(productId: string, content: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!content.trim()) {
    return { success: false, error: 'Comment content is required' };
  }

  const { data, error } = await supabase
    .from('product_comments')
    .insert({
      product_id: productId,
      user_id: user.id,
      content: content.trim()
    })
    .select(`
      id,
      content,
      created_at,
      user_id
    `)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/embld-products/${productId}`);
  return { success: true, data };
}

export async function deleteComment(commentId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('product_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/embld-products');
  return { success: true };
}

export async function getComments(productId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('product_comments')
    .select(`
      id,
      content,
      created_at,
      updated_at,
      user_id
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function checkUserLike(productId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: true, liked: false };
  }

  const { data } = await supabase
    .from('product_likes')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle();

  return { success: true, liked: !!data };
}

