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
            $table
                ->string("password")
                ->nullable()
                ->change();
            $table->string("google_token")->nullable();
            // TODO: do I really need this? Perhaps this doc would help decide:
            // https://developers.google.com/identity/protocols/oauth2/web-server
            $table->string("google_refresh_token")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("users", function (Blueprint $table) {
            $table->string("password")->change();
            $table->dropColumn(["google_token", "google_refresh_token"]);
        });
    }
};
