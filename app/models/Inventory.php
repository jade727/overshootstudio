<?php

namespace Application\models;

use Application\abstracts\InventoryAbstract;
use Application\abstracts\InventoryItemAbstract;

class Inventory extends InventoryAbstract
{
    protected $CONNECTION;

    public function __construct($userData = [])
    {
        global $CONNECTION;

        $this->CONNECTION = $CONNECTION;
        $this->applyData($userData, InventoryAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }

    public function getItems()
    {
        global $APPLICATION;

        $control = $APPLICATION->FUNCTIONS->INVENTORY_REPORT_ITEM_CONTROL;

        return $control->filterRecords(['inventory_id' => $this->inventory_id], false);
    }
}