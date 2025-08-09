## KnowShare Backend

Quick start

1) Copy env and set `APP_URL` and `FRONTEND_URL`:

```
cp .env.example .env
php artisan key:generate
```

2) Install dependencies:

```
composer install
```

3) Configure DB and run migrations:

```
php artisan migrate
```

4) Serve API:

```
php artisan serve
```

Optional (Voting):

```
composer require overtrue/laravel-vote
php artisan vendor:publish --provider="Overtrue\\LaravelVote\\VoteServiceProvider"
php artisan migrate
```
