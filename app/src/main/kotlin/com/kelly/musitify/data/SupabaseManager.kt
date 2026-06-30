package com.kelly.musitify.data

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.GoTrue
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage

object SupabaseManager {
    const val SUPABASE_URL = "https://oovlijlvshbvanbehvqg.supabase.co"
    const val SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdmxpamx2c2hidmFuYmVodnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk3NzA3NCwiZXhwIjoyMDk2NTUzMDc0fQ.G7NmwzC_99GiUNwQ9-U5OvCyQuNwCrm4zfAfyvAWXiQ"

    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_KEY
    ) {
        install(GoTrue)
        install(Postgrest)
        install(Storage)
    }
}
