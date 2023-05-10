<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_changes', function (Blueprint $table) {
            $table->uuid('id');
            $table->enum('type', ['create', 'complete', 'delete']);
            $table->foreignUuid('task_id')->constrained()->nullOnDelete();
            $table->json('args')->default('{}');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_changes');
    }
};
