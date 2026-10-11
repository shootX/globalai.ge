<?php

namespace App\Policies;

use App\Models\User;

class SettingPolicy extends AdminPolicy
{
    public function updateAny(User $user): bool
    {
        return true;
    }

    public function upload(User $user): bool
    {
        return true;
    }

    public function deleteUpload(User $user): bool
    {
        return true;
    }
}
