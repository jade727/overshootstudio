<?php

namespace Application\models;

use Application\abstracts\PackageAbstract;

class Package extends PackageAbstract
{
    protected $CONNECTION;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, PackageAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}