<?php

namespace App\Observers;

use App\Models\Setting;
use App\Support\AuditLogger;
use Illuminate\Support\Facades\Auth;

class SettingObserver
{
    public function saved(Setting $setting): void
    {
        if (! Auth::check()) {
            return;
        }

        $secret = AuditLogger::isSecretKey($setting->key);
        $value = $secret ? null : $setting->value;
        $previous = $secret ? null : $setting->getOriginal('value');

        AuditLogger::write(
            'settings_changed',
            $setting,
            $setting->wasRecentlyCreated ? null : ['key' => $setting->key, 'value' => $previous],
            ['key' => $setting->key, 'value' => $value],
        );
    }
}
