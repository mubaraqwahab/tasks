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
        // I need this table just to prevent duplicate task changes
        Schema::create("task_changes", function (Blueprint $table) {
            $table->uuid("id")->primary();
            // Just for debugging.
            $table->enum("type", ["create", "complete", "delete"]);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("task_changes");
    }
};
