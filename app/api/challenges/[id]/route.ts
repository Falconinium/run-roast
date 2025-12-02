import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Check if user is the owner of the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: 'Défi introuvable' },
        { status: 404 }
      )
    }

    if (challenge.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à supprimer ce défi' },
        { status: 403 }
      )
    }

    // Delete the challenge (cascade will delete members automatically)
    const { error: deleteError } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du défi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
