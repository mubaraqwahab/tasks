<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table("users", function (Blueprint $table) {
            // The google token is short lived, so there's little benefit in keeping it.
            // As for the refresh token, using it isn't as straightforward as I'd love,
            // so instead I'll just retrieve the info I'd ever need (namely, name and email)
            // on login/register.
            $table->dropColumn(["google_token", "google_refresh_token"]);

            // For now, we'll only support authenticating with Google,
            // so the email field is the google email, and there's no
            // need to add any new columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("users", function (Blueprint $table) {
            $table->string("google_token")->nullable();
            $table->string("google_refresh_token")->nullable();
        });
    }
};
