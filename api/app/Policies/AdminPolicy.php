<?php

namespace App\Policies;

use App\Models\User;

abstract class AdminPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, object $model): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, object $model): bool
    {
        return true;
    }

    public function delete(User $user, object $model): bool
    {
        return true;
    }
}
