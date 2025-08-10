<?php

namespace App\Notifications;

use App\Models\Answer;
use App\Models\Question;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AnswerAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Answer $answer,
        public Question $question,
        public User $questionOwner
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'answer_accepted',
            'message' => "{$this->questionOwner->name} accepted your answer to: {$this->question->title}",
            'answer_id' => $this->answer->id,
            'question_id' => $this->question->id,
            'question_title' => $this->question->title,
            'question_slug' => $this->question->slug,
            'question_owner_name' => $this->questionOwner->name,
            'question_owner_avatar' => $this->questionOwner->avatar_url,
            'created_at' => now()->toISOString(),
        ];
    }
}
