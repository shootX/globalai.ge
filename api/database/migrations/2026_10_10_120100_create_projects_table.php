<?php

use App\Database\SlugIndexes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->jsonb('slug');
            $table->jsonb('title');
            $table->jsonb('summary')->nullable();
            $table->jsonb('body')->nullable();
            $table->jsonb('category')->nullable();
            $table->string('cover_image')->nullable();
            $table->jsonb('gallery')->nullable();
            $table->jsonb('seo_title')->nullable();
            $table->jsonb('seo_description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->index(['is_published', 'sort_order']);
        });

        SlugIndexes::create('projects');
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
