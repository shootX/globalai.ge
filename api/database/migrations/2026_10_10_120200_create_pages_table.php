<?php

use App\Models\Page;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->jsonb('content');
            $table->jsonb('seo_title')->nullable();
            $table->jsonb('seo_description')->nullable();
            $table->timestamps();
        });

        $now = now();

        foreach (Page::KEYS as $key) {
            DB::table('pages')->insert([
                'key' => $key,
                'content' => json_encode(['ka' => ['blocks' => []]], JSON_THROW_ON_ERROR),
                'seo_title' => json_encode(new stdClass, JSON_THROW_ON_ERROR),
                'seo_description' => json_encode(new stdClass, JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
