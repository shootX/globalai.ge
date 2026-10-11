<?php

use App\Models\Page;
use App\Models\Project;
use App\Models\Service;
use App\Models\Setting;
use App\Models\TeamMember;

it('falls back to ka when the requested locale has no translation', function () {
    Service::factory()->published()->create([
        'slug' => ['ka' => 'brendingi'],
        'title' => ['ka' => 'ბრენდინგი'],
        'summary' => ['ka' => 'იდენტობა და სისტემა'],
        'sort_order' => 2,
    ]);

    Service::factory()->published()->create([
        'slug' => ['ka' => 'veb-dizaini'],
        'title' => ['ka' => 'ვებ დიზაინი'],
        'summary' => ['ka' => 'საიტები'],
        'sort_order' => 1,
    ]);

    $page = Page::query()->where('key', 'about')->firstOrFail();
    $page->replaceTranslations('seo_title', ['ka' => 'ჩვენ შესახებ']);
    $page->save();

    $this->getJson('/api/v1/services?locale=en')
        ->assertOk()
        ->assertHeader('Cache-Control', 'max-age=60, public, stale-while-revalidate=300')
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('data.0.slug', 'veb-dizaini')
        ->assertJsonPath('data.0.title', 'ვებ დიზაინი')
        ->assertJsonPath('data.1.title', 'ბრენდინგი');

    $this->getJson('/api/v1/pages/about?locale=ru')
        ->assertOk()
        ->assertJsonPath('data.key', 'about')
        ->assertJsonPath('data.seo_title', 'ჩვენ შესახებ')
        ->assertJsonPath('data.content.blocks', []);
});

it('returns an empty list with a zero total', function () {
    $this->getJson('/api/v1/projects')
        ->assertOk()
        ->assertExactJson([
            'data' => [],
            'meta' => ['total' => 0],
        ]);
});

it('includes ka en and ru slug alternates on detail routes', function () {
    Project::factory()->published()->create([
        'slug' => ['ka' => 'proekti', 'en' => 'project', 'ru' => 'proekt'],
        'title' => ['ka' => 'პროექტი', 'en' => 'Project', 'ru' => 'Проект'],
        'summary' => ['ka' => 'მოკლე', 'en' => 'Short'],
    ]);

    $this->getJson('/api/v1/projects/project?locale=en')
        ->assertOk()
        ->assertJsonPath('data.slug', 'project')
        ->assertJsonPath('data.title', 'Project')
        ->assertJsonPath('data.alternates', [
            'ka' => 'proekti',
            'en' => 'project',
            'ru' => 'proekt',
        ]);

    $this->getJson('/api/v1/projects/proekti?locale=en')->assertNotFound();
});

it('hides unpublished records', function () {
    Service::factory()->create([
        'slug' => ['ka' => 'draft'],
        'title' => ['ka' => 'დრაფტი'],
        'is_published' => false,
    ]);

    $this->getJson('/api/v1/services')
        ->assertOk()
        ->assertExactJson([
            'data' => [],
            'meta' => ['total' => 0],
        ]);

    $this->getJson('/api/v1/services/draft')->assertNotFound();
});

it('keeps team and stats hidden until their flags are enabled', function () {
    TeamMember::factory()->published()->create([
        'name' => ['ka' => 'ნინო ბერიძე', 'en' => 'Nino Beridze'],
        'role' => ['ka' => 'დირექტორი'],
    ]);

    Setting::putValue('stats', [
        ['value' => '48', 'label' => ['ka' => 'პროექტი', 'en' => 'Projects']],
    ]);

    $this->getJson('/api/v1/team?locale=en')
        ->assertOk()
        ->assertExactJson([
            'data' => [],
            'meta' => ['total' => 0],
        ]);

    $this->getJson('/api/v1/settings?locale=en')
        ->assertOk()
        ->assertJsonPath('data.team_visible', false)
        ->assertJsonPath('data.stats_visible', false)
        ->assertJsonPath('data.projects_nav_visible', false)
        ->assertJsonPath('data.stats', [])
        ->assertJsonPath('data.logo', '/brand/globalai-logo.png');

    Setting::putValue('team_visible', true);
    Setting::putValue('stats_visible', true);

    $this->getJson('/api/v1/team?locale=en')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'Nino Beridze')
        ->assertJsonPath('data.0.role', 'დირექტორი');

    $this->getJson('/api/v1/settings?locale=ru')
        ->assertOk()
        ->assertJsonPath('data.stats_visible', true)
        ->assertJsonPath('data.stats.0.value', '48')
        ->assertJsonPath('data.stats.0.label', 'პროექტი');
});

it('does not return private settings', function () {
    Setting::putValue('next_revalidate_secret', 'super-secret-value');

    $response = $this->getJson('/api/v1/settings');

    $response->assertOk();
    expect($response->getContent())->not->toContain('super-secret-value');
    expect($response->json('data'))->not->toHaveKey('next_revalidate_secret');
});

it('rejects an unknown locale', function () {
    $this->getJson('/api/v1/services?locale=de')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['locale']);
});

it('allows only configured cors origins', function () {
    $this->withHeaders(['Origin' => 'https://evil.example'])
        ->getJson('/api/v1/settings')
        ->assertOk()
        ->assertHeaderMissing('Access-Control-Allow-Origin');

    $this->withHeaders(['Origin' => 'https://globalai.ge'])
        ->getJson('/api/v1/settings')
        ->assertOk()
        ->assertHeader('Access-Control-Allow-Origin', 'https://globalai.ge');
});
