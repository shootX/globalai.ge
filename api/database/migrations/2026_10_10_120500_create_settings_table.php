<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->jsonb('value')->nullable();
            $table->timestamps();
        });

        $now = now();
        $rows = [
            'contact_email' => null,
            'contact_phone' => null,
            'contact_address' => ['ka' => null, 'en' => null, 'ru' => null],
            'socials' => [
                'instagram' => null,
                'facebook' => null,
                'linkedin' => null,
                'behance' => null,
            ],
            'logo' => '/brand/globalai-logo.png',
            'stats' => [],
            'projects_nav_visible' => false,
            'team_visible' => false,
            'stats_visible' => false,
        ];

        foreach ($rows as $key => $value) {
            DB::table('settings')->insert([
                'key' => $key,
                'value' => json_encode($value, JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
