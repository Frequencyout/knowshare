<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Overtrue\LaravelVote\Traits\Votable;

class Question extends Model
{
    use HasFactory, Votable;

    protected $fillable = [
        'user_id',
        'title',
        'body_markdown',
        'body_html',
        'slug',
        'score',
        'views',
        'accepted_answer_id',
        'is_closed',
    ];

    protected $casts = [
        'is_closed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'question_tags')->withTimestamps();
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}


