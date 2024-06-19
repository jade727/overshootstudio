<?php

namespace Application\models;

use Application\abstracts\InventoryItemAbstract;

class InventoryItem extends InventoryItemAbstract
{
    protected $CONNECTION;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, InventoryItemAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}