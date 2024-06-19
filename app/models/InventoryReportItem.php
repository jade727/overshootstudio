<?php

namespace Application\models;

use Application\abstracts\InventoryAbstract;
use Application\abstracts\InventoryItemAbstract;
use Application\abstracts\InventoryReportItemAbstract;

class InventoryReportItem extends InventoryReportItemAbstract
{
    protected $CONNECTION;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, InventoryReportItemAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}