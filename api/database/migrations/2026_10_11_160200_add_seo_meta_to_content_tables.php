<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['pages', 'services', 'projects'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('og_image')->nullable();
                $table->boolean('noindex')->default(false);
            });
        }
    }

    public function down(): void
    {
        foreach (['pages', 'services', 'projects'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['og_image', 'noindex']);
            });
        }
    }
};
