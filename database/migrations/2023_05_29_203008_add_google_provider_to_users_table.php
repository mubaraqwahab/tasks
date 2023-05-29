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
            $table->string("google_refresh_token")->nullable();
            // TODO: add a constraint that password and google_token mustn't both be null.
            // Either may be null, and both may be nonnull though.
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
