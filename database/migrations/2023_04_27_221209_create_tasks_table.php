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
        Schema::create("tasks", function (Blueprint $table) {
            $table->uuid("id");
            $table
                ->foreignId("user_id")
                ->constrained()
                ->cascadeOnDelete();
            $table->string("name");
            $table->timestamps();
            $table->timestamp("edited_at")->nullable();
            $table->timestamp("completed_at")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("tasks");
    }
};
