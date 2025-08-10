<?php

namespace App\Services;

use League\CommonMark\CommonMarkConverter;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\Extension\Table\TableExtension;

class MarkdownService
{
    private CommonMarkConverter $converter;

    public function __construct()
    {
        $environment = new Environment([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
            'max_nesting_level' => 10,
        ]);

        $environment->addExtension(new CommonMarkCoreExtension());
        $environment->addExtension(new GithubFlavoredMarkdownExtension());
        $environment->addExtension(new TableExtension());

        $this->converter = new CommonMarkConverter([], $environment);
    }

    public function toHtml(string $markdown): string
    {
        return $this->converter->convert($markdown)->getContent();
    }

    public function toSafeHtml(string $markdown): string
    {
        $html = $this->toHtml($markdown);

        // Additional security: strip potentially dangerous tags
        $html = strip_tags($html, '<p><br><strong><em><ul><ol><li><h1><h2><h3><h4><h5><h6><blockquote><code><pre><a><table><thead><tbody><tr><th><td><hr>');

        // Clean up attributes to only allow safe ones
        $html = preg_replace('/(<a[^>]*?)(?:(?!href)[a-zA-Z-]+="[^"]*")/i', '$1', $html);

        return $html;
    }
}
