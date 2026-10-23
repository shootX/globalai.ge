<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Creates the two live ventures as unpublished drafts, so an admin only has to check the copy
 * and switch them on. Run once: `php artisan db:seed --class=VenturesSeeder`. Existing slugs are skipped.
 */
class VenturesSeeder extends Seeder
{
    public function run(): void
    {
        $ventures = [
            [
                'slug' => ['ka' => 'autolime', 'en' => 'autolime', 'ru' => 'autolime'],
                'title' => ['ka' => 'autolime.ge', 'en' => 'autolime.ge', 'ru' => 'autolime.ge'],
                'summary' => [
                    'ka' => 'ავტომობილის სერვისები ონლაინ: სერვისცენტრი, ფასი და ჯავშანი ერთ ადგილას.',
                    'en' => 'Car services online: the service centre, the price and the booking in one place.',
                    'ru' => 'Автосервисы онлайн: сервисный центр, цена и запись в одном месте.',
                ],
                'category' => ['ka' => 'ავტო', 'en' => 'Auto', 'ru' => 'Авто'],
                'website_url' => 'https://autolime.ge',
                'sort_order' => 1,
            ],
            [
                'slug' => ['ka' => 'gocar', 'en' => 'gocar', 'ru' => 'gocar'],
                'title' => ['ka' => 'gocar.ge', 'en' => 'gocar.ge', 'ru' => 'gocar.ge'],
                'summary' => [
                    'ka' => 'მანქანა, როცა გჭირდება. შერჩევა, დოკუმენტები და გადახდა ერთ აპში.',
                    'en' => 'A car when you need one. Choice, documents and payment in one app.',
                    'ru' => 'Машина, когда она нужна. Выбор, документы и оплата в одном приложении.',
                ],
                'category' => ['ka' => 'მობილობა', 'en' => 'Mobility', 'ru' => 'Мобильность'],
                'website_url' => 'https://gocar.ge',
                'sort_order' => 2,
            ],
        ];

        foreach ($ventures as $data) {
            if (Project::query()->where('slug->ka', $data['slug']['ka'])->exists()) {
                continue;
            }

            $project = new Project;
            foreach (['slug', 'title', 'summary', 'category'] as $field) {
                $project->replaceTranslations($field, $data[$field]);
            }
            $project->website_url = $data['website_url'];
            $project->status = 'live';
            $project->sort_order = $data['sort_order'];
            $project->is_published = false;
            $project->save();
        }
    }
}
