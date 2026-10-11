<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CreateBot extends Command
{
    protected $signature = 'bot:create {name} {--expires=90}';

    protected $description = 'Create a bot admin and print a Sanctum token once.';

    public function handle(): int
    {
        $name = (string) $this->argument('name');
        $days = (int) $this->option('expires');

        $validator = Validator::make(
            ['name' => $name, 'expires' => $days],
            [
                'name' => ['required', 'string', 'max:255'],
                'expires' => ['required', 'integer', 'min:1', 'max:365'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = (new User)->forceFill([
            'name' => $name,
            'email' => 'bot-'.Str::lower(Str::random(12)).'@bots.globalai.ge',
            'password' => Str::password(40),
            'is_bot' => true,
            'role' => User::ROLE_ADMIN,
        ]);
        $user->save();

        $issued = $user->createToken('bot', ['*'], now()->addDays($days));

        AuditLogger::write('token_created', $issued->accessToken, null, [
            'name' => 'bot',
            'expires_at' => $issued->accessToken->expires_at?->toIso8601String(),
        ], $user->id);

        $this->warn('Save this token now. It will not be shown again.');
        $this->line($issued->plainTextToken);

        return self::SUCCESS;
    }
}
