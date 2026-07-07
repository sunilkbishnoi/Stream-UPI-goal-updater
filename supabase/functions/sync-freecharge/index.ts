import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FreechargeTransaction {
  transactionId: string
  name: string
  date: string
  status: string
  amount: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { transactions } = await req.json() as { transactions: FreechargeTransaction[] }

    if (!transactions || !Array.isArray(transactions)) {
      console.error('Invalid transactions data received')
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid transactions data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Received ${transactions.length} transactions to sync`)

    let insertedCount = 0
    let skippedCount = 0

    for (const tx of transactions) {
      const { error } = await supabase
        .from('freecharge_transactions')
        .upsert({
          transaction_id: tx.transactionId,
          name: tx.name,
          date: tx.date,
          status: tx.status,
          amount: tx.amount,
        }, { onConflict: 'transaction_id' })

      if (error) {
        console.error('Error inserting transaction:', error)
        skippedCount++
      } else {
        insertedCount++
      }
    }

    console.log(`Synced: ${insertedCount} inserted, ${skippedCount} skipped`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: insertedCount, 
        skipped: skippedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in sync-freecharge function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
