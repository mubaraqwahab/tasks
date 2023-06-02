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
            $table->dropColumn(["google_token", "google_refresh_token"]);
            $table
                ->string("google_email")
                ->nullable()
                ->unique();

            // TODO: add a constraint that password and google_email mustn't both be null.
            // Either may be null alone, and both may be nonnull together though.
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
            $table->dropColumn("google_email");
        });
    }
};
