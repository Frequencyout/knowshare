<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('body_markdown');
            $table->longText('body_html')->nullable();
            $table->string('slug')->unique();
            $table->integer('score')->default(0)->index();
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('accepted_answer_id')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};


