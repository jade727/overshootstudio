<?php

namespace Application\models;

use Application\abstracts\ResultImageAbstract;

class ResultImage extends ResultImageAbstract
{
    protected $CONNECTION;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, ResultImageAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}